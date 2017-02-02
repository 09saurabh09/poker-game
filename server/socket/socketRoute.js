/**
 * Created by saurabhk on 28/12/16.
 */
"use strict";
var io = require('socket.io')();
let jwt = require("jsonwebtoken");

let socketController = require("./socketController");

io.use(function (socket, next) {
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
io.on('connection', function (socket) {
    console.log("Client connected");
    
    // Socket event for player turn
    socket.on('turn', function (params) {
        socketController.playerTurn(params, socket);
    });

    socket.on('joinTable', function(params) {
        socket.join(params.tableUniqueId);
        socketController.joinTable(params, socket);
    })

    socket.on('disconnect', function () {

        var i = allClients.indexOf(socket);
        allClients.splice(i, 1);
    });
});

module.exports = io;