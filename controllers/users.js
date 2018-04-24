var express = require('express');
var firebase = require('firebase');
var router = express.Router();
var auth_user = {};

// middleware to verify if user is authenticated. This will secure some routes
function isAuthenticated (req, res, next) {
    var user = firebase.auth().currentUser;
    if (user !== null) {
        req.user = user;
        next();
    } else {
        res.redirect('/users/login');
    }
}
  
router.get('/register', function(req, res) {
	 res.render('registration', {title: "Sign up" });
});

router.post('/register', function(req, res) {
    //Register a new user with email and password
    firebase.auth().createUserWithEmailAndPassword(req.body.email, req.body.password).then(function(data) {
        // data.sendEmailVerification();
        firebase.auth().signInWithEmailAndPassword(req.body.email, req.body.password).then(function(data) {
            firebase.database().ref(`users/${data.uid}`).set({
                'email': req.body.email,
                'username': req.body.username?req.body.username:"",
                'city':req.body.city? req.body.city: "",
                'age': req.body.age?req.body.age:""
            });
        }).then(function (data) {
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
            console.log(firebase.auth().currentUser.email,firebase.auth().currentUser.uid );            
            res.render('user_profile.ejs', {
                details: details.val()
            });
        });     
    });   
});

router.get('/favorite', isAuthenticated,function(req, res){
    console.log('permission approved');
});
module.exports = router;
