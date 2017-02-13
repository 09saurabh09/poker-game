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
let eventConfig = require("../game/eventConfig");

// Namespace for authorized events
let gameAuthorizedIO = io.of('/poker-game-authorized');

gameAuthorizedIO.use(function (socket, next) {
    // make sure the handshake data looks good as before
    // if error do this:
    // next(new Error('not authorized');
    // else just call next
    jwt.verify(socket.handshake.query.token, GlobalConstant.tokenSecret, function (err, user) {
        if (err) {
            console.log(`ERROR ::: Unable to authorize socket, error: ${err.message}, stack: ${err.stack}`);
            return next(new Error('not authorized'));
        } else {
            socket.user = user;
            return next();
        }
    });
});

gameAuthorizedIO.on('connection', function (socket) {
    console.log("Player connected to authorized channel");
    socketController.playerConnected(socket.user);

    // Socket event for player turn
    socket.on('player-turn', function (params) {
        params = JSON.parse(params);
        socketController.playerTurn(params, socket);
    });

    socket.on('table-join', function (params) {
        params = JSON.parse(params);
        socketController.joinTable(params, socket);
    });

    socket.on('table-add-to-waiting', function (params) {
        params = JSON.parse(params);
        socketController.addToWaiting(params, socket);
    });

    socket.on('table-leave', function (params) {
        params = JSON.parse(params);
        socketController.leaveTable(params, socket);
    });

    socket.on('chat-message', function (params) {
        params = JSON.parse(params);
        let tableUniqueId = params.tableUniqueId;
        let message = {
            sender: socket.user.name,
            message: params.message,
        }
        socket.broadcast.in(GlobalConstant.chatRoomPrefix + tableUniqueId).emit(eventConfig.chatMessage, commonGameState);
        // SOCKET_IO.of("/poker-game-authorized").in(GlobalConstant.chatRoomPrefix + tableUniqueId).emit(eventConfig.chatMessage, commonGameState);
        SOCKET_IO.of("/poker-game-unauthorized").in(GlobalConstant.chatRoomPrefix + tableUniqueId).emit(eventConfig.chatMessage, commonGameState);

        // Not required, just for testing
        // socketController.testQ(params, socket);
    });

    socket.on('disconnect', function (socket) {
        console.log(`INFO ::: Player disconnected with id: ${socket.id}`);
        socketController.playerDisconnected(socket.user);
    });
});


// *******************************************************************************************************************************

// Namespace for unauthorized events
let gameUnauthorizedIO = io.of('/poker-game-unauthorized');

gameUnauthorizedIO.on('connection', function (socket) {
    console.log('User connected for Unauthorized channel');

    socket.on('game-subscribe-chat', function (params) {
        params = JSON.parse(params);
        let tableUniqueId = params.tableUniqueId;
        socket.join(GlobalConstant.chatRoomPrefix + tableUniqueId);
    });

    socket.on('game-subscribe-gameState', function (params) {
        params = JSON.parse(params);
        let tableUniqueId = params.tableUniqueId;
        socket.join(GlobalConstant.gameRoomPrefix + tableUniqueId);
    });
});

module.exports = io;