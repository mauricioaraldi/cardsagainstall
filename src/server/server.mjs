import 'dotenv/config';
import fs from 'fs';
import { Server } from 'socket.io';

import { onChooseCards, onPickAnswer, onPlayerName, onRevealAnswer } from './gameSocket.mjs';

let GAMES = {
  1: {
    players: {},
    currentQuestion: null,
    master: [],
    decks: {
      questions: {
        used: [],
        unused: [],
      },
      answers: {
        used: [],
        unused: [],
      },
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

function shuffle(array) {
  let currentIndex = array.length;
  let randomIndex;

  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
}

function suffleDeck(deck) {
  return deck;
}

console.log(process.env.FRONT_END_ADDRESS);

const io = new Server(3000, {
  cors: {
    origin: process.env.FRONT_END_ADDRESS,
    methods: ['GET', 'POST'],
  },
});

io.on('connection', socket => {
  socket.emit('question', {
    id: GAMES[1].currentQuestion.id,
    pick: GAMES[1].currentQuestion.pick,
    text: GAMES[1].currentQuestion.text,
    version: GAMES[1].currentQuestion.version,
  });

  socket.on('playerName', userName => onPlayerName(io, socket, GAMES[1], userName));

  socket.on('chooseCards', cards => onChooseCards(io, socket, GAMES[1], cards));

  socket.on('revealAnswer', cards => onRevealAnswer(io, socket, GAMES[1]));

  socket.on('pickAnswer', cardId => onPickAnswer(io, socket, GAMES[1], cardId));
});

// Saves games each minute
// setInterval(function () {
//   if (!Object.keys(GAMES).length) {
//     return;
//   }

//   fs.writeFile('games.json', JSON.stringify(GAMES), err => {
//     if (err) {
//       return console.error(err);
//     }
//     console.info('Games saved.');
//   });
// }, 60000);

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
    used: [],
  };

  shuffle(GAMES[1].decks.questions.unused);

  GAMES[1].currentQuestion = GAMES[1].decks.questions.unused.pop();
});

fs.readFile('./cah_b.csv', 'UTF-8', (err, data) => {
  if (err) {
    return console.error(err);
  }

  const deckId = DECK_ID_TRACKER++;

  GAMES[1].decks.answers = {
    deckId,
    unused: CSVToDeck(data, deckId),
    used: [],
  };

  shuffle(GAMES[1].decks.answers.unused);
});
