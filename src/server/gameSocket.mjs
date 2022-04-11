import { shuffle } from './utils.mjs';

const drawAnswerCards = (player, game, numberOfCards) => {
  const { unused } = game.decks.answers;

  player.hand.push(
    ...unused.splice(unused.length - numberOfCards, numberOfCards)
  );
};

const checkReadyToReveal = (io, game) => {
  const players = Object.values(game.players).filter(
    player => game.master[0].id !== player.id
  );
  const isEverybodyReady = !players.some(player => !player.choice.length);

  if (!isEverybodyReady) {
    return;
  }

  game.currentChoices = {
    hidden: shuffle(players.map(player => player.choice)),
    revealed: [],
  };

  io.emit('answers', new Array(players.length).fill({}));
};

const getPlayersWithStatus = game =>
  Object.values(game.players).map(player => {
    const status = player.choice.length ? 'ready' : 'choosing';

    return {
      name: player.name,
      score: player.score,
      status: game.master[0].id === player.id ? 'master' : status,
    };
  });

export const onChangeDevice = (io, socket, game) => {
  game.players[socket.id].deviceCode = new Date()
    .getTime()
    .toString()
    .slice(-4);
  socket.emit('deviceCode', game.players[socket.id].deviceCode);
};

export const onPlayerName = (io, socket, game, payload) => {
  const prevPlayer = Object.values(game.players).find(
    player => player.name === payload.userName
  );

  if (prevPlayer) {
    console.log(
      'TEST FOR PROD',
      socket.handshake.address,
      prevPlayer.socket.handshake.address
    );

    const isFromSameAddress =
      socket.handshake.address === prevPlayer.socket.handshake.address;
    const deviceCodeMatch = payload.deviceCode === prevPlayer.deviceCode;

    if ((prevPlayer.deviceCode || payload.deviceCode) && !deviceCodeMatch) {
      socket.emit(
        'error',
        `Device code not valid for player ${payload.userName}`
      );
      return;
    }

    if (!isFromSameAddress && !deviceCodeMatch) {
      socket.emit('error', 'Player name already exists');
      return;
    }

    prevPlayer.deviceCode = null;

    delete game.players[prevPlayer.socket.id];

    prevPlayer.socket = socket;
    prevPlayer.id = socket.id;

    game.players[socket.id] = prevPlayer;

    socket.emit(
      'hand',
      prevPlayer.hand.map(card => ({
        id: card.id,
        text: card.text,
        version: card.version,
      }))
    );

    socket.emit('players', getPlayersWithStatus(game));

    if (game.master[0] === prevPlayer) {
      socket.emit('master', true);
    }

    socket.emit('enterGame');

    return;
  }

  const player = {
    id: socket.id,
    socket,
    choice: [],
    deviceCode: null,
    score: 0,
    gameId: 1,
    name: payload.userName,
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

  socket.emit('enterGame');
};

export const onKickPlayer = (io, socket, game, playerName) => {
  if (!playerName) {
    return;
  }

  const player = Object.values(game.players).find(
    player => player.name === playerName
  );

  if (!player) {
    return;
  }

  player.socket.emit('kicked');

  game.decks.answers.unused.push(...player.hand);
  game.decks.answers.unused.push(...player.choice);

  if (game.master[0].id === player.id) {
    game.master.push(game.master.shift());

    game.master[0].socket.emit('master', true);

    if (game.currentChoices) {
      let choiceIndex = game.currentChoices.hidden.findIndex(
        hiddenChoice => hiddenChoice[0].id === game.master[0].choice[0].id
      );

      if (choiceIndex > -1) {
        game.currentChoices.hidden.splice(choiceIndex, 1);
      } else {
        choiceIndex = game.currentChoices.revealed.findIndex(
          revealedChoice => revealedChoice[0].id === game.master[0].choice[0].id
        );

        if (choiceIndex > -1) {
          game.currentChoices.revealed.splice(choiceIndex, 1);
        }
      }

      io.emit('answers', [
        ...game.currentChoices.revealed.map(choice =>
          choice.map(card => ({
            id: card.id,
            text: card.text,
            version: card.version,
          }))
        ),
        ...game.currentChoices.hidden.map(choice => []),
      ]);
    }

    game.master[0].hand.push(...game.master[0].choice);
    game.master[0].choice = [];
  }

  const masterIndex = game.master.findIndex(master => master.id === player.id);
  game.master.splice(masterIndex, 1);

  delete game.players[player.id];

  io.emit('players', getPlayersWithStatus(game));
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

    player.choice.push(...choosenCard);
  });

  io.emit('players', getPlayersWithStatus(game));

  socket.emit('cardsLocked', true);

  checkReadyToReveal(io, game);
};

export const onRevealAnswer = (io, socket, game) => {
  if (socket.id !== game.master[0].id) {
    return;
  }

  if (!game.currentChoices.hidden.length) {
    return;
  }

  game.currentChoices.revealed.push(game.currentChoices.hidden.pop());

  if (!game.currentChoices.hidden.find(choice => !choice.revealed)) {
    game.master[0].socket.emit('pickAnswer');
  }

  io.emit('answers', [
    ...game.currentChoices.revealed.map(choice =>
      choice.map(card => ({
        id: card.id,
        text: card.text,
        version: card.version,
      }))
    ),
    ...game.currentChoices.hidden.map(choice => []),
  ]);
};

export const onPickAnswer = (io, socket, game, cardId) => {
  if (socket.id !== game.master[0].id) {
    return;
  }

  Object.values(game.players).forEach(player => {
    if (player.choice.find(card => card.id === cardId)) {
      player.score++;
    }

    game.decks.answers.used.push(...player.choice);
    player.choice = [];

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

  game.currentChoices = null;

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
      games[id].decks.answers.unused.push(...player.choice);
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
