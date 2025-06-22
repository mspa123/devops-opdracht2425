import express from 'express';
import * as clockController from '../controllers/clock.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// Maak of herplan een deadline
router.post('/', authMiddleware.authenticateJWT, clockController.createDeadline);

// Toon alle deadlines
router.get('/', authMiddleware.authenticateJWT, clockController.listDeadlines);

export default router;
