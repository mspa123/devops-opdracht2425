// score-service/middleware/auth.middleware.js
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import dotenv from 'dotenv';
dotenv.config();

// Configuratie van Passport JWT
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET
    },
    (payload, done) => {
      // payload bevat bijvoorbeeld { id: '...', role: 'participant' }
      return done(null, { _id: payload.id, role: payload.role });
    }
  )
);

export const authenticateJWT = passport.authenticate('jwt', { session: false });

// Optionele rol‐controle (bijv. alleen deelnemers mogen inzenden)
export const requireRole = (roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Geen toestemming' });
  }
  next();
};

// Voeg dit toe:
export default {
  authenticateJWT,
  requireRole
};