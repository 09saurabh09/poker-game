"use strict";

let moment = require('moment');
let momentTimer = require('../utils/momentTimer');
let pokerTableConfig = require('../game/pokerTableConfig');

let GameHistoryModel = DB_MODELS.GameHistory;

module.exports = {
    playerTurnTimer: function (game) {
        let user = game.getCurrentPlayer();
        let playerTimeBank = user.timeBank;

        let delay = (game.actionTime + playerTimeBank) * 1000;
        console.log(`INFO ::: Adding player turn timer for user ${user.id} with delay of ${delay}`);

        let jobId = GlobalConstant.playerTurnTimerPrefix + game.tableId;

        POKER_QUEUE.playerTurnTimer.getJob(jobId).then(function (job) {
            return new PROMISE(function (resolve) {
                if (job) {
                    job.remove().then(function () {
                        console.log(`INFO ::: successfully removed job with id: ${job.jobId}`);
                        resolve();
                    })
                } else {
                    resolve();
                }
            }).then(function () {
                let opts = { delay, removeOnComplete: true, jobId };
                POKER_QUEUE.playerTurnTimer.add({ game: game.getRawObject() }, opts)
                    .then(function (job) {
                        console.log(`SUCCESS ::: playerTurnTimer job has been successfully queued with id: ${job.jobId}`);
                    })
                    .catch(function (err) {
                        console.log(`ERROR ::: Unable to enqueue playerTurnTimer job, error: ${err.message}`);
                    })
            })
        })
    },

    playerJoinTimer: function (table, user, Game) {
        console.log(`INFO ::: Adding table join timer for user ${user.id}`);
        GlobalConstant.tableJoinTimers[table.id] = GlobalConstant.tableJoinTimers[table.id] || {};
        GlobalConstant.tableJoinTimers[table.id][user.id] = momentTimer.timer(moment.duration(table.timeBank.frequency, "hours"), { loop: true }, function () {
            console.log(`INFO ::: Started table join timer for player ${user.id}`);
            table.reload().then(function (tableReloaded) {
                let game = tableReloaded.gameState;
                game.players.forEach(function (player) {
                    if (player && (player.id == user.id)) {
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
    },

    disconnectTimer: function ({ gameService, game, currentUser }) {
        if (gameService.isPlayerTurn(game, currentUser)) {
            // Remove existing player turn job
            let jobId = GlobalConstant.playerTurnTimerPrefix + game.tableId;
            if (game.getCurrentPlayer().disconnectionCount < 3) {
                POKER_QUEUE.playerTurnTimer.removeJob(jobId).then(function () {
                    let delay = 120 * 1000;
                    // let newJobId = GlobalConstant.disconnectionTimerPrefix + game.tableId;
                    let opts = { delay, removeOnComplete: true, jobId};
                    return POKER_QUEUE.playerTurnTimer.add({ game: game.getRawObject() }, opts)
                        .then(function (job) {
                            console.log(`SUCCESS ::: playerTurnTimer job while disconnect has been successfully queued with id: ${job.jobId}`);
                        })
                }).catch(function (err) {
                    console.log(`ERROR ::: error in adding disconnectTimer err: ${err.message}, stack: ${err.stack}`);
                })
            }

        }
    },

    connectTimer: function ({gameService, game, currentUser}) {
        let self = this;
        if (gameService.isPlayerTurn(game, currentUser)) {
            // Remove existing player turn job
            let jobId = GlobalConstant.playerTurnTimerPrefix + game.tableId;
            POKER_QUEUE.playerTurnTimer.removeJob(jobId).then(function () {
                self.playerTurnTimer(game);
            }).catch(function (err) {
                console.log(`ERROR ::: error in adding connectTimer err: ${err.message}, stack: ${err.stack}`);
            });
        }
    }
}