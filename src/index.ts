import * as Chart from 'chart.js';

let properties: any;

window.onload = init;

function init() {
  const request = new XMLHttpRequest();
  request.open('GET', 'properties.json');
  request.send();
  request.onload = () => {
    const propertyNames = JSON.parse(request.responseText).properties;
    initChart(propertyNames);
  };
}

function initChart(propertyNames: string[]) {
  var myChart = new Chart('chart', {
    type: 'line',
    data: {
    }
  });
}
