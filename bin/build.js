const path = require('path');
const { URL } = require('url');
const fs = require('fs').promises;
const fm = require('front-matter');
const md = require('markdown-it')({ html: true, linkify: true });
const { minify } = require('html-minifier');
const glob = require('fast-glob');
const { FileSystemLoader, Environment } = require('nunjucks');
const loader = new FileSystemLoader(path.resolve(__dirname, '..', 'templates'));
const env = new Environment(loader, { trimBlocks: true, lstripBlocks: true });

const COMPILED_SITE_PATH = path.resolve(__dirname, '..', '_site');
const TITLE = `aria.wtf`;
const DESCRIPTION = `aria-incantations`;
const BASEURL = 'https://aria.wtf';
const FONT_PRELOAD = 'https://fonts.googleapis.com/css2?family=Lora&family=Poppins:wght@300;700&display=swap';

const sitedata = {
  title: TITLE,
  description: DESCRIPTION,
  baseurl: BASEURL,
  fontPreload: FONT_PRELOAD,
};

function parse(file) {
  const { name } = path.parse(file);
  const dir = path.basename(path.dirname(file));
  const contentType = dir !== 'content' ? dir : null;
  return {
    name,
    filename: `${name}.html`,
    contentType,
    root: contentType ? '../' : '',
    filejoin: [COMPILED_SITE_PATH, contentType].filter(Boolean)
  }
}

async function compile(file) {
  const filedata = parse(file);
  const markdown = await fs.readFile(file);
  const { attributes, body } = fm(markdown.toString());
  return { 
    attributes,
    content: md.render(body),
    ...filedata,
    ...sitedata,
  };
}

async function lookup(metadata) {
  const reference = metadata.reduce((acc, { contentType, name }) => {
    if (!contentType) return acc;
    if (!Array.isArray(acc[contentType])) acc[contentType] = [];
    acc[contentType].push(name);
    return acc;
  }, {});
  return fs.writeFile(path.join(COMPILED_SITE_PATH, 'lookup.json'), JSON.stringify(reference), { encoding: 'utf8' });
}

async function sitemap(metadata) {
  const urls = metadata.map(({ contentType, name }) => {
    const sitemapUrl = new URL(path.join(...[contentType, name].filter(Boolean)), BASEURL);
    return name === 'index' ? BASEURL : sitemapUrl;
  });
  return fs.writeFile(path.join(COMPILED_SITE_PATH, 'sitemap.txt'), urls.join('\n'), { encoding: 'utf8' });
}

async function render(data) {
  const html = minify(env.render('base.njk', data), { collapseWhitespace: true });
  const { filejoin, filename } = data;
  const filedir = path.join(...filejoin);
  await fs.mkdir(filedir, { recursive: true });
  return fs.writeFile(path.join(filedir, filename), html, { encoding: 'utf8' });
}

(async function main() {
  const mdFiles = await glob(['content/**/*.md']);
  const metadata = await Promise.all(mdFiles.map(compile));
  await Promise.all(metadata.map(render));
  await lookup(metadata);
  await sitemap(metadata);
})();
