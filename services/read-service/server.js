import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet  from 'helmet';
import morgan from 'morgan';
import passport from 'passport';

import { connectDB }         from './config/database.js';
import { configurePassport } from './config/passport.js';
import readRoutes           from './routes/read.routes.js';

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
app.use('/api/read', readRoutes);

// Error handlers
app.use((err, _req, res, _next) =>
    res.status(500).json({ message: 'Server-fout', error: err.message })
  );
  app.use((_, res) =>
    res.status(404).json({ message: 'Route niet gevonden' })
  );

// Start
  (async () => {
    try {
      await Promise.all([ connectDB(), busConnect() ]);
      const PORT = process.env.PORT || 3007;
      app.listen(PORT, () => console.log(`[target] draait op poort ${PORT}`));
    } catch (e) {
      console.error('Startup-fout:', e);
      process.exit(1);
    }
  })();