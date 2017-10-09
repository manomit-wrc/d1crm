var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var eventSchema = new Schema({
	event_name: {type: String, required: 'Please enter event name'},
	event_date: {type:Date, required: 'Please enter event date'},
	event_time: {type:String, required: 'Please enter event time'},
	event_address: {type:String, required: 'Please enter event address'},
	event_image: {type: String}
});

var Event = mongoose.model('Event', eventSchema);

module.exports = {
	Event: Event
}