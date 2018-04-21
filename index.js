var express = require('express');
firebase = require('firebase');
var bodyParser = require('body-parser');
var session = require('express-session');
var path = require('path');
var app = express();
var config = require('./config/config.json');
var users = require('./controllers/users');

//setup view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//firebase initiatialization
firebase.initializeApp(config.firebase);
//user session
app.use(session(config.session));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//routes
app.use('/users', users);
app.get('/', function (req, res) {
     res.send('City match app rocks!');
});

//server
app.listen(config.server.port, function () {
  console.log('City match app listening on port: ' + config.server.port );
});