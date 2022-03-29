import { shuffle } from './utils.mjs';

const drawAnswerCards = (player, game, numberOfCards) => {
  const { unused } = game.decks.answers;

  player.hand.push(
    ...unused.splice(unused.length - numberOfCards, numberOfCards)
  );
};

const checkReadyToReveal = (io, game) => {
  const players = Object.values(game.players);
  const isEverybodyReady = !players.some(
    player => !player.choice.cards.length && game.master[0].id !== player.id
  );

  if (!isEverybodyReady) {
    return;
  }

  io.emit('answers', new Array(players.length - 1).fill({}));
};

const getPlayersWithStatus = game =>
  Object.values(game.players).map(player => {
    const status = player.choice.cards.length ? 'ready' : 'choosing';

    return {
      name: player.name,
      score: player.score,
      status: game.master[0].id === player.id ? 'master' : status,
    };
  });

export const onPlayerName = (io, socket, game, userName) => {
  const player = {
    id: socket.id,
    socket,
    choice: {
      revealed: false,
      cards: [],
    },
    score: 0,
    gameId: 1,
    name: userName,
    hand: [],
  };

  game.players[socket.id] = player;
  game.master.push(player);

  drawAnswerCards(player, game, 7);

  socket.emit(
    'hand',
    player.hand.map(card => ({
      id: card.id,
      text: card.text,
      version: card.version,
    }))
  );

  io.emit('players', getPlayersWithStatus(game));

  if (game.master.length === 1) {
    socket.emit('master', true);
  }
};

export const onChooseCards = (io, socket, game, cardIds) => {
  if (cardIds.length > game.currentQuestion.pick) {
    return;
  }

  const player = game.players[socket.id];
  const playerHasCards = !cardIds.some(
    cardId => !player.hand.find(card => card.id === cardId)
  );

  if (!playerHasCards) {
    return;
  }

  cardIds.forEach(id => {
    const choosenCardIndex = player.hand.findIndex(card => card.id === id);
    const choosenCard = player.hand.splice(choosenCardIndex, 1);

    player.choice.cards.push(...choosenCard);
  });

  io.emit('players', getPlayersWithStatus(game));

  socket.emit('cardsLocked', true);

  checkReadyToReveal(io, game);
};

export const onRevealAnswer = (io, socket, game) => {
  if (socket.id !== game.master[0].id) {
    return;
  }

  const choices = Object.values(game.players)
    .filter(player => game.master[0].id !== player.id)
    .map(player => player.choice);
  const choiceToReveal = choices.find(choice => !choice.revealed);

  if (!choiceToReveal) {
    return;
  }

  choiceToReveal.revealed = true;

  if (!choices.find(choice => !choice.revealed)) {
    game.master[0].socket.emit('pickAnswer');
  }

  io.emit(
    'answers',
    choices.map(choice =>
      choice.revealed
        ? choice.cards.map(card => ({
            id: card.id,
            text: card.text,
            version: card.version,
          }))
        : []
    )
  );
};

export const onPickAnswer = (io, socket, game, cardId) => {
  if (socket.id !== game.master[0].id) {
    return;
  }

  Object.values(game.players).forEach(player => {
    if (player.choice.cards.find(card => card.id === cardId)) {
      player.score++;
    }

    game.decks.answers.used.push(...player.choice.cards);
    player.choice.revealed = false;
    player.choice.cards = [];

    drawAnswerCards(player, game, 7 - player.hand.length);

    player.socket.emit(
      'hand',
      player.hand.map(card => ({
        id: card.id,
        text: card.text,
        version: card.version,
      }))
    );
  });

  socket.emit('master', false);
  io.emit('cardsLocked', false);
  io.emit('answers', null);
  io.emit('pickAnswer', false);

  game.master.push(game.master.shift());

  game.decks.questions.used.push(game.currentQuestion);
  game.currentQuestion = game.decks.questions.unused.pop();

  io.emit('question', {
    id: game.currentQuestion.id,
    pick: game.currentQuestion.pick,
    text: game.currentQuestion.text,
    version: game.currentQuestion.version,
  });

  game.master[0].socket.emit('master', true);

  io.emit('players', getPlayersWithStatus(game));
};

export const onResetGames = (io, games) => {
  Object.entries(games).forEach(([id, game]) => {
    games[id].decks.answers.unused.push(...games[id].decks.answers.used);
    Object.values(games[id].players).forEach(player => {
      games[id].decks.answers.unused.push(...player.hand);
      games[id].decks.answers.unused.push(...player.choice.cards);
    });

    games[id].decks.questions.unused.push(...games[id].decks.questions.used);
    games[id].decks.questions.unused.push(games[id].currentQuestion);

    shuffle(games[id].decks.questions.unused);
    shuffle(games[id].decks.answers.unused);

    games[id] = {
      players: {},
      currentQuestion: games[id].decks.questions.unused.pop(),
      master: [],
      decks: {
        answers: {
          unused: games[id].decks.answers.unused,
          used: [],
        },
        questions: {
          unused: games[id].decks.questions.unused,
          used: [],
        },
      },
    };
  });
};
