"use strict";

let moment = require('moment');
let momentTimer = require('../utils/momentTimer');
let pokerTableConfig = require('../game/pokerTableConfig');

let GameHistoryModel = DB_MODELS.GameHistory;

module.exports = {
    playerTurnTimer: function (gameService, game) {
        let user = game.getCurrentPlayer();
        // let pos = game.findPlayerPos(user.id);
        let playerTimeBank = user.timeBank;

        console.log(`INFO ::: Adding player turn timer for user ${user.id}`);
        GlobalConstant.playerTurnTimers[game.tableId] = momentTimer.timer(moment.duration(game.timerDuration + playerTimeBank, "seconds"), function () {
            console.log(`INFO ::: Started player turn timer for player ${user.id}`);
            let turnType = "timer";
            gameService.playerTurn({ user, game, turnType })
        });
        console.log(`Timer added for player ${user.id}`);
    },

    playerJoinTimer: function (table, user, Game) {
        console.log(`INFO ::: Adding table join timer for user ${user.id}`);
        GlobalConstant.tableJoinTimers[table.id] = GlobalConstant.tableJoinTimers[table.id] || {};
        GlobalConstant.tableJoinTimers[table.id][user.id] = momentTimer.timer(moment.duration(table.timeBank.frequency, "hours"), { loop: true }, function () {
            console.log(`INFO ::: Started table join timer for player ${user.id}`);
            table.reload().then(function (tableReloaded) {
                let game = tableReloaded.gameState;
                game.players.forEach(function(player) {
                    if(player.id == user.id) {
                        player.timeBank += table.timeBank.timeGiven;
                    }
                })
                return DB_MODELS.sequelize.transaction(function (t) {
                    let newGameState = game.getRawObject();
                    return GameHistoryModel.create({
                        gameState: newGameState,
                        pokerTableId: table.id,
                        GameId: newGameState.currentGameId
                    }, { transaction: t })
                }).then(function () {
                    console.log(`SUCCESS ::: Time bank for player ${user.id}, has been updated on table ${table.id}`);
                })
            }).catch(function (err) {
                console.log(`ERROR ::: Error in updating time bank for player ${user.id}, has been updated on table ${table.id}, error: ${err.message}, stack: ${err.stack}`);
            })


        });
        console.log(`Timer added for player ${user.id}`);
    }
}