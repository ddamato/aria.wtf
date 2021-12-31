import html from './template.html';
import css from './styles.css';

export default class RandomContent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).innerHTML = `<style type="text/css">${css}</style>${html}`;

    const a = this.shadowRoot.querySelector('a');
    window.fetch('./lookup.json').then((res) => res.json()).then((lookup) => {
      a.href = lookup[Math.floor(Math.random() * lookup.length)].link;
    });
  }
}
