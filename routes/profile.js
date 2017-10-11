module.exports = function(app,passport) {
var User = require('../models/user').User;

var bCrypt = require('bcrypt-nodejs');
var session  = require('express-session');

var multer  = require('multer');
	var im = require('imagemagick');
	var fileExt = '';
	var fileName = '';
	var storage = multer.diskStorage({
	  destination: function (req, file, cb) {
	    cb(null, 'public/profile');
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





app.get('/admin/profile/edit', function(req, res) {
		User.findOne(function(err, obj){
			var msg = req.flash('message')[0];
			res.render('admin/profile/edit',{layout:'dashboard',message: msg,profile: obj});
		});
		
	});

app.post('/admin/profile/update',upload.single('event_image') ,function(req, res){

		User.findOneAndUpdate(
			{_id: req.body._id}, 
			{
				$set:
				{
					first_name: req.body.first_name,
					last_name: req.body.last_name,
					address: req.body.profile_address,
					country: req.body.country_name,
					state: req.body.state_name,
					city: req.body.city_name,
					pincode: req.body.pincode,
					avator: fileName
				}
			}, {new: true}, function(err, doc){
				if(err) {
					req.flash('message', 'Please try again');
				}
				if(doc) {
					req.flash('message', 'Profile updated successfully');
				}
        		res.redirect('/admin/profile/edit');
		});
		
	});

 app.get('/admin/profile/changepassword', function(req, res) {
	res.render('admin/profile/changepassword',{layout:'dashboard'});
 });

 app.post('/admin/profile/change_password' ,function(req, res){

		   var oldPwd=req.body.old_password;
		   var newPwd=req.body.new_password;
		   var confPwd=req.body.confirm_password;
		   var user_id = req.body._id;
		   var pwd=req.user.password;
		   console.log(oldPwd);
		   console.log(req.user.password);
		   //console.log(passport.authenticate);
      if(pwd==bCrypt(oldPwd))
	   {
              if(oldPwd==newPwd)
               {
					req.flash('message', 'Old password should be different with new password');
					
               }
               else
               {
                    if(confPwd==newPwd)
                     {
                      User.findOneAndUpdate(
						{_id: req.user._id}, 
						{
							$set:
							{
								password:bCrypt(oldPwd)
								
							}
						}, {new: true}, function(err, doc){
							if(err) {
								req.flash('message', 'Please try again');
							}
							if(doc) {
								req.flash('message', 'Password updated successfully');
							}
			        		res.redirect('/admin/profile/changepassword');
					}); 
                  }
                  else
                  {
                  	req.flash('message', 'New password should be same with confirm password');
                  }
               }
      }
      else
      {
      	req.flash('message', 'Old password does not match with original password');
      }




		
	});


};