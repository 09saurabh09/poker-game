"use strict";

let gameModel = DB_MODELS.Game;
let PokerTableModel = DB_MODELS.PokerTable;
let GameHistoryModel = DB_MODELS.GameHistory;
let eventConfig = require("../socket/eventConfig");
let timer = require("../utils/timer");
let pokerTableConfig = require("./pokerTableConfig");
let moment = require('moment');

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
            tableId: gameState.tableId,
            turnPos: gameState.turnPos,
            round: gameState.round,
            minRaise: gameState.minRaise,
            maxRaise: gameState.maxRaise,
            callValue: gameState.callValue,
            gamePots: gameState.gamePots,
            totalPot: gameState.totalPot,
            lastRaise: gameState.lastRaise,
            currentTotalPlayer: gameState.currentTotalPlayer,
            communityCards: gameState.communityCards,
            maxPlayer: gameState.maxPlayer,
            bigBlind: gameState.bigBlind,
            dealerPos: gameState.dealerPos,
            minAmount: gameState.minAmount,
            maxAmount: gameState.maxAmount,
            currentPot: gameState.currentPot,
            players: [],
            lastTurnAt: gameState.lastTurnAt,
            timerDuration: gameState.timerDuration
        };

        gameState.players = gameState.players || Array.apply(null, Array(gameState.maxPlayer));
        gameState.players.forEach(function (player) {
            if (player) {
                let pl = {
                    id: player.id,
                    name: player.name,
                    seat: player.seat,
                    chips: player.chips,
                    bet: player.bet,
                    lastAction: player.lastAction,
                    hasDone: player.hasDone,
                    idleForHand: player.idleForHand,
                    betForRound: player.betForRound,
                    timeBank: player.timeBank,
                    expCallValue: player.expCallValue,
                    hasSitOut: player.hasSitOut
                }
                if ((gameState.round == "showdown") && (player.showCards)) {
                    pl.cards = player.cards;
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
            // DB_MODELS.sequelize.query(updateCurrentBalanceQuery)
            //     .then(function (table) {

            //     })
            //     .catch(function (err) {

            //     })
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
        // var job = GAME_QUEUE.create('gameOverUpdateGame', params)
        //     .attempts(5)
        //     .backoff({ type: 'exponential' })
        //     .removeOnComplete(true)
        //     .save(function (err) {
        //         if (err) {
        //             console.log(`ERROR ::: Unable to enqueue transaction job, error: ${err.message}`);
        //             // Manually add to DB so that can be picked up by cron
        //         } else {
        //             console.log(`SUCCESS ::: Transaction job has been successfully queued with id: ${job.id}`);
        //         }
        //     });
        params.gameState = params.gameState.getRawObject();
        POKER_QUEUE.gameOverUpdateGame.add(params, GlobalConstant.bullQueueDefaultJobOptions)
            .then(function (job) {
                console.log(`SUCCESS ::: gameOverUpdateGame job has been successfully queued with id: ${job.data.id}`);
            })
            .catch(function (err) {
                console.log(`ERROR ::: Unable to enqueue gameOverUpdateGame job, error: ${err.message}`);
            })
    },

    startGame: function (game) {
        let self = this;
        let pokerTable;
        return DB_MODELS.sequelize.transaction(function (t) {
            // chain all your queries here. make sure you return them.
            return PokerTableModel.findOne({ where: { id: game.tableId } }, { transaction: t })
                .then(function (table) {
                    pokerTable = table;
                    return gameModel.create({ pokerTableId: game.tableId }, { transaction: t })
                        .then(function (gameInstance) {
                            let newGameState = _.assign(game.getRawObject(), { currentGameId: gameInstance.id });
                            return GameHistoryModel.create({
                                gameState: newGameState,
                                pokerTableId: pokerTable.id,
                                GameId: newGameState.currentGameId
                            }, { transaction: t })
                            // table.set("gameState", _.assign(game.getRawObject(), { currentGameId: gameInstance.id }));
                            // return table.save({ transaction: t })
                        });
                });
        })
            .then(function (gameHistory) {
                let playerIdToCards = {};
                let players = game.players;
                let playerCards;
                players.forEach(function (player) {
                    if (player) {
                        playerIdToCards[player.id] = player.cards;
                    }

                });

                console.log(`INFO ::: Emitting cards in room ${GlobalConstant.gameRoomPrefix + game.tableId}`);

                // Get current game room
                let room = SOCKET_IO.nsps["/poker-game-authorized"].adapter.rooms[GlobalConstant.gameRoomPrefix + game.tableId];

                // List all socket in game room
                let currentSockets = (room && room.sockets && Object.keys(room.sockets)) || [];
                // let currentSockets = Object.keys(SOCKET_IO.nsps["/poker-game-authorized"].adapter.rooms[GlobalConstant.gameRoomPrefix + game.tableId].sockets);

                currentSockets.forEach(function (currentSocket) {
                    let socket = SOCKET_IO.nsps["/poker-game-authorized"].sockets[currentSocket];
                    playerCards = {
                        tableId: pokerTable.id,
                        cards: playerIdToCards[socket.user.id]
                    }
                    socket.emit(eventConfig.gameStarted, playerCards);
                });

                if (!currentSockets.length) {
                    console.log(`INFO ::: No sockets found in room ${GlobalConstant.gameRoomPrefix + game.tableId}`);
                    return;
                }

                // Emit game state to all players in room
                let commonGameState = self.getCommonGameState(game);

                SOCKET_IO.of("/poker-game-authorized").in(GlobalConstant.gameRoomPrefix + pokerTable.id).emit(eventConfig.turnCompleted, commonGameState);
                SOCKET_IO.of("/poker-game-unauthorized").in(GlobalConstant.gameRoomPrefix + pokerTable.id).emit(eventConfig.turnCompleted, commonGameState);

                // Add timer for next player
                timer.playerTurnTimer(self, game);

                POKER_QUEUE.gameStartCreateUserGames.add(game, GlobalConstant.bullQueueDefaultJobOptions)
                    .then(function (job) {
                        console.log(`SUCCESS ::: gameStartCreateUserGames job has been successfully queued with id: ${job.data.id}`);
                    })
                    .catch(function (err) {
                        console.log(`ERROR ::: Unable to enqueue gameStartCreateUserGames job, error: ${err.message}`);
                    })
            })
            .catch(function (err) {
                console.log(`ERROR ::: Unable to start game, error: ${err.message}, stack: ${err.stack}`);
            })

    },

    roundCompleted: function (game) {
        let self = this;
        let newGameState = game.getRawObject();
        GameHistoryModel.create({
            gameState: newGameState,
            pokerTableId: game.tableId,
            GameId: game.currentGameId
        }).then(function (gameHistory) {
            let commonGameState = self.getCommonGameState(game);

            // Inform others that player has left
            SOCKET_IO.of("/poker-game-authorized").in(GlobalConstant.gameRoomPrefix + game.tableId).emit(eventConfig.roundCompleted, commonGameState);
            SOCKET_IO.of("/poker-game-unauthorized").in(GlobalConstant.gameRoomPrefix + game.tableId).emit(eventConfig.roundCompleted, commonGameState);

        }).catch(function (err) {
            console.log(`ERROR ::: Unable to complete round, error: ${err.message}, stack: ${err.stack}`);
        })
    },

    // params = {
    //     id:17,
    //     chips: 500 
    // }

    leaveGame: function (params) {

    },

    getGameStateForUser: function (gameState, currentUser) {

    },

    isGameStarted: function (gameState) {
        let startGame;
        let parentType = gameState.parentType;
        if ((parentType == "cashGame") && gameState.currentTotalPlayer == 3) {
            startGame = true;
        }
        return startGame;
    },

    playerTurn: function ({params, user, game, turnType}) {
        let self = this;
        if(turnType == "timer") {
            game.playerTurn({callType: "player", call: "doBestCall"}, user);
        } else {
            // Stop timer for player
            let duration = parseInt(GlobalConstant.playerTurnTimers[game.tableId].getDurationPassed()/ 1000);
            let timeBankUsed = (duration - pokerTableConfig.timer.defaultDuration) > 0 ? (duration - pokerTableConfig.timer.defaultDuration): 0;
            GlobalConstant.playerTurnTimers[game.tableId].stop();
            console.log(`INFO ::: Time bank used by player: ${user.id} is: ${timeBankUsed}`);
            game.updateTimeBank(timeBankUsed);
            // delete GlobalConstant.playerTurnTimers[game.tableId];

            game.playerTurn(params, user);
            game.lastTurnAt = moment();
        }
        
        let newGameState = game.getRawObject();
        return DB_MODELS.sequelize.transaction(function (t) {
            return GameHistoryModel.create({
                gameState: newGameState,
                pokerTableId: game.tableId,
                GameId: newGameState.currentGameId
            }, { transaction: t }).then(function (gameHistory) {
                console.log(`SUCCESS Game history created for game: ${newGameState.currentGameId} on ${user.id} turn`);
                let commonGameState = self.getCommonGameState(game);

                SOCKET_IO.of("/poker-game-authorized").in(GlobalConstant.gameRoomPrefix + game.tableId).emit(eventConfig.turnCompleted, commonGameState);
                SOCKET_IO.of("/poker-game-unauthorized").in(GlobalConstant.gameRoomPrefix + game.tableId).emit(eventConfig.turnCompleted, commonGameState);

                // Add timer for next turn
                timer.playerTurnTimer(self, game);
            }).catch(function (err) {
                console.log(`ERROR ::: Unable to make player turn for user: ${user.id}, error: ${err.message}, stack: ${err.stack}`);
            });
        })
    }
}