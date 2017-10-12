var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var emailSchema = new Schema({
   event_id: {type:String, required: 'Please enter company name'},
   text: {type:String, required: 'Please enter company address'},
   status: {type:String, required: 'Please enter email'},
});

var Email_template = mongoose.model('Email',emailSchema);

module.exports = {
    Email_template: Email_template
};