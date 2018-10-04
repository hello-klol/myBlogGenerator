const fs = require('fs-extra')
const path = require("path")
const Mustache = require('mustache')


const pages = require('./main-pages.json')
const posts = require('./blog-posts.json')


var pageTemplate = fs.readFileSync(path.join(__dirname,'templates/page.html')).toString()
Mustache.parse(pageTemplate)

var postTemplate = fs.readFileSync(path.join(__dirname,'templates/post.html')).toString()
Mustache.parse(postTemplate)


partialFiles = ['default-head', 'header', 'post-header']

function getPartialTemplate(partialFileName) {
  return fs.readFileSync(path.join(__dirname, 'partials', `${partialFileName}.html`)).toString();
}

function addPartialTemplate(obj, partialFileName) {
  return Object.assign(obj, {
    [partialFileName]: getPartialTemplate(partialFileName) 
  });
}

const partials = partialFiles.reduce(addPartialTemplate, {})



//generate blog posts
const generator = partials => template => obj => {
  // for posts need to know previous and next
  // need path as date + path without index
  var inputPath  = path.join(__dirname,'source',obj.path,'index.html')
  var outputPath = path.join(__dirname,'public',obj.path,'index.html')
  
  if ((obj.type=='article') || (obj.type=='notebook')) {
    var datePath = obj.date.replace(/-/g,'/')
    inputPath  = path.join(__dirname, 'source', 'blog',   obj.path, 'index.html')
    outputPath = path.join(__dirname, 'public', datePath, obj.path, 'index.html')
  }
  
  var output = Mustache.render(template, Object.assign(obj, {
    content: fs.readFileSync(inputPath).toString()
  }), partials) 
  fs.outputFileSync(outputPath, output)

}

const makeGenerator = generator(partials);

const pageGenerator = makeGenerator(pageTemplate);
pages.build.forEach(pageGenerator)

const postGenerator = makeGenerator(postTemplate)
posts.build.forEach(postGenerator)

