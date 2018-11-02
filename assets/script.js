var svg = null;

var svgAttributes = {
  width: 1000,
  height: 400,
  selector: '#graph',
  margins: {
    top: 120,
    left: 150,
    right: 150,
    bottom: 150,
  },
  xScale: null,
  yScale: null,
  tooltip: null,
  legendThreshold: null,
  legendOptions: {
    width: 400,
    height: 30,
  },
};

var svgData = {
  url:
    'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json',
  response: {},
  temperatureData: [],
  baseTemperature: null,
  years: [],
  colors: [
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
  ],
  minTemp: null,
  maxTemp: null,
  minYear: null,
  maxYear: null,
  barWidth: null,
  barHeight: svgAttributes.height / 11,
};

addEventListener('DOMContentLoaded', function(e) {
  fetch(svgData.url)
    .then(response => response.json())
    .then(data => {
      svgData.response = data;
      svgData.temperatureData = data.monthlyVariance;
      svgData.baseTemperature = data.baseTemperature;
      svgData.minYear = d3.min(svgData.temperatureData, d => d.year);
      svgData.maxYear = d3.max(svgData.temperatureData, d => d.year);
      svgData.minTemp = d3.min(svgData.temperatureData, d => svgData.baseTemperature + d.variance);
      svgData.maxTemp = d3.max(svgData.temperatureData, d => svgData.baseTemperature + d.variance);

      for (var i = svgData.minYear; i <= svgData.maxYear; i++) {
        svgData.years.push(i);
      }
      svgData.barWidth = svgAttributes.width / svgData.years.length;

      makeChart();
      scaleThreshold();
      createGraph();
      showMeasurementScales();
      showTooltip();
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
  console.log('Threshold Domain', svgAttributes.legendThreshold.domain());
}

function scaleThreshold() {
  svgAttributes.legendThreshold = d3
    .scaleThreshold()
    .domain(
      (function() {
        var arr = [];
        var step = (svgData.maxTemp - svgData.minTemp) / svgData.colors.length;
        for (var i = 1; i < svgData.colors.length; i++) {
          arr.push(svgData.minTemp + i * step);
        }
        return arr;
      })(),
    )
    .range(svgData.colors);
}

function makeChart() {
  svg = d3
    .select(svgAttributes.selector)
    .append('svg')
    .attr('width', svgAttributes.width + svgAttributes.margins.left + svgAttributes.margins.right)
    .attr(
      'height',
      svgAttributes.height + svgAttributes.margins.top + svgAttributes.margins.bottom,
    );
}

function createGraph() {
  function scaleX(value) {
    svgAttributes.xScale = d3
      .scaleLinear()
      .domain([svgData.minYear, svgData.maxYear])
      .range([svgAttributes.margins.left, svgAttributes.width + svgAttributes.margins.left]);
    return svgAttributes.xScale(value);
  }

  function scaleY(value) {
    svgAttributes.yScale = d3
      .scaleBand()
      .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
      .rangeRound([svgAttributes.margins.top, svgAttributes.height + svgAttributes.margins.top]);
    return svgAttributes.yScale(value);
  }

  function showAxes() {
    var xAxis = d3
      .axisBottom(svgAttributes.xScale)
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

    var yAxis = d3.axisLeft(svgAttributes.yScale).tickFormat(function(month) {
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
      .style('fill', d => svgAttributes.legendThreshold(svgData.baseTemperature + d.variance))
      .on('mouseover', function(d, i) {
        var html = '';

        html += '<div> <strong>Year: </strong>' + d.year + '</div>';
        html += '<div> <strong>Month: </strong>' + d.month + '</div>';
        html +=
          '<div> <strong>Temperature: </strong>' +
          Math.round((svgData.baseTemperature + d.variance) * 10) / 10 +
          '</div>';
        html += '<div> <strong>Variance: </strong>' + Math.round(d.variance * 10) / 10 + '</div>';

        svgAttributes.tooltip
          .attr('data-year', d.year)
          .style('left', d3.event.pageX + 'px')
          .style('top', d3.event.pageY + 'px')
          .style('display', 'inline-block')
          .html(html);
      })
      .on('mouseout', function(d, i) {
        svgAttributes.tooltip.style('display', 'none').html('');
      })
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

  populateChart();
  showAxes();
  showTexts();
}

function showMeasurementScales() {
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

  var legendX = d3
    .scaleLinear()
    .domain([svgData.minTemp, svgData.maxTemp])
    .range([0, svgAttributes.legendOptions.width]);

  var legendXAxis = d3
    .axisBottom(legendX)
    .tickSize(10)
    .tickValues(svgAttributes.legendThreshold.domain())
    .tickFormat(d3.format('.1f'));

  legend
    .selectAll('rect')
    .data(
      svgAttributes.legendThreshold.range().map(function(color) {
        var d = svgAttributes.legendThreshold.invertExtent(color);

        if (d[0] == null) d[0] = legendX.domain()[0];
        if (d[1] == null) d[1] = legendX.domain()[1];

        return d;
      }),
    )
    .enter()
    .append('rect')
    .style('fill', d => svgAttributes.legendThreshold(d[0]))
    .style('stroke', 'white')
    .attr('x', d => legendX(d[0]))
    .attr('width', d => legendX(d[1]) - legendX(d[0]))
    .attr('height', svgAttributes.legendOptions.height)
    .exit();

  legend
    .append('g')
    .style('transform', 'translate(0px, ' + svgAttributes.legendOptions.height + 'px)')
    .style('color', 'white')
    .call(legendXAxis);
}

function showTooltip() {
  svgAttributes.tooltip = d3
    .select('#graph')
    .append('div')
    .attr('id', 'tooltip');
}
