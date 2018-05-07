var renderEmp2 = function(cities) {
	//SVG setup
	var margin = { top: 40, right: 100, bottom: 70, left: 100 };
	var width = 650;
	var height = 270;

	var svg = d3.select('body #employmentSvg')
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
				return c.Employment_Rate_2017;
		})])
		.range([height, 0]);

	var y1 = d3.scaleLinear()
		.domain([0, d3.max(cities, function(c) {
			return c.Average_Weekly_Workplace_Earnings_2017
		})])
		.range([height, 0])

	//Data for the legend
	var legendData = [
		{
			Text: "Employment rate",
			Class: "employmentRate"
		},
		{
			Text: "Avg. weekly earnings",
			Class: "avgWeeklyEarnings"
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
		.text("Employment rate (%)");

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
		.text("Avg. weekly earnings (£)");

	//Employment rate
	var employment = svg.selectAll(".city." + legendData[0].Class)
		.data(cities)
		.enter()
		.append("g")
		.attr("class", function(d) { return "city " + legendData[0].Class + " " + d.city; })
		.attr("transform", function(d, i) { 
			return "translate(" + x(d.city) + ", " + y0(d.Employment_Rate_2017) + ")";
		});
	//bar
	//placement based on : https://github.com/liufly/Dual-scale-D3-Bar-Chart
	employment.append("rect")
		.attr("class", "bar1")
		.attr("width", x.bandwidth()/2)
		.attr("height", function(d,i,j) { return height - y0(d.Employment_Rate_2017); });
	//label
	employment.append("text")
		.attr("x", function(d) { return x.bandwidth()/4; })
		.attr("y", -3)
		.attr("font-family", "sans-serif")
		.attr("text-anchor", "middle")
		.attr("fill", "black")
		.attr("opacity", 1)
		.text(function(d) { return d.Employment_Rate_2017; });
	
	//Average weekly earnings
	var avgEarnings = svg.selectAll(".city." + legendData[1].Class)
		.data(cities)
		.enter()
		.append("g")
		.attr("class", function(d) { return "city " + legendData[1].Class + " " + d.city; })
		.attr("transform", function(d, i) {
			return "translate(" + (x(d.city) + x.bandwidth()/2) + ", " + y1(d.Average_Weekly_Workplace_Earnings_2017) + ")";
		});
	//bar
	//placement based on : https://github.com/liufly/Dual-scale-D3-Bar-Chart
	avgEarnings.append("rect")
		.attr("class", "bar2")
		.attr("width", x.bandwidth()/2)
		.attr("height", function(d,i,j) { return height - y1(d.Average_Weekly_Workplace_Earnings_2017); });
	//label
	avgEarnings.append("text")
		.attr("x", function(d) { return x.bandwidth()/4; })
		.attr("y", -3)
		.attr("font-family", "sans-serif")
		.attr("text-anchor", "middle")
		.attr("fill", "black")
		.attr("opacity", 1)
		.text(function(d) { return d.Average_Weekly_Workplace_Earnings_2017.toLocaleString("en-GB") });
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