var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var smsSchema = new Schema({
   event_id: {type:String, required: 'Please enter company name'},
   text: {type:String, required: 'Please enter company address'},
   status: {type:String, required: 'Please enter email'},
});

var Sms_template = mongoose.model('Sms',smsSchema);

module.exports = {
    Sms_template: Sms_template
};