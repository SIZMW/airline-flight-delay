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

loadJSON();

/**
 * Loads the JSON data set and converts the fields.
 */
function loadJSON() {
  d3.json('data-preprocess/data.json', function(data) {
    // Process down to airline names and average arrival delays

    var airportAverages = {};
    var airlineAverages = {};
    var monthAverages = {};

    data.forEach(function(d) {
      var airportAverage = airportAverages[d.airport.name];
      if (airportAverage) {
        airportAverage.avg += d.avgArrDelay;
        airportAverage.flightCount += d.flightCount;
        airportAverage.dataCount += 1;
      }
      else {
        airportAverages[d.airport.name] = {
          airport: d.airport,
          avg: d.avgArrDelay,
          flightCount: d.flightCount,
          dataCount: 1
        };
      }

      var airlineAverage = airlineAverages[d.airline];
      if (airlineAverage) {
        airlineAverage.avg += d.avgArrDelay;
        airlineAverage.flightCount += d.flightCount;
        airlineAverage.dataCount += 1;
      }
      else {
        airlineAverages[d.airline] = {
          airline: d.airline,
          avg: d.avgArrDelay,
          flightCount: d.flightCount,
          dataCount: 1
        }
      }

      var monthAverage = monthAverages[d.month];
      if (monthAverage) {
        monthAverage.avg += d.avgArrDelay;
        monthAverage.flightCount += d.flightCount;
        monthAverage.dataCount += 1;
      }
      else {
        monthAverages[d.month] = {
          month: d.month,
          avg: d.avgArrDelay,
          flightCount: d.flightCount,
          dataCount: 1
        }
      }
    });

    airportAverages = Object.values(airportAverages).map(function (d) {
      d.avg /= d.dataCount;
      return d;
    });
    airlineAverages = Object.values(airlineAverages).map(function (d) {
      d.avg /= d.dataCount;
      return d;
    });
    monthAverages = Object.values(monthAverages).map(function (d) {
      d.avg /= d.dataCount;
      return d;
    });

    console.log(airportAverages);
    console.log(airlineAverages);
    console.log(monthAverages);

    // Load chart
    loadMap(airportAverages);
    loadBarChart(airlineAverages);
    loadLineChart(monthAverages);
  });
}

function loadMap(data) {
  d3.json('us-states.json', function (error, usStates) {
    var width = 960;
    var height = 600;

    var canvas = d3.select('#map-canvas');
    canvas.attr('width', width);
    canvas.attr('height', height);

    var delayScale = d3.scalePow()
      .exponent(2)
      .domain([0, d3.max(data, function (d) { return Math.abs(d.avg); })])
      .range([10, 100]);

    var proj = d3.geoAlbersUsa();
    var geoPath = d3.geoPath(proj);
    data.forEach(function (d) {
      d.pos = proj([d.airport.lon, d.airport.lat]);
      // console.log([d.airport.lon, d.airport.lat], d.pos);
    });

    var states = canvas
      .selectAll('.state')
      .data(usStates.features)
      .enter()
        .append('g')
        .classed('state', true);

    states
        .append('path')
        .attr('d', geoPath);

    var airports = canvas
      .selectAll('.airport')
      .data(data)
      .enter()
        .append('g')
        .classed('airport', true)
        .classed('late', function (d) { return d.avg > 0; })
        .classed('early', function (d) { return d.avg < 0; })
        .classed('on-time', function (d) { return d.avg == 0; });

    airports
      .append('circle')
      .attr('r', function (d) { return Math.sqrt(delayScale(Math.abs(d.avg))); })
      .attr('cx', function (d) { return d.pos[0]; })
      .attr('cy', function (d) { return d.pos[1]; });
  })
}

/**
 * Loads bar chart from the data set into the SVG element.
 * @param {data} The data set from the input file.
 */
function loadBarChart(data) {
  var svg = d3.select('#bar-canvas')
  .attr('width', canvasWidth)
  .attr('height', canvasHeight);

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
    .attr('x', 5)
    .attr('y', 5)
    .text(function(d) {
      return d.airline;
    })
    .attr("transform", "rotate(90, 0, 0)");

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

function loadLineChart(data) {
  var svg = d3.select('#line-canvas')
    .attr('width', canvasWidth)
    .attr('height', canvasHeight);

  var monthScale = d3.scalePoint()
    .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
    .range([0, canvasWidth - margin.right - margin.left])
    .padding(0.25);

  var avgDelayScale = d3.scaleLinear()
    .domain([0.0, d3.max(data.map(function(d) {
      return d.avg;
    }))])
    .rangeRound([canvasHeight - margin.bottom, 0]);

  var line = d3.line()
    .x(function(d) {
      return monthScale(d.month);
    })
    .y(function(d) {
      return avgDelayScale(d.avg);
    });

    var leftAxis = d3.axisLeft(avgDelayScale);
    var botAxis = d3.axisBottom(monthScale)
      .tickFormat(function(d) {
        return d3.timeFormat('%b')(d3.timeParse('%m')(d));
      });

    svg.append('g')
      .attr('class', 'y-axis')
      .attr('transform', 'translate(' + margin.left + ',0)')
      .call(leftAxis);

    svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', 'translate(' + margin.left + ',' + (canvasHeight - margin.bottom) + ')')
      .call(botAxis);

    svg.append('path')
      .datum(data)
      .attr('class', 'line')
      .attr('d', line)
      .attr('transform', 'translate(' + margin.left + ', 0)')
      .attr('fill', 'none')
      .attr('stroke', 'black');
}
