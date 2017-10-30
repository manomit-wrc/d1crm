var mongoose = require('mongoose');

var Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;
var presentationSchema = new Schema({
	event_id: {type: ObjectId, required: 'Please select events'},
	question_name: {type:String, required: 'Please enter question'},
	answer_type: {type:String, required: 'Please select answer type'},
	answer_name: {type:String},
	status: {type: String, default: '1'}
});

var Presentation = mongoose.model('Presentation', presentationSchema);

module.exports = {
	Presentation: Presentation
}