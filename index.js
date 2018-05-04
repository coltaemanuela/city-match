var express = require('express');
var firebase = require('firebase');
require('firebase/auth');
require('firebase/database');
var bodyParser = require('body-parser');
var session = require('express-session');
var path = require('path');
var gcloud = require('google-cloud');

var app = express();
var config = require('./config/config.json');
var users = require('./controllers/users');
var compare = require('./controllers/compare');

//setup view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use("/styles",express.static(__dirname + "/styles"));
//firebase initiatialization
firebase.initializeApp(config.firebase);

//storage initialization
var storage = gcloud.storage({
  projectId:'city-match',
  keyFilename: 'city match-420315c4b0a9.json'
});
var bucket = storage.bucket(`city-match.appspot.com`);

//user session
app.use(session(config.session));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//routes
app.use('/users', users);
app.use('/compare', compare);

//homepage
app.get('/', function (req, res) {
    res.render('index');
});
//retrieve search results
app.post('/search', function(req,res){
  var city = req.body.city;
  console.log(city);
  firebase.database().ref(`cities/` + city).once('value')
  .then(function(data) {
      res.render('search_result', {
          city: city,
          details: data.val()
      });
  })
  .catch(function(error) {
    res.send(error);
  });
});

app.use(function (err, req, res, next) {
  console.log(err);
  if (err.name === 'UnauthorizedError') {
    res.send('unauthorized user');
  }
});

//server
app.listen(config.server.port, function () {
  console.log('City match app listening on port: ' + config.server.port );
});
