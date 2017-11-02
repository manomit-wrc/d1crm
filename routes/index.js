module.exports = function(app, passport) {

	var User = require("../models/user").User;

	var Client = require("../models/client").Client;

	var Product = require("../models/product").Product;

	var ProductCart = require("../models/product_cart").ProductCart;

	var bCrypt = require('bcrypt-nodejs');

	var Order = require("../models/order").Order;


	var jwt = require('jwt-simple');

	var url = require('url');

	var fs = require('fs');

	var base64Img = require('base64-img');

	var FCM = require('fcm-node');
    var serverKey = 'AAAAUdnMgPw:APA91bEW2wNomqp3O6XdAY1GEb8M3LSFlVaI5wy5GpvhOs_jo7t1A1UVP0LD_qX3uRu-bjj0Aghcd8v96MxCfxLi3MlVhBrvfpDSGj9QNpPar8EtLrxnN52WEcscujnJ5BgP1_adeTs-'; //put your server key here 
    var fcm = new FCM(serverKey);

    var nodemailer = require('nodemailer');

    var ForgotPassword = require('../models/forgot_password').ForgotPassword;

	// =====================================
	// Login PAGE (with login links) ========
	// =====================================


	app.get('/test_noti', function(req, res) {
		var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera) 
        to: 'mhVARvSPfgQ:APA91bH09qNTaLhQvWAIib7kMPzCM8wo8UH5t7B0X4kknsG7MLYRArlI4f7jOgTN0_3Rbsv-TcAsDARglTGOSPKY3EDSdZR3DEkymQjkcd7tL78wx_U-fZJpprovEnhc9ypiiVzk9tpK', 
        collapse_key: 'green',
        
        notification: {
            title: 'Test', 
            body: 'Test' 
        },
        
        data: {  //you can send only notification or only data(or include both) 
            "my_key": 'my value',
            "my_another_key": 'my another value',
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
    
	});


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
		   address: req.body.address,
		   city_name: req.body.city_name,
		   state_name: req.body.state_name,
		   country_name: req.body.country_name,
		   pincode: req.body.pincode,
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

        
    	Client.findOne({ 'email' :  req.body.email },  { image: 0 }, 
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

    app.post('/client/fcm_update', function(req, res) {
    	var token = getToken(req.headers);
    	if (token) {
	    	var decoded = jwt.decode(token, "W$q4=25*8%v-}UW");
	    	Client.findOneAndUpdate(
				{ _id: decoded._id}, 
				{
					$set:
					{
					   device_id: req.body.device_id
					}
				}, function(err, client){
					if(err) {
						res.json({success: false, msg: "Please try again"});
					}
					if(client) {
						res.json({success: true, msg: "Device updated successfully"});
					}
	        		
			});
	    }
    });

    app.get('/client/profile', passport.authenticate('jwt', { session: false}), function(req, res) {
		var token = getToken(req.headers);
		var clientArr = new Array();
		var clientImage = '';
		var hostname = req.headers.host;
		if (token) {
	    	var decoded = jwt.decode(token, "W$q4=25*8%v-}UW");
	    	Client.findOne({ _id: decoded._id} , { original_password: 0, password: 0 } , function(err, client){

	    		if(err) {
	    			res.json({success: false, msg: "Client not found"});
	    		}
	    		else {
    				if (client.image != "") {
						imageName = "http://" + hostname + "/" + client.image;
			        
			        }
				    else {
				        imageName = "http://" + hostname + "/admin/assets/img/user-13.jpg";
				        
				    }
				    clientArr.push({
				    	_id: client._id,
				    	first_name: client.first_name,
				    	last_name: client.last_name,
				    	email: client.email,
				    	mobile_no: client.mobile_no,
				    	pincode: client.pincode,
				    	city_name: client.city_name,
				    	state_name: client.state_name,
				    	country_name: client.country_name,
				    	address: client.address,
				    	image: imageName
				    });
	    			res.json({success: true, client: clientArr});
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
	    	    console.log(req.body);
	    		Client.findOneAndUpdate(
				{ _id: decoded._id}, 
				{
					$set:
					{
					   first_name: (req.body.first_name !="" && req.body.first_name != null) ? req.body.first_name : decoded.first_name,	
					   last_name: (req.body.last_name !="" && req.body.last_name != null) ? req.body.last_name : decoded.last_name,	
					   mobile_no: (req.body.mobile_no !="" && req.body.mobile_no != null) ? req.body.mobile_no : decoded.mobile_no,		
					   address: (req.body.address !="" && req.body.address != null) ? req.body.address : decoded.address,	
					   city_name: (req.body.city_name !="" && req.body.city_name != null) ? req.body.city_name : decoded.city_name,
					   state_name: (req.body.state_name !="" && req.body.state_name != null) ? req.body.state_name : decoded.state_name,
					   country_name: (req.body.country_name !="" && req.body.country_name != null) ? req.body.country_name : decoded.country_name,
					   pincode: (req.body.pincode !="" && req.body.pincode != null) ? req.body.pincode : decoded.pincode 
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

	app.post('/client/profile/image', passport.authenticate('jwt', { session: false }), function(req, res) {
		var token = getToken(req.headers);
		if(token) {
			var decoded = jwt.decode(token, "W$q4=25*8%v-}UW");
			var random_otp = Math.floor(100000 + Math.random() * 900000);
			base64Img.img(req.body.image, 'public/profile', random_otp, function(err, filepath) {
					Client.findOneAndUpdate(
					{ _id: decoded._id}, 
					{
						$set:
						{
						   image: filepath.replace('public/', '')
						}
					}, function(err, client){
						if(err) {
							res.json({success: false, msg: "Please try again"});
						}
						if(client) {
							res.json({success: true, msg: "Profile image updated successfully"});
						}
		        		
				});
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

	app.get('/client/products', passport.authenticate('jwt', { session: false }), function(req, res) {
		var token = getToken(req.headers);
		var hostname = req.headers.host;
  		var productArr = new Array();
  		var imageName = "";
		if(token) {
			Product.find({}, function(err, products) {
				if(err) {
					res.json({success: false, msg: "Please try again"});
				}
				if(products) {

					for(var i=0; i<products.length; i++)
					{
						if (fs.existsSync("public/product/"+products[i].image) && products[i].image != "") {
						imageName = "http://" + hostname + "/product/"+products[i].image;
				        
				        }
					    else {
					        imageName = "http://" + hostname + "/admin/assets/img/pattern-cover.png";
					        
					    }
					    productArr.push({
					    	_id: products[i]._id,
					    	name: products[i].name,
					    	code: products[i].code,
					    	description: products[i].description,
					    	quantity: products[i].quantity,
					    	price: products[i].price,
					    	symbol: products[i].symbol,
					    	image: imageName
					    });
					}
					res.json({success: true, msg: "Product List", products:productArr});
				}
			});
		}
	});

	app.get('/client/product/:id', passport.authenticate('jwt', { session: false }), function(req, res) {
		var token = getToken(req.headers);
		var hostname = req.headers.host;
  		var productArr = new Array();
  		var imageName = "";
		if(token) {
			Product.find({_id: req.params['id']}, function(err, product) {
				if(err) {
					res.json({success: false, msg: "Please try again"});
				}
				if(product) {
					if (fs.existsSync("public/product/"+product[0].image) && product[0].image != "") {
						imageName = "http://" + hostname + "/product/"+product[0].image;
				        
			        }
				    else {
				        imageName = "http://" + hostname + "/admin/assets/img/pattern-cover.png";
				        
				    }
				    productArr.push({
				    	_id: product[0]._id,
				    	name: product[0].name,
				    	code: product[0].code,
				    	description: product[0].description,
				    	quantity: product[0].quantity,
				    	price: product[0].price,
				    	symbol: product[0].symbol,
				    	image: imageName
				    });
					res.json({success: true, msg: "Product List", product:productArr});
				}
			});
		}
	});

	app.post('/client/product/add_to_cart', passport.authenticate('jwt', { session: false }), function(req, res) {
		var token = getToken(req.headers);
		if(token) {
			var decoded = jwt.decode(token, "W$q4=25*8%v-}UW");
			var newCart = new ProductCart({
				product_id: req.body.product_id,
				client_id: decoded._id,
				quantity: req.body.quantity,
				price: req.body.price,
				added_date: new Date()
			});

			newCart.save(function(err, client) {
			      if(err) {
			         res.json({success: false, msg: 'Please try again', err: err});
			      }
			      else {
			      	
			  		res.json({success: true, msg: 'Product added to cart successfully'});
			      }
		      
	  		});	
		}
	});

	app.post('/client/product/remove_cart', passport.authenticate('jwt', { session: false }), function(req, res) {
		var token = getToken(req.headers);
		if(token) {
			 ProductCart.remove({_id: req.body.cart_id}, function(err, product_cart) {
				res.json({success: true, msg: 'Product remove from cart successfully'});
			});
		}
	});

	app.post('/client/product/place_order', passport.authenticate('jwt', { session: false}), function(req, res) {
		var token = getToken(req.headers);
		if(token) {
			var invoice_no = Math.floor(100000 + Math.random() * 900000);
			var decoded = jwt.decode(token, "W$q4=25*8%v-}UW");
			var newOrder = new Order({
				client_id: decoded._id,
				invoice_no: invoice_no,
				items: JSON.stringify(req.body)
			});

			newOrder.save(function(err, order) {
				if(order) {
					res.json({success: true, msg: 'Order placed successfully', invoice_no: invoice_no});
				}
			});
		}
	});

	app.post('/client/product/confirm_order', passport.authenticate('jwt', { session: false}), function(req, res) {
		var token = getToken(req.headers);
		if(token) {
			var decoded = jwt.decode(token, "W$q4=25*8%v-}UW");
			var invoice_no = req.body.invoice_no;
			var transaction_id = req.body.transaction_id;
			Order.findOneAndUpdate(
					{ invoice_no: invoice_no}, 
					{
						$set:
						{
						   status: '1',
						   transaction_no: req.body.transaction_id
						}
					}, function(err, order){
						var obj = JSON.parse(order.items);
						for(var i=0;i<obj.length;i++) {
							ProductCart.remove({_id: obj[i].cart_id}, function(err, product_cart) {
								
							});
						}
						setTimeout(function(){ res.json({success: true, msg: 'Order confirmed successfully'});}, 2000);
		        		
					});
		}
	});

	app.get('/client/products/cart_list', passport.authenticate('jwt', { session: false }), function(req, res) {
		var token = getToken(req.headers);
		if(token) {
			var decoded = jwt.decode(token, "W$q4=25*8%v-}UW");
			 ProductCart.aggregate([
			    {
			      $lookup:
			        {
			          from: "products",
			          localField: "product_id",
			          foreignField: "_id",
			          as: "products"
			        }
			   }
			], function(err, product_list) {
				var hostname = req.headers.host;
		  		var productArr = new Array();
		  		var imageName = "";
				for(var i=0;i<product_list.length;i++) {
					if(product_list[i].client_id == decoded._id) {
					if (fs.existsSync("public/product/"+product_list[i].products[0].image) && product_list[i].products[0].image != "") {
						imageName = "http://" + hostname + "/product/"+product_list[i].products[0].image;
				        
			        }
				    else {
				        imageName = "http://" + hostname + "/admin/assets/img/pattern-cover.png";
				        
				    }
				    productArr.push({
				    	cart_id: product_list[i]._id,
				    	product_id: product_list[i].product_id,
				    	product_name: product_list[i].products[0].name,
				    	quantity: product_list[i].quantity,
				    	price: product_list[i].price,
				    	added_date: product_list[i].added_date,
				    	image: imageName
				    });
					
					}

					
				}
				res.json({success: true, product_list: productArr});
			});
		}
	});

	app.post('/client/forgot-password', function(req, res) {
		Client.findOne({ 'email' :  req.body.email }, 
              function(err, client) {
                // In case of any error, return using the done method
                if (err)
                  res.json({success: false, msg: 'Please try again'});
                // Username does not exist, log error & redirect back
                if (!client){
                  res.json({success: false, msg: "Username didn't matched"});                
                }
                else {

                	var random_otp = Math.floor(100000 + Math.random() * 900000);
                	var newForgotPassword = new ForgotPassword({
				       email: req.body.email,
				       otp: random_otp
			  		});

			  		newForgotPassword.save(function(err, client) {
					      if(err) {
					         res.json({success: false, msg: 'Please try again'});
					      }
					      else {
						      	nodemailer.createTestAccount(function(err, account){
					        	var transporter = nodemailer.createTransport({
								        host: 'smtp.gmail.com',
								        port: 587,
								        secure: false, // true for 465, false for other ports
								        auth: {
								            user: "wrctecpl@gmail.com", // generated ethereal user
								            pass: "Parth0Sen"  // generated ethereal password
								        }
								    });

					        	var mailOptions = {
							        from: 'wrctecpl@gmail.com', // sender address
							        to: req.body.email, // list of receivers
							        subject: 'OTP', // Subject line
							        text: 'There is your OTP', // plain text body
							        html: '<b>'+random_otp+'</b>' // html body
					    		};

						    	transporter.sendMail(mailOptions, function (error, info){
							        if (error) {
							            res.json(error);
							        }
							        else {
							        	res.json({success: true, msg: "An OTP has been sent to your email."});
							        }
							    });
					        });
					      }
					      
				  	});

                	
                }
                
              }
        );
	});

	app.post('/client/reset-password', function(req, res) {
		ForgotPassword.findOne({ 'otp' :  req.body.otp }, function(err, client) {
			if(err) {
				res.json({success: false, msg: 'Please try again.'});
			}
			if(!client) {
				res.json({success: false, msg: 'OTP does not matched.'});
			}
			else {
				
		    	Client.findOneAndUpdate(
					{ email: client.email}, 
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
							res.json({success: true, msg: "Password change successfully"});
						}
		        		
				});
			}
		})
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