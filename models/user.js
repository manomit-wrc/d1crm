var mongoose = require('mongoose');


var Schema = mongoose.Schema;

var userSchema = new Schema({
   first_name: {type:String, required: 'Please enter first name'},
   last_name: {type:String, required: 'Please enter last name'},
   email: {type:String, required: 'Please enter email'},
   password: {type:String, required: 'Please enter password'},
   address: {type: String, required: 'Please enter street address'},
   country: {type: String, required: 'Please enter country name'},
   state: {type: String, required: 'Please enter state name'},
   city: {type: String, required: 'Please enter city name'},
   pincode: {type: String, required: 'Please enter pincode'},
   avator: {type: String},
   created: {type:Date, default: Date.now() }
});

userSchema.path('email').validate(function(email, next){

  User.findOne({email:email.toLowerCase()}, function(err, user){
     if(err) {
          return next(false);
      }
      next(!user);
  });

},'Email already in use');

var User = mongoose.model('User', userSchema);

module.exports = {
    User: User
};