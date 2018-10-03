const fs = require('fs-extra')
const path = require("path")
const Mustache = require('mustache')
const config = require('./config.json')

var pageTemplate = fs.readFileSync(path.join(__dirname,'templates/page.html')).toString()
Mustache.parse(pageTemplate)

partialFiles = ['defaultHead', 'header']

function getPartialTemplate(partialFileName) {
  return fs.readFileSync(path.join(__dirname, 'partials', `${partialFileName}.html`)).toString();
}

function addPartialTemplate(obj, partialFileName) {
  return Object.assign(obj, {
    [partialFileName]: getPartialTemplate(partialFileName) 
  });
}

const partials = partialFiles.reduce(addPartialTemplate, {})

//generate plain pages
function generatePage(obj){
  var content = fs.readFileSync(path.join(__dirname,'source',obj.path)).toString()
  var output = Mustache.render(pageTemplate, {
    title: obj.title, 
    content,
  }, partials) 
  fs.outputFileSync(path.join(__dirname,'public',obj.path), output)
}
config.build.forEach(generatePage)

//generate blog posts

