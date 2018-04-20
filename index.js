var express = require('express');
firebase = require('firebase');
var bodyParser = require('body-parser');
var session = require('express-session');
var path = require('path');
var app = express();
var users = require('./controllers/users');

//setup view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Firebase initiatialization
var config = {
  apiKey: "AIzaSyD2Ch6ki-gZ98roJx7cj6Rcb2-OY4ZM0vo",
  authDomain: "city-match.firebaseapp.com",
  databaseURL: "https://city-match.firebaseio.com",
  projectId: "city-match",
  storageBucket: "city-match.appspot.com",
  messagingSenderId: "331136100363"
};
firebase.initializeApp(config);

// app.use(session({
//     secret: "HtpodLPfga5l66rh",
//     resave:true,
//     saveUninitialized:true,
//     cookie:{},
//     duration: 45 * 60 * 1000,
//     activeDuration: 15 * 60 * 1000,
// }));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/users', users);


app.get('/', function (req, res) {
     res.send('City match app rocks!');
});

//Server
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
