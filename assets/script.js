var svg = null;

var svgAttributes = {
  width: 1600,
  height: 600,
  selector: '#graph',
  margins: {
    top: 70,
    left: 50,
    right: 30,
    bottom: 50,
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
  barHeight: svgAttributes.height / 12,
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
      .attr('width', svgAttributes.width)
      .attr('height', svgAttributes.height);
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
      .attr('data-month', d => d.month)
      .attr('data-year', d => d.year)
      .attr('data-temp', d => d.variance)
      .attr('x', function(d, i) {
        return (d.year - svgData.minYear) * svgData.barWidth;
      })
      .attr('y', function(d, i) {
        return (d.month - 1) * svgData.barHeight;
      });
  }

  makeChart();
  populateChart();
}
