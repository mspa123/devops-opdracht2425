import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from 'passport';
import path     from 'path';
import { fileURLToPath } from 'url';


import  connectDB from './config/database.js';
import { configurePassport }  from './config/passport.js';
import scoreRoutes from './routes/score.routes.js';
import { connect as busConnect} from './libs/bus.js';


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
app.use('/api/scores', scoreRoutes);

// === Error‐handlers ===
app.use((err, _req, res) =>
  res.status(500).json({ message: 'Server‐fout', error: err.message })
);
app.use((_, res) => res.status(404).json({ message: 'Route niet gevonden' }));

(async () => {
  try {
    // Verbind met DB én RabbitMQ
    await Promise.all([ connectDB(), busConnect() ]);

    const PORT = process.env.PORT || 3003;
    app.listen(PORT, () =>
      console.log(`[Score] Listening on port ${PORT}`)
    );
  } catch (err) {
    console.error('[Score] Startup error:', err);
    process.exit(1);
  }
})();