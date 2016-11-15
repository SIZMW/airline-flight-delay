// Margin amounts
var margin = {
  top: 10,
  right: 20,
  bottom: 30,
  left: 40
};

var canvasWidth = 1000;
var canvasHeight = 500;

var barWidth = 20;
var barSpacing = 2;
var barMaxHeight = 300;

var minDelay = -10;
var maxDelay = 30;

var tooltip = d3.select('body')
  .append('div')
  .attr('class', 'tooltip');

loadJSON();

/**
 * Loads the JSON data set and converts the fields.
 */
function loadJSON() {
  d3.json('data-preprocess/data.json', function(data) {
    d3.json('us-states.json', function (usStates) {
      // Process down to airline names and average arrival delays

      var airlines = [];
      data.forEach(function (d) {
        if (!airlines.includes(d.airline)) {
          airlines.push(d.airline);
        }
      });

      var updateMap = loadMap(usStates);
      var updateBarChart = loadBarChart(airlines);
      var updateLineChart = loadLineChart();

      function updateAverages(selectionType, selection) {
        var airportAverages = {};
        var airlineAverages = {};
        var monthAverages = {};

        data.forEach(function(d) {

          if (selectionType == 'airport' && d.airport.name != selection) return;
          if (selectionType == 'airline' && d.airline != selection) return;
          if (selectionType == 'month' && d.month != selection) return;

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

        updateMap(airportAverages);
        updateBarChart(airlineAverages);
        updateLineChart(monthAverages);
      }

      updateAverages();
    });
  });
}

function loadMap(usStates) {
    var width = 960;
    var height = 600;

    var canvas = d3.select('#map-canvas');
    canvas.attr('width', width);
    canvas.attr('height', height);

    var delayScale = d3.scalePow()
      .exponent(2)
      .domain([0, Math.max(Math.abs(minDelay), Math.abs(maxDelay))])
      .range([0, 300]);

    var proj = d3.geoAlbersUsa();
    var geoPath = d3.geoPath(proj);

    var states = canvas
      .append('g')
      .classed('states', true)
      .selectAll('.state')
      .data(usStates.features)
      .enter()
        .append('g')
        .classed('state', true);

    states
        .append('path')
        .attr('d', geoPath);

    canvas
      .append('g')
      .classed('airports', true)

    function update(data) {
      data.forEach(function (d) {
        d.pos = proj([d.airport.lon, d.airport.lat]);
      });

      // delayScale
      //   .domain([0, d3.max(data, function (d) { return Math.abs(d.avg); })]);

      var airports = canvas.select('.airports')
        .selectAll('.airport')
        .data(data, function (d) { return d.airport.name; })

      // ENTER

      var enter = airports
        .enter()
          .append('g')
          .classed('airport', true);

      enter
        .append('circle')
        .on('mouseover', function(d) {
          tooltipMapMouseOver(d);
        })
        .on('mousemove', function(d) {
          tooltipMapMouseMove(d);
        })
        .on('mouseout', function(d) {
          tooltipMouseOut(d);
        });

      // EXIT

      airports
        .exit()
        .remove();

      // UPDATE

      var airports = canvas.select('.airports')
        .selectAll('.airport');

      airports
        .attr('display', function(d) { return d.dataCount > 0 ? 'inherit' : 'none'; })
        .classed('late', function (d) { return d.avg > 0; })
        .classed('early', function (d) { return d.avg < 0; })
        .classed('on-time', function (d) { return d.avg == 0; });

      airports.select('circle')
        .attr('r', function (d) { return Math.sqrt(delayScale(Math.abs(d.avg))); })
        .attr('cx', function (d) { return d.pos[0]; })
        .attr('cy', function (d) { return d.pos[1]; });
    }

    return update;
}

/**
 * Loads bar chart from the data set into the SVG element.
 * @param {data} The data set from the input file.
 */
function loadBarChart(airlines) {
  var svg = d3.select('#bar-canvas')
  .attr('width', canvasWidth)
  .attr('height', canvasHeight + 30);

  // Y axis scale
  // Nicely round domain value max to be the next 10 above maximum value
  var barHeightScale = d3.scaleLinear()
    .domain([minDelay, maxDelay])
    .rangeRound([0, barMaxHeight]);

  var graphWidth = airlines.length * (barWidth + barSpacing);

  var barColorScale = d3.scaleOrdinal(d3.schemeCategory20);

  var airlineScale = d3.scalePoint()
    .domain(airlines)
    .range([canvasWidth / 2 - graphWidth / 2, canvasWidth / 2 + graphWidth / 2]);

  svg.append('g')
    .classed('percent-bars', true)
    .attr('transform', 'translate(0,' + (barMaxHeight + 10) + ')');

  svg.append('g')
    .classed('airline-labels', true)
    .selectAll('.airline-label')
    .data(airlines)
    .enter()
      .append('text')
      .classed('airline-label', true)
      .text(function (d) { return d; })
      .attr('y', function (d) { return -airlineScale(d) - barWidth/2; })
      .attr('x', barMaxHeight + 10 + 5)
      .attr("transform", "rotate(90, 0, 0)")
      .attr('alignment-baseline', 'middle');


  // Left axis
  var barHeightAxis = svg
    .select('.percent-bars')
    .append('g')
    .classed('y-axis', true)
    .attr('transform', 'translate(' + (canvasWidth / 2 - graphWidth / 2 - 5) + ',' + (-barMaxHeight) + ')')

  // Label
  barHeightAxis.append('text')
    .attr("class", "label")
    .attr('x', -barMaxHeight / 2 + 50)
    .attr("y", -margin.left)
    .attr("transform", "rotate(-90, 0, 0)")
    .text('Average Arrival Delay');

  var numAirlines = null;

  function update(data) {
    // barHeightScale
    //   // .domain([0.0, (Math.floor(d3.max(data.map(function(d) { return d.avg; })) / 10) + 1) * 10]);
    //   .domain(d3.extent(data, function (d) { return d.avg; }));

    if (numAirlines === null) {
      numAirlines = data.length;
    }

    var bars = svg.select('.percent-bars')
      .selectAll('.percent-bar')
      .data(data, function (d) { return d.airline; });

    // ENTER

    var enter = bars
      .enter()
        .append('g')
        .classed('percent-bar', true);

    enter
      .append('rect')
      .attr('width', barWidth)
      .attr('fill', 'black')
      .on('mouseover', function(d) {
        tooltipBarMouseOver(d);
      })
      .on('mousemove', function(d) {
        tooltipBarMouseMove(d);
      })
      .on('mouseout', function(d) {
        tooltipMouseOut(d);
      });

    // EXIT

    bars
      .exit()
      .remove();

    // UPDATE

    var bars = svg.select('.percent-bars')
      .selectAll('.percent-bar');

    var update = bars
      .attr('transform', function(d) {
        return 'translate(' + airlineScale(d.airline) + ',0)';
      });

    update.select('rect')
      .attr('y', function(d) {
        return -barHeightScale(d.avg);
      })
      .attr('height', function(d) {
        return barHeightScale(d.avg)
      })
      .attr('fill', function (d, i) { return barColorScale(i); });

    var barAxis = d3.axisLeft(barHeightScale.copy().rangeRound([barMaxHeight, 0]));

    svg.select('.percent-bars')
      .select('.y-axis')
      .call(barAxis);
  }

  return update;
}

function loadLineChart() {
  var svg = d3.select('#line-canvas')
    .attr('width', canvasWidth)
    .attr('height', canvasHeight);

  var monthScale = d3.scalePoint()
    .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
    .range([margin.left, canvasWidth - margin.right])
    .padding(0.25);

  var avgDelayScale = d3.scaleLinear()
    .domain([minDelay, maxDelay])
    .rangeRound([canvasHeight - margin.bottom, margin.top]);

  var barColorScale = d3.scaleOrdinal(d3.schemeCategory20);

  var line = d3.line()
    .x(function(d) {
      return monthScale(d.month);
    });

  svg.append('g')
    .attr('class', 'y-axis')
    .attr('transform', 'translate(' + margin.left + ',0)');

  svg.append('g')
    .attr('class', 'x-axis')
    .attr('transform', 'translate(0,' + (canvasHeight - margin.bottom) + ')');

  svg.append('path')
    .attr('class', 'line')
    .attr('fill', 'none')
    .attr('stroke', 'black');

  svg.append('g')
    .classed('dots', true);

  function update(data) {
    // avgDelayScale
    //   .domain(d3.extent(data, function(d) { return d.avg; }));

    var dots = svg.select('.dots')
      .selectAll('.dot')
      .data(data);

    // ENTER

    var enter = dots.enter()
      .append('g')
      .classed('dot', true)

    enter.append('circle')
      .attr('r', 5)
      .attr('opacity', 1)
      .on('mouseover', function(d) {
        tooltipLineMouseOver(d);
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 1);
      })
      .on('mousemove', function(d) {
        tooltipLineMouseMove(d);
      })
      .on('mouseout', function(d) {
        tooltipMouseOut(d);
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 1);
      });

    // EXIT

    dots.exit().remove();

    // UPDATE

    var dots = svg.select('.dots')
      .selectAll('.dot');

    dots.select('circle')
      .attr('cx', function (d) { return monthScale(d.month); })
      .attr('cy', function (d) { return avgDelayScale(d.avg); })
      .attr('fill', function (d, i) { return barColorScale(i); });

    line
      .y(function(d) {
        return avgDelayScale(d.avg);
      });

    svg.select('.y-axis')
      .call(d3.axisLeft(avgDelayScale));

    svg.select('.x-axis')
      .call(d3.axisBottom(monthScale)
        .tickFormat(function(d) {
          return d3.timeFormat('%b')(d3.timeParse('%m')(d));
        }));

    svg.select('.line')
      .datum(data)
      .attr('d', line);
  }

  return update;
}

function tooltipMapMouseOver(d) {
  tooltipMouseOver(d, d.airport.name);
}

function tooltipMapMouseMove(d) {
  tooltipMouseMove(d, d.airport.name);
}

function tooltipBarMouseOver(d) {
  tooltipMouseOver(d, Number(d.avg).toFixed(2) + "");
}

function tooltipBarMouseMove(d) {
  tooltipMouseMove(d, Number(d.avg).toFixed(2) + "");
}

function tooltipLineMouseOver(d) {
  tooltipBarMouseOver(d);

}

function tooltipLineMouseMove(d) {
  tooltipBarMouseMove(d);
}

function tooltipMouseOver(d, text) {
  tooltip
    .style('top', (d3.event.pageY - 20) + "px")
    .style('left', (d3.event.pageX) + "px")
    .text(text);

  tooltip.transition()
    .duration(200)
    .style('opacity', 1)
}

function tooltipMouseMove(d, text) {
  tooltip
    .style('top', (d3.event.pageY - 20) + "px")
    .style('left', (d3.event.pageX) + "px")
    .text(text);
}

function tooltipMouseOut(d) {
  tooltip
    .transition()
    .duration(200)
    .style('opacity', 0)
}
