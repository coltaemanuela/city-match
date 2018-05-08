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
var filters = require('./controllers/filters');
var cities = require('./controllers/cities');

//setup view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use("/styles",express.static(__dirname + "/styles"));
//firebase initialization
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
app.use('/filters',filters);
app.use('/cities', cities);

//homepage
app.get('/', function (req, res) {
    res.render('index');
});
//retrieve search results
app.post('/search', function(req,res){
  var city = req.body.city;
  var sumOfRatings = 0;

  console.log(city);
  firebase.database().ref(`cities/` + city).once('value').then(function(data){
    /*
      iterate over the /reviews collection
      have a variable that serves as counter (of number of reviews)
      have a variable that serves as sum (of ratings of all reviews)  
    */
    firebase.database().ref(`cities/` + city + `/reviews`).once('value').then(function(reviews){
      //calculate average rating of all reviews for the city, if there are any
      if (reviews.val() != null) {
        Object.keys(reviews.val()).forEach(function(k) {
          sumOfRatings += parseFloat(reviews.val()[k].rating);
         });
        var averageRating = sumOfRatings / Object.keys(reviews.val()).length;
        averageRating.toFixed(2);
        
        // get current user if logged in
        var user = firebase.auth().currentUser;
        if (user !== null) {
            req.user = user;
            // check if city is in favorites
            firebase.database().ref(`users/${user.uid}/favorites/${city}`).once("value").then(function(snapshot) {
              var favorite = (snapshot.val() !== null);
             res.render('search_result', {
                  city: city,
                  favorite: favorite,
                  averageRating: averageRating,
                  details: data.val()
              });
            });
        } else {
          res.render('search_result', {
            city: city,
            favorite: false,
            averageRating: averageRating,
            details: data.val()
          });
        }
      } else {
        res.render('search_result', {
          city: city,
          favorite: false,
          averageRating: " ",
          details: data.val()
        });
        }
    })
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