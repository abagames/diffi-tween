import * as Chart from 'chart.js';
declare const componentHandler: any;

let properties: any = {};
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
let diffiChart;

window.onload = init;

function init() {
  const request = new XMLHttpRequest();
  request.open('GET', 'properties.json');
  request.send();
  request.onload = () => {
    const propertyNames = JSON.parse(request.responseText).properties;
    propertyNames.forEach(n => {
      let defaultData = [];
      for (let i = 0; i < 36; i++) {
        defaultData.push(1);
      }
      properties[n] = {
        name: n,
        data: defaultData,
        func: funcs[0],
        param: 1,
        saw: 2
      };
    });
    initChart(propertyNames);
  };
}

function initChart(propertyNames: string[]) {
  let labels = [];
  for (let i = 0; i < 36; i++) {
    labels.push(i % 12 < 11 ? '' : `${Math.ceil(i / 12)}m`);
  }
  const borderColors = ['#a77', '#7a7', '#77a', '#aa7', '#a7a', '#7aa'];
  const backgroundColors = ['#faa', '#afa', '#aaf', '#ffa', '#faf', '#aff'];
  const datasets = propertyNames.map((n, i) => {
    return {
      label: [n],
      data: properties[n].data,
      borderColor: borderColors[i % 6],
      backgroundColor: backgroundColors[i % 6],
      fill: false
    };
  });
  diffiChart = new Chart('chart', {
    type: 'line',
    data: { labels, datasets },
    options: {
      animation: {
        onComplete: () => {
          const meta = (<any>diffiChart).chart.controller.getDatasetMeta(0);
          const top = meta.dataset._model.scaleTop;
          const bottom = meta.dataset._model.scaleBottom;
          const context = (<HTMLCanvasElement>document.getElementById('chart')).getContext('2d');
          const x = (<any>diffiChart).chart.controller.getDatasetMeta(0).data[1]._model.x;
          context.fillStyle = '#000';
          context.fillRect(x, top, 1, bottom - top);
        }
      }
    }
  });
  const slidesDom = document.getElementById('chart_sliders');
  propertyNames.forEach(n => {
    const span = document.createElement('span');
    span.className = 'mdl-card__title-text';
    span.innerText = n;
    slidesDom.appendChild(span);
    appendFuncRadios(slidesDom, n);
    appendSlider(slidesDom, n, 'param', '1');
    appendSlider(slidesDom, n, 'saw', '2');
    setData(n);
  });
}

function appendFuncRadios(parent: HTMLElement, propName: string) {
  const radios = document.createElement('div');
  let isFirst = true;
  funcs.forEach((f, i) => {
    const label = document.createElement('label');
    label.style.margin = '5px';
    label.className = 'mdl-radio mdl-js-radio mdl-js-ripple-effect';
    (<any>label).for = `${propName}-${f.name}`;
    label.innerHTML = `
      <input type="radio" id="${propName}-${f.name}" class="mdl-radio__button" 
      name="${propName}" value="${i}" ${isFirst ? 'checked' : ''}>
      <span class="mdl-radio__label">${f.name}</span>
    `;
    label.childNodes.item(1).addEventListener('click', e => {
      properties[propName].func = funcs[Number((<any>e.srcElement).value)];
      setData(propName);
    });
    radios.appendChild(label);
    componentHandler.upgradeElement(label);
    isFirst = false;
  });
  parent.appendChild(radios);
}

function appendSlider(parent: HTMLElement, propName: string, name: string, value: string) {
  const span = document.createElement('span');
  span.textContent = name;
  parent.appendChild(span);
  const slider = document.createElement('input');
  slider.className = 'mdl-slider mdl-js-slider';
  slider.type = 'range';
  slider.min = '0';
  slider.max = '2';
  slider.value = value;
  slider.step = '0.2';
  slider.addEventListener('input', e => {
    properties[propName][name] = (<any>e.srcElement).valueAsNumber;
    setData(propName);
  });
  parent.appendChild(slider);
  componentHandler.upgradeElement(slider);
}

function setData(name: string) {
  const p = properties[name];
  const param = Math.pow(p.param, 2);
  for (let i = 0; i < 36; i++) {
    p.data[i] = p.func.func(i / 12, param);
  }
  diffiChart.update();
}
