import express from 'express';
import * as clockController from '../controllers/clock.controller.js';
import auth from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/clock', auth.authenticateJWT, auth.requireRole(['targetOwner','admin']),
  clockController.createDeadline
);

router.get('/clock', auth.authenticateJWT, auth.requireRole(['admin']), clockController.listDeadlines
);

export default router;