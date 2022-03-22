import fs from 'fs';
import { Server } from 'socket.io';

const GAMES = {};

const io = new Server(3000);

io.on('connection', socket => {
  socket.emit('message', 'Hellow');

  socket.on('test', arg => {
    console.log('THIS IS A TEST');
  });
});

//Saves Games each 5 minutes
setInterval(function() {
  if (!Object.keys(GAMES).length) {
    return;
  }

  fs.writeFile('games.json', JSON.stringify(GAMES), err => {
    if (err) {return console.error(err)};
    console.info('Games saved.');
  });
}, 60000);