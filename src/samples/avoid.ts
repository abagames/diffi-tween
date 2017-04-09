import * as diffiTween from '../index';

let canvas: HTMLCanvasElement;
let context: CanvasRenderingContext2D;
let ticks = 0;
let appTicks = 0;
let actors: Actor[] = [];
let isGameStarting = false;
let cursorX = 128;
let isClicked = false;

window.onload = init;

function init() {
  canvas = <HTMLCanvasElement>document.getElementById('game');
  canvas.onmousemove = e => {
    const rect = canvas.getBoundingClientRect();
    cursorX = (e.clientX - rect.left) * 256 / canvas.clientWidth;
  };
  canvas.onclick = e => {
    isClicked = true;
  };
  context = canvas.getContext('2d');
  context.fillStyle = 'white';
  diffiTween.init(update);
}

function changeScene(isStarting: boolean) {
  isGameStarting = isStarting;
  isClicked = false;
  actors = [];
  ticks = 0;
  diffiTween.setTicks(ticks);
  if (isStarting) {
    new Player();
  }
}

function update() {
  requestAnimationFrame(update);
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillRect(0, 240, 256, 1);
  if (appTicks <= 0) {
    new Rock();
    appTicks = 10;
  }
  appTicks -= diffiTween.getProperty('speed');
  updateActors();
  ticks++;
  diffiTween.setTicks(ticks);
  if (!isGameStarting) {
    context.fillText('GAME OVER', 90, 90);
    context.fillText('click to start', 90, 150);
    if (isClicked) {
      changeScene(true);
    }
  }
}

function updateActors() {
  for (let i = 0; i < actors.length;) {
    const actor = actors[i];
    if (actor.exists) {
      actor.update();
    }
    if (actor.exists) {
      i++;
    } else {
      actors.splice(i, 1);
    }
  }
}

class Actor {
  pos = new Vector();
  size = new Vector();
  exists = true;

  constructor() {
    actors.push(this);
  }

  update() {
    context.fillRect(this.pos.x - this.size.x / 2, this.pos.y - this.size.y / 2,
      this.size.x, this.size.y);
  }

  remove() {
    this.exists = false;
  }
}

class Vector {
  x = 0;
  y = 0;
}

class Rock extends Actor {
  speed = 0;
  vy = 0;

  constructor() {
    super();
    this.speed = diffiTween.getProperty('speed') * 0.1;
    this.size.x = this.size.y = diffiTween.getProperty('size') * 16;
    this.pos.x = Math.random() * 256;
    this.pos.y = -this.size.y / 2;
  }

  update() {
    this.vy += this.speed;
    this.vy *= 0.99;
    this.pos.y += this.vy;
    if (this.pos.y + this.size.y / 2 >= 240) {
      this.remove();
    }
    super.update();
  }
}

class Player extends Actor {
  constructor() {
    super();
    this.size.x = this.size.y = 8;
    this.pos.x = 128;
    this.pos.y = 240 - 4;
  }

  update() {
    this.pos.x = cursorX;
    actors.forEach(a => {
      if (a !== this) {
        if (Math.abs(this.pos.x - a.pos.x) < (this.size.x + a.size.x) / 2 &&
          Math.abs(this.pos.y - a.pos.y) < (this.size.y + a.size.y) / 2) {
          changeScene(false);
        }
      }
    });
    super.update();
  }
}
