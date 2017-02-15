"use strict";

let gameModel = DB_MODELS.Game;
let PokerTableModel = DB_MODELS.PokerTableModel;
let eventConfig = require("../game/eventConfig");

module.exports = {
    /**
     * function will adjust all add money request made during the game, will be executed after every round
     * @param {Object} poker table instance
     */

    addMoneyToTable: function (table) {
        let updateCurrentBalanceQuery = '';
        let syncRequired = false;
        return new PROMISE(function (resolve, reject) {
            let currentGameState = table.gameState;
            let moneyRequest = table.moneyRequest;
            let players = currentGameState.players;

            players.forEach(function (player) {
                if (moneyRequest[player.id]) {
                    syncRequired = true;
                    player.gameBalance += moneyRequest[player.id] || 0;
                    updateCurrentBalanceQuery += `UPDATE "Users" SET "currentBalance" = "currentBalance" - ${moneyRequest[player.id] || 0} WHERE id = ${player.id};`
                }
            });

            if (syncRequired) {
                table.set("gameState", currentGameState);
                table.set("moneyRequest", {});
                return DB_MODELS.sequelize.transaction(function (t) {
                    return table.save({ transaction: t }).then(function (newTable) {
                        return DB_MODELS.sequelize.query(updateCurrentBalanceQuery, { transaction: t })
                    })
                }).then(function (result) {
                    resolve(result);
                }).catch(function (err) {
                    console.log(`ERROR ::: ${err.message}, stack: ${err.stack}`);
                    reject(err);
                })
            }

        });
    },

    getCommonGameState: function (gameState) {
        let commonGameState = {
            turnPos: gameState.turnPos,
            minRaise: gameState.minRaise,
            maxRaise: gameState.maxRaise,
            callValue: gameState.callValue,
            gamePots: gameState.gamePots,
            lastRaise: gameState.lastRaise,
            currentTotalPlayer: gameState.currentTotalPlayer,
            communityCards: gameState.communityCards,
            maxPlayer: gameState.maxPlayer,
            bigBlind: gameState.bigBlind,
            dealerPos: gameState.dealerPos,
            players: []
        };
        
        gameState.players = gameState.players || [];
        gameState.players.forEach(function (player) {
            if (player) {
                let pl = {
                    chips: player.chips,
                    bet: player.bet,
                    lastAction: player.lastAction,
                    hasDone: player.hasDone,
                    idleForHand: player.idleForHand
                }
                commonGameState.players.push(pl);
            } else {
                commonGameState.players.push(null);
            }

        });
        return commonGameState;
    },

    updateGameState: function (tableInstance, newGameState, turnCheck) {
        let gameStateQuery = `UPDATE "PokerTables" SET "gameState"= ${newGameState}`;
        new PROMISE(function (resolve, reject) {
            if (turnCheck) {
                tableInstance.reload().then(function () {
                    // Do turn validation
                    resolve();
                });
            } else {
                resolve();
            }

        }).then(function () {
            DB_MODELS.sequelize.query(updateCurrentBalanceQuery)
                .then(function (table) {

                })
                .catch(function (err) {

                })
        }).catch(function () {

        })

    },
    /*
        { 
            earnings : [{
                id: 1,
                amount: 10
            }, {
                id: 17,
                amount: -60
            }],
            rakeEarning: 10,
            gameState:  this(raw object)
        }

    */

    gameOver: function (params) {
        // let pots = [{ "amount": 480, "stakeHolders": [1, 2, 3], "rakeMoney": 24 },
        // { "amount": 500, "stakeHolders": [1, 2], "rakeMoney": 50 },
        // { "amount": 1000, "stakeHolders": [1, 2, 3, 4], "rakeMoney": 100 }];
        var job = GAME_QUEUE.create('gameOverUpdateGame', params)
            .attempts(5)
            .backoff({ type: 'exponential' })
            .save(function (err) {
                if (err) {
                    console.log(`ERROR ::: Unable to enqueue transaction job`);
                    // Manually add to DB so that can be picked up by cron
                } else {
                    console.log(`SUCCESS ::: Transaction job has been successfully queued with id: ${job.id}`);
                }
            });
    },

    startGame: function (game) {
        return DB_MODELS.sequelize.transaction(function (t) {

            // chain all your queries here. make sure you return them.
            return PokerTableModel.findOne({ where: { id: game.tableId } }, { transaction: t })
                .then(function (table) {
                    return gameModel.create({ pokerTableId: game.tableId }, { transaction: t })
                        .then(function (gameInstance) {
                            table.set("gameState", _.assign(game.getRawObject(), { currentGameId: gameInstance.id }));
                            return table.save({ transaction: t })
                        });
                });
        })
            .then(function (result) {
                // Testing Required
                SOCKET_IO.of("/poker-game-authorized").in(GlobalConstant.gameRoomPrefix + table.uniqueId).emit(eventConfig.gameStarted, commonGameState);
                SOCKET_IO.of("/poker-game-unauthorized").in(GlobalConstant.gameRoomPrefix + table.uniqueId).emit(eventConfig.gameStarted, commonGameState);

            })
            .catch(function (err) {

            })

    },

    // params = {
    //     id:17,
    //     chips: 500 
    // }

    leaveGame: function (params) {

    },

    getGameStateForUser: function (gameState, currentUser) {

    }
} 