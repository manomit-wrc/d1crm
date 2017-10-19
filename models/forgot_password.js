var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var forgotPasswordSchema = new Schema({
	email: {type: String, required: 'Please enter email'},
	otp: {type: String, required: 'Please provide an otp'}
});

var ForgotPassword = mongoose.model('ForgotPassword', forgotPasswordSchema);

module.exports = {
	ForgotPassword: ForgotPassword
}