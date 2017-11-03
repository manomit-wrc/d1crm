var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var deviceSchema = new Schema({
	device_id: {type: String, required: 'Please enter device id'}
});

var Device = mongoose.model('Device', deviceSchema);

module.exports = {
	Device: Device
}