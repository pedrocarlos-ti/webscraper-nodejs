const fs = require('fs');
const axios = require('axios');
const exportResult = require('./app');

async function initFetchMode() {
  let page = 1;
  let rankingPlayers = [];

  while (true) {
    const { data } = await axios.get(
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
      ...players.map(p => {
        return {
          rank: p.rank,
          name: p.owner.name.display,
          nationality: p.owner.nationalTeam.country,
          goals: p.value
        };
      })
    );

    page += 1;
  }

  fs.writeFileSync('player-fetch-mode.json', JSON.stringify(rankingPlayers));
  exportResult('player-fetch-mode.json');
}

initFetchMode();
