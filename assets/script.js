let graphData = {
  url:
    'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json',
  response: {},
  temperatureData: [],
};

addEventListener('DOMContentLoaded', function(e) {
  getData(graphData.url)
    .then(data => {
      graphData.response = data;
      graphData.temperatureData = data.monthlyVariance;
    })
    .catch(function(e) {
      alert('There is no data to show.');
    })
    .then(function(e) {
      log();
    });
});

function log() {
  console.log(graphData);
}

function getData(url) {
  return fetch(url).then(response => response.json());
}
