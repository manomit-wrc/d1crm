var mongoose = require('mongoose');

var Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

var notificationSchema = new Schema({
	device_id: {type: String},
	presentation_id: {type: ObjectId},
	question: {type: String},
	statement_type: {type: String},
	status: {type: String}
});

var Notification = mongoose.model('Notification', notificationSchema);

module.exports = {
	Notification: Notification
}