module.exports = function(app) {
	var Event = require('../models/events').Event;
	var Presentation = require('../models/presentations').Presentation;
	var Client = require('../models/client').Client;

	var FCM = require('fcm-node');
    var serverKey = 'AAAAUdnMgPw:APA91bEW2wNomqp3O6XdAY1GEb8M3LSFlVaI5wy5GpvhOs_jo7t1A1UVP0LD_qX3uRu-bjj0Aghcd8v96MxCfxLi3MlVhBrvfpDSGj9QNpPar8EtLrxnN52WEcscujnJ5BgP1_adeTs-'; //put your server key here 
    var fcm = new FCM(serverKey);

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

	app.get('/admin/events/:id/presentations', function(req, res) {
		Presentation.aggregate([
			
		    {
		      $lookup:
		        {
		          from: "events",
		          localField: "event_id",
		          foreignField: "_id",
		          as: "presentation_docs"
		        }
		   }
		], function(err, presentation) {
			var msg = req.flash('message')[0];
			res.render('admin/presentation/index',
				{
					layout:'dashboard', 
					presentation:presentation,
					event_id: req.params['id'],
					message: msg
				});
		});
	});

	app.get('/admin/events/:event_id/presentations/add', function(req, res) {
		res.render('admin/presentation/add', 
		{
			layout: 'dashboard', 
			event_id: req.params['event_id']
		});
	});

	app.post('/admin/events/:event_id/presentations/add', function(req, res) {
      

      var prestObj = new Presentation({
			event_id: req.params['event_id'],
			question_name: req.body.question_name,
			answer_type: req.body.answer_type,
			answer_name: req.body.answer_type == "1" ? req.body.answer_name : '',
			status: '1'
		});

		prestObj.save(function(err, prst) {
	      if(err) 
	      {
			req.flash('message', 'Please try again');
		  }
			if(prst) {

             Client.find({}, function(err, clients) {

               for(var i=0;i<clients.length;i++)
	            {
	            	
	            	  var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera) 
					        to:clients[i].device_id, 
					        collapse_key: 'green',
					        
					        notification: {
					            title: 'D1 EVENT'
					        },
					        
					        data: {  //you can send only notification or only data(or include both)
					            "question": req.body.question_name,
					            "description": req.body.answer_type == "1" ? req.body.answer_name : '',
					            "statement_type": req.body.answer_type,
					            "content-available": "1"
					        }
					    };

					     fcm.send(message, function(err, response){
					        if (err) {
					            console.log(err);
					        } else {
					            console.log("Successfully sent with response: ", response);
					        }
					    });
	            }

				req.flash('message', 'Presentation added successfully');

			});

			}
			res.redirect('/admin/events/'+req.params['event_id']+'/presentations');
		      
		});


     
     


	});

	app.get('/admin/events/:event_id/presentations/edit/:id', function(req, res) {
		Presentation.find({_id:req.params['id']}, function(err, presentation) {

			res.render('admin/presentation/edit', 
			{
				layout: 'dashboard', 
				event_id: req.params['event_id'],
				presentation: presentation
			});
		});
		
	});

	app.post('/admin/events/:event_id/presentations/edit/:id', function(req, res) {

		
        var updateStatus=req.body.update;
        var pushStatus=req.body.push;
        if(updateStatus=="updt")
        {
		Presentation.findOneAndUpdate(
			{_id: req.params['id'], event_id: req.params['event_id']}, 
			{
				$set:
				{
			        event_id: req.params['event_id'],
					question_name: req.body.question_name,
					answer_type: req.body.answer_type,
					answer_name: req.body.answer_type == "1" ? req.body.answer_name : '',
					status: '1'
				}
			}, function(err, presentation){
				if(err) {
					req.flash('message', 'Please try again');
				}
				if(presentation) {
					req.flash('message', 'Presentation updated successfully');
				}
        		res.redirect('/admin/events/'+req.params['event_id']+'/presentations');
		});

	  }
	  else if(pushStatus=="push")
	  {
          
          Presentation.findOneAndUpdate(
			{_id: req.params['id'], event_id: req.params['event_id']}, 
			{
				$set:
				{
			        event_id: req.params['event_id'],
					question_name: req.body.question_name,
					answer_type: req.body.answer_type,
					answer_name: req.body.answer_type == "1" ? req.body.answer_name : '',
					status: '1'
				}
			}, function(err, presentation){
				if(err) {
					req.flash('message', 'Please try again');
				}
			if(presentation) {

              Client.find({}, function(err, clients) {

               for(var i=0;i<clients.length;i++)
	            {
	            	
	            	  var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera) 
					        to:clients[i].device_id, 
					        collapse_key: 'green',
					        
					        notification: {
					            title: 'D1 EVENT'
					        },
					        
					        data: {  //you can send only notification or only data(or include both)
					            "question": req.body.question_name,
					            "description": req.body.answer_type == "1" ? req.body.answer_name : '',
					            "statement_type": req.body.answer_type,
					            "content-available": "1"
					        }
					    };

					     fcm.send(message, function(err, response){
					        if (err) {
					            console.log(err);
					        } else {
					            console.log("Successfully sent with response: ", response);
					        }
					    });
	              }

				   req.flash('message', 'Presentation added successfully');

			      });

                  req.flash('message', 'Presentation updated successfully');
                  
				}
        		res.redirect('/admin/events/'+req.params['event_id']+'/presentations');
		   });


	  }


	});

	app.get('/admin/events/:event_id/presentations/delete/:id', function(req, res) {
		Presentation.remove({_id:req.params['id']}, function(err, presentation) {
			req.flash('message', 'Presentation deleted successfully');
			res.redirect('/admin/events/'+req.params['event_id']+'/presentations');
		});
		
	});
};