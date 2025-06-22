import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connect } from './libs/bus.js';
import { startEventSubscriptions } from './services/eventHandler.js';
import mailRoutes from './routes/mail.routes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api/mail', mailRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Er is iets misgegaan!',
        error: err.message 
    });
});

// Start de server en message bus
const PORT = process.env.PORT || 3006;

const startServer = async () => {
    try {
        // Start message bus connectie
        await connect();
        console.log('[mail-service] Message bus verbonden');
        
        // Start event subscriptions
        await startEventSubscriptions();
        console.log('[mail-service] Event subscriptions gestart');
        
        // Start HTTP server
        app.listen(PORT, () => {
            console.log(`[mail-service] Mail service draait op poort ${PORT}`);
            console.log(`[mail-service] Health check beschikbaar op: http://localhost:${PORT}/api/mail/health`);
        });
        
    } catch (error) {
        console.error('[mail-service] Fout bij starten server:', error);
        process.exit(1);
    }
};

startServer(); 