module.exports = function(app,passport) {

var Payment_Setting = require('../models/payment_setting').Payment_Setting;

/*app.get('/admin/payment/', function(req, res) {
		Payment_Setting.find({}, function(err, payment) {
			res.render('admin/payment/',{layout:'dashboard',paymentlist:payment});
		});
		
	});*/

app.get('/admin/payment/add', function(req, res) {
		Payment_Setting.find({},function(err, paymentdata){
			var msg = req.flash('message')[0];
		res.render('admin/payment/add',{layout:'dashboard',paymentdata:paymentdata});

		});

		
	});

app.post('/admin/Payment/create', function(req, res) {
		

        var payment_id=req.body.payment_id;
        
        if(payment_id=="")
        {
		 var PaymentSetting = new Payment_Setting({
	       paypal_description: req.body.paypal_description,
		   judopay_description: req.body.judopay_description,
		   
		   
  		});

		PaymentSetting.save(function(err, evt) {
	      if(err) 
	      {
			req.flash('message', 'Please try again');
		  }
			if(evt) {
				req.flash('message', 'Payment description added successfully');
			}
			res.redirect('/admin/Payment/add');
		      
		});
	
      }
      else
      {

      	    Payment_Setting.findOneAndUpdate(
			{_id: payment_id}, 
			{
				$set:
				{
				    paypal_description: req.body.paypal_description,
		            judopay_description: req.body.judopay_description,
				   
				}
			}, function(err, doc){
				if(err) {
					req.flash('message', 'Please try again');
				}
				if(doc) {
					req.flash('message', 'Payment updated successfully');
				}
        		res.redirect('/admin/payment/add');
		});
      }

});


};	