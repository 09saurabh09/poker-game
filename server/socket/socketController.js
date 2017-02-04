"use strict";

let Game = require("../game/game");
let gameService = require("../game/gameService");
let userService = require("../user/userService");
let eventConfig = require("../game/eventConfig");

let PokerTable = DB_MODELS.PokerTable;
let UserModel = DB_MODELS.User;
let UserPokerTable = DB_MODELS.UserPokerTable;

module.exports = {
    playerConnected: function (currentUser) {
        UserModel.find({
            where: {
                id: currentUser.id
            }
        }).then(function (user) {
            return user.getPokerTables()
                .then(function (pokerTables) {
                    pokerTables.forEach(function (pokerTable) {
                        // console.log(pokerTable.id);
                        let game = new Game(pokerTable.gameState);
                        // game.playerConnected();
                    })
                })
        }).catch(function (err) {
            console.log(`ERROR ::: Unable to proceed with post connection events for user: ${currentUser.id}, error: ${err.message}`)
        })
    },

    playerDisconnected: function (playerId) {
        UserModel.find({
            where: {
                id: currentUser.id
            }
        }).then(function (user) {
            return user.getPokerTables()
                .then(function (pokerTables) {
                    pokerTables.forEach(function (pokerTable) {
                        // console.log(pokerTable.id);
                        let game = new Game(pokerTable.gameState);
                        // game.playerDisconnected();
                    })
                })
        }).catch(function (err) {
            console.log(`ERROR ::: post player disconnection failure for player: ${playerId}, error: ${err.message}`);
        })
    },

    playerTurn: function (params, socket) {
        let tableId = params.tableId;
        PokerTable.findOne({
            where: {
                id: tableId
            }
        }).then(function (table) {
            let currentGameState = table.gameState;
            if (currentGameState.players[currentGameState.turnPos].id == socket.user.id) {
                let game = new Game(table.gameState);
                params.tableInstance = table;
                game.playerTurn(params, socket.user);
                let commonGameState = gameService.getCommonGameState(gameState);
                SOCKET_IO.to(GlobalConstant.gameRoomPrefix + table.uniqueId).emit(eventConfig.turnCompleted, commonGameState);
            } else {
              console.log(`ERROR ::: Validation failed, not a turn for player id ${socket.user.id} for table: ${tableId}`)  
            }

        }).catch(function (err) {
            console.log(`ERROR ::: Unable to make turn for player id ${socket.user.id}, and table: ${tableId}, error: ${err.message}`)
        })
    },

    joinTable: function (params, socket) {
        let tableId = params.tableId;
        params.callType = "game";
        params.call = "addPlayer";
        socket.join(GlobalConstant.gameRoomPrefix + params.tableUniqueId);
        socket.join(GlobalConstant.chatRoomPrefix + params.tableUniqueId);

        PokerTable.findOne({
            where: {
                id: tableId
            }
        }).then(function (table) {
            let game = new Game(table.gameState);
            game.playerTurn(params, socket.user);
            userService.addTableToUser(socket.user, table);
            table.set("gameState", game.getRawObject());
            table.save()
                .then(function(table) {
                    console.log("Game state updated for table: ${table.id}");    
                })
            let commonGameState = gameService.getCommonGameState(game);
            console.log("event name", eventConfig.playerJoined);
            // SOCKET_IO.sockets.in(GlobalConstant.gameRoomPrefix + table.uniqueId).emit(eventConfig.playerJoined, commonGameState);
            return null;

        }).catch(function (err) {
            console.log(`ERROR ::: Unable to join table with id ${tableId}, error: ${err.message}`)
        })
    },

    leaveTable: function (params, socket) {
        let tableId = params.tableId;
        socket.leave(GlobalConstant.gameRoomPrefix + params.tableUniqueId);
        socket.leave(GlobalConstant.chatRoomPrefix + params.tableUniqueId);

        PokerTable.findOne({
            where: {
                id: tableId
            }
        }).then(function (table) {
            let game = new Game(table.gameState);
            // game.playerTurn({callType: "leaveGame"}, socket.user)
            userService.removeTableFromUser(socket.user, table);
            return null

        }).catch(function (err) {
            console.log(`ERROR ::: Unable to leave table with id ${tableId}, error: ${err.message}`)
        })
    },

    testQ: function () {
        gameService.gameOver();
    }
}