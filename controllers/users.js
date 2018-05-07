var express = require("express");
var firebase = require("firebase");
var gcloud = require("google-cloud");
var config = require("../config/config.json");
var utils= require("../utils.js");
var router = express.Router();

//storage initialization
var storage = gcloud.storage({
    projectId:"city-match",
    keyFilename: "city match-420315c4b0a9.json"
  });
var bucket = storage.bucket(`city-match.appspot.com`);
var existing_recommendations =[];

// middleware to verify if user is authenticated. This will secure some routes
function isAuthenticated (req, res, next) {
    var user = firebase.auth().currentUser;
    console.log("current user " + user);
    if (user !== null) {
        req.user = user;
        next();
    } else {
        res.redirect("/users/login");
    }
}

router.get("/register", function(req, res) {
	firebase.database().ref(`cities`).once("value").then(function(cities_details){
		// console.log( Object.keys(cities_details.val()));
		var cities_list= Object.keys(cities_details.val());
			 res.render("registration", {
				 title: "Sign up",
				 cities_list: cities_list
			 });
	}).catch(function(error) {
			console.log(error);
		  res.send("error");
	});
});

router.post("/register", function(req, res) {
    //Register a new user with email and password
    firebase.auth().createUserWithEmailAndPassword(req.body.email, req.body.password).then(function(data) {
        firebase.auth().signInWithEmailAndPassword(req.body.email, req.body.password).then(function(data) {
            firebase.database().ref(`users/${data.uid}`).set({
                "email": req.body.email,
                "username": req.body.username?req.body.username:"",
                "city":req.body.city? req.body.city: "",
                "age": req.body.age?req.body.age: 18,
                "form_completion":false
            });
        }).then(function () {
            //ask new user to login
            res.redirect("/users/login");
        }).catch(function (err) {
            console.log(err);
            res.send("error");
        });
    }).catch(function(error) {
        if (error.code === "auth/email-already-in-use") {
            res.send("email already in use");
        }
        console.log(error);
       res.send("error");
    });
});

router.get("/login", function(req, res){
    res.render("login", {title:"Sign in"});
});

router.post("/login", function(req,res){
    firebase.auth().signInWithEmailAndPassword(req.body.email, req.body.password).then(function(data) {
        firebase.database().ref(`users/${data.uid}`).once("value")
        .then(function(details) {
            // console.log(firebase.auth().currentUser.email,firebase.auth().currentUser.uid, details.val());
            res.render("user_profile.ejs", {
                details: details.val()
            });
        });
    });
});

router.post("/favorite", isAuthenticated,function(req, res){
    // console.log("permission approved"+ req.user.uid);
    var filePath = req.body.city + ".jpg";
    var citiesPath = "cities/" + filePath;
    var storageFile = bucket.file(citiesPath);
    var url = storageFile.getSignedUrl({ action: "read",expires: "03-09-2491"}).then(signedUrls => {
    firebase.database().ref(`users/${req.user.uid}/favorites/${req.body.city}`).update({
        "city":req.body.city,
        "population": req.body.city_population,
        "timestamp": Date.now(),
        "imageUrl":signedUrls[0]
    });
   });

   firebase.database().ref("cities").orderByChild("Population_2016").startAt(req.body.city_population - 10000).limitToFirst(2).on("value", function(snapshot){
    var recommendations = snapshot.val();
    firebase.database().ref("cities").orderByChild("Average_Weekly_Workplace_Earnings_2017").startAt(req.body.earnings- 20).limitToFirst(2).on("value", function(snapshot1){
        var recommendations1 = snapshot1.val();
        var final_recommendations = Object.assign(recommendations, recommendations1);
        Object.keys(final_recommendations).forEach(function(id){
            if(id != req.body.city){
                existing_recommendations.push(final_recommendations[id]);
                bucket.file( "cities/"+ id + ".jpg" ).getSignedUrl({ action: "read",expires: "03-09-2491"}).then(signedUrls => {
                    firebase.database().ref(`users/${req.user.uid}/recommendations/${id}`).update({
                        "imageUrl":signedUrls[0],
                        "Average_Weekly_Workplace_Earnings_2017":final_recommendations[id]["Average_Weekly_Workplace_Earnings_2017"],
                        "Population_2016":final_recommendations[id]["Population_2016"]
                    });
                });
            }
        });
    });
});
});

//todo: rename to /pinCity
router.post("/interestedin", isAuthenticated, function(req, res) {
    console.log("permission approved"+ req.user.uid);
    firebase.database().ref(`users/${req.user.uid}/interestedin`).push({
        "city": req.body.city,
        "timestamp": Date.now()
    });
    res.send("city " + req.body.city + " added as favorite");
});

//todo: post /unpinCity

router.post("/review", isAuthenticated,function(req, res){
    console.log("permission approved"+ req.user.uid);
    firebase.database().ref(`users/${req.user.uid}/reviews`).push({
        "city":req.body.city,
        "title": req.body.review_title,
        "review_body": req.body.review_body,
        "timestamp": Date.now()
    });
});

router.post("/recommendations", isAuthenticated, function(req, res){
    var color = utils.hexToRgbA(req.body.color);
    var cities = firebase.database().ref("cities");
    //identify big 5 tendencies by answers.Use this result as secondary criteria
    var big_5 = { 
        extraversion: req.body.extrovert >= 5 || color.average_rgb > 127  ? true: false,
        openness: req.body.spare_time === "explore"|| color.rgb_luminance < 127 ? true: false,
        conscientiousness: req.body.spare_time === "cultural"|| color.rgb_luminance > 127 ? true: false,
        agreeableness:req.body.spare_time === "friends" || color.rgb_luminance < 127 ? true: false,
        neuroticism: color.rgb_luminance < 127 ? true: false,
    }    
    utils.filter_criteria.lowerBroadband = req.body.spare_time === "movies" || req.body.workplace === "freelance"|| req.body.patience === "impatient" ? utils.average_values.Ultrafast_Broadband_2017 : utils.extremeValues.lowerBroadband;
    utils.filter_criteria.lowerPopulation = req.body.workplace === "corporation" ? utils.average_values.Population_2016 : utils.extremeValues.lowerPopulation;
    //if I don"t like risks, I want to be able to invest in real estate and to afford it. If not, no matter how affordable it is
    utils.filter_criteria.lowerHouseAffordability = req.body.risk <= 5 ? utils.average_values.Housing_Affordability_Ratio_2017 : utils.extremeValues.lowerHouseAffordability;
    utils.filter_criteria.lowerSectorReport = req.body.workplace === "small_medium" || req.body.workplace === "start-up"  ? utils.average_values.Ratio_of_Private_to_Public_Sector_Employment_2016 : utils.extremeValues.lowerSectorReport;
    utils.filter_criteria.lowerEmployment = req.body.career >=5 ? utils.average_values.Employment_Rate_2017 : utils.extremeValues.lowerEmployment;
    //if you prefer money over time, recommend cities with earnings above average. If no, earnings will be at any possible level
    utils.filter_criteria.lowerEarnings = req.body.time_money === true ? utils.average_values.Average_Weekly_Workplace_Earnings_2017 : utils.extremeValues.lowerEarnings;  
    utils.filter_by_big_5(big_5.extraversion, big_5.openness, big_5.conscientiousness, big_5.agreeableness, big_5.neuroticism);
    console.log(big_5, utils.filter_criteria);
    
  //add new recommended cities in the exiting_recommendations array. 
  cities.orderByChild("Population_2016").startAt(utils.filter_criteria.lowerPopulation).limitToFirst(5).on("value", function(snapshot1){
      cities.orderByChild("Employment_Rate_2017").startAt(utils.filter_criteria.lowerEmployment).limitToFirst(4).on("value", function(snapshot2){
        cities.orderByChild("Ultrafast_Broadband_2017").startAt(utils.filter_criteria.lowerBroadband).limitToFirst(3).on("value", function(snapshot3){
            console.log(snapshot1.val(),snapshot2.val(),snapshot3.val());
        });
      });
  });

  //Remove duplicates form this array.Then, update Firebase collection. 

  //Then, if successful, update user profile with form_completion:true
  firebase.database().ref(`users/${req.user.uid}`).update({"form_completion" : true });

});

module.exports = router;
