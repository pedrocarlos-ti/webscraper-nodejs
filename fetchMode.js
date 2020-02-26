const fs = require('fs');
const axios = require('axios');
const chalk = require('chalk');

function exportResult() {
  const nationality = {};
  const raw = fs.readFileSync('player-fetch-mode.json', 'utf-8');
  const players = JSON.parse(raw);

  players.map(r => {
    //If found nationality
    if (nationality.hasOwnProperty(r.nationality)) {
      return (nationality[r.nationality] += 1);
    }

    nationality[r.nationality] = 1;
  });

  fs.writeFile(
    'nationality-fetch-mode.json',
    JSON.stringify(nationality),
    'utf-8',
    () => {
      console.log(chalk.blue('Exporting nationality-fetch-mode.json'));
      console.log(chalk.redBright('Process Finished'));
      process.exit();
    }
  );
}

async function initFetchMode() {
  let page = 1;
  let rankingPlayers = [];

  while (true) {
    const { data } = await axios(
      `https://footballapi.pulselive.com/football/stats/ranked/players/goals?page=${page}&pageSize=20&comps=1&compCodeForActivePlayer=EN_PR&altIds=true`,
      {
        headers: {
          origin: 'https://www.premierleague.com'
        }
      }
    );

    const players = data.stats.content;

    console.log('loading page ' + page);

    if (players.length === 0) {
      break;
    }

    rankingPlayers.push(
      ...players.map(p => ({
        rank: p.rank,
        name: p.owner.name.display,
        nationality: p.owner.nationalTeam.country,
        goals: p.value
      }))
    );

    page += 1;
  }

  fs.writeFileSync('player-fetch-mode.json', JSON.stringify(rankingPlayers));
  exportResult();
}

initFetchMode();
