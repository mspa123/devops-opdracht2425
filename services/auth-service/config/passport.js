// config/passport.js  (Optie A)
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from '../models/user.model.js';

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey   : process.env.JWT_SECRET
};

export const configurePassport = () => {
  passport.use(
    new JwtStrategy(options, async (jwtPayload, done) => {
      try {
        const userId = jwtPayload.id ?? jwtPayload.sub;   // ① fallback
        const user   = await User.findById(userId);
        return done(null, user || false);
      } catch (err) {
        return done(err, false);
      }
    })
  );
  // geen passport.initialize() hier (die roep je één keer aan in server.js)
};
