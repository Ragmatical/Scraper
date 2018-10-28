const puppeteer = require('puppeteer')
var mongoose = require('mongoose')
var labelModel = require("./schema.js").getModel();



async function scrapeSite(url) {
	const browser = await puppeteer.launch({headless: true});
	const page = await browser.newPage();
	await page.goto(url);
	const buffer = await page.screenshot({fullPage: true});
	await browser.close();
	return  buffer;
}

labelModel.find({image:{$exists:false}})
	.exec(function(err, labels){
			if(err){
				console.log(err)
				return
			}
			for(i=0; i<labels.length; i++){
				var url = labels[i].url
				var label = labels[i]
				label.image = scrapeSite(url);
				label.save();
			}
	}
	)
