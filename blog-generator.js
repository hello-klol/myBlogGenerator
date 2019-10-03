"use strict"

const fs = require('fs-extra')
const path = require('path')
const find = require('find')
const Mustache = require('mustache')
const moment = require('moment')
const cheerio = require('cheerio')


const postTemplate = fs.readFileSync(path.join(__dirname,'templates/post.mustache')).toString()
Mustache.parse(postTemplate)


console.log('Loading partials...')
// Load partial files into an array of filenames
const partialFiles = fs.readdirSync('./partials/').reduce((partials, file) => {
  const ext = path.extname(file)
  if (ext=='.mustache') {
    return partials.concat(path.basename(file, ext))
  }
  return partials
}, [])

function getPartialTemplate(partialFileName) {
  return fs.readFileSync(path.join(__dirname, 'partials', `${partialFileName}.mustache`)).toString();
}

function addPartialTemplate(obj, partialFileName) {
  return Object.assign(obj, {
    [partialFileName]: getPartialTemplate(partialFileName)
  });
}
// Convert array of partial filenames into object containing templates
const partials = partialFiles.reduce(addPartialTemplate, {})



// Generate blog posts
console.log('Generating blog posts...')
const generator = partials => template => (obj, i, arr) => {
  let prev = arr[i+1]
  let next = arr[i-1]

  // Content might be .html or .md - need to convert if .md
  let inputPath  = path.join(__dirname, 'source', 'blog',   obj.path, 'index.html')
  // TODO: find index and maybe convert
  // Hosted path is based on date published:
  const datePath = obj.date.replace(/-/g,'/')
  // console.log(datePath)
  let outputPath = path.join(__dirname, 'public', datePath, obj.path, 'index.html')

  let content = fs.readFileSync(inputPath).toString()
  if (obj.type=='notebook') {
    const $ = cheerio.load(content)
    content = '<div class="notebook">' + $('div#notebook').html() + '</div>'
  }

  const output = Mustache.render(template, Object.assign(obj, {
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

const archiveTemplate = fs.readFileSync(path.join(__dirname,'templates/archive.mustache')).toString()
Mustache.parse(archiveTemplate)

const postSummary = posts['blog-posts'].map(obj => Object.create({
  title: obj.title,
  datePath: path.join('/', obj.date.replace(/-/g,'/'), obj.path),
  shortDate: moment(obj.date).format('MM-DD'),
  year: moment(obj.date).format('YYYY')
}))

// TODO: Seems like a pretty convulated way to get distinct years and split posts
const years = [...new Set(postSummary.map(post => post.year))]

let blogsByYear = years.map(y =>  Object.create({
  'archive-year' : y,
  'blog-posts' : postSummary.filter((v, i, a) => v.year === y)
}))

const archivePage = Mustache.render(archiveTemplate, {'title':'Archives', 'archive-years':blogsByYear}, partials)

fs.outputFileSync(path.join(__dirname, 'public', 'archives', 'index.html'),
  archivePage)
