//  node imdb.js   --datafolder=dbms --excel1=tvb.csv --excel2==tvs.csv --config=config.json



const minimist = require('minimist');
const puppeteer = require('puppeteer');
const fs = require('fs');
const axios = require('axios');
const jsdom = require('jsdom');
const path = require('path');
const xl = require('excel4node');
const pdf = require('pdfkit');
const {
    fontSize
} = require('pdfkit');
const {
    fontFamily
} = require('excel4node/distribution/lib/types');


let args = minimist(process.argv);
let url = "https://www.imdb.com/ ";
let folder = args.datafolder;
let excel1 = args.excel1;
let excel2 = args.excel2;
let config = args.config;


let configJSON = fs.readFileSync(config, "utf-8");
let configJSO = JSON.parse(configJSON);


async function danceMeriRani() {

    let browser = await puppeteer.launch({
        headless: false,
        args: ['--start-maximized'],
        defaultViewport: null
    });

    let pages = await browser.pages();
    let page = pages[0];

    await page.goto(url);

    await page.waitForSelector("div._3x17Igk9XRXcaKrcG3_MXQ a");
    await page.click("div._3x17Igk9XRXcaKrcG3_MXQ a");


    await page.waitForSelector("div.list-group a:nth-child(1)");
    await page.click("div.list-group a:nth-child(1)");

    await page.waitForSelector("input[type='email']")
    await page.type("input[type='email']", configJSO.userid, {
        delay: 100
    });

    await page.waitForSelector("input[type='password']")
    await page.type("input[type='password']", configJSO.password, {
        delay: 100
    });

    await page.waitForSelector("input#signInSubmit");
    await page.click("input#signInSubmit");

    await page.waitForSelector("label div.ipc-button__text");
    await page.click("label div.ipc-button__text");

    await page.waitForSelector("a[href='/chart/top/?ref_=nv_mv_250']");
    await page.click("a[href='/chart/top/?ref_=nv_mv_250']");



    await page.waitFor(3000);

    await autoScroll(page);

    await page.waitFor(3000);


    await page.waitForSelector("label div.ipc-button__text");
    await page.click("label div.ipc-button__text");

    await page.waitFor(3000);

    await page.waitForSelector("a[href='/chart/toptv/?ref_=nv_tvv_250']");
    await page.click("a[href='/chart/toptv/?ref_=nv_tvv_250']");

    await page.waitFor(3000);


    await autoScroll(page);

}
danceMeriRani()

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 30);
        });
    });
}

const top250Moviewale = "https://www.imdb.com/chart/top/?ref_=nv_mv_250";

let downlode_Pr = axios.get(top250Moviewale);
downlode_Pr.then(function (res) {
    let html = res.data;
    let dom = new jsdom.JSDOM(html);
    let document1 = dom.window.document;
    console.log(document1.title);

    top250Movies(document1);
})

function top250Movies(document1) {
    console.log(document1.title);
    let movies = [];
    let movies_info = document1.querySelectorAll(".lister-list tr");


    for (let i = 0; i < movies_info.length; i++) {

        let movie = {}



        let mui_name = movies_info[i].querySelector("td.titleColumn a");
        movie.Name = mui_name.textContent;

        let mui_time = movies_info[i].querySelector("td.titleColumn span");
        movie.Year = mui_time.textContent;

        let mui_rating = movies_info[i].querySelector("td.imdbRating strong");
        movie.IMDB_Rating = mui_rating.textContent;



        movies.push(movie);
    }


    let movieJSON = JSON.stringify(movies);
    fs.writeFileSync("top_250_movies.json", movieJSON, "utf-8");

    createExcelFile(movies, document1.title);

    let docs1 = new pdf();
    let writeMovies = fs.createWriteStream('Top250Movies.pdf')
   
    docs1
        .text('Top 250 Movies Of All Time', {
            align: 'center',
            fontSize: 23
        })
        .fillColor('Red')

    docs1
        .fillColor('gray')
        .fontSize(15)


    docs1.pipe(writeMovies);
    docs1.text(JSON.stringify(movies));
    docs1.end();

}



// node imdb.js   --datafolder=movies --datafolder2=series --excel1=tvb.csv --excel2==tvs.csv --config=config.json

const top250Serieswale = "https://www.imdb.com/chart/toptv/?ref_=nv_tvv_250";

let downlode_Prr = axios.get(top250Serieswale);
downlode_Prr.then(function (res) {
    let html = res.data;

    let dom = new jsdom.JSDOM(html);
    let document2 = dom.window.document;
    console.log(document2.title);

    top250Series(document2);


})



function top250Series(document2) {
    console.log(document2.title);
    let seriess = [];

    let series_info = document2.querySelectorAll(".lister-list tr");


    for (let i = 0; i < series_info.length; i++) {

        let series = {}


        let series_name = series_info[i].querySelector("td.titleColumn a");
        series.Name = series_name.textContent;

        let series_year = series_info[i].querySelector("td.titleColumn span");
        series.Year = series_year.textContent;

        let series_rating = series_info[i].querySelector("td.imdbRating strong");
        series.IMDB_Rating = series_rating.textContent;


        seriess.push(series);
    }

    let movieJSON = JSON.stringify(seriess);
    fs.writeFileSync("top_250_series.json", movieJSON, "utf-8");

    createExcelFile(seriess, document2.title);

    let docs2 = new pdf();
    let writeSeries = fs.createWriteStream('Top250series.pdf')
   
    docs2
        .text('Top 250 Movies Of All Time', {
            align: 'center',
            fontSize: 23

        })
        .fillColor('Red')




    docs2
        .fillColor('gray')
        .fontSize(15)
    docs2.pipe(writeSeries);
    docs2.text(JSON.stringify(seriess));
    docs2.end();

}





function createExcelFile(movie, title) {
    let wb = new xl.Workbook();

    let mStyle = wb.createStyle({
        font: {
            color: 'light green',
            size: 12,
        },
        alignment: {
            wrapText: true,
            horizontal: 'center',
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: "indigo",

        },
    });

    let cStyle = wb.createStyle({
        font: {
            color: 'green',
            size: 12,
        },
        alignment: {
            wrapText: true,
            horizontal: 'center',
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: "light green",

        },
    });


    let sheet = wb.addWorksheet(title);

    for (let i = 0; i < movie.length; i++) {

        sheet.cell(1, 1).string("Name").style(mStyle);
        sheet.cell(1, 2).string("Year").style(mStyle);
        sheet.cell(1, 3).string("Rating").style(mStyle);

        sheet.cell(i + 2, 1).string(movie[i].Name).style(cStyle);
        sheet.cell(i + 2, 2).string(movie[i].Year).style(cStyle);
        sheet.cell(i + 2, 3).string(movie[i].IMDB_Rating).style(cStyle);
    }

    if (title == "IMDb Top 250 TV - IMDb") {
        wb.write(excel2);
    } else {
        wb.write(excel1);
    }


}





// node imdb.js --url=https://www.imdb.com/  --tvb=https://www.imdb.com/chart/top/?ref_=nv_mv_250 --tss=https://www.imdb.com/chart/toptv/?ref_=nv_tvv_250 --datafolder=Fun --excel1=tvb.csv --excel2==tvs.csv --config=config.json




// danceMeriRani();