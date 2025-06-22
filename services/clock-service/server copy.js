import 'dotenv/config';
import express  from 'express';
import cors     from 'cors';
import helmet   from 'helmet';
import morgan   from 'morgan';
import passport from 'passport';

import { connectDB }         from './config/database.js';
import { configurePassport } from './config/passport.js';
import clockRoutes           from './routes/clock.routes.js';
import Deadline              from './models/deadline.model.js';
import { scheduleJob }       from './utils/scheduler.js';
import { connect as busConnect, consume } from '../../libs/bus.js';

const app = express();

app.use(
  cors(),
  helmet(),
  morgan('dev'),
  express.json(),
  express.urlencoded({ extended: true })
);

// JWT setup
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
    // 1) DB & RabbitMQ
    await Promise.all([connectDB(), busConnect()]);
    console.log('[clock] MongoDB & RabbitMQ connected');

    // 2) Maak + bind de que voor deadline-events
    await consume(
      'deadline_queue',   // queue-naam
      'deadline',         // exchange
      'reached',          // routing key
      payload => {
        console.log('[clock] deadline.reached ontvangen:', payload);
        // Hier kun je eventueel extra logica draaien als een deadline is bereikt
      }
    );

    // 3) Schedule bestaande deadlines in DB
    const all = await Deadline.find();
    all.forEach(d => scheduleJob(d.targetId.toString(), d.deadlineDate));
    console.log('[clock] Scheduled', all.length, 'deadlines');

    // 4) Start HTTP-server
    const PORT = process.env.PORT || 3007;
    app.listen(PORT, () =>
      console.log(`[clock] draait op poort ${PORT}`)
    );
  } catch (e) {
    console.error('Startup-fout:', e);
    process.exit(1);
  }
})();
