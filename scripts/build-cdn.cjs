/**
 * Builds the CDN sample from src/ by:
 * - Injecting unpkg script tags into index.html and using classic script for app.js
 * - Transforming app.js for CDN (no ES module import, use window.Webex)
 * - Copying styles.css
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const OUT = path.join(ROOT, 'dist', 'cdn');

const UNPKG_SCRIPTS = [
  '<script crossorigin src="https://unpkg.com/webex@3.8.1/umd/webex.min.js"></script>',
  '<script crossorigin src="https://unpkg.com/@webex/contact-center/umd/contact-center.min.js"></script>',
].join('\n    ');

function buildHtml() {
  let html = fs.readFileSync(path.join(SRC, 'index.html'), 'utf8');
  html = html.replace(
    '<!-- UNPKG_INJECT -->\n    <script type="module" src="./app.js"></script>',
    `${UNPKG_SCRIPTS}\n    <script src="./app.js"></script>`,
  );
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'index.html'), html);
}

function buildAppJs() {
  let js = fs.readFileSync(path.join(SRC, 'app.js'), 'utf8');
  // Remove the ES module import line
  js = js.replace(
    /^import Webex from '@webex\/(?:plugin-cc|contact-center)';\s*\n/,
    '',
  );
  // Use window.Webex for CDN (classic script)
  js = js.replace(
    /\bwebex = Webex\.init\(/,
    'webex = window.webex = Webex.init(',
  );
  fs.writeFileSync(path.join(OUT, 'app.js'), js);
}

function copyStyles() {
  fs.copyFileSync(path.join(SRC, 'styles.css'), path.join(OUT, 'styles.css'));
}

buildHtml();
buildAppJs();
copyStyles();
console.log('CDN build complete: dist/cdn/');
