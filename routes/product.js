module.exports = function(app) {
	var Product = require('../models/product').Product;

	var multer  = require('multer');
	var im = require('imagemagick');
	var fileExt = '';
	var fileName = '';
	var storage = multer.diskStorage({
	  destination: function (req, file, cb) {
	    cb(null, 'public/product');
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

	app.get('/admin/product', function(req, res) {
		Product.find({}, function(err, product){
         
         Product.count({}, function(err,count){
			var msg = req.flash('message')[0];
			res.render('admin/product/index',{layout:'dashboard', product: product,count:count, message: msg});
         });

		});
		
	});

	app.get('/admin/product/add', function(req, res) {
		/*for (var i in currency) {
		    if (!currency.hasOwnProperty(i)) continue;
		    console.log(currency[i]);
		}*/
		res.render('admin/product/add',{layout:'dashboard'});
	});

	app.post('/admin/product/add', upload.single('image'), function(req, res) {
		
		var newProduct = new Product({
			name: req.body.name,
			code: req.body.code,
			description: req.body.description,
			quantity: req.body.quantity,
			price: req.body.price,
			symbol: req.body.symbol,
			image: fileName 
		});

		newProduct.save(function(err, product) {
	      if(err) 
	      {
			req.flash('message', 'Please try again');
		  }
			if(product) {
				req.flash('message', 'Product added successfully');
			}
			res.redirect('/admin/product');
		      
		});
	});

	app.get('/admin/product/delete/:id', function(req, res) {
		Product.remove({_id: req.params['id']}, function(err, product) {
			req.flash('message', 'Product deleted successfully');
			res.redirect('/admin/product');
		});
	});

	app.get('/admin/product/edit/:id', function(req, res) {
		Product.find({_id: req.params['id']}, function(err, product){

			res.render('admin/product/edit',{layout:'dashboard', product:product});
		});
	});

	app.post('/admin/product/edit/:id', upload.single('image'), function(req, res) {
		
		Product.findOneAndUpdate(
			{_id: req.params['id']}, 
			{
				$set:
				{
				    name: req.body.name,
					code: req.body.code,
					description: req.body.description,
					quantity: req.body.quantity,
					price: req.body.price,
					symbol: req.body.symbol,
					image: fileName
				}
			}, function(err, product){
				if(err) {
					req.flash('message', 'Please try again');
				}
				if(product) {
					req.flash('message', 'Product updated successfully');
				}
        		res.redirect('/admin/product');
		});
	});


    app.post('/admin/product/inlineUpdate/', function(req, res) {
        
         var pid=req.body.pid;
         var name=req.body.name;
         var code=req.body.code;
         
         Product.findOne(

         //{_id:pid,'code':code,'name':name},
           {_id:pid,'code':code},{_id:pid,'name':name},
          //{ '_id': pid} $and: {'code': code} $and:{'name': name},
			  function(err, product){
				
				if(product) {
					
					res.json({message:"duplicate"});
					
				}
				else
				{

				 Product.findOneAndUpdate(
					{_id:req.body.pid}, 
					{
						$set:
						{
						    name: req.body.name,
							code: req.body.code,
							description: req.body.description,
							quantity: req.body.quantity,
							price: req.body.price,
							symbol: req.body.symbol,
							
						}
					}, function(err, product){
						if(err) {
							req.flash('message', 'Please try again');
						}
						if(product) {

		                   Product.find({_id: pid}, function(err, product){
		                   	//console.log(product);
		                   	  var upd_name=product[0].name;
		                   	  var upd_code=product[0].code;
		                   	  var upd_price=product[0].price;
		                   	  var upd_symbol=product[0].symbol;
		                          res.json({name:upd_name,code:upd_code,price:upd_price,symbol:upd_symbol});
								//res.render('admin/product/edit',{layout:'dashboard', product:product});
							});


							//req.flash('message', 'Product updated successfully');
						   }
		        		   //res.redirect('/admin/product');
				      });
		

                  
				}
        		//res.redirect('/admin/product');
		});
	
    	 
	});




};