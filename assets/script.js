var svg = null;
var xScale = null;
var yScale = null;

var svgAttributes = {
  width: 1200,
  height: 500,
  selector: '#graph',
  margins: {
    top: 120,
    left: 150,
    right: 30,
    bottom: 150,
  },
};

var svgData = {
  url:
    'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json',
  response: {},
  temperatureData: [],
  years: [],
  minYear: null,
  maxYear: null,
  barWidth: null,
  barHeight: svgAttributes.height / 11,
};

addEventListener('DOMContentLoaded', function(e) {
  getData(svgData.url)
    .then(data => {
      svgData.response = data;
      svgData.temperatureData = data.monthlyVariance;
      svgData.minYear = d3.min(svgData.temperatureData, d => d.year);
      svgData.maxYear = d3.max(svgData.temperatureData, d => d.year);

      for (var i = svgData.minYear; i <= svgData.maxYear; i++) {
        svgData.years.push(i);
      }
      svgData.barWidth = svgAttributes.width / svgData.years.length;

      createGraph();
    })
    .catch(function(e) {
      alert('There is no data to show.');
      console.log(e);
    })
    .then(function(e) {
      log();
    });
});

function log() {
  console.log(svgData);
}

function getData(url) {
  return fetch(url).then(response => response.json());
}

function createGraph() {
  function makeChart() {
    svg = d3
      .select(svgAttributes.selector)
      .append('svg')
      .attr('width', svgAttributes.width + svgAttributes.margins.left + svgAttributes.margins.right)
      .attr(
        'height',
        svgAttributes.height +
          svgAttributes.margins.top +
          svgData.barHeight +
          svgAttributes.margins.bottom,
      );
  }

  function scaleX(value) {
    xScale = d3
      .scaleLinear()
      .domain([svgData.minYear, svgData.maxYear + 1]) // +1 is for adjustment
      .range([svgAttributes.margins.left, svgAttributes.width + svgAttributes.margins.left]);
    return xScale(value);
  }

  function scaleY(value) {
    yScale = d3
      .scaleLinear()
      .domain([0, 11]) // +1 is for adjustment
      .range([svgAttributes.margins.top, svgAttributes.height + svgAttributes.margins.top]);
    return yScale(value);
  }

  function showAxes() {
    var xAxis = d3
      .axisBottom(xScale)
      .ticks(20)
      .tickFormat(d3.format('d'));

    svg
      .append('g')
      .attr('id', 'x-axis')
      .style(
        'transform',
        'translate(0,' +
          (svgAttributes.margins.top + svgAttributes.height + svgData.barHeight) +
          'px)',
      )
      .call(xAxis);

    var yAxis = d3.axisLeft(yScale).tickFormat(function(month) {
      var date = new Date(0);
      date.setUTCMonth(month);
      return d3.timeFormat('%B')(date);
    });

    svg
      .append('g')
      .attr('id', 'y-axis')
      .style(
        'transform',
        'translate(' + svgAttributes.margins.left + 'px, ' + svgData.barHeight / 2 + 'px)',
      )
      .call(yAxis);
  }

  function populateChart() {
    svg
      .selectAll('rect')
      .data(svgData.temperatureData)
      .enter()
      .append('rect')
      .classed('cell', true)
      .attr('width', svgData.barWidth)
      .attr('height', svgData.barHeight)
      .attr('data-month', d => d.month - 1)
      .attr('data-year', d => d.year)
      .attr('data-temp', d => d.variance)
      .attr('x', d => scaleX(d.year))
      .attr('y', d => scaleY(d.month - 1));
  }

  makeChart();
  populateChart();
  showAxes();
}
