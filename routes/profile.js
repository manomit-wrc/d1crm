module.exports = function(app,passport) {
var User = require('../models/user').User;

var Client = require("../models/client").Client;
var LocalStrategy   = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jwt-simple');
//var session  = require('express-session');

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
			console.log(obj);
			res.render('admin/profile/edit',{layout:'dashboard',message: msg,profile: obj});
		});
		
	});

app.post('/admin/profile/update',upload.single('profile_image') ,function(req, res){

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

 app.post('/admin/profile/change_password' ,function(req,res){

		   var oldPwd=req.body.old_password;
		   var newPwd=req.body.new_password;
		   var confPwd=req.body.confirm_password;
		   var user_id = req.user._id;
		   var pwd=req.user.password;
           var old_pwd=bCrypt.hashSync(oldPwd);
		   
		   var isValidPassword = function(user, password){
                return bCrypt.compareSync(oldPwd, req.user.password);
            }
               
              if (!isValidPassword(req.user, oldPwd)){
                   //return done(null, false, 
                      //req.flash('message', 'Invalid Password'));
                      console.log('pwd not match')
                      //res.json({message: 'Password does not match with original password'});
                     req.flash('message', 'Password does not match with original password');
                     res.redirect('/admin/profile/changepassword');
                }
                else
                {
                	if(oldPwd==newPwd)
                	{
                        console.log('new pwd match oldpwd');

                        //req.flash('message', 'new password should be different from old password');
                        //res.redirect('/admin/profile/changepassword');
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
										password:bCrypt.hashSync(req.body.new_password)
										
									}
								}, {new: true}, function(err, doc){
									if(err) {
										req.flash('message','Please try again');
									}
									if(doc) {
										req.flash('message','Password updated successfully');
									}
					        		res.redirect('/admin/profile/changepassword');
							}); 
                		 }
                		 else
                		 {
                		 	console.log('new pwd diff conf');
                		 	req.flash('message', 'new password should be same with conf. password');
                            res.redirect('/admin/profile/changepassword');
                		 }
                	}
                }
      
      });


};