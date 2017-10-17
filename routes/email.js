module.exports = function(app,passport) {

//var Sms_template = require('../models/sms_template').Sms_template;
var Event = require('../models/events').Event;
var Email_template = require('../models/email_template').Email_template;

app.get('/admin/email/', function(req, res) {
		Email_template.find({}, function(err, email) {
			res.render('admin/email/',{layout:'dashboard',emaillist:email});
		});
		
	});
app.get('/admin/email/add', function(req, res) {
		Event.find({},function(err, email){
			//var msg = req.flash('message')[0];
			
		res.render('admin/email/add',{layout:'dashboard',emails:email});
		});
		
	});

 app.post('/admin/email/create', function(req, res) {
		
		var Email = new Email_template({
	       event_id: req.body.event_name,
		   text: req.body.description,
		   status: req.body.status
		   
  		});

		Email.save(function(err, evt) {
	      if(err) 
	      {
			req.flash('message', 'Please try again');
		  }
			if(evt) {
				req.flash('message', 'Email added successfully');
			}
			res.redirect('/admin/email');
		      
		});
	});

 app.get('/admin/email/edit/:id', function(req, res) {

 	    Event.find({},function(err, obj1){
 	    
		Email_template.find({_id: req.params['id']}, function(err, obj){
             //console.log(obj);
			res.render('admin/email/edit',{layout:'dashboard', emaildata:obj,events:obj1});
		});

	});

	});

 app.post('/admin/email/update/:id', function(req, res) {
		
		Email_template.findOneAndUpdate(
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
					req.flash('message', 'Email updated successfully');
				}
        		res.redirect('/admin/email');
		});
	});

 app.get('/admin/email/delete/:id', function(req, res) {
		Email_template.remove({_id: req.params['id']}, function(err, event) {
			req.flash('message', 'Email deleted successfully');
			res.redirect('/admin/email');
		});
	});


};