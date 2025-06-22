import passport from 'passport';
export const authenticateJWT = passport.authenticate('jwt', { session:false });
export const requireRole = roles => (req,res,next)=>
  roles.includes(req.user.role) ? next() : res.status(403).json({msg:'Forbidden'});
export default { authenticateJWT, requireRole };
