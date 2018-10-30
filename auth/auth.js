const User = require('../models/user.js');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
const UserModel = require('../models/user');
const passportJWT = require("passport-jwt");
const JWTStrategy   = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;


passport.use('register', new LocalStrategy({
  usernameField : 'email',
  passwordField : 'password',
  passReqToCallback : true
}, async (req,email, password, done) => {
    try {
      //Save the information provided by the user to the the database
       var createU = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email :req.body.email,
            password:req.body.password,
            role:req.body.role,
            phone:req.body.phone
          }
    UserModel.create(createU).then(function(user){
      return done(null, user);
     }).catch(function(err){
         var reason  = err.message
          if (reason.indexOf('E11000') > -1) {
             if (reason.indexOf('email') > -1) {
               reason = 'Email Id already exits. ';
             }
           }
           return done(reason);
         })
      //Send the user information to the next middleware
    } catch (error) {
      done(error);
    }
}));


passport.use('register_user', new LocalStrategy({
  usernameField : 'email',
  passwordField : 'password',
  passReqToCallback : true
}, async (req,email, password, done) => {
    try {
      //Save the information provided by the user to the the database
       var createU = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email :req.body.email,
            password:req.body.password,
            phone:req.body.phone,
            customer_role:req.body.customer_role
          }
    UserModel.create(createU).then(function(user){
      return done(null, user);
     }).catch(function(err){
         var reason  = err.message
          if (reason.indexOf('E11000') > -1) {
             if (reason.indexOf('email') > -1) {
               reason = 'Email Id already exits. ';
             }
           }
           return done(reason);
         })
      //Send the user information to the next middleware
    } catch (error) {
      done(error);
    }
}));


//Create a passport middleware to handle User login
passport.use('login', new LocalStrategy({
  usernameField : 'email',
  passwordField : 'password'
}, async (email, password, done) => {
  try {
    //Find the user associated with the email provided by the user
    const user = await UserModel.findOne({ email });
    if( !user ){
      //If the user isn't found in the database, return a message
      return done(null, false, { status:404 ,message : 'User not found'});
    }
    //Validate password and make sure it matches with the corresponding hash stored in the database
    //If the passwords match, it returns a value of true.
    const validate = await user.isValidPassword(password);
    if( !validate ){
      return done(null, false, { status:400 ,message : 'Wrong Password'});
    }
    //Send the user information to the next middleware
    return done(null, user, { status:200, message : 'Logged in Successfully'});
  } catch (error) {
    return done(error);
  }
}));
// verify jwt token

passport.use(new JWTStrategy({
jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
secretOrKey   : 'top_secrett'
}, async (token, done) => {

   if(!token)
    return done(null,false)
   else
    return done(null,token);
}));

passport.serializeUser(function(user,done){
   done(null,user);
});

passport.deserializeUser(function(user,done){
   done(null,user);
});