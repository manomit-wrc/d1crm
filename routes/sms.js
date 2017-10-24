module.exports = function(app,passport) {

var Sms_template = require('../models/sms_template').Sms_template;
var Event = require('../models/events').Event;

app.get('/admin/sms/', function(req, res) {
		Sms_template.find({}, function(err, sms) {
			console.log(sms);
			res.render('admin/sms/',{layout:'dashboard',smsList:sms});
		});
		
	});
app.get('/admin/sms/add', function(req, res) {
		Event.find({},function(err, obj){
			//var msg = req.flash('message')[0];
			
		res.render('admin/sms/add',{layout:'dashboard',events: obj});
		});
		
	});

 app.post('/admin/sms/create', function(req, res) {
		
		var Sms = new Sms_template({
	       event_id: req.body.event_name,
		   text: req.body.description,
		   status: req.body.status
		   
  		});

		Sms.save(function(err, evt) {
	      if(err) 
	      {
			req.flash('message', 'Please try again');
		  }
			if(evt) {
				req.flash('message', 'Sms added successfully');
			}
			res.redirect('/admin/sms');
		      
		});
	});

 app.get('/admin/sms/edit/:id', function(req, res) {

 	    Event.find({},function(err, obj1){
 	    
		Sms_template.find({_id: req.params['id']}, function(err, obj){
             //console.log(obj);
			res.render('admin/sms/edit',{layout:'dashboard', smsdata:obj,events:obj1});
		});

	});

	});

 app.post('/admin/sms/update/:id', function(req, res) {
		
		Sms_template.findOneAndUpdate(
			{_id: req.params['id']}, 
			{
				$set:
				{
				    event_id: req.body.event_name,
		            text: req.body.description,
		            status: req.body.status
				   
				}
			}, function(err, doc){
				if(err) {
					req.flash('message', 'Please try again');
				}
				if(doc) {
					req.flash('message', 'Sms updated successfully');
				}
        		res.redirect('/admin/sms');
		});
	});

 app.get('/admin/sms/delete/:id', function(req, res) {
		Sms_template.remove({_id: req.params['id']}, function(err, event) {
			req.flash('message', 'Sms deleted successfully');
			res.redirect('/admin/sms');
		});
	});


};