var express = require('express');
var firebase = require('firebase');
var gcloud = require('google-cloud');
var config = require('../config/config.json');
var utils= require('../utils.js');
var querybase = require('querybase');
var router = express.Router();
var auth_user = {};

//storage initialization
var storage = gcloud.storage({
    projectId:'city-match',
    keyFilename: 'city match-420315c4b0a9.json'
  });
var bucket = storage.bucket(`city-match.appspot.com`);
var existing_recommendations =[];

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

router.post('/reviews', isAuthenticated,function(req, res){
    console.log('permission approved'+ req.user.uid);
    firebase.database().ref(`cities/${req.body.cityName}/reviews`).push({
        "userid": req.user.uid,
        "title": req.body.reviewTitle,
        "body": req.body.reviewBody,
        "timestamp": Date.now(),
        "rating": req.body.reviewRating
    });
});

module.exports = router;