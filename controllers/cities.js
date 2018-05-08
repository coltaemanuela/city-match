var express = require('express');
var firebase = require('firebase');
var gcloud = require('google-cloud');
var config = require('../config/config.json');
var utils= require('../utils.js');
var router = express.Router();

//storage initialization
var storage = gcloud.storage({
    projectId:'city-match',
    keyFilename: 'city match-420315c4b0a9.json'
  });
var bucket = storage.bucket(`city-match.appspot.com`);

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
    console.log(req.body);
    firebase.database().ref(`cities/${req.body.city}/reviews`).push({
        "userid": req.user.uid,
        "title": req.body.review_title,
        "body": req.body.review_body,
        "timestamp": Date.now(),
        "rating": req.body.rating
    });
    res.status(200).send("Review added.");
});

module.exports = router;