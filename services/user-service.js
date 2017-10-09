var User = require("../models/user").User;

exports.findUser = function(email, next) {
  User.findOne({email:email.toLowerCase()}, function(err, user){
     return next(err, user);
  });
};