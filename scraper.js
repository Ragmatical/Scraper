const puppeteer = require('puppeteer')
var url = "https://naver.com"


async function scrapeSite(url) {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto(url);
    await page.screenshot({path: 'screenshot.png', fullPage: true});
	await browser.close();
    return;
}

scrapeSite(url)