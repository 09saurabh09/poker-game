/**
 * Created by saurabhk on 28/12/16.
 */

/**
 * Naming of socket events: 
 * To avoid event name clash we will follow naming convention similar to REST routes like
 * entity-action e.g. player-turn, player-add
 */


"use strict";
var io = require('socket.io')();
let jwt = require("jsonwebtoken");

let socketController = require("./socketController");

// Namespace for authorized events
let gameAuthorizedIO = io.of('/poker-game-authorized');

gameAuthorizedIO.use(function (socket, next) {
    // make sure the handshake data looks good as before
    // if error do this:
    // next(new Error('not authorized');
    // else just call next
    jwt.verify(socket.handshake.query.token, GlobalConstant.tokenSecret, function (err, user) {
        if (err) {
            console.log(`ERROR ::: Unable to authorize socket, error: ${err.message}`);
            return next(new Error('not authorized'));
        } else {
            socket.user = user;
            return next();
        }
    });
});

gameAuthorizedIO.on('connection', function (socket) {
    console.log("Player connected to game");
    socketController.playerConnected(socket.user);

    // Socket event for player turn
    socket.on('player-turn', function (params) {
        socketController.playerTurn(params, socket);
    });

    socket.on('table-join', function (params) {
        params = JSON.parse(params);
        socketController.joinTable(params, socket);
    });

    socket.on('table-leave', function (params) {
        socketController.leaveTable(params, socket);
    });

    socket.on('chat-message', function (params) {
        // Not required, just for testing
        socketController.testQ(params, socket);
    });

    socket.on('disconnect', function (socket) {
        console.log(`INFO ::: Player disconnected with id: ${socket.user.id}`);
    });
});


// *******************************************************************************************************************************

// Namespace for unauthorized events
let gameUnauthorizedIO = io.of('/poker-game-unauthorized');

gameUnauthorizedIO.on('connection', function (socket) {
    console.log('User connected for game chat');

    socket.on('game-subscribe-chat', function (params) {
        let tableUniqueId = params.tableUniqueId;
        socket.join(GlobalConstant.chatRoomPrefix + tableUniqueId);
    });

    socket.on('game-subscribe-gameState', function (params) {
        let tableUniqueId = params.tableUniqueId;
        socket.join(GlobalConstant.gameRoomPrefix + tableUniqueId);
    });
});

module.exports = io;