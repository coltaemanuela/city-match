var express = require('express');
var firebase = require('firebase');
var router = express.Router();

router.get('/register', function(req, res) {
	 res.render('registration', {title: "Sign up" });
});

router.post('/register', function(req, res) {
    var email = req.body.email;
    var password = req.body.password;
    var city = req.body.city;
    var username = req.body.username;
    var age = req.body.age;

    //Register a new user with email and password
    firebase.auth().createUserWithEmailAndPassword(email, password).then(function(data) {
        // data.sendEmailVerification();
        firebase.auth().signInWithEmailAndPassword(email, password).then(function(data) {
        firebase.database().ref(`users/${data.uid}`).set({
            'email': email,
            'usename': username,
            'city': city,
            'age': age
        });

        }).then(function (data) {
            res.redirect("/users/login");
        }).catch(function (err) {
            res.render("error", { error: err });
        });
    }).catch(function(error) {
        if (error.code === 'auth/email-already-in-use') {
            res.send('email already in use');
        } else {}
        res.render("error", {
            error: error
        });
    });
});

router.get('/login', function(req, res){
    res.render('login', {title:"Sign in"});
});

router.post('/login', function(req,res){
    firebase.auth().signInWithEmailAndPassword(req.body.email, req.body.password).then(function(data) {
        console.log(data);
        res.send('welcome!');        
    });        
});

module.exports = router;
