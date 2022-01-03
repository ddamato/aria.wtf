// https://codepen.io/emmanuelulloa/pen/xZeJzd?editors=0010
import html from "./template.html";
import css from "./styles.css";

const MAX_VELOCITY = 2;

export default class FogCanvas extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).innerHTML = `<style type="text/css">${css}</style>${html}`;
    this._canvas = this.shadowRoot.querySelector("canvas");
  }

  connectedCallback() {
    const context = this._canvas.getContext("2d");
    const particles = Array(30).fill(context).map((ctx) => {
      const particle = new Particle(ctx);
      particle.setPosition(randomBetween(0, this._canvas.width), randomBetween(0, this._canvas.height));
      particle.setVelocity(randomBetween(-MAX_VELOCITY, MAX_VELOCITY), randomBetween(-MAX_VELOCITY, MAX_VELOCITY));
      return particle;
    });
    setInterval(() => {
      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });
  }, 1000 / 30);
  }
}

function randomBetween(min, max){
  return Math.random() * (max - min) + min;
}

class Particle {
  constructor(context) {
    this.context = context;
    this.x = 0;
    this.y = 0;
    this.xVelocity = 0;
    this.yVelocity = 0;
    this.radius = 5;
    this.image = new Image();
    this.image.src = 'fog.png';
  }

  draw() {
    if (!this.image.naturalWidth) return;
    const offsetX = this.x - this.image.naturalWidth / 2;
    const offsetY = this.y - this.image.naturalHeight / 2;
    this.context.drawImage(this.image, offsetX, offsetY);
    this.context.beginPath();
    this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
    this.context.closePath();
  }

  update() {
    this.x += this.xVelocity;
    this.y += this.yVelocity;

    const { width, height } = this.context.canvas;

    // Check if has crossed the right edge
    if (this.x >= width) {
      this.xVelocity = -this.xVelocity;
      this.x = width;
    }
    // Check if has crossed the left edge
    else if (this.x <= 0) {
      this.xVelocity = -this.xVelocity;
      this.x = 0;
    }

    // Check if has crossed the bottom edge
    if (this.y >= height) {
      this.yVelocity = -this.yVelocity;
      this.y = height;
    }

    // Check if has crossed the top edge
    else if (this.y <= 0) {
      this.yVelocity = -this.yVelocity;
      this.y = 0;
    }
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  setVelocity(x, y) {
    this.xVelocity = x;
    this.yVelocity = y;
  }
}
