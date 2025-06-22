import express from 'express';
import * as targetController from '../controllers/target.controller.js';
import upload from '../config/upload.config.js';
import auth from '../middleware/auth.middleware.js';
import { validateTarget } from '../middleware/validation.middleware.js';

const router = express.Router();

// 1) Haal (actieve) targets op, met optie ?placeName=.. of ?latitude=..&longitude=..
router.get('/', targetController.getAllTargets);

// 2) Haal één specifieke target op
router.get('/:id', targetController.getTargetById);

// 3) Maak een nieuwe target (eigenaar) – nu inclusief placeName
router.post(
  '/',
  auth.authenticateJWT,
  upload.single('image'),
  validateTarget,
  targetController.createTarget
);


// 5) Soft delete target (eigenaar)
router.delete(
  '/:id',
  auth.authenticateJWT,
  targetController.deleteTarget
);

export default router;
