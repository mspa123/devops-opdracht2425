import 'dotenv/config';
import express  from 'express';
import cors     from 'cors';
import helmet   from 'helmet';
import morgan   from 'morgan';
import passport from 'passport';
import path     from 'path';
import { fileURLToPath } from 'url';

import { connectDB }          from './config/database.js';
import { configurePassport }  from './config/passport.js';
import targetRoutes           from './routes/target.routes.js';
import { connect as busConnect, consume } from '../../libs/bus.js';
import Target                 from './models/target.model.js';

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

// === Statische bestanden ===
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// === Routes ===
app.use('/api/targets', targetRoutes);

// === Error‐handlers ===
app.use((err, _req, res, _next) =>
  res.status(500).json({ message: 'Server‐fout', error: err.message })
);
app.use((_, res) => res.status(404).json({ message: 'Route niet gevonden' }));

// === Startup: MongoDB + RabbitMQ + consumer voor deadline.reached ===
(async () => {
  try {
    // 1) Verbind met MongoDB en RabbitMQ
    await Promise.all([
      connectDB(),
      busConnect()
    ]);

    // 2) Stel consumer in voor deadline.reached
    await consume(
      'target_deadline_queue',  // unie que queue‐naam
      'deadline',               // exchange
      'reached',                // routingKey
      async (payload) => {
        try {
          const { targetId } = payload;
          console.log('[Target] ontvangen deadline.reached:', payload);

          const target = await Target.findById(targetId);
          if (target && target.active) {
            target.active = false;
            await target.save();
            console.log(`[Target] target ${targetId} automatisch gedeactiveerd`);
          } else {
            console.warn(`[Target] target ${targetId} niet gevonden of al inactief`);
          }
        } catch (err) {
          console.error('[Target] Fout in deadline.reached‐handler:', err);
        }
      }
    );

    // 3) Start de HTTP‐server
    const PORT = process.env.PORT || 3002;
    app.listen(PORT, () => {
      console.log(`[target] draait op poort ${PORT}`);
    });

  } catch (e) {
    console.error('[Target] Startup‐fout:', e);
    process.exit(1);
  }
})();
