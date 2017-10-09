module.exports = function(app) {
	var Settings = require("../models/settings").Settings;

	app.get('/admin/dashboard', function(req, res) {

		res.render('admin/dashboard',{layout:'dashboard'});
	});

	app.get('/admin/logout', function(req, res) {
		req.logout();
		res.redirect('/admin');
	});

	app.get('/admin/settings', function(req, res) {
		Settings.findOne(function(err, obj){
			var msg = req.flash('message')[0];
			res.render('admin/settings',{layout:'dashboard',message: msg, settings: obj});
		});
		
	});

	app.post('/admin/settings', function(req, res){

		Settings.findOneAndUpdate(
			{_id: req.body._id}, 
			{
				$set:
				{
					company_name: req.body.company_name,
					company_address: req.body.company_address,
					email: req.body.company_email,
					contact_no: req.body.contact_no,
					google_store_link: req.body.google_store_link,
					apple_store_link: req.body.apple_store_link,
					twilio_no: req.body.twilio_no
				}
			}, {new: true}, function(err, doc){
				if(err) {
					req.flash('message', 'Please try again');
				}
				if(doc) {
					req.flash('message', 'Settings updated successfully');
				}
        		res.redirect('/admin/settings');
		});
		
	});
};