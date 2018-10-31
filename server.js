
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var config = require('./config/conf');
var session = require('express-session');
var cors = require('cors');

const router = express.Router();


var routes = require('./routes/main');
var auth_routes = require('./routes/auth');
var dropdown = require('./routes/dropdown');
var users = require('./routes/users');
var absorb = require('./routes/absorb');
var others = require('./routes/others');
var secureRoute = require('./routes/secure-route');
var histories = require('./routes/histories');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


// //app variables
app.set('top_secret' , config.secret);


// // middlewares
app.use(cors());
// app.options('*' , cors())
app.use(logger('dev'));
app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(require('express-session')({
   secret: 'Casa_Casa',
   resave: false,
   saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api' , routes);
app.use('/api' , dropdown);
app.use('/api' , auth_routes);
app.use('/api' , users);
app.use('/api' , absorb);
app.use('/api' , others);
app.use('/api' , histories);
//verified users can access this route
app.use('/user', passport.authenticate('jwt'), secureRoute);


//Error Handling middlewares
app.use(logErrors);
app.use(clientErrorHandler);
app.use(errorHandler);


router.use(function(req, res, next) {
   if (!req.route)
       return next (new Error('404'));  
   next();
});

process.on('uncaughtException', function (err) {
  console.log(err)
   console.log(" ****From  uncaughtException");
   console.log(err.stack);
   console.log(err.message);
});

function clientErrorHandler(err, req, res, next) {
   if (req.xhr) {
       res.send(500, {error: 'Something blew up!'});
   } else {
       next(err);
   }
}
function logErrors(err, req, res, next) {
  console.log(err)
  console.log(" >>>>>>>From  logErrors");
   //console.error(err.stack);
   next(err);
}


function errorHandler(err, req, res, next) {
    if (err instanceof SyntaxError && err.status === 400) {
        return res.status(400).send(JSON.stringify({
            error: {
                code: "INVALID_JSON",
                message: "The body of your request is not valid JSON."
            }
        }))
    }

    console.error(err);
    res.status(500).send();
}

//auth
require('./auth/auth');


//database connection
require('./connection.js');

// app listen
var port = process.env.PORT || 5000

app.listen(port,function(){
  console.log("Nodejs Server listening on port 5000.")
})


///////////////////////////////////////////////////





// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//    var err = new Error('Not Found');
//    err.status = 404;
//    next(err);
// });

// error handlers

// development error handler
// will print stacktrace
// if (app.get('env') === 'development') {
//    app.use(function(err, req, res, next) {
//        res.status(err.status || 500);
//        res.render('error', {
//            message: err.message,
//            error: err
//        });
//    });
// }

// // production error handler
// // no stacktraces leaked to user
// app.use(function(err, req, res, next) {
//    res.status(err.status || 500);
//    res.render('error', {
//        message: err.message,
//        error: {}
//    });
// });

