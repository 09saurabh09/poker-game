"use strict";

let Game = require("../game/game");
let gameService = require("../game/gameService");

let PokerTable = DB_MODELS.PokerTable;

module.exports = {
    playerConnected: function (playerId) {

    },

    playerDisconnected: function (playerId) {

    },

    playerTurn: function (params, socket) {
        let tableId = params.tableId;
        PokerTable.findOne({
            where: {
                id: tableId
            }
        }).then(function (table) {
            let game = new Game(table.gameState);
            game.playerTurn(params, socket.user)
                .then(function(gameState){
                    let {commonGameState} = gameService.divideGameState(gameState);
                    SOCKET_IO.to(GlobalConstant.gameRoomPrefix + table.uniqueId).emit(commonGameState);
                })
                .catch(function() {

                })
        }).catch(function (err) {

        })
    },

    joinTable: function(params, socket) {
        let tableId = params.tableId;
        PokerTable.findOne({
            where: {
                id: tableId
            }
        }).then(function (table) {
            let game = new Game(table.gameState);
            game.addPlayer(params, socket.user);
        }).catch(function (err) {

        })
    }
}