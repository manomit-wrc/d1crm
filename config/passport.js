var User = require("../models/user").User;
var LocalStrategy   = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');
// expose this function to our app using module.exports
module.exports = function(passport) {
    
    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
      User.findById(id, function(err, user) {
        done(err, user);
      });
    });

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-login',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) { // callback with email and password from our form
            
            
 
            var isValidPassword = function(user, password){
                return bCrypt.compareSync(password, user.password);
            }

            User.findOne({ 'email' :  email }, 
              function(err, user) {
                // In case of any error, return using the done method
                if (err)
                  return done(err);
                // Username does not exist, log error & redirect back
                if (!user){
                  
                  return done(null, false, 
                        req.flash('loginMessage', 'User Not found.'));                 
                }
                // User exists but wrong password, log the error 
                if (!isValidPassword(user, password)){
                  console.log('Invalid Password');
                  return done(null, false, 
                      req.flash('loginMessage', 'Invalid Password'));
                }
                // User and password both match, return user from 
                // done method which will be treated like success
                return done(null, user);
              }
            );
        }

        ));


};