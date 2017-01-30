/**
 * Created by saurabhk on 28/12/16.
 */
"use strict";
var io = require('socket.io')();
var socketioJwt = require('socketio-jwt');

let socketController = require("./socketController");

io.use('authorization', socketioJwt.authorize({
  secret: GlobalConstant.tokenSecret,
  handshake: true
}));

io.on('connection', function (socket) {
    console.log("Client connected");
    console.log(socket.handshake.decoded_token.email, 'connected');
    // Socket event for player turn
    socket.on('turn', function (data) {
        socketController.playerTurn(data);
    });

    socket.on('disconnect', function () {

        var i = allClients.indexOf(socket);
        allClients.splice(i, 1);
    });
});

module.exports = io;