import fs from 'fs';
import { Server } from 'socket.io';

let GAMES = {
  1: {
    players: {},
    decks: {
      questions: {},
      answers: {},
    },
  },
};
let CARD_ID_TRACKER = 1;
let GAME_ID_TRACKER = 1;
let DECK_ID_TRACKER = 1;

function CSVToDeck(data, deckId) {
  const THREE_PICK_EXCEPTIONS = ['haiku'];

  return data.split('\n').map(rawCard => {
    const separatorPos = rawCard.lastIndexOf(',');
    const anwserSpaces = rawCard.match(/___/g);
    let pick = anwserSpaces ? anwserSpaces.length : 1;

    THREE_PICK_EXCEPTIONS.forEach(term => {
      if (rawCard.includes(term)) {
        pick = 3;
      }
    });

    const preDraw = pick === 3 ? 2 : 0;

    return {
      deckId,
      pick,
      preDraw,
      id: CARD_ID_TRACKER++,
      draw: pick - preDraw,
      text: rawCard.slice(0, separatorPos),
      version: rawCard.slice(separatorPos + 1),
    };
  });
}

const io = new Server(3000, {
  cors: {
    origin: 'http://localhost:8000',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', socket => {
  const drawCards = (player, game, numberOfCards) => {
    const { unused } = game.decks.answers;

    player.hand.push(
      ...unused.splice(unused.length - numberOfCards, numberOfCards)
    );
  };

  socket.on('playerName', userName => {
    const player = {
      gameId: 1,
      name: userName,
      hand: [],
    };

    GAMES[1].players[socket.id] = player;

    drawCards(player, GAMES[player.gameId], 7);

    socket.emit('hand', player.hand.map(card => ({ card.id, card.text, card.version })));
  });
});

// Saves games each minute
setInterval(function () {
  if (!Object.keys(GAMES).length) {
    return;
  }

  fs.writeFile('games.json', JSON.stringify(GAMES), err => {
    if (err) {
      return console.error(err);
    }
    console.info('Games saved.');
  });
}, 60000);

// fs.readFile('games.json', 'UTF-8', (err, data) => {
//   if (err) {
//     return console.error(err);
//   }

//   GAMES = JSON.parse(data);
// });

fs.readFile('./cah_p.csv', 'UTF-8', (err, data) => {
  if (err) {
    return console.error(err);
  }

  const deckId = DECK_ID_TRACKER++;

  GAMES[1].decks.questions = {
    deckId,
    unused: CSVToDeck(data, deckId),
    used: {},
  };
});

fs.readFile('./cah_b.csv', 'UTF-8', (err, data) => {
  if (err) {
    return console.error(err);
  }

  const deckId = DECK_ID_TRACKER++;

  GAMES[1].decks.answers = {
    deckId,
    unused: CSVToDeck(data, deckId),
    used: {},
  };
});
