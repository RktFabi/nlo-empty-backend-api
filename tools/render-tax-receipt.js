const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

const rootDir = path.resolve(__dirname, '..');
const templatesDir = path.join(rootDir, 'src', 'pdf', 'templates');
const mockDataDir = path.join(rootDir, 'src', 'pdf', 'mock-data');
const outputDir = path.join(rootDir, 'tmp');

function renderTemplate({ templateName, dataFileName, outputFileName }) {
  const templatePath = path.join(templatesDir, templateName);
  const dataPath = path.join(mockDataDir, dataFileName);
  const outputPath = path.join(outputDir, outputFileName);

  const templateSource = fs.readFileSync(templatePath, 'utf8');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const html = handlebars.compile(templateSource)(data);

  fs.writeFileSync(outputPath, html);
  console.log(`${outputFileName}: ${html.length} bytes`);
}

fs.mkdirSync(outputDir, { recursive: true });

renderTemplate({
  templateName: 'tax-receipt-ca.hbs',
  dataFileName: 'tax-receipt-ca.json',
  outputFileName: 'ca-receipt.html',
});

renderTemplate({
  templateName: 'tax-receipt-us.hbs',
  dataFileName: 'tax-receipt-us.json',
  outputFileName: 'us-receipt.html',
});

console.log(`Wrote outputs to ${outputDir}`);
