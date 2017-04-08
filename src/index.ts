import * as Chart from 'chart.js';
declare const componentHandler: any;

let properties: any;
const funcs = [
  {
    name: 'sqrt',
    func: (t, a) => Math.sqrt(a * t) + 1
  },
  {
    name: 'linear',
    func: (t, a) => a * t + 1
  },
  {
    name: 'pow',
    func: (t, a) => Math.pow(a * t, 2) + 1
  }
];

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
  const diffiChart = new Chart('chart', {
    type: 'line',
    data: {
      datasets: [{
        label: ["Speed"],
        data: [1, 2]
      },
      {
        label: ["Size"],
        data: [1, 1.5]
      }
      ]
    }
  });
  console.log((<any>diffiChart).chart.controller.getDatasetMeta(0).data[1]._model.x);
  const slidesDom = document.getElementById('chart_sliders');
  propertyNames.forEach(n => {
    const span = document.createElement('span');
    span.className = 'mdl-card__title-text';
    span.innerText = n;
    slidesDom.appendChild(span);
    appendFuncRadios(slidesDom, n);
    appendSlider(slidesDom, 'param');
    appendSlider(slidesDom, 'saw');
  });
}

function appendFuncRadios(parent: HTMLElement, name: string) {
  const radios = document.createElement('div');
  let isFirst = true;
  funcs.forEach(f => {
    const label = document.createElement('label');
    label.style.margin = '5px';
    label.className = 'mdl-radio mdl-js-radio mdl-js-ripple-effect';
    (<any>label).for = `${name}-${f.name}`;
    label.innerHTML = `
      <input type="radio" id="option-1" class="mdl-radio__button" 
      name="${name}" value="1" ${isFirst ? 'checked' : ''}>
      <span class="mdl-radio__label">${f.name}</span>
    `;
    radios.appendChild(label);
    componentHandler.upgradeElement(label);
    isFirst = false;
  });
  parent.appendChild(radios);
}

function appendSlider(parent: HTMLElement, name: string) {
  const span = document.createElement('span');
  span.textContent = name;
  parent.appendChild(span);
  const slider = document.createElement('input');
  slider.className = 'mdl-slider mdl-js-slider';
  slider.type = 'range';
  slider.min = '0';
  slider.max = '1';
  slider.value = '1';
  slider.step = '0.1';
  parent.appendChild(slider);
  componentHandler.upgradeElement(slider);
}
