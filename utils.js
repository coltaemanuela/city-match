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
