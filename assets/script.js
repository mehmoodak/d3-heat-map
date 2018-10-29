var svg = null;
var xScale = null;
var yScale = null;

var svgAttributes = {
  width: 1000,
  height: 400,
  selector: '#graph',
  margins: {
    top: 120,
    left: 150,
    right: 30,
    bottom: 150,
  },
};

var colors = [
  '#313695',
  '#4575B4',
  '#74ADD1',
  '#ABD9E9',
  '#E0F3F8',
  '#FFFFBF',
  '#FEE090',
  '#FDAE61',
  '#F46D43',
  '#D73027',
  '#A50026',
];

var svgData = {
  url:
    'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json',
  response: {},
  temperatureData: [],
  baseTemperature: null,
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
      svgData.baseTemperature = data.baseTemperature;
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

function getColor(baseTemp) {
  if (baseTemp < 2.8) {
    return colors[0];
  } else if (baseTemp <= 3.9) {
    return colors[1];
  } else if (baseTemp <= 5.0) {
    return colors[2];
  } else if (baseTemp <= 6.1) {
    return colors[3];
  } else if (baseTemp <= 7.2) {
    return colors[4];
  } else if (baseTemp <= 8.3) {
    return colors[5];
  } else if (baseTemp <= 9.5) {
    return colors[6];
  } else if (baseTemp <= 10.6) {
    return colors[7];
  } else if (baseTemp <= 11.7) {
    return colors[8];
  } else if (baseTemp <= 12.8) {
    return colors[9];
  } else if (baseTemp > 12.8) {
    return colors[10];
  }
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
      .domain([svgData.minYear, svgData.maxYear])
      .range([svgAttributes.margins.left, svgAttributes.width + svgAttributes.margins.left]);
    return xScale(value);
  }

  function scaleY(value) {
    yScale = d3
      .scaleBand()
      .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
      .rangeRound([svgAttributes.margins.top, svgAttributes.height + svgAttributes.margins.top]);
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
        'translate(0,' + (svgAttributes.margins.top + svgAttributes.height) + 'px)',
      )
      .call(xAxis);

    var yAxis = d3
      .axisLeft(yScale)
      .tickFormat(function (month) {
        var date = new Date(0);
        date.setUTCMonth(month);
        return d3.timeFormat('%B')(date);
      });

    svg
      .append('g')
      .attr('id', 'y-axis')
      .style('transform', 'translate(' + svgAttributes.margins.left + 'px, 0px)')
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
      .attr('y', d => scaleY(d.month - 1))
      .style('fill', d => getColor(svgData.baseTemperature + d.variance));
  }

  function showTexts() {
    // Show Title
    svg
      .append('text')
      .text('Monthly Global Land-Surface Temperature')
      .attr('id', 'title')
      .attr('x', svgAttributes.width / 2)
      .attr('y', 40);

    // Show Subtitle
    svg
      .append('text')
      .text('1753 - 2015: base temperature 8.66℃')
      .attr('id', 'description')
      .attr('x', svgAttributes.width / 2)
      .attr('y', 80);

    // Show x-axis text
    svg
      .append('text')
      .text('Months')
      .style('fill', 'white')
      .style('font-size', '16px')
      .style('transform', 'translate(65px, 370px) rotate(-90deg)');

    // Show y-axis text
    svg
      .append('text')
      .text('Years')
      .style('fill', 'white')
      .style('font-size', '16px')
      .style(
        'transform',
        'translate(' +
          (svgAttributes.margins.left + svgAttributes.width / 2 - 50) +
          'px, ' +
          (svgAttributes.margins.top + svgAttributes.height + 50) +
          'px)',
      );
  }

  makeChart();
  populateChart();
  showAxes();
  showTexts();
}
