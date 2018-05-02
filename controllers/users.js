var express = require('express');
var firebase = require('firebase');
var gcloud = require('google-cloud');
var config = require('../config/config.json');
var utils= require('../utils.js');
var router = express.Router();
var existing_recommendations =[];
var auth_user = {};

//storage initialization
var storage = gcloud.storage({
    projectId:'city-match',
    keyFilename: 'city match-420315c4b0a9.json'
  });
var bucket = storage.bucket(`city-match.appspot.com`);

//get public link of the image from Storage based on city name
 function getImageUrl(name){
    var filePath = name + ".jpg";
    var citiesPath = 'cities/' + filePath;
    var storageFile = bucket.file(citiesPath);
    var url = storageFile.getSignedUrl({
     action: 'read',
     expires: '03-09-2491'
   }).then(signedUrls => {
    //  console.log(signedUrls[0]);
     return signedUrls[0]; 
   });
}

// getImageUrl("Belfast");

// middleware to verify if user is authenticated. This will secure some routes
function isAuthenticated (req, res, next) {
    var user = firebase.auth().currentUser;
    console.log('current user ' + user);
    if (user !== null) {
        req.user = user;
        next();
    } else {
        res.redirect('/users/login');
    }
}

router.get('/register', function(req, res) {
	firebase.database().ref(`cities`).once('value').then(function(cities_details){
		// console.log( Object.keys(cities_details.val()));
		var cities_list= Object.keys(cities_details.val());
			 res.render('registration', {
				 title: "Sign up",
				 cities_list: cities_list
			 });
	}).catch(function(error) {
			console.log(error);
		  res.send('error');
	});
});

router.post('/register', function(req, res) {
    //Register a new user with email and password
    firebase.auth().createUserWithEmailAndPassword(req.body.email, req.body.password).then(function(data) {
        firebase.auth().signInWithEmailAndPassword(req.body.email, req.body.password).then(function(data) {
            firebase.database().ref(`users/${data.uid}`).set({
                'email': req.body.email,
                'username': req.body.username?req.body.username:"",
                'city':req.body.city? req.body.city: "",
                'age': req.body.age?req.body.age: 18
            });
        }).then(function (data) {
            //ask new user to login
            res.redirect("/users/login");
        }).catch(function (err) {
            res.send("error");
        });
    }).catch(function(error) {
        if (error.code === 'auth/email-already-in-use') {
            res.send('email already in use');
        }
        console.log(error);
       res.send('error');
    });
});

router.get('/login', function(req, res){
    res.render('login', {title:"Sign in"});
});

router.post('/login', function(req,res){
    firebase.auth().signInWithEmailAndPassword(req.body.email, req.body.password).then(function(data) {
        firebase.database().ref(`users/${data.uid}`).once('value')
        .then(function(details) {
            console.log(firebase.auth().currentUser.email,firebase.auth().currentUser.uid, details.val());      
            res.render('user_profile.ejs', {
                details: details.val(),
                existing_recommendations: existing_recommendations
            });
        });
    });
});

router.post('/favorite', isAuthenticated,function(req, res){
    console.log('permission approved'+ req.user.uid);
    var filePath = req.body.city + ".jpg";
    var citiesPath = 'cities/' + filePath;
    var storageFile = bucket.file(citiesPath);
    var url = storageFile.getSignedUrl({
     action: 'read',
     expires: '03-09-2491'
   }).then(signedUrls => {
    //  console.log(signedUrls[0]);
    firebase.database().ref(`users/${req.user.uid}/favorites`).push({
        "city":req.body.city,
        "population": req.body.city_population,
        "timestamp": Date.now(),
        "imageUrl":signedUrls[0]
    });
    //  return signedUrls[0]; 
   });
    // console.log("image url:",);    
   
});

//todo: rename to /pinCity
router.post('/interestedin', isAuthenticated, function(req, res) {
    console.log('permission approved'+ req.user.uid);
    firebase.database().ref(`users/${req.user.uid}/interestedin`).push({
        "city": req.body.city,
        "timestamp": Date.now()
    });
    res.send("city " + req.body.city + " added as favorite");
});

//todo: post /unpinCity

router.post('/review', isAuthenticated,function(req, res){
    console.log('permission approved'+ req.user.uid);
    firebase.database().ref(`users/${req.user.uid}/reviews`).push({
        "city":req.body.city,
        "title": req.body.review_title,
        "review_body": req.body.review_body,
        "timestamp": Date.now()
    });
});

router.post('/recommendations', isAuthenticated, function(req, res){
    var spare_time= req.body.spare-time;
    var workplace = req.body.workplace;
    var career = req.body.career;
    var risk = req.body.risk;
    var color = utils.hexToRgbA(req.body.color);

    console.log('permission approved'+ req.user.uid);
});

module.exports = router;
