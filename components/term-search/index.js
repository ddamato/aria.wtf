// https://www.hawksworx.com/blog/adding-search-to-a-jamstack-site/
import html from './template.html';
import css from './styles.css';

const MAX_RESULTS = 10;

function renderEntry({ term, link, text }) {
  const span = text ? `<span class="text">${text}</span>` : '';
  return `
    <li>
      <a href="${link}">
      <span class="term">${term}</span>
      ${span}
      </a>
    </li>
  `;
}

function getResultIndex(needle, haystack) {
  return haystack.search(new RegExp(needle, 'i'));
}

export default class TermSearch extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).innerHTML = `<style type="text/css">${css}</style>${html}`;

    window.fetch('./lookup.json').then((res) => res.json()).then((lookup) => this._lookup = lookup);
    this._list = this.shadowRoot.querySelector('#list');
    this._input = this.shadowRoot.querySelector('input');
    this._input.addEventListener('focus', () => this._render());
    this._input.addEventListener('input', () => this._render());
  }

  _search(input) {
    return [].concat(this._lookup).filter(Boolean).reduce((results, entry) => {
      const { term, group, text, link } = entry;
      let index

      index = getResultIndex(input, term);
      if (~index) {
        results[group] = results[group] ?? [];
        results[group].push({ term, link });
        return results;
      }

      index = getResultIndex(input, text);
      if (~index) {
        results[group] = results[group] ?? [];
        results[group].push({ term, link, text: text.slice(index) });
        return results;
      }

      return results;
    }, {});
  }

  _render() {
    this._list.innerHTML = '';
    const results = this._search(this._input.value);
    for (let group in results) {
      const ul = document.createElement('ul');
      this._list.appendChild(ul);
      ul.setAttribute('aria-label', group);
      ul.innerHTML = results[group].map(renderEntry).slice(0, MAX_RESULTS).join('');
    }
  }

  focus() {
    this._input.focus();
  }
}