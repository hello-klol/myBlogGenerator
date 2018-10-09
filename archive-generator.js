const fs = require('fs-extra')
const path = require("path")
const Mustache = require('mustache')
const moment = require('moment')

partialFiles = ['blog-post', 'archive', 'head-meta','post-head-meta','post','header','post-meta','post-header','post-footer']

function getPartialTemplate(partialFileName) {
  return fs.readFileSync(path.join(__dirname, 'partials', `${partialFileName}.mustache`)).toString();
}

function addPartialTemplate(obj, partialFileName) {
  return Object.assign(obj, {
    [partialFileName]: getPartialTemplate(partialFileName) 
  });
}

const partials = partialFiles.reduce(addPartialTemplate, {})


const posts = require('./blog-posts.json')

var blogPosts = posts['blog-posts'].map(obj => Object.assign(obj, {
  datePath: path.join('/', obj.date.replace(/-/g,'/'), obj.path),
  shortDate: moment(obj.date).format('MM-DD')
}))


var archiveTemplate = fs.readFileSync(path.join(__dirname,'templates/archive.mustache')).toString()
Mustache.parse(archiveTemplate)

var archivePage = Mustache.render(archiveTemplate, {'title':'Archives', 'blog-posts':blogPosts}, partials) 


fs.outputFileSync(path.join(__dirname, 'public', 'archives', 'index.html'), 
  archivePage)
