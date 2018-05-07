var renderBro = function(cities) {
	//SVG setup
	var margin = { top: 40, right: 50, bottom: 70, left: 50 };
	var width = 400;
	var height = 270;

	var svg = d3.select('body #broadbandSvg')
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
		
	var y = d3.scaleLinear()
		.domain([0, d3.max(cities, function(c) {
				return c.Ultrafast_Broadband_2017;
		})])
		.range([height, 0]);


	//Data for the legend
	var legendData = [
		{
			Text: "Ultra-fast broadband",
			Class: "broadband"
		}
	];
		
	//Add the x axis
	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x))
		.selectAll('.x .tick text')
		.call(wrap, x.bandwidth());

	//Add the y axis
	svg.append("g")
		.attr("class", "y axis")
		.call(d3.axisLeft(y))
		//Add a label for the y axis
		.append("text")
		.attr("class", "axis-label")
		.attr("y", -35)
		.attr("x", -height/2)
		.attr("transform", "rotate(-90)")
		.attr("text-anchor", "middle")
		.text("Ultra-fast broadband (%)");

	//Ultra-fast broadband
	var broadband = svg.selectAll(".city." + legendData[0].Class)
		.data(cities)
		.enter()
		.append("g")
		.attr("class", function(d) { return "city " + legendData[0].Class + " " + d.city; })
		.attr("transform", function(d, i) { 
			return "translate(" + x(d.city) + ", " + y(d.Ultrafast_Broadband_2017) + ")";
		});
	//bar
	//placement based on : https://github.com/liufly/Dual-scale-D3-Bar-Chart
	broadband.append("rect")
		.attr("class", "bar1")
		.attr("width", x.bandwidth())
		.attr("height", function(d,i,j) { return height - y(d.Ultrafast_Broadband_2017); });
	//label
	broadband.append("text")
		.attr("x", function(d) { return x.bandwidth()/2; })
		.attr("y", -3)
		.attr("font-family", "sans-serif")
		.attr("text-anchor", "middle")
		.attr("fill", "black")
		.attr("opacity", 1)
		.text(function(d) { return d.Ultrafast_Broadband_2017; });
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