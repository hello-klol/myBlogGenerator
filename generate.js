const fs = require('fs-extra')
const path = require("path")
const Mustache = require('mustache')


const pages = require('./main-pages.json')


var pageTemplate = fs.readFileSync(path.join(__dirname,'templates/page.mustache')).toString()
Mustache.parse(pageTemplate)

partialFiles = ['head-meta','header','web-page-meta']

function getPartialTemplate(partialFileName) {
  return fs.readFileSync(path.join(__dirname, 'partials', `${partialFileName}.mustache`)).toString();
}

function addPartialTemplate(obj, partialFileName) {
  return Object.assign(obj, {
    [partialFileName]: getPartialTemplate(partialFileName) 
  });
}

const partials = partialFiles.reduce(addPartialTemplate, {})



const generator = partials => template => obj => {
  var inputPath  = path.join(__dirname,'source',obj.path,'index.html')
  var outputPath = path.join(__dirname,'public',obj.path,'index.html')
  
  var output = Mustache.render(template, Object.assign(obj, {
    content: fs.readFileSync(inputPath).toString()
  }), partials) 
  fs.outputFileSync(outputPath, output)
}

const makeGenerator = generator(partials);

const pageGenerator = makeGenerator(pageTemplate);
pages.build.forEach(pageGenerator)


// TODO: copy dirs css, images, pdfs, js
