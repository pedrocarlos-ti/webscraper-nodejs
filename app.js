const fs = require('fs');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const chalk = require('chalk');

const url =
  'https://www.premierleague.com/stats/top/players/goals?se=-1&cl=-1&iso=-1&po=-1?se=-1';

function exportResult(file = 'players.json') {
  const nationality = {};
  const raw = fs.readFileSync(file, 'utf-8');
  const players = JSON.parse(raw);

  players.map(r => {
    //If found nationality
    if (nationality.hasOwnProperty(r.nationality)) {
      return (nationality[r.nationality] += 1);
    }

    nationality[r.nationality] = 1;
  });

  fs.writeFile('nationality.json', JSON.stringify(nationality), 'utf-8', () => {
    console.log(chalk.blue('Exporting nationality.json'));
    console.log(chalk.redBright('Process Finished'));
    process.exit();
  });
}

function extractMetadata($) {
  const rank = $(this)
    .find('.rank > strong')
    .text();
  const name = $(this)
    .find('.playerName > strong')
    .text();
  const nationality = $(this)
    .find('.playerCountry')
    .text();
  const goals = $(this)
    .find('.mainStat')
    .text();

  return {
    rank,
    name,
    nationality,
    goals
  };
}

async function init() {
  let baseValue = 0;
  const toValue = 20; //Set the limit or Max Data ex: 2500
  const rankingPlayers = [];

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  console.log(chalk.blue('Loading page - ' + url));
  await page.goto(url);
  await page.waitForSelector('.paginationContainer > .paginationNextContainer');
  await page.waitFor(1000); //Need for render in the DOM

  while (baseValue < toValue) {
    console.log(chalk.blue('Extracting page - ' + baseValue));

    const content = await page.content();
    const $ = cheerio.load(content);
    const table = $('.statsTableContainer > tr');

    //Handle case don't exist more data to extract
    if (table.length === 0) {
      break;
    }

    table.each(function() {
      rankingPlayers.push(extractMetadata.apply(this, [$]));
    });

    baseValue += table.length;
    await page.tap('.paginationNextContainer');
    await page.waitFor(2000); //Needs for fetch and update DOM
  }

  fs.writeFile('players.json', JSON.stringify(rankingPlayers), 'utf-8', () => {
    console.log(chalk.blue('Exporting players.json'));
    exportResult();
  });
}

init();

module.exports = exportResult;
