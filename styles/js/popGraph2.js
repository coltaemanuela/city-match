//from https://bl.ocks.org/mbostock/3886394
var renderPop2 = function(cities) {
	//SVG setup
	var margin = { top: 40, right: 100, bottom: 70, left: 100 };
	var width = 650;
	var height = 270;

	var svg = d3.select('body #immigrationSvg')
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
		.range([height, 0]);
		
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
		.call(d3.axisLeft(y).ticks(10, "%"))
		//Add a label for the y axis
		.append("text")
		.attr("class", "axis-label")
		.attr("y", -75)
		.attr("x", -height/2)
		.attr("transform", "rotate(-90)")
		.attr("text-anchor", "middle")
		.text("Population (%)");

	//Data for the legend
	var legendData = {
		Population_UK: {
			class: "popUK",
			text: "UK"
		},
		Population_Non_UK : {
			class: "popNonUK",
			text: "Non-UK"
		}
	};

	var stack = d3.stack()
    .offset(d3.stackOffsetExpand);

 	var columns = [ "Population_UK", "Population_Non_UK"];

	var serie = svg.selectAll(".serie")
		.data(stack.keys(columns)(cities))
		.enter()
		.append("g")
		.attr("class", function(d) { return "serie " + legendData[d.key].class });

	serie.selectAll("rect")
		.data(function(d) { return d; })
		.enter()
		.append("rect")
		.attr("x", function(d) { return x(d.data.city); })
		.attr("y", function(d) { return y(d[1]); })
		.attr("height", function(d) { return y(d[0]) - y(d[1]); })
		.attr("data-val", function(d) { return d[0] - d[1]; })
		.attr("width", x.bandwidth());

  var legend = serie.append("g")
      .attr("class", "legend")
      .attr("transform", function(d) { var d = d[d.length - 1]; return "translate(" + (x(d.data.city) + x.bandwidth()) + "," + ((y(d[0]) + y(d[1])) / 2) + ")"; });

  legend.append("line")
      .attr("x1", -6)
      .attr("x2", 6)
      .attr("class", function(d) { return legendData[d.key].class; });

  legend.append("text")
      .attr("x", 9)
      .attr("dy", "0.35em")
      .attr("fill", "#000")
      .style("font", "sans-serif")
      .text(function(d) { return legendData[d.key].text; })
      .attr("class", function(d) { return legendData[d.key].class; });
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