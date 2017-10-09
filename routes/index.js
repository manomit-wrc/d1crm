module.exports = function(app, passport) {

	var User = require("../models/user").User;

	var bCrypt = require('bcrypt-nodejs');

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

};