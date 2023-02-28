/**
 * File name: app.js
 * Student name: Minh Tri Le
 * Student ID: 301323963
 * Date: Feb 9, 2023
 */
require('dotenv').config({ path: __dirname + '/env/local.env' });

let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

// Modules for authentication
let session = require('express-session');
let passport = require('passport');
let passportLocal = require('passport-local');
let localStrategy = passportLocal.Strategy;
let flash = require('connect-flash');

// Database setup
let mongoose = require('mongoose');
const { ServerApiVersion } = require('mongodb');
let DB = require('./db');
// Point mongoose to the DB URI
if (process.env.PRODUCTION_ENV) {
  mongoose.connect(
    DB.URI,
    { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 },
  );
} else {
  mongoose.connect(
    DB.URI,
    { useNewUrlParser: true, useUnifiedTopology: true },
  );
}
// Create an event to let mongo connect to the database
let mongoDB = mongoose.connection;
mongoDB.on('error', console.error.bind(console, 'Connection Error:'));
mongoDB.once('open', () => {
  console.log('Connected to MongoDB...');
});

let indexRouter = require('../routes/index');
let usersRouter = require('../routes/users');
let businessContactsRouter = require('../routes/business_contacts');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../../public')));
app.use(express.static(path.join(__dirname, '../../node_modules')));

// Setup express session.
app.use(session({
  secret: "SomeSecret",
  saveUninitialized: false,
  resave: false
}));

// Initialize flash to maintain the error msg.
app.use(flash());

// Initialize passport.
app.use(passport.initialize());
app.use(passport.session());
// Passport user configuration
// Create a user model instance
let userModel = require('../models/users');
passport.use(userModel.createStrategy());
// Serialize and deserialize the user info
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/business-contacts', businessContactsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', { title:'Error' });
});

module.exports = app;
