module.exports = function(app) {



var Client = require('../models/client').Client;
   

   app.get('/admin/client', function(req, res) {
		Client.find({}, function(err, clients) {
			res.render('admin/client/',{layout:'dashboard',clientList:clients});
		});
		
	});
};