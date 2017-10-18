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
			var msg = req.flash('message')[0];
			res.render('admin/product/index',{layout:'dashboard', product: product, message: msg});
		});
		
	});

	app.get('/admin/product/add', function(req, res) {
		res.render('admin/product/add',{layout:'dashboard'});
	});

	app.post('/admin/product/add', upload.single('image'), function(req, res) {
		
		var newProduct = new Product({
			name: req.body.name,
			code: req.body.code,
			description: req.body.description,
			quantity: req.body.quantity,
			price: req.body.price,
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
};