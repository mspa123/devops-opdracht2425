// services/register-service/server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import connectDB from './config/database.js';

import registerRoutes from './routes/register.routes.js';

import { connect as busConnect, consume } from '../../libs/bus.js';
import User from './models/user.model.js';

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// API routes
app.use('/api', registerRoutes);

// Error handlers
app.use((err, _req, res, _next) =>
  res.status(500).json({ message: 'Internal server error', error: err.message })
);
app.use((_, res) =>
  res.status(404).json({ message: 'Route not found' })
);

(async () => {
  try {
    // 1) Connect to MongoDB & RabbitMQ
    await Promise.all([connectDB(), busConnect()]);
    console.log('[register] MongoDB & RabbitMQ connected');

    // 2) Consume deadline events to close registrations
    await consume(
      'register_deadline_queue',          // queue name
      'deadline',                         // exchange declared by Clock-Service
      'target.deadline.reached',          // routing key
      async ({ targetId }) => {
        console.log('[register] target.deadline.reached received for target:', targetId);
        // Markeer alle open registraties voor dit target als gesloten
        await User.updateMany(
          { targetId, active: true },
          { active: false }
        );
        console.log(`[register] Closed registrations for target ${targetId}`);
      }
    );
    console.log('[register] Consumer bound for target.deadline.reached events');

    // 3) Start HTTP server
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => console.log(`[register] listening on port ${PORT}`));
  } catch (e) {
    console.error('[register] startup error:', e);
    process.exit(1);
  }
})();
