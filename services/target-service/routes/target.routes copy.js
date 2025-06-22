import express from 'express';
import * as targetController from '../controllers/target.controller.js';
import upload from '../config/upload.config.js';
// import auth from '../middleware/auth.js';
import auth from '../middleware/auth.middleware.js'
// import validation from '../middleware/validation.middleware.js';
import { validateTarget } from '../middleware/validation.middleware.js';

const router = express.Router();

// Basis CRUD routes
router.get('/', targetController.getAllTargets);
router.get('/category/:category', targetController.getTargetsByCategory);
router.get('/difficulty/:difficulty', targetController.getTargetsByDifficulty);
router.get('/:id', targetController.getTargetById);


// Owner routes (JWT vereist)

// target aanmaken
router.post(
    '/',                             
    auth.authenticateJWT,
    upload.single('image'),
    validateTarget,
    targetController.createTarget
  );

  // target wijzigen
  router.put(
    '/:id',                          
    auth.authenticateJWT,
    upload.single('image'),
    targetController.updateTarget
  );

// soft-delete
  router.delete(
    '/:id',                          // soft-delete
    auth.authenticateJWT,
    targetController.deleteTarget
  );

  // Speler routes (foto insturen)
  router.post(
    '/:id/photo',
    auth.authenticateJWT,
    upload.single('image'),
    targetController.uploadPhoto
  );

export default router; 