import 'dotenv/config';
import express from 'express';
import passport from 'passport';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';

import { connectDB } from './config/database.js';
import { configurePassport } from './config/passport.js';
import authRoutes from './routes/auth.routes.js';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev'));
app.use(helmet());

// Passport configuratie
configurePassport();
app.use(passport.initialize());


// Routes
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      message: 'Er is een interne serverfout opgetreden',
      error  : process.env.NODE_ENV === 'development' ? err.message : {}
    });
  });

// 404 handler
app.use((_, res) => res.status(404).json({ message: 'Route niet gevonden' }));

// Start server (Na Mongo)
(async () => {
    await connectDB();                           // wacht tot Mongo verbonden is
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => console.log(`Auth service draait op poort ${PORT}`));
  })();
