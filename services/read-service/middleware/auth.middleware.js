import passport from 'passport';

const authMiddleware = {
    authenticateJWT: passport.authenticate('jwt', { session: false }),
    
    authorizeRole: (roles) => {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({ message: 'Niet geautoriseerd' });
            }

            if (!roles.includes(req.user.role)) {
                return res.status(403).json({ message: 'Geen toegang tot deze resource' });
            }

            next();
        };
    }
};

export default authMiddleware; 