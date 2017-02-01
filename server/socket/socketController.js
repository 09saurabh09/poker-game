"use strict";

let Game = require("../game/game");
let gameService = require("../game/gameService");

let PokerTable = DB_MODELS.PokerTable;

module.exports = {
    playerConnected: function (playerId) {

    },

    playerDisconnected: function (playerId) {

    },

    playerTurn: function (params, currentUser) {
        let tableId = params.tableId;
        PokerTable.findOne({
            where: {
                id: tableId
            }
        }).then(function (table) {
            let game = new Game(table.gameState);
            game.playerTurn(params, currentUser);
        }).catch(function (err) {

        })
    }
}