// https://www.hawksworx.com/blog/adding-search-to-a-jamstack-site/
import html from './template.html';
import css from './styles.css';

export default class TermSearch extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).innerHTML = `<style type="text/css">${css}</style>${html}`;

    this._input = this.shadowRoot.querySelector('input');
  }

  focus() {
    this._input.focus();
  }
}