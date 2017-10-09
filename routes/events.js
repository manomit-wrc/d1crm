module.exports = function(app) {
	var Event = require('../models/events').Event;

	var multer  = require('multer');
	var im = require('imagemagick');
	var fileExt = '';
	var fileName = '';
	var storage = multer.diskStorage({
	  destination: function (req, file, cb) {
	    cb(null, 'public/events');
	  },
	  filename: function (req, file, cb) {
	    fileExt = file.mimetype.split('/')[1];
	    if (fileExt == 'jpeg'){ fileExt = 'jpg';}
	    fileName = req.user.id + '-' + Date.now() + '.' + fileExt;
	    cb(null, fileName);
	  }
	})

	var restrictImgType = function(req, file, cb) {

	    var allowedTypes = ['image/jpeg','image/gif','image/png'];
	      if (allowedTypes.indexOf(req.file.mimetype) !== -1){
	        // To accept the file pass `true`
	        cb(null, true);
	      } else {
	        // To reject this file pass `false`
	        cb(null, false);
	       //cb(new Error('File type not allowed'));// How to pass an error?
	      }
	};

    var upload = multer({ storage: storage, limits: {fileSize:3000000, fileFilter:restrictImgType} });

	app.get('/admin/events', function(req, res) {
		Event.find({}, function(err, events){
			var msg = req.flash('message')[0];
			res.render('admin/events/index',{layout:'dashboard', events: events, message: msg});
		});
		
	});

	app.get('/admin/events/add', function(req, res) {
		res.render('admin/events/add',{layout:'dashboard'});
	});

	app.post('/admin/events/add', upload.single('event_image'), function(req, res) {
		var event_date = req.body.event_date.split("/");
		var newEvent = new Event({
	       event_name: req.body.event_name,
		   event_date: new Date(event_date[2], event_date[1] - 1, event_date[0]).toISOString(),
		   event_time: req.body.event_time,
		   event_address: req.body.event_address,
		   event_image: fileName
  		});

		newEvent.save(function(err, evt) {
	      if(err) 
	      {
			req.flash('message', 'Please try again');
		  }
			if(evt) {
				req.flash('message', 'Event added successfully');
			}
			res.redirect('/admin/events');
		      
		});
	});

	app.get('/admin/events/delete/:id', function(req, res) {
		Event.remove({_id: req.params['id']}, function(err, event) {
			req.flash('message', 'Event deleted successfully');
			res.redirect('/admin/events');
		});
	});

	app.get('/admin/events/edit/:id', function(req, res) {
		Event.find({_id: req.params['id']}, function(err, event){

			res.render('admin/events/edit',{layout:'dashboard', event:event});
		});
	});

	app.post('/admin/events/edit/:id', upload.single('event_image'), function(req, res) {
		var event_date = req.body.event_date.split("/");
		Event.findOneAndUpdate(
			{_id: req.params['id']}, 
			{
				$set:
				{
				   event_name: req.body.event_name,
				   event_date: new Date(event_date[2], event_date[1] - 1, event_date[0]).toISOString(),
				   event_time: req.body.event_time,
				   event_address: req.body.event_address,
				   event_image: fileName
				}
			}, function(err, doc){
				if(err) {
					req.flash('message', 'Please try again');
				}
				if(doc) {
					req.flash('message', 'Event updated successfully');
				}
        		res.redirect('/admin/events');
		});
	});
};