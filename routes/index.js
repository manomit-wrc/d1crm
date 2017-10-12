module.exports = function(app, passport) {

	var User = require("../models/user").User;

	var Client = require("../models/client").Client;

	var bCrypt = require('bcrypt-nodejs');


	var jwt = require('jwt-simple');


	// =====================================
	// Login PAGE (with login links) ========
	// =====================================
	app.get('/admin', function(req, res) {

		var msg = req.flash('loginMessage')[0];
		
		res.render('admin/login',{layout:'login',message: msg});
	});


	
	// process the login form
	app.post('/admin', passport.authenticate('local-login', {
            successRedirect : '/admin/dashboard', // redirect to the secure profile section
            failureRedirect : '/admin', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
		}),
        function(req, res) {
            

            if (req.body.remember_me) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        
		res.redirect('/admin');
    });

    

    /*app.get('/test', function(req, res) {
    	var newUser = new User({
	       first_name: "Partho",
		   last_name: "Sen",
		   email: "admin@d1crm.com",
		   password: bCrypt.hashSync('wrc2017'),
		   address: "J-1/12 Block EP-GP, 2nd Floor, Saltlake",
		   country: "India",
		   state: "West Bengal",
		   city: "Kolkata",
		   pincode: "700091",
		   avator: ""
  		});

		  newUser.save(function(err) {
		      if(err) {
		         console.log(err);
		      }
		      
		  });
    });*/

    app.post('/client/register', function(req, res) {
    	var newClient = new Client({
	       first_name: req.body.first_name,
		   last_name: req.body.last_name,
		   email: req.body.email,
		   password: bCrypt.hashSync(req.body.password),
		   original_password: req.body.password,
		   mobile_no: req.body.mobile_no,
		   device_id: req.body.device_id,
		   platform: req.body.platform
  		});

  		newClient.save(function(err, client) {
		      if(err) {
		         res.json({success: false, msg: 'Please try again'});
		      }
		      else {
		      	var token = jwt.encode(client, "W$q4=25*8%v-}UW");
		  		res.json({success: true, token: 'Bearer ' + token});
		      }
		      
	  	});
    });

    app.post('/client/login', function(req, res) {
    	var isValidPassword = function(client, password){
                return bCrypt.compareSync(new_password, password);
        }
        
    	Client.findOne({ 'email' :  req.body.email }, 
              function(err, client) {
                // In case of any error, return using the done method
                if (err)
                  res.json({success: false, msg: 'Please try again'});
                // Username does not exist, log error & redirect back
                if (!client){
                  res.json({success: false, msg: "Username or password didn't matched"});                
                }
                else {
                	if(bCrypt.compareSync(req.body.password, client.password)) {
                		var token = jwt.encode(client, "W$q4=25*8%v-}UW");
		  				res.json({success: true, token: 'Bearer ' + token});
                	}
                	else {
                		res.json({success: false, msg: "Username or password didn't matched"});
                	}
                }
                
              }
        );
    });

    app.get('/client/profile', passport.authenticate('jwt', { session: false}), function(req, res) {
		var token = getToken(req.headers);
		if (token) {
	    	var decoded = jwt.decode(token, "W$q4=25*8%v-}UW");
	    	Client.findOne({ 'email': decoded.email} , { original_password: 0, password: 0 } , function(err, client){

	    		if(err) {
	    			res.json({success: false, msg: "Client not found"});
	    		}
	    		else {
	    			res.json({success: true, client: client});
	    		}
	    		
	    	});
			
		} else {
			res.json({success: false, msg: "Token not found"});
		}
	});

	app.post('/client/profile/update', passport.authenticate('jwt', { session: false}), function(req, res) {
		var token = getToken(req.headers);
		if (token) {
	    	var decoded = jwt.decode(token, "W$q4=25*8%v-}UW");
	    	Client.findOneAndUpdate(
				{ _id: decoded._id}, 
				{
					$set:
					{
					   first_name: req.body.first_name,
					   last_name: req.body.last_name,
					   mobile_no: req.body.mobile_no,
					   address: req.body.address,
					   country_name: req.body.country_name,
					   state_name: req.body.state_name,
					   city_name: req.body.city_name,
					   pincode: req.body.pincode
					}
				}, function(err, client){
					if(err) {
						res.json({success: false, msg: "Please try again"});
					}
					if(client) {
						res.json({success: true, msg: "Profile updated successfully"});
					}
	        		
			});
	    }
	});

	app.post('/client/change-password', passport.authenticate('jwt', { session: false}), function(req, res) {
		var token = getToken(req.headers);
		var isValidPassword = function(client, password){
                return bCrypt.compareSync(new_password, password);
        }
		if(token) {
			var decoded = jwt.decode(token, "W$q4=25*8%v-}UW");
			if(bCrypt.compareSync(req.body.old_password, decoded.password)) {
        		
	  				Client.findOneAndUpdate(
					{ _id: decoded._id}, 
					{
						$set:
						{
						   password: bCrypt.hashSync(req.body.new_password),
						   original_password: req.body.new_password
						}
					}, function(err, client){
						if(err) {
							res.json({success: false, msg: "Please try again"});
						}
						if(client) {
							res.json({success: true, msg: "Password updated successfully"});
						}
		        		
				});
        	}
        	else {
        		res.json({success: false, msg: "Old password didn't match"});
        	}
		}
	});

    getToken = function (headers) {
	  if (headers && headers.authorization) {
	    var parted = headers.authorization.split(' ');
	    if (parted.length === 2) {
	      return parted[1];
	    } else {
	      return null;
	    }
	  } else {
	    return null;
	  }
    }

};