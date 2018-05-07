var renderPop = function(cities) {
	//SVG setup
	var margin = { top: 40, right: 100, bottom: 70, left: 100 };
	var width = 650;
	var height = 270;

	var svg = d3.select('body #populationSvg')
		.append('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom) 
		.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ")");

	//Scales
	var x = d3.scaleBand()
		.domain(cities.map(function(d) { return d.city; }))
		.range([0, width])
		.padding(0.05);
		
	var y0 = d3.scaleLinear()
		.domain([0, d3.max(cities, function(c) {
				return c.Population_2016;
		})])
		.range([height, 0]);

	var y1 = d3.scaleLinear()
		.domain([0, d3.max(cities, function(c) {
			return c.CO2_Emissions_per_Capita_2015_tons
		})])
		.range([height, 0])

	//Data for the legend
	var legendData = [
		{
			Text: "Population",
			Class: "population"
		},
		{
			Text: "CO2 emissions",
			Class: "co2"
		}
	];
		
	//Add the x axis
	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x))
		.selectAll('.x .tick text')
		.call(wrap, x.bandwidth());

	//Add the y0 axis
	svg.append("g")
		.attr("class", "y0 axis")
		.call(d3.axisLeft(y0))
		//Add a label for the y axis
		.append("text")
		.attr("class", "axis-label")
		.attr("y", -75)
		.attr("x", -height/2)
		.attr("transform", "rotate(-90)")
		.attr("text-anchor", "middle")
		.text("Population (#)");

	//Add the y1 axis
	svg.append("g")
		.attr("class", "y1 axis")
		.attr("transform", "translate(" + (width) + ",0)")
		.call(d3.axisRight(y1))
		//Add a label for the y axis
		.append("text")
		.attr("class", "axis-label")
		.attr("y", 75)
		.attr("x", -height/2)
		.attr("transform", "rotate(-90)")
		.attr("text-anchor", "middle")
		.text("CO2 Emissions per capita (tons)");

	//Population
	var population = svg.selectAll(".city." + legendData[0].Class)
		.data(cities)
		.enter()
		.append("g")
		.attr("class", function(d) { return "city " + legendData[0].Class + " " + d.city; })
		.attr("transform", function(d, i) { 
			return "translate(" + x(d.city) + ", " + y0(d.Population_2016) + ")";
		});
	//bar
	//placement based on : https://github.com/liufly/Dual-scale-D3-Bar-Chart
	population.append("rect")
		.attr("class", "bar1")
		.attr("width", x.bandwidth()/2)
		.attr("height", function(d,i,j) { return height - y0(d.Population_2016); });
	//label
	population.append("text")
		.attr("x", function(d) { return x.bandwidth()/4; })
		.attr("y", -3)
		.attr("font-family", "sans-serif")
		.attr("text-anchor", "middle")
		.attr("fill", "black")
		.attr("opacity", 1)
		.text(function(d) { return d.Population_2016.toLocaleString("en-GB") });
	
	//CO2 emissions per capita
	var co2emissions = svg.selectAll(".city." + legendData[1].Class)
		.data(cities)
		.enter()
		.append("g")
		.attr("class", function(d) { return "city " + legendData[1].Class + " " + d.city; })
		.attr("transform", function(d, i) {
			return "translate(" + (x(d.city) + x.bandwidth()/2) + ", " + y1(d.CO2_Emissions_per_Capita_2015_tons) + ")";
		});
	//bar
	//placement based on : https://github.com/liufly/Dual-scale-D3-Bar-Chart
	co2emissions.append("rect")
		.attr("class", "bar2")
		.attr("width", x.bandwidth()/2)
		.attr("height", function(d,i,j) { return height - y1(d.CO2_Emissions_per_Capita_2015_tons); });
	//label
	co2emissions.append("text")
		.attr("x", function(d) { return x.bandwidth()/4; })
		.attr("y", -3)
		.attr("font-family", "sans-serif")
		.attr("text-anchor", "middle")
		.attr("fill", "black")
		.attr("opacity", 1)
		.text(function(d) { return d.CO2_Emissions_per_Capita_2015_tons.toLocaleString("en-GB") });
}

//Wraps d3 ticks from the x axis in tspans so that they can span multiple lines
//Source: https://bl.ocks.org/mbostock/7555321
var wrap = function(text, width) {
	text.each(function() {
		var text = d3.select(this),
		words = text.text().split(/\s+/).reverse(),
		word,
		line = [],
		lineNumber = 0,
		lineHeight = 1.1, // ems
		y = text.attr("y"),
		dy = parseFloat(text.attr("dy")),
		tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
		while (word = words.pop()) {
			line.push(word);
			tspan.text(line.join(" "));
			if (tspan.node().getComputedTextLength() > width) {
				line.pop();
				tspan.text(line.join(" "));
				line = [word];
				tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
			}
		}
	});
};