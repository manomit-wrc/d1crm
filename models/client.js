var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var clientSchema = new Schema({
	first_name: {type: String, required: 'Please enter first name'},
	last_name: {type:String, required: 'Please enter last name'},
	email: {type:String, required: 'Please enter email id'},
	password: {type:String, required: 'Please enter password'},
	original_password: {type: String, default: ''},
	mobile_no: {type:String, required: 'Please enter mobile no'},
	address: {type:String, default: ''},
	country_name: {type:String, default: ''},
	state_name: {type:String, default: ''},
	city_name: {type:String, default: ''},
	pincode: {type:String, default: ''},
	image: {type:String, default:''},
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