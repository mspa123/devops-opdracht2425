// services/auth-service/routes/auth.routes.js
import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import { validateLogin } from '../middleware/validation.middleware.js';

const router = express.Router();

// Publiek endpoint
router.post('/login', validateLogin, authController.login);

// Protected endpoints
router.get('/profile', authMiddleware.authenticateJWT, authController.getProfile);
router.put('/profile', authMiddleware.authenticateJWT, authController.updateProfile);

// Admin endpoints
router.get(
  '/users',
  authMiddleware.authenticateJWT,
  authMiddleware.authorizeRoles(['admin']),
  authController.getUsers
);
router.delete(
  '/users/:id',
  authMiddleware.authenticateJWT,
  authMiddleware.authorizeRoles(['admin']),
  authController.deleteUser
);

export default router;
