var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var PaymentSettingSchema = new Schema({
   paypal_description: {type:String, required: 'Please enter paypal content'},
   judopay_description: {type:String, required: 'Please enter judocontent'},
   
});

var Payment_Setting = mongoose.model('PaymentSetting',PaymentSettingSchema);

module.exports = {
    Payment_Setting: Payment_Setting
};