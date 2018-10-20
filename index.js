/*
https://mrlera.wisen.space/strategy

TODO:
1. Input keyword(s)
2. Retrieve the json file from the network
https://v2.sg.media-imdb.com/suggests/FIRSTLETTER_OF_KEYWORD/KEYWORD.json
3. Filter out movies only (ID start with TT)
4.  In the response extract ID (TT...)
5. INSERT ID INTO: https://www.imdb.com/title/IDGOESHERE/reviews?ref_=tt_urv

*/
const request = require('request');
const puppeteer = require('puppeteer')

var terms = ['knowledge','street','infinity']
var searchUrls = terms.map(term =>
    `https://v2.sg.media-imdb.com/suggests/${term[0]}/${term}.json`
)
var movieIds = [];
var movieTitles = [];
var responseReceivedCount = 0;
var reviewUrls = [];
var allReviews = [];

function getReview(callback) {
  var reviewUrl = searchUrls.pop()
  var index = searchUrls.length
  console.log("MAKE REQUEST FOR: " + reviewUrl)
  request(reviewUrl, function (error, response, body) {
    responseReceivedCount ++;
    const term = terms[index];
    const startStringToRemove = `imdb${term}({`
    body = body.substring(startStringToRemove.length, body.length -1)
    body = JSON.parse(body);
    body.d.forEach(obj => {
      if(obj.id.startsWith('tt') && !movieIds.includes(obj.id)) {
        movieIds.push(obj.id);
        movieTitles.push(obj.l);
      }

    })
    console.log(responseReceivedCount)
    if(searchUrls.length === 0) {
      reviewUrls = movieIds.map((id, index) => {
        const url = `https://www.imdb.com/title/${id}/reviews?ref_=tt_ov_rt`

        return {
          url: url
          , title: movieTitles[index]
        }
      })
        console.log(reviewUrls)
        callback(reviewUrls)
    } else{
      getReview(callback)
    }
  }) 
}

function getReviewUrls(callback) {
  getReview(callback)
}

async function getReviews(divs){
  var ratings = divs.map(item => {
    return {
      rating: parseInt((item.querySelector('.ipl-ratings-bar') || {}).innerText)
      , review: item.querySelector('.content').textContent
    }
  });
  return ratings;

}

async function grabReviews(page, item){
  await page.$$eval('.lister-item-content', getReviews).then(function (output){
    allReviews = allReviews.concat(output);
  });
  console.log(allReviews)
}

async function scrapeReviews(reviewUrls){
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  for (var i = 0; i < reviewUrls.length; i++){
    var item = reviewUrls[i];
    console.log(item);
    await page.goto(item.url)
    await grabReviews(page, item)
  }
  await browser.close();
}

getReviewUrls(scrapeReviews);