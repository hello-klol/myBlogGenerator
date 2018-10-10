const fs = require('fs-extra')
const path = require('path')
const Mustache = require('mustache')
const moment = require('moment')
const cheerio = require('cheerio')


var postTemplate = fs.readFileSync(path.join(__dirname,'templates/post.mustache')).toString()
Mustache.parse(postTemplate)


// Load partial files into vars
// TODO: replace below with loading file names from partials dir
console.log('Loading partials...')
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
console.log('Generating blog posts...')
const generator = partials => template => (obj, i, arr) => {
  prev = arr[i+1]
  next = arr[i-1]
  
  var datePath = obj.date.replace(/-/g,'/')
  inputPath  = path.join(__dirname, 'source', 'blog',   obj.path, 'index.html')
  outputPath = path.join(__dirname, 'public', datePath, obj.path, 'index.html')
  
  var content = fs.readFileSync(inputPath).toString()
  if (obj.type=='notebook') {
    const $ = cheerio.load(content)
    content = '<div class="notebook">' + $('div#notebook').html() + '</div>'
  }

  var output = Mustache.render(template, Object.assign(obj, {
    content,
    'date-path' : path.join(datePath, obj.path),
    'prev-path' : (typeof prev !== 'undefined')?path.join('/',prev.date.replace(/-/g,'/'), prev.path):undefined,
    'prev-title': (typeof prev !== 'undefined')?prev.title:undefined,
    'next-path' : (typeof next !== 'undefined')?path.join('/',next.date.replace(/-/g,'/'), next.path):undefined,
    'next-title': (typeof next !== 'undefined')?next.title:undefined
  }), partials)
  console.log(outputPath)
  fs.outputFileSync(outputPath, output)

}


const makeGenerator = generator(partials);
const postGenerator = makeGenerator(postTemplate)

const posts = require('./blog-posts.json')
posts['blog-posts'].map(postGenerator)

// Generate archive page
console.log('Generating archive page')
var blogPosts = posts['blog-posts'].map(obj => Object.assign(obj, {
  datePath: path.join('/', obj.date.replace(/-/g,'/'), obj.path),
  shortDate: moment(obj.date).format('MM-DD')
}))


var archiveTemplate = fs.readFileSync(path.join(__dirname,'templates/archive.mustache')).toString()
Mustache.parse(archiveTemplate)

var archivePage = Mustache.render(archiveTemplate, {'title':'Archives', 'blog-posts':blogPosts}, partials) 

fs.outputFileSync(path.join(__dirname, 'public', 'archives', 'index.html'), 
  archivePage)
