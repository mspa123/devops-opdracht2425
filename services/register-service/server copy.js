// services/register-service/server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import  connectDB  from './config/database.js';
import registerRoutes from './routes/register.routes.js';

const app = express();

// 1) Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// 2) MongoDB verbinden
(async () => {
  await connectDB();
})();

// 3) Routes mounten
app.use('/api', registerRoutes);

// 4) Health‐check
app.get('/', (req, res) => res.send('Register‐Service is actief'));

// 5) Fout en 404 handlers
app.use((err, req, res, next) => {
  console.error(err.stack);
  return res.status(500).json({
    message: 'Er is een interne serverfout opgetreden',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});
app.use((_, res) => res.status(404).json({ message: 'Route niet gevonden' }));

// 6) Server starten
const PORT = process.env.PORT || 4100;
app.listen(PORT, () => {
  console.log(`🚀 Register‐Service luistert op poort ${PORT}`);
});
