var mongoose = require('mongoose');

var Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;
var ProductCartSchema = new Schema({
	product_id: {type: ObjectId, required: 'Please enter product'},
	client_id: {type: ObjectId, required: 'Please enter client'},
	quantity: {type:String, required: 'Please enter quantity'},
	price: {type:String, required: 'Please enter price'},
	added_date: {type: Date}
});

var ProductCart = mongoose.model('ProductCart', ProductCartSchema);

module.exports = {
	ProductCart: ProductCart
}