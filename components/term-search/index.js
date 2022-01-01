// https://www.hawksworx.com/blog/adding-search-to-a-jamstack-site/
import html from './template.html';
import css from './styles.css';

const MAX_RESULTS = 6;

function renderEntry({ display, link, text }) {
  const span = text ? `<span class="text">${text}</span>` : '';
  return `
    <li>
      <a href="${link}" tabIndex="-1">
      <span class="term">${display}</span>
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
  }

  _onLeave(ev) {
    const targets = [this._input, this._list];
    const eventInside = ev.composedPath().some((elem) => targets.includes(elem));
    if (!eventInside) this.clear();
  }

  _onEscape({ key }) {
    if (key === 'Escape') this.clear();
  }

  connectedCallback() {
    this._input = document.getElementById(this.getAttribute('input'));
    document.documentElement.addEventListener('focusin', (ev) => this._onLeave(ev));
    document.documentElement.addEventListener('click', (ev) => this._onLeave(ev));
    document.documentElement.addEventListener('keydown', (ev) => this._onEscape(ev));
    this._input.addEventListener('keydown', (ev) => this._shiftTabIndex(ev));
    this._list.addEventListener('keydown', (ev) => this._shiftTabIndex(ev));
    this._input.addEventListener('focus', () => this._render());
    this._input.addEventListener('input', () => this._render());
  }

  _shiftTabIndex({ key }) {
    const keys = { ArrowDown: 1, ArrowUp: -1 };
    if (['Enter', 'Space'].includes(key)) return;
    if (!keys[key]) return this._input.focus();
    const anchors = [...this._list.querySelectorAll('a')];
    const currentFocus = anchors.reduce((index, { tabIndex }, i) => tabIndex === 0 ? i : index, null);
    anchors.forEach((a) => a.tabIndex = -1);
    const next = currentFocus === null ? 0 : (currentFocus + keys[key]) % anchors.length;
    const target = anchors.at(next);
    target.tabIndex = 0;
    target.focus();
  }

  clear() {
    this._list.innerHTML = '';
  }

  _search(input) {
    return [].concat(this._lookup).filter(Boolean).reduce((results, entry) => {
      const { term, group, text, link, display } = entry;
      let index

      index = getResultIndex(input, term);
      if (~index) {
        results[group] = results[group] ?? [];
        results[group].push({ display, link });
        return results;
      }

      index = getResultIndex(input, text);
      if (~index) {
        results[group] = results[group] ?? [];
        results[group].push({ display, link, text: text.slice(index) });
        return results;
      }

      return results;
    }, {});
  }

  _render() {
    this.clear();
    const results = this._search(this._input.value);
    for (let group in results) {
      const ul = document.createElement('ul');
      this._list.appendChild(ul);
      ul.setAttribute('aria-label', group);
      ul.innerHTML = results[group].map(renderEntry).slice(0, MAX_RESULTS).join('');
    }
  }
}