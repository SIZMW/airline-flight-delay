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

/**
 * Loads the CSV data set and converts the fields.
 */
function loadCSV() {
  d3.csv('data.csv', function(d) {
    return {
      // TODO return real values
    };
  }, function(error, data) {
    if (error != null) {
      console.log("Read error.");
      return;
    }

    // TODO Draw chart
  });
}

// TODO Add real data file
// TODO Fix bar chart for real data

/**
 * Loads bar chart from the data set into the SVG element.
 * @param {svg} The SVG element.
 * @param {data} The data set from the input file.
 */
function loadBarChart(svg, data) {
  // Y axis scale
  var barHeightScale = d3.scaleLinear()
    .domain([0.0, d3.max(data.map(function(d) {
      return d.length;
    }))])
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
      return -barHeightScale(d.length);
    })
    .attr('width', barWidth)
    .attr('height', function(d) {
      return barHeightScale(d.length)
    })
    .attr('fill', 'black');

  // Labels on X axis
  var percentBarLabels = avgDelayBars
    .append('text')
    .attr('x', 0)
    .attr('y', 5)
    .text(function(d) {
      return Number(d.x0)
        .toFixed(2) + ':' + Number(d.x1)
        .toFixed(2);
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
    .attr('x', -barMaxHeight / 2)
    .attr("y", -margin.left)
    .attr("transform", "rotate(-90, 0, 0)")
    .style('stroke', 'black')
    .text('Count');
}
