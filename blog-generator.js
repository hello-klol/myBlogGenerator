const fs = require('fs-extra')
const path = require("path")
const Mustache = require('mustache')
const moment = require('moment')

const posts = require('./blog-posts.json')


var postTemplate = fs.readFileSync(path.join(__dirname,'templates/post.html')).toString()
Mustache.parse(postTemplate)


// Load partial files into vars
// TODO: replace below with loading file names from partials dir
partialFiles = ['blog-post', 'archive','archive-head-meta', 'head-meta','post-head-meta','post','header','post-meta','post-header','post-footer']

function getPartialTemplate(partialFileName) {
  return fs.readFileSync(path.join(__dirname, 'partials', `${partialFileName}.mustache`)).toString();
}

function addPartialTemplate(obj, partialFileName) {
  return Object.assign(obj, {
    [partialFileName]: getPartialTemplate(partialFileName) 
  });
}

const partials = partialFiles.reduce(addPartialTemplate, {})



// Generate blog posts
const generator = partials => template => (obj, i, arr) => {
  prev = arr[i-1]
  next = arr[i+1]
  
  var datePath = obj.date.replace(/-/g,'/')
  inputPath  = path.join(__dirname, 'source', 'blog',   obj.path, 'index.html')
  outputPath = path.join(__dirname, 'public', datePath, obj.path, 'index.html')

  var output = Mustache.render(template, Object.assign(obj, {
    'content'   : fs.readFileSync(inputPath).toString(),
    'date-path' : path.join(datePath, obj.path),
    'prev-path' : (typeof prev !== 'undefined')?path.join('/',prev.date.replace(/-/g,'/'), prev.path):undefined,
    'prev-title': (typeof prev !== 'undefined')?prev.title:undefined,
    'next-path' : (typeof next !== 'undefined')?path.join('/',next.date.replace(/-/g,'/'), next.path):undefined,
    'next-title': (typeof next !== 'undefined')?next.title:undefined
  }), partials) 
  fs.outputFileSync(outputPath, output)

}


const makeGenerator = generator(partials);
const postGenerator = makeGenerator(postTemplate)


// Generate archive page
var blogPosts = posts['blog-posts'].map(obj => Object.assign(obj, {
  datePath: path.join('/', obj.date.replace(/-/g,'/'), obj.path),
  shortDate: moment(obj.date).format('MM-DD')
}))


var archiveTemplate = fs.readFileSync(path.join(__dirname,'templates/archive.mustache')).toString()
Mustache.parse(archiveTemplate)

var archivePage = Mustache.render(archiveTemplate, {'title':'Archives', 'blog-posts':blogPosts}, partials) 

fs.outputFileSync(path.join(__dirname, 'public', 'archives', 'index.html'), 
  archivePage)
