var mongoose = require('mongoose');

var Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;
var orderSchema = new Schema({
	client_id: {type: ObjectId, required: 'Please enter client'},
	invoice_no: {type:String, required: 'Please enter invoice no'},
	transaction_no: {type:String, default: ''},
	items: {type:String, required: 'Please enter items'},
	status: {type: String, default: '0'}
});

var Order = mongoose.model('Order', orderSchema);

module.exports = {
	Order: Order
}