var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var productSchema = new Schema({
	name: {type: String, required: 'Please enter product name'},
	code: {type: String, required: 'Please enter product code'},
	description: {type: String, required: 'Please enter product description'},
	quantity: {type: String, required: 'Please enter product quantity'},
	price: {type: String, required: 'Please enter product price'},
	symbol: {type: String, default: ''},
	image: {type: String, default: ''},
	status: {type: String, default: '1'}
});

productSchema.path('code').validate(function(code, next){

Product.findOne({code:code.toLowerCase()}, function(err, client){
 if(err) {
      return next(false);
  }
  next(!client);
});

},'Product code already in use');

var Product = mongoose.model('Product', productSchema);

module.exports = {
	Product: Product
}