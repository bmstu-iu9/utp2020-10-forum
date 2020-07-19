'use strict'
const express = require('express'),
   app = express(),
   http = require('http').createServer(app),
   io = require('socket.io')(http);
let players = {};

class Player{
   constructor(role, name){
      this.name = name;
      this.role = role;
   }
}
function findName(name) {
   for(let key in players)
      if (players[key].name === name)
         return 1;
   return 0;
}
io.on('connection', socket => {
   console.log('user connected');
   socket.on('setPlayerName', function (player) {
      if (player.name.length == 0) { //пустое имя недопустимо
         socket.emit('invalidNickname', 'nickname is invalid');
      } else {
         if (findName(player.name) == 0) { //проверяем есть ли игок с таким ником
            players[socket.id] = new Player(player.role, player.name);
            console.log('a new player ' + player.name + ' is ' + player.role);
            socket.emit('PlayTheGame', players);

            let timerId = setInterval(function () { socket.emit('render', players) }, 100);
         } else socket.emit('usersExists', player.name + ' username is taken! Try some other username.');
      }
   });
   socket.on('disconnect', () => {
      if (socket.id in players) {
         console.log("Player " + players[socket.id].name + " disconnect");
         delete players[socket.id];
      } else console.log("Player (no name) disconnect");
   });
});

app.get('/', function (req, res) {
   res.sendfile('index.html');
});
app.use('/css', express.static(`${__dirname}/css`));

http.listen(3000, function () {
   console.log('listening on *:3000');
});