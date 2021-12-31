import html from './template.html';
import css from './styles.css';

export default class BeginBrowsing extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).innerHTML = `<style type="text/css">${css}</style>${html}`;

    const button = this.shadowRoot.querySelector('button');
    const search = document.querySelector('term-search');
    button.addEventListener('click', () => search.focus());
  }
}
