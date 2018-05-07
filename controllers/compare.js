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
    var ret = [];
    Object.keys(cities.val()).forEach(function(k) {
        if(filter.indexOf(k) > -1) {
            var c = {};
            c.city = k;
            c.Population_2016 = cities.val()[k].Population_2016;
            c.Population_UK = cities.val()[k].Population_UK;
            c.Population_Non_UK = cities.val()[k]["Population_Non-UK"];
            c.Employment_Rate_2017 = cities.val()[k].Employment_Rate_2017;
            c.Average_Weekly_Workplace_Earnings_2017 = cities.val()[k].Average_Weekly_Workplace_Earnings_2017;
            c.Ratio_of_Private_to_Public_Sector_Employment_2016 = cities.val()[k].Ratio_of_Private_to_Public_Sector_Employment_2016;
            c.Housing_Affordability_Ratio_2017 = Math.round(parseFloat(cities.val()[k].Housing_Affordability_Ratio_2017)*100)/100;
            c.Mean_house_price_2017 = Math.round(parseFloat(cities.val()[k].Mean_house_price_2017)*100)/100;
            c.CO2_Emissions_per_Capita_2015_tons = Math.round(parseFloat(cities.val()[k].CO2_Emissions_per_Capita_2015_tons)*100)/100;
            c.Public_libraries = cities.val()[k].Public_libraries;
            c.Ultrafast_Broadband_2017 = cities.val()[k].Ultrafast_Broadband_2017;
            ret.push(c);
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

//given an array of objects, returns an array with its <property> values
function getPropertiesAsArray(array, property) {
    var ret = array.map(function(item) {
        return item[property];
    });
    return ret;
}

//returns an object with arrays for all properties of the given <cities> array
function getProperties(cities) {
    var ret = {};
    ret.city = getPropertiesAsArray(cities, "city");
    ret.Population_2016 = getPropertiesAsArray(cities, "Population_2016");
    ret.Population_UK = getPropertiesAsArray(cities, "Population_UK");
    ret.Population_Non_UK = getPropertiesAsArray(cities, "Population_Non_UK");
    ret.Employment_Rate_2017 = getPropertiesAsArray(cities, "Employment_Rate_2017");
    ret.Average_Weekly_Workplace_Earnings_2017 = getPropertiesAsArray(cities, "Average_Weekly_Workplace_Earnings_2017");
    ret.Ratio_of_Private_to_Public_Sector_Employment_2016 = getPropertiesAsArray(cities, "Ratio_of_Private_to_Public_Sector_Employment_2016");
    ret.Housing_Affordability_Ratio_2017 = getPropertiesAsArray(cities, "Housing_Affordability_Ratio_2017");
    ret.Mean_house_price_2017 = getPropertiesAsArray(cities, "Mean_house_price_2017");
    ret.CO2_Emissions_per_Capita_2015_tons = getPropertiesAsArray(cities, "CO2_Emissions_per_Capita_2015_tons");
    ret.Public_libraries = getPropertiesAsArray(cities, "Public_libraries");
    ret.Ultrafast_Broadband_2017 = getPropertiesAsArray(cities, "Ultrafast_Broadband_2017");
    return ret;
}

//gets the favorite cities to compare and shows them in the compare view.
router.get('/all', isAuthenticated, function(req, res) {
    getFavorites(req).then(function(favs) {
        getCities(favs).then(function(cities) {
            console.log(cities);
            var citiesObj = getProperties(cities);
            console.log(citiesObj);
            res.render('compare', {
                title: "Compare cities",
                cities: cities,
                citiesObj: citiesObj
            });
        });
    });
});

module.exports = router;