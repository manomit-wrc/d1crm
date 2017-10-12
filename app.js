var express = require('express');
var session  = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');

var Event = require('./models/events').Event;

var exphbs  = require('express-handlebars');

var app = express();

var port = process.env.PORT || 8080;

var dbConfig = require('./config/db.js');
var mongoose = require('mongoose');
mongoose.connect(dbConfig.url);

var passport = require('passport');
var flash    = require('connect-flash');


require('./config/passport')(passport);


// view engine setup



app.set('views', path.join(__dirname, 'views'));

var hbs = exphbs.create({
extname: '.hbs', //we will be creating this layout shortly
helpers: {
    if_eq: function (a, b, opts) {

        if (a == b) // Or === depending on your needs
            return opts.fn(this);
        else
            return opts.inverse(this);

    },
    inArray: function(array, value, block) {
      if (array.indexOf(value) !== -1) {
        return block.fn(this);

	    }
	    else {
	      return block.inverse(this);
	    }
    },

    for: function(from, to, incr, block) {
    	var accum = 0;
	    for(var i = from; i < to; i += incr)
	        accum += block.fn(i);
	    return accum;
	},
    
    eq: function (v1, v2) {
    	
        return v1 === v2;
    },
    ne: function (v1, v2) {
        return v1 !== v2;
    },
    lt: function (v1, v2) {
        return v1 < v2;
    },
    gt: function (v1, v2) {
        return v1 > v2;
    },
    lte: function (v1, v2) {
        return v1 <= v2;
    },
    gte: function (v1, v2) {
        return v1 >= v2;
    },
    and: function (v1, v2) {
        return v1 && v2;
    },
    or: function (v1, v2) {

        return v1 || v2;

    },
    dateFormat: require('handlebars-dateformat'),
    inc: function(value, options) {
      return parseInt(value) + 1;
    },
    img_src: function(value, options) {
      if (fs.existsSync("public/events/"+value) && value != "") {
        return "/events/"+value;
      }
      else {
        
        return "/admin/assets/img/pattern-cover.png";
      }
    }
 }

});
app.engine('.hbs', hbs.engine);
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(cookieParser());


app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());
app.use(session({
	secret: 'W$q4=25*8%v-}UV',
	resave: true,
	saveUninitialized: true
 })); // session secret
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


require('./routes/index')(app, passport);
app.use(function(req, res, next){
  if (req.isAuthenticated())
  {

    delete req.user.password;
    if (fs.existsSync("public/profile/thumbs/"+req.user.avator) && req.user.avator != "") {
      res.locals.image = "/profile/thumbs/"+req.user.avator;
    }
    else {
      //res.locals.image = "/user2-160x160.jpg";
      res.locals.image = "/admin/assets/img/user-13.jpg";
    }
    res.locals.user = req.user;                            

    res.locals.active = req.path.split('/')[2];
    
    return next();
  }
  res.redirect('/admin');
});

require('./routes/dashboard')(app);
require('./routes/events')(app);
require('./routes/profile')(app);
require('./routes/sms')(app);
require('./routes/email')(app);

// catch 404 and forward to error handler


app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(port);
console.log('The magic happens on port ' + port);

module.exports = app;
