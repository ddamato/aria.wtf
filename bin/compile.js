const path = require('path');
const fs = require('fs').promises;
const fm = require('front-matter');
const md = require('markdown-it')({
  html: true,
  linkify: true,
});
const { minify } = require('html-minifier');
const glob = require('fast-glob');
const nunjucks = require('nunjucks');
const loader = new nunjucks.FileSystemLoader(path.resolve(__dirname, '..', 'templates'));
const env = new nunjucks.Environment(loader, {
  trimBlocks: true,
  lstripBlocks: true,
});

const COMPILED_SITE_PATH = path.resolve(__dirname, '..', '_site');
const TITLE = `aria.wtf`;
const DESCRIPTION = `aria-incantations`;
const URL = 'https://aria.wtf';
const FONT_PRELOAD = 'https://fonts.googleapis.com/css2?family=Lora&family=Poppins:wght@300;700&display=swap';

const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  url: URL,
  fontPreload: FONT_PRELOAD,
};

function parse(file) {
  const { name } = path.parse(file);
  const dir = path.basename(path.dirname(file));
  const contentType = dir !== 'content' ? dir : '';
  return {
    filename: `${name}.html`,
    contentType,
    root: contentType ? '../' : '',
    filejoin: [COMPILED_SITE_PATH, contentType].filter(Boolean)
  }
}

async function compile(file) {
  const { filename, contentType, filejoin, root } = parse(file);
  const markdown = await fs.readFile(file);
  const { attributes, body } = fm(markdown.toString());
  const html = env.render('base.njk', { 
    attributes,
    content: md.render(body),
    contentType,
    root,
    ...metadata,
  });
  const filedir = path.join(...filejoin);
  fs.mkdir(filedir, { recursive: true });
  return fs.writeFile(path.join(filedir, filename), minify(html, { collapseWhitespace: true }), { encoding: 'utf8' });
}

(async function main() {
  const mdFiles = await glob(['content/**/*.md']);
  await Promise.all(mdFiles.map(compile));
})();
