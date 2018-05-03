var express = require('express');
var firebase = require('firebase');
var router = express.Router();

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

//gets favorite city names only
function mapFavorites(fav_cities) {
    var ret = [];
    if(fav_cities.val() != null) {
        ret = Object.keys(fav_cities.val()).map(function(key){
            return fav_cities.val()[key].city;
        });
    }
    return ret;
}

//gets favorite cities by user
function getFavorites(req) {
    return firebase.database().ref(`users/${req.user.uid}/favorites`).once('value').then(mapFavorites);
}

//returns only cities in both cities and filter
function buildCities(cities, filter) {
    var ret = {};
    Object.keys(cities.val()).forEach(function(k) {
        if(filter.indexOf(k) > -1) {
            ret[k] = cities.val()[k];
        }
    });
    return ret
}

//returns cities to compare, based on a filter
function getCities(filter) {
    var compare_cities = {};
    return firebase.database().ref(`cities`).once('value').then(function(cities) {
        return buildCities(cities, filter)
    });
}

//gets the cities to compare and shows them in the compare view. At the moment only favorite cities are compared
//todo: routes and methods to compare: 1) only pinned cities, 2) all cities (pinned and in favorites)
router.get('/all', isAuthenticated, function(req, res) {
    getFavorites(req).then(function(favs) {
        getCities(favs).then(function(cities) {
            console.log(cities);
            res.render('compare', {
                title: "Compare cities",
                cities: cities
            });
        });
    });
});

module.exports = router;