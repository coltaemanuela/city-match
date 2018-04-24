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

app.use("/styles",express.static(__dirname + "/styles"));

//firebase initiatialization
firebase.initializeApp(config.firebase);
//user session
app.use(session(config.session));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//routes
app.use('/users', users);
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