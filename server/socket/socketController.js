"use strict";

let game = require("../game/game");
let gameService = require("../game/gameService");

let PokerTable = DB_MODELS.PokerTable;

module.exports = {
    playerConnected: function (playerId) {

    },

    playerDisconnected: function (playerId) {

    },

    playerTurn: function (params) {
        let tableId = params.tableId;
        PokerTable.findOne({
            where: {
                id: tableId
            }
        }).then(function (table) {
            return gameService.addMoneyToTable(table).then(function () {

            }).catch(function () {

            });
        }).catch(function (err) {

        })
        // game.playerTurn();
    }
}