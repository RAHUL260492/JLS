const fs = require('fs');

const index = fs.readFileSync('../just-adulting-club/index.html', 'utf8');
const category = fs.readFileSync('../just-adulting-club/category.html', 'utf8');

const bodyMatch = index.match(/<body[^>]*>(.*?)<\/body>/s)[1];

const mainStartHtml = '<main id="main">';
const mainEndHtml = '</main>';

const indexMainStartIndex = bodyMatch.indexOf(mainStartHtml);
const indexMainEndIndex = bodyMatch.indexOf(mainEndHtml, indexMainStartIndex);

const topPart = bodyMatch.slice(0, indexMainStartIndex);
let indexMainContent = bodyMatch.slice(indexMainStartIndex + mainStartHtml.length, indexMainEndIndex);
indexMainContent = indexMainContent.replace(/src="images\/([^"]+)"/g, 'src="{{ \'$1\' | asset_url }}"');
const bottomPart = bodyMatch.slice(indexMainEndIndex + mainEndHtml.length);

const categoryBodyMatch = category.match(/<body[^>]*>(.*?)<\/body>/s)[1];
const categoryMainStartIndex = categoryBodyMatch.indexOf(mainStartHtml);
const categoryMainEndIndex = categoryBodyMatch.indexOf(mainEndHtml, categoryMainStartIndex);
const categoryMainContent = categoryBodyMatch.slice(categoryMainStartIndex + mainStartHtml.length, categoryMainEndIndex);

const themeLiquid = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ page_title }}</title>
  
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600&family=Jost:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&display=swap" rel="stylesheet">
  
  <link rel="stylesheet" href="{{ 'styles.css' | asset_url }}">
  <script type="module" src="https://cdn.shopify.com/storefront/web-components.js"></script>
  
  {{ content_for_header }}
</head>
<body>
  ${topPart}
  <main id="main">
    {{ content_for_layout }}
  </main>
  ${bottomPart.replace(/<script defer src="main.js"><\/script>/, `<script defer src="{{ 'main.js' | asset_url }}"></script>`).replace(/<script defer src="category.js"><\/script>/, '')}
  
  {% if template contains 'collection' %}
  <script defer src="{{ 'category.js' | asset_url }}"></script>
  {% endif %}
</body>
</html>`;

fs.mkdirSync('layout', { recursive: true });
fs.mkdirSync('templates', { recursive: true });
fs.mkdirSync('assets', { recursive: true });

fs.writeFileSync('layout/theme.liquid', themeLiquid);
fs.writeFileSync('templates/index.liquid', indexMainContent);
fs.writeFileSync('templates/collection.liquid', categoryMainContent);

fs.copyFileSync('../just-adulting-club/styles.css', 'assets/styles.css');
fs.copyFileSync('../just-adulting-club/main.js', 'assets/main.js');
fs.copyFileSync('../just-adulting-club/category.js', 'assets/category.js');
try {
  fs.readdirSync('../just-adulting-club/images').forEach(file => {
    fs.copyFileSync('../just-adulting-club/images/' + file, 'assets/' + file);
  });
} catch(e) {}

console.log('Build complete');
