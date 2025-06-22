import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

export function configurePassport() {
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey   : process.env.JWT_SECRET
      },
      (payload, done) => done(null, { _id: payload.id ?? payload.sub, role: payload.role})
      // we laden hier geen user-record op — target-service heeft dat niet nodig
    )
  );
}
