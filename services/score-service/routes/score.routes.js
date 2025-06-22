import express from 'express';
import * as scoreController from '../controllers/score.controller.js';
import upload from '../config/upload.config.js';
import auth from '../middleware/auth.middleware.js';

const router = express.Router();

// 1) Upload foto (speler, deadline-check)
router.post('/:targetId/submit',
  auth.authenticateJWT,
  auth.requireRole(['participant']),
  upload.single('photo'),
  scoreController.submitPhoto
);

// 2) Haal eigen score op
router.get('/:targetId/my-score', auth.authenticateJWT, auth.requireRole(['participant']), scoreController.getMyScore);

// 3) Haal alle scores op
router.get('/:targetId/all-scores', auth.authenticateJWT, auth.requireRole(['targetOwner']), scoreController.getAllScores);

router.get('/debug/user',
  auth.authenticateJWT,
  (req, res) => {
    console.log('🧪 DEBUG req.user:', req.user);  // <- hier zie je het in de console
    res.json({ user: req.user });                  // <- hier zie je het in Postman
  }
);


export default router;
