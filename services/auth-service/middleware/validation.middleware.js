import { body, validationResult } from 'express-validator';

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

const validateRegistration = [
    body('email')
        .isEmail()
        .withMessage('Voer een geldig e-mailadres in')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Wachtwoord moet minimaal 6 karakters bevatten')
        .matches(/\d/)
        .withMessage('Wachtwoord moet minimaal één nummer bevatten'),
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is verplicht')
        .isLength({ min: 2 })
        .withMessage('Naam moet minimaal 2 karakters bevatten'),
    body('role')
        .optional()
        .isIn(['user', 'target-owner', 'admin'])
        .withMessage('Ongeldige rol'),
    handleValidationErrors
];

const validateLogin = [
    body('email')
        .isEmail()
        .withMessage('Voer een geldig e-mailadres in')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Wachtwoord is verplicht'),
    handleValidationErrors
];

export { validateRegistration, validateLogin }; 