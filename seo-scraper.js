var Crawler = require("simplecrawler");
var cheerio = require('cheerio');
var csvWriter = require('csv-write-stream');
var fs = require('fs');

var writer = csvWriter({
	headers: ['url', 'title', 'viewport', 'csrf-token', 
			  'description', 'keywords', 'og:title', 'og:type',
			  'og:url', 'og:image', 'og:description', 'og:site_name',
			  'twitter:image', 'words']});

var d = new Date();
var n = d.getTime();

writer.pipe(fs.createWriteStream('crawls/' + n + '-crawl.csv'));

var crawler = new Crawler("http://originalvinyl.net");

crawler.interval = 100;
crawler.maxConcurrency = 6;

crawler.on("fetchcomplete", function (queueItem, responseBuffer, response) {

	var $ = cheerio.load(responseBuffer.toString("utf8"));

	var cleanMeta = { url: queueItem.url ,title:  $('title').text() };
	var words = 0;
	var meta = $('meta');
	var paragraphs = $('p');

	for(var i = 0; i < paragraphs.length; i++){
		//TODO count all words on page
	}
	cleanMeta['words'] = words;

	for(var i = 0; i < meta.length; i++){

		var el = meta[i].attribs;

		if(el.property){
			cleanMeta[el.property] = el.content;
		}else if(el.name){
			cleanMeta[el.name] = el.content;
		}
	}

	console.log(queueItem.url);

	writer.write(cleanMeta);

	return $("a[href]").map(function () {
		return $(this).attr("href");
	}).get();

});

crawler.on('complete', function(){
	writer.end();
});

crawler.on('crawlstart', function(){
	console.log('Crawler Start');
});

crawler.start();