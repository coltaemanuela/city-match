var express = require('express');
var firebase = require('firebase');
var gcloud = require("google-cloud");
var router = express.Router();
//var url;

var storage = gcloud.storage({
    projectId:"city-match",
    keyFilename: "city match-420315c4b0a9.json"
  });
var bucket = storage.bucket(`city-match.appspot.com`);

async function getImage(city){
    var filePath = city + ".jpg";
    var citiesPath = "cities/" + filePath;
    var storageFile = bucket.file(citiesPath);
    var url = await storageFile.getSignedUrl({ action: "read",expires: "03-09-2491"}).then(signedUrls => {
            //console.log(signedUrls[0]);
            return signedUrls[0];
     });
     return url;
}

/*async function getImageSync(city){

    var v = await getImage(city);
    console.log(v);
    return v;

}*/

//get array of cities based on the selection bars
router.post('/filter', function(req,res){
      var filteredCity = [];
      var population = req.body.selectPopulation;
      var earnings = req.body.selectEarning;
      var employment = req.body.selectEmployment;
      var house = req.body.selectHouse;
      var co2 = req.body.selectCo2;
      var ultra = req.body.selectUltra;
      var lowerPopulation = 0;
      var upperPopulation = 20000000;
      var lowerEarnings = 0;
      var upperEarnings = 800;
      var lowerEmployment = 0;
      var upperEmployment = 100;
      var lowerHouse = 0;
      var upperHouse = 1000000;
      var lowerCo2 = 0;
      var upperCo2 = 30;
      var lowerUltra = 0;
      var upperUltra = 100;
     if (population == 1000000){
      lowerPopulation = 1000000;
      upperPopulation = 20000000;
      }
      else if (population == 500000){
            lowerPopulation = 500000;
            upperPopulation = 1000000;
            }
      else if (population == 200000){
                   lowerPopulation = 200000;
                   upperPopulation = 500000;
                   }
      else if (population == 100000){
                         lowerPopulation = 0;
                         upperPopulation = 200000;
                         }
         if(earnings == 700 ){
                       lowerEarnings = 700;
                       upperEarnings = 800;
          }
           else if(earnings == 600) {
                       lowerEarnings = 600;
                       upperEarnings = 700;
                       }
            else if(earnings == 500) {
                       lowerEarnings = 500;
                       upperEarnings = 600;
                 }
            else if(earnings == 400) {
                       lowerEarnings = 400;
                       upperEarnings = 500;
                  }
        if (employment == 80){
              lowerEmployment = 80;
              upperEmployment = 100;
              }
              else if (employment == 70){
                    lowerEmployment = 70;
                    upperEmployment = 80;
                    }
              else if (employment == 60){
                           lowerEmployment = 60;
                           upperEmployment = 70;
                           }
        if (house == 400000){
                      lowerHouse = 400000;
                      upperHouse = 1000000;
                      }
                      else if (house == 300000){
                            lowerHouse = 300000;
                            upperHouse = 400000;
                            }
                      else if (house == 200000){
                                   lowerHouse = 200000;
                                   upperHouse = 300000;
                                   }
                      else if (house == 100000){
                             lowerHouse = 100000;
                             upperHouse = 200000;
                      }
      if (co2 == 10){
                    lowerCo2 = 10;
                    upperCo2 = 30;
                    }
                    else if (co2 == 5){
                          lowerCo2 = 5;
                          upperCo2 = 10;
                          }
                    else if (co2 == 0){
                                 lowerCo2 = 0;
                                 upperCo2 = 5;
                                 }
      if (ultra == 90){
                          lowerUltra = 90;
                          upperUltra = 100;
                          }
                          else if (ultra == 70){
                                lowerUltra = 70;
                                upperUltra = 90;
                                }
                          else if (ultra == 50){
                                       lowerUltra = 50;
                                       upperUltra = 70;
                                       }
                                       else if (ultra == 0){
                                       lowerUltra = 0;
                                       upperUltra = 50;
       }
      firebase.database().ref('cities').orderByChild('Population_2016').startAt(lowerPopulation).endAt(upperPopulation).on("value", function(snapshot1){
      var filteredCity1 = snapshot1.val();
         firebase.database().ref('cities').orderByChild('Average_Weekly_Workplace_Earnings_2017').startAt(lowerEarnings).endAt(upperEarnings).on("value", function(snapshot2){
            var filteredCity2 = snapshot2.val();
           firebase.database().ref('cities').orderByChild('Employment_Rate_2017').startAt(lowerEmployment).endAt(upperEmployment).on("value", function(snapshot3){
                       var filteredCity3 = snapshot3.val();
               /*firebase.database().ref('cities').orderByChild('Mean_house_price_2017').startAt(lowerHouse).endAt(upperHouse).on("value", function(snapshot4){
                             var filteredCity4 = snapshot4.val();
                     firebase.database().ref('cities').orderByChild('CO2_Emissions_per_Capita_2015_tons').startAt(lowerCo2).endAt(upperCo2).on("value", function(snapshot5){
                                   var filteredCity5 = snapshot5.val();
                              firebase.database().ref('cities').orderByChild('Ultrafast_Broadband_2017').startAt(lowerUltra).endAt(upperUltra).on("value", function(snapshot6){
                                         var filteredCity6 = snapshot6.val();*/
               Object.keys(filteredCity1).forEach(function(id1){
                  Object.keys(filteredCity2).forEach(function(id2){
                       Object.keys(filteredCity3).forEach(function(id3){
                           /*Object.keys(filteredCity4).forEach(function(id4){
                              Object.keys(filteredCity5).forEach(function(id5){
                                 Object.keys(filteredCity6).forEach(function(id6){
                                    if(id1 == id2 && id1 == id3 && id1 == id4 && id1==id5 && id1==id6){
                                           filteredCity.push(id1);
                                            }
                                    });
                                  });
                               });*/
                               if(id1 === id2 && id1 === id3){
                                    var cityUrl = getImage(id1);
                                     filteredCity.push(id1);
                                }
                            });
                       });
                   });
                  /*Object.keys(filteredCity1).forEach(function(id1){
                  //filteredCity = Object.assign(filteredCity1, filteredCity2, filteredCity3,filteredCity4,filteredCity5,filteredCity6);
                  filteredCity.push(id1);
                  });*/
               //console.log(filteredCity);
               //Object.keys(filteredCity).forEach(function(id){

               //console.log(filteredCity[id]);

               console.log(filteredCity);
               res.render('filter.ejs', {
                      filteredCity: filteredCity
               });


               //});
                              /*});
                            });
                          });*/
                       });
                    });
                });
 });

module.exports = router;