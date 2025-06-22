import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from 'passport';

import  connectDB from './config/database.js';
import { configurePassport }  from './config/passport.js';
import clockRoutes from './routes/clock.routes.js';
import Deadline from './models/deadline.model.js';
import { scheduleExisting }  from './utils/scheduler.js';
import { connect as busConnect, consume } from '../../libs/bus.js';

const app = express();

// === Middleware ===
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === Passport JWT ===
configurePassport();
app.use(passport.initialize());

// API
app.use('/api/clock', clockRoutes);

// Error handlers
app.use((err, _req, res, _next) =>
  res.status(500).json({ message: 'Server-fout', error: err.message })
);
app.use((_, res) =>
  res.status(404).json({ message: 'Route niet gevonden' })
);

(async () => {
  try {
    // 1) Connect to MongoDB & RabbitMQ
    await Promise.all([connectDB(), busConnect()]);
    console.log('[clock] MongoDB & RabbitMQ connected');

    // 2) Schedule all existing deadlines in the DB
    await scheduleExisting();
    console.log('[clock] Existing deadlines scheduled');

    // 3) Listen for new targets to auto-schedule their deadlines
    await consume(
      'clock_schedule_queue',   // your queue name
      'target',                 // exchange declared by Target-Service
      'created',                // routing key when a target is created
      payload => {
        console.log('[clock] target.created event received:', payload);
        scheduleDeadline({
          _id: payload.targetId,
          targetId: payload.targetId,
          deadlineDate: new Date(payload.deadline)
        });
      }
    );
    console.log('[clock] Consumer bound for target.created events');

    // 4) Start HTTP server
    const PORT = process.env.PORT || 5003;
    app.listen(PORT, () => console.log(`[clock] listening on port ${PORT}`));
  } catch (e) {
    console.error('[clock] startup error:', e);
    process.exit(1);
  }
})();
