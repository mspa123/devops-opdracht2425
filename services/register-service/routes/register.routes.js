// services/register-service/routes/register.routes.js
import express from 'express';
import { register } from '../controllers/register.controller.js';
import { validateRegistration } from '../middleware/validation.middleware.js';

const router = express.Router();

router.post('/register', validateRegistration, register);

export default router;
