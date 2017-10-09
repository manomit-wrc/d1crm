var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var settingSchema = new Schema({
   company_name: {type:String, required: 'Please enter company name'},
   company_address: {type:String, required: 'Please enter company address'},
   email: {type:String, required: 'Please enter email'},
   contact_no: {type:String, required: 'Please enter contact_no'},
   google_store_link: {type: String, required: 'Please enter google store link'},
   apple_store_link: {type: String, required: 'Please enter apple store link'},
   twilio_no: {type: String, required: 'Please enter 2 way sms number'}
});

var Settings = mongoose.model('Settings', settingSchema);

module.exports = {
    Settings: Settings
};