import * as Chart from 'chart.js';
declare const componentHandler: any;

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
const maxTicksCount = 30;
const ticksPerCount = 60 * 2;
const version = '1';
let properties: any = {};
let diffiChart;
let ticksCount = 0;
let prevTicksCount = 0;

export function init(onComplete: Function) {
  const request = new XMLHttpRequest();
  request.open('GET', 'properties.json');
  request.send();
  request.onload = () => {
    setProperties(JSON.parse(request.responseText).properties);
    setFromUrl();
    onComplete();
  };
}

export function setTicks(ticks = 0) {
  ticksCount = Math.floor(ticks / ticksPerCount);
  if (ticksCount >= maxTicksCount) {
    ticksCount = maxTicksCount - 1;
  }
  if (ticksCount !== prevTicksCount) {
    prevTicksCount = ticksCount;
    diffiChart.update();
  }
}

export function getProperty(name: string) {
  return properties[name].data[ticksCount];
}

function setProperties(propertyNames: string[]) {
  propertyNames.forEach(n => {
    let defaultData = [];
    for (let i = 0; i < maxTicksCount; i++) {
      defaultData.push(1);
    }
    properties[n] = {
      name: n,
      data: defaultData,
      funcIndex: 0,
      climb: 1,
      saw: 2,
      radios: [],
      sliders: []
    };
  });
  initChart(propertyNames);
  /*properties['speed'].radios[2].click();
  properties['speed'].sliders[0].valueAsNumber = 1.8;
  const event = new CustomEvent('input');
  properties['speed'].sliders[0].dispatchEvent(event);*/
}

function initChart(propertyNames: string[]) {
  let labels = [];
  for (let i = 0; i < maxTicksCount; i++) {
    labels.push(i % 5 < 4 ? '' : `${Math.ceil(i / 5)}0s`);
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
          const context =
            (<HTMLCanvasElement>document.getElementById('chart')).getContext('2d');
          const x = (<any>diffiChart).chart.controller.getDatasetMeta(0).
            data[ticksCount]._model.x;
          context.fillStyle = '#444';
          context.fillRect(x - 1, top, 3, bottom - top);
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
    appendSlider(slidesDom, n, 'climb', '1');
    appendSlider(slidesDom, n, 'saw', '2');
    setData(n, false);
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
    const input = label.childNodes.item(1);
    properties[propName].radios.push(input);
    input.addEventListener('click', e => {
      properties[propName].funcIndex = Number((<any>e.target).value);
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
    properties[propName][name] = (<any>e.target).valueAsNumber;
    setData(propName);
  });
  properties[propName].sliders.push(slider);
  parent.appendChild(slider);
  componentHandler.upgradeElement(slider);
}

function setData(name: string, isCreatingUrl = true) {
  const p = properties[name];
  const climb = Math.pow(p.climb, 2);
  let sawRatio = 0;
  const func = funcs[p.funcIndex].func;
  for (let i = 0; i < maxTicksCount; i++) {
    let v = func(i / (30 * 60 / ticksPerCount), climb);
    if (p.saw < 2) {
      sawRatio += 1 / (p.saw * 10 + 2);
      v = (v - 1) * sawRatio + 1;
      if (sawRatio >= 1) {
        sawRatio = 0;
      }
    }
    p.data[i] = v;
  }
  diffiChart.update();
  if (isCreatingUrl) {
    createUrl();
  }
}

function createUrl() {
  const baseUrl = window.location.href.split('?')[0];
  let url = `${baseUrl}?v=${version}`;
  Object.keys(properties).forEach(propName => {
    const p = properties[propName];
    url += `&f_${propName}=${p.funcIndex}&c_${propName}=${p.climb}&s_${propName}=${p.saw}`
  });
  try {
    window.history.replaceState({}, '', url);
  } catch (e) {
    console.log(e);
  }
}

function setFromUrl() {
  const query = window.location.search.substring(1);
  if (query == null) {
    return;
  }
  try {
    query.split('&').forEach(param => {
      const pair = param.split('=');
      const key: string = pair[0];
      const value: string = pair[1];
      if (key === 'v' && value !== version) {
        return;
      }
      const propName = key.substr(2);
      if (key.charAt(0) === 'f') {
        properties[propName].radios[Number(value)].click();
      } else if (key.charAt(0) === 'c') {
        properties[propName].sliders[0].valueAsNumber = Number(value);
        const event = new CustomEvent('input');
        properties[propName].sliders[0].dispatchEvent(event);
      } else if (key.charAt(0) === 's') {
        properties[propName].sliders[1].valueAsNumber = Number(value);
        const event = new CustomEvent('input');
        properties[propName].sliders[1].dispatchEvent(event);
      }
    });
  } catch (e) {
    console.log(e);
  }
}
