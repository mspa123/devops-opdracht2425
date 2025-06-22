import express from 'express';
import * as readController from '../controllers/read.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// Publieke endpoint (kan zonder JWT)
router.get('/active', readController.getActiveTargets);

// Beveiligde endpoints
router.get('/finished', authMiddleware.authenticateJWT, readController.getFinishedTargets);
router.get('/target/:id/leaderboard', authMiddleware.authenticateJWT, readController.getLeaderboard);

export default router; 