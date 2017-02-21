"use strict";

let gameModel = DB_MODELS.Game;
let PokerTableModel = DB_MODELS.PokerTable;
let GameHistoryModel = DB_MODELS.GameHistory;
let eventConfig = require("../socket/eventConfig");

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
            players: []
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
                    betForRound: player.betForRound
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
            .removeOnComplete( true )
            .save(function (err) {
                if (err) {
                    console.log(`ERROR ::: Unable to enqueue transaction job, error: ${err.message}`);
                    // Manually add to DB so that can be picked up by cron
                } else {
                    console.log(`SUCCESS ::: Transaction job has been successfully queued with id: ${job.id}`);
                }
            });
    },

    startGame: function (game) {
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

                let room = SOCKET_IO.nsps["/poker-game-authorized"].adapter.rooms[GlobalConstant.gameRoomPrefix + game.tableId];
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
                }
                // // Testing Required
                // SOCKET_IO.of("/poker-game-authorized").in(GlobalConstant.gameRoomPrefix + table.uniqueId).emit(eventConfig.gameStarted, commonGameState);
                // SOCKET_IO.of("/poker-game-unauthorized").in(GlobalConstant.gameRoomPrefix + table.uniqueId).emit(eventConfig.gameStarted, commonGameState);

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
        }).then(function(gameHistory) {
             let commonGameState = self.getCommonGameState(game);

            // Inform others that player has left
            SOCKET_IO.of("/poker-game-authorized").in(GlobalConstant.gameRoomPrefix + game.tableId).emit(eventConfig.roundCompleted, commonGameState);
            SOCKET_IO.of("/poker-game-unauthorized").in(GlobalConstant.gameRoomPrefix + game.tableId).emit(eventConfig.roundCompleted, commonGameState);

        }).catch(function(err) {
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

    }
} 