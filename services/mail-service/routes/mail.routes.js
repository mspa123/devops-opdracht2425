import express from 'express';
import * as mailController from '../controllers/mail.controller.js';

const router = express.Router();

// Health check
router.get('/health', mailController.healthCheck);

// Test email endpoint
router.post('/test', mailController.sendTestEmail);

// Registratie email
router.post('/registration', mailController.sendRegistrationEmail);

// Contest resultaten email naar target owner
router.post('/contest-results', mailController.sendContestResultsEmail);

// Individuele score email naar deelnemer
router.post('/individual-score', mailController.sendIndividualScoreEmail);

export default router; 