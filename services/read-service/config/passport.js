import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

export function configurePassport() {
  console.log('⏳ JWT_SECRET is:', process.env.JWT_SECRET);
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey   : process.env.JWT_SECRET
      },
      (payload, done) => done(null, { _id: payload.id ?? payload.sub, role: payload.roles?.[0] })
      // we laden hier geen user-record op — score-service heeft dat niet nodig
    )
  );
}
