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
  { temp: 0, color: '#313695' },
  { temp: 2.8, color: '#4575B4' },
  { temp: 3.9, color: '#74ADD1' },
  { temp: 5.0, color: '#ABD9E9' },
  { temp: 6.1, color: '#E0F3F8' },
  { temp: 7.2, color: '#FFFFBF' },
  { temp: 8.3, color: '#FEE090' },
  { temp: 9.5, color: '#FDAE61' },
  { temp: 10.6, color: '#F46D43' },
  { temp: 11.7, color: '#D73027' },
  { temp: 12.8, color: '#A50026' },
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
      showMeasurementScales();
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
  for (var i = 0; i < colors.length; i++) {
    if (i === colors.length - 1) {
      return colors[colors.length - 1].color;
    }

    if (colors[i].temp < baseTemp && colors[i + 1].temp >= baseTemp) {
      return colors[i].color;
    }
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

    var yAxis = d3.axisLeft(yScale).tickFormat(function(month) {
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
      .style('fill', d => getColor(svgData.baseTemperature + d.variance))
      .exit();
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

function showMeasurementScales() {
  var legendOptions = {
    width: 400,
    height: 30,
    legendColors: colors.map(d => d.color),
    minTemp: d3.min(svgData.temperatureData, d => svgData.baseTemperature + d.variance),
    maxTemp: d3.max(svgData.temperatureData, d => svgData.baseTemperature + d.variance),
  };

  console.log('legendOptions', legendOptions);

  var legend = svg
    .append('g')
    .attr('id', 'legend')
    .style(
      'transform',
      'translate(' +
        svgAttributes.margins.left +
        'px, ' +
        (svgAttributes.margins.top + svgAttributes.height + svgAttributes.margins.bottom / 2) +
        'px)',
    );

  var legendThreshold = d3
    .scaleThreshold()
    .domain(
      (function() {
        var arr = [];
        var step =
          (legendOptions.maxTemp - legendOptions.minTemp) / legendOptions.legendColors.length;
        for (var i = 1; i < legendOptions.legendColors.length; i++) {
          arr.push(legendOptions.minTemp + i * step);
        }
        console.log('Threshold Domain', arr);
        return arr;
      })(),
    )
    .range(legendOptions.legendColors);

  var legendX = d3
    .scaleLinear()
    .domain([legendOptions.minTemp, legendOptions.maxTemp])
    .range([0, legendOptions.width]);

  var legendXAxis = d3
    .axisBottom(legendX)
    .tickSize(10)
    .tickValues(legendThreshold.domain())
    .tickFormat(d3.format('.1f'));

  legend
    .selectAll('rect')
    .data(
      legendThreshold.range().map(function(color) {
        var d = legendThreshold.invertExtent(color);

        if (d[0] == null) d[0] = legendX.domain()[0];
        if (d[1] == null) d[1] = legendX.domain()[1];

        return d;
      }),
    )
    .enter()
    .append('rect')
    .style('fill', d => legendThreshold(d[0]))
    .style('stroke', 'white')
    .attr('x', d => legendX(d[0]))
    .attr('width', d => legendX(d[1]) - legendX(d[0]))
    .attr('height', legendOptions.height)
    .exit();

  legend
    .append('g')
    .style('transform', 'translate(0px, ' + legendOptions.height + 'px)')
    .style('color', 'white')
    .call(legendXAxis);
}
