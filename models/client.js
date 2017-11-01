var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var clientSchema = new Schema({
	first_name: {type: String, required: 'Please enter first name'},
	last_name: {type:String, required: 'Please enter last name'},
	email: {type:String, required: 'Please enter email id'},
	password: {type:String, required: 'Please enter password'},
	original_password: {type: String, default: ''},
	mobile_no: {type:String, required: 'Please enter mobile no'},
	address: {type:String, required: 'Please enter address'},
	country_name: {type:String, required: 'Please enter country name'},
	state_name: {type:String, required: 'Please enter state name'},
	city_name: {type:String, required: 'Please enter city name'},
	pincode: {type:String, required: 'Please enter pincode'},
	image: {type:String, default: ''},
	device_id: {type:String, default:''},
	platform: {type:String, required: 'Please provide platform'}
});

clientSchema.path('email').validate(function(email, next){

Client.findOne({email:email.toLowerCase()}, function(err, client){
 if(err) {
      return next(false);
  }
  next(!client);
});

},'Email already in use');

var Client = mongoose.model('Client', clientSchema);

module.exports = {
	Client: Client
}