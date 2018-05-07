//convert color code from HEX to RGBA
module.exports.hexToRgbA = function(hex){
    var c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        var rgba = 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+')';
        var red = (c>>16)&255;
        var green = (c>>8)&255;
        var blue = c&255;
        // Luminance is Gray tone values computed from RGB
        var rgb_luminance = (299*red + 587*green + 114*blue) / 1000;
        var average_rgb = (red + green + blue)/3;
        return {
          "rgb_luminance":rgb_luminance,
          "rgba":rgba,
          "average_rgb":average_rgb
        }
    }
    throw new Error('Bad Hex');
}

module.exports.average_values = {      
    "Population_UK":  70.16,
    "Population_Non-UK": 13.9,
    "Public_libraries":  14,
    "Average_Weekly_Workplace_Earnings_2017": 513,
    "CO2_Emissions_per_Capita_2015_tons": 5.36,
    "Employment_Rate_2017": 73.44,   
    "Housing_Affordability_Ratio_2017": 8.18,
    "Mean_house_price_2017": 220183.5,
    "Population_2016": 561461.9048,
    "Ratio_of_Private_to_Public_Sector_Employment_2016":  2.57,
    "Ultrafast_Broadband_2017":  72.75
}