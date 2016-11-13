// Margin amounts
var margin = {
  top: 20,
  right: 20,
  bottom: 30,
  left: 40
};

var canvasWidth = 1000;
var canvasHeight = 500;

var barWidth = 20;
var barSpacing = 2;
var barMaxHeight = 300;

var svg = d3.select('#canvas')
  .attr('width', canvasWidth)
  .attr('height', canvasHeight);

loadJSON();

/**
 * Loads the JSON data set and converts the fields.
 */
function loadJSON() {
  d3.json('data-preprocess/data.json', function(data) {
    data.forEach(function(d, i) {
      var airportLoc = null;

      // TODO Replace missing location data
      if (d['airport'].lat && d['airport'].lon) {
        airportLoc = {
          lat: d['airport'].lat,
          lon: d['airport'].lon
        };
      } else {
        airportLoc = d['airport'];
      }

      d.airline = d['airline'];
      d.avgArrDelay = +d['avg_arr_delay'];
      d.flightCount = +d['flight_count'];
      d.month = +d['month'];
      d.airport = airportLoc;
    });

    // Process down to airline names and average arrival delays
    var airlineNames = d3.map(data, function(d) {
        return d.airline;
      })
      .keys();

    var airlineAverages = [];

    // Push all values into arry
    data.forEach(function(d) {
      var airlineName = d.airline;
      var result = $.grep(airlineAverages, function(d) {
        return d.airline === airlineName;
      });

      if (result.length == 0) {
        var obj = {
          airline: airlineName,
          values: [],
          avg: 0
        };

        obj.values.push(d.avgArrDelay);
        airlineAverages.push(obj);
      } else if (result.length == 1) {
        result[0].values.push(d.avgArrDelay);
      }
    });

    // Process averages
    airlineAverages.forEach(function(d) {
      var sum = 0;
      for (i = 0; i < d.values.length; i++) {
        sum += d.values[i];
      }
      sum /= d.values.length;
      d.avg = sum;
    });

    // Load chart
    loadBarChart(airlineAverages);
  });
}

/**
 * Loads bar chart from the data set into the SVG element.
 * @param {data} The data set from the input file.
 */
function loadBarChart(data) {
  // Calculate max value for domain
  var maxAvgValue = d3.max(data.map(function(d) {
      return d.avg;
    }));

  // Y axis scale
  // Nicely round domain value max to be the next 10 above maximum value
  var barHeightScale = d3.scaleLinear()
    .domain([0.0, (Math.floor(maxAvgValue / 10) + 1) * 10])
    .rangeRound([0, barMaxHeight]);

  // Bars group
  var avgDelayBars = svg
    .append('g')
    .classed('percent-bars', true)
    .attr('transform', 'translate(' + ((canvasWidth / 2) - data.length * (barWidth + barSpacing) / 2) + ',' + (canvasHeight / 2 + barMaxHeight / 2) + ')')
    .selectAll('.percent-bar')
    .data(data)
    .enter()
    .append('g')
    .classed('percent-bar', true)
    .attr('transform', function(d, i) {
      return 'translate(' + (i * (barWidth + barSpacing) + barWidth / 2) + ',0)';
    });

  // Bars
  avgDelayBars
    .append('rect')
    .attr('x', function(d) {
      return -barWidth / 2;
    })
    .attr('y', function(d) {
      return -barHeightScale(d.avg);
    })
    .attr('width', barWidth)
    .attr('height', function(d) {
      return barHeightScale(d.avg)
    })
    .attr('fill', 'black');

  // Labels on X axis
  var percentBarLabels = avgDelayBars
    .append('text')
    .attr('x', 0)
    .attr('y', 5)
    .text(function(d) {
      return d.airline;
    })
    .attr('writing-mode', 'vertical-lr');

  // Invert Y axis scale for left axis
  barHeightScale.rangeRound([barMaxHeight, 0]);
  var barAxis = d3.axisLeft(barHeightScale);

  // Left axis
  var barHeightAxis = d3
    .select('.percent-bars')
    .append('g')
    .classed('y-axis', true)
    .attr('transform', 'translate(' + (-5) + ',' + (-barMaxHeight) + ')')
    .call(barAxis);

  // Label
  barHeightAxis.append('text')
    .attr("class", "label")
    .attr('x', -barMaxHeight / 2 + 50)
    .attr("y", -margin.left)
    .attr("transform", "rotate(-90, 0, 0)")
    .style('stroke', 'black')
    .text('Average Arrival Delay');
}
