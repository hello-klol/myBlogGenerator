const fs = require('fs-extra')
const path = require('path')
const cheerio = require('cheerio')

var notebook = fs.readFileSync(path.join(__dirname, 'source', 'notebooks', 'index.html')).toString()
//console.log(notebook)

const $ = cheerio.load(notebook)
//console.log($.html())

console.log($('div#notebook').html())
