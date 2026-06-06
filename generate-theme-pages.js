const fs = require('fs');

const replaceNavigationPaths = (str) => {
  return str
    .replace(/href="\/women\.html"/g, 'href="/pages/women"')
    .replace(/href="\/women"/g, 'href="/pages/women"')
    .replace(/href="\/men\.html"/g, 'href="/pages/men"')
    .replace(/href="\/men"/g, 'href="/pages/men"')
    .replace(/href="\/linen\.html"/g, 'href="/collections/all"')
    .replace(/href="\/linen"/g, 'href="/collections/all"')
    .replace(/href="\/category\.html"/g, 'href="/collections/all"')
    .replace(/href="category\.html"/g, 'href="/collections/all"')
    .replace(/href="\/resort-cuban-shirt"/g, 'href="/collections/resort-cuban-shirt"')
    .replace(/href="\/polos"/g, 'href="/collections/polos"')
    .replace(/href="\/accessories"/g, 'href="/collections/accessories"');
};

// Read the previously compiled Theme layout
let themeLiquid = fs.readFileSync('layout/theme.liquid', 'utf8');
themeLiquid = replaceNavigationPaths(themeLiquid);
fs.writeFileSync('layout/theme.liquid', themeLiquid);

// Read the new dummy pages from original HTML codebase
const extractMain = (html) => {
  const mainStart = '<main id="main">';
  const mainEnd = '</main>';
  const startIndex = html.indexOf(mainStart) + mainStart.length;
  const endIndex = html.indexOf(mainEnd);
  return html.slice(startIndex, endIndex);
};

const womenHtml = fs.readFileSync('../just-adulting-club/women.html', 'utf8');
const menHtml = fs.readFileSync('../just-adulting-club/men.html', 'utf8');

fs.writeFileSync('templates/page.women.liquid', replaceNavigationPaths(extractMain(womenHtml)));
fs.writeFileSync('templates/page.men.liquid', replaceNavigationPaths(extractMain(menHtml)));

// Read and process index.liquid and collection.liquid which were created by build-theme.js
let indexLiquid = fs.readFileSync('templates/index.liquid', 'utf8');
fs.writeFileSync('templates/index.liquid', replaceNavigationPaths(indexLiquid));

let collectionLiquid = fs.readFileSync('templates/collection.liquid', 'utf8');
fs.writeFileSync('templates/collection.liquid', replaceNavigationPaths(collectionLiquid));

console.log('Theme templates compiled.');
