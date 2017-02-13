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
        let params = {
            call: "playerConnected",
            callType: "game"
        }

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
                        game.playerTurn(params, currentUser);
                        pokerTable.set("gameState", game.getRawObject());
                        pokerTable.save()
                            .then(function(table) {
                                console.log(`SUCCESS ::: Player with id ${currentUser.id}, restored on table id: ${pokerTable.id}`);
                            })
                            .catch(function(err) {
                                console.log(`ERROR ::: Player with id ${currentUser.id}, can't be restored on table id: ${pokerTable.id}, error: ${err.message}, stack: ${err.stack}`);
                            })
                    });
                    return null;
                })
        }).catch(function (err) {
            console.log(`ERROR ::: Unable to proceed with post connection events for user: ${currentUser.id}, error: ${err.message}, stack: ${err.stack}`)
        })
    },

    playerDisconnected: function (currentUser) {
        let params = {
            call: "playerDisconnected",
            callType: "game"
        }
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
                        game.playerTurn(params, currentUser);
                        pokerTable.set("gameState", game.getRawObject());
                        pokerTable.save()
                            .then(function(table) {
                                console.log(`SUCCESS ::: Player with id ${currentUser.id}, disconnected on table id: ${pokerTable.id}`);
                            })
                            .catch(function(err) {
                                console.log(`ERROR ::: Player with id ${currentUser.id}, can't be restored on table id: ${pokerTable.id}, error: ${err.message}, stack: ${err.stack}`);
                            })
                    })
                })
        }).catch(function (err) {
            console.log(`ERROR ::: post player disconnection failure for player: ${playerId}, error: ${err.message}, stack: ${err.stack}`);
        })
    },

    playerTurn: function (params, socket) {
        let tableId = params.tableId;
        params.callType = "player";
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
                table.save();
                let commonGameState = gameService.getCommonGameState(gameState);

                SOCKET_IO.of("/poker-game-authorized").in(GlobalConstant.gameRoomPrefix + table.uniqueId).emit(eventConfig.turnCompleted, commonGameState);
                SOCKET_IO.of("/poker-game-unauthorized").in(GlobalConstant.gameRoomPrefix + table.uniqueId).emit(eventConfig.turnCompleted, commonGameState);
            } else {
                console.log(`ERROR ::: Validation failed, not a turn for player id ${socket.user.id} for table: ${tableId}`)
            }

        }).catch(function (err) {
            console.log(`ERROR ::: Unable to make turn for player id ${socket.user.id}, and table: ${tableId}, error: ${err.message}, stack: ${err.stack}`)
        })
    },

    joinTable: function (params, socket) {
        params.callType = "game";
        params.call = "addPlayer";

        let tableId = params.tableId;
        let game, table;

        let pokerTablePromise = PokerTable.findOne({
            where: {
                id: tableId
            }
        });

        let userPomise = UserModel.findOne({
            where: {
                id: socket.user.id
            }
        })

        PROMISE.props({
            user: userPomise,
            table: pokerTablePromise
        }).then(function (result) {
            table = result.table;
            let user = result.user;

            return DB_MODELS.sequelize.transaction(function (t) {
                game = new Game(table.gameState);
                game.playerTurn(params, socket.user);
                table.set("gameState", game.getRawObject());

                // chain all your queries here. make sure you return them.
                return table.save({ transaction: t })
                    .then(function (table) {
                        return user.decrement('currentBalance', { by: params.playerInfo.chips || 0 }, { transaction: t })
                            .then(function () {
                                return user.addPokerTables(table, { transaction: t });
                            })
                    });

            }).then(function (result) {
                let commonGameState = gameService.getCommonGameState(game);
                // let comSocket = SOCKET_IO.of(socket.nsp.name).connected[`${socket.nsp.name}#${socket.client.id}`];
                // let comSocket = SOCKET_IO.sockets.connected[`${socket.client.id}`];
                // comSocket.join(room.name);
                // console.log(socket.nsp.name);
                // console.log(SOCKET_IO.of(socket.nsp.name).connected);
                // console.log(comSocket.nsp);
                // console.log(SOCKET_IO.sockets.adapter.rooms);
                // console.log(SOCKET_IO.of(socket.nsp.name).adapter.rooms);

                socket.join(GlobalConstant.gameRoomPrefix + table.uniqueId);
                socket.join(GlobalConstant.chatRoomPrefix + table.uniqueId);
                SOCKET_IO.of("/poker-game-authorized").in(GlobalConstant.gameRoomPrefix + table.uniqueId).emit(eventConfig.playerJoined, commonGameState);
                SOCKET_IO.of("/poker-game-unauthorized").in(GlobalConstant.gameRoomPrefix + table.uniqueId).emit(eventConfig.playerJoined, commonGameState);
                return null;
            })

        }).catch(function (err) {
            console.log(`ERROR ::: Unable to join table with id ${tableId}, error: ${err.message}, stack: ${err.stack}`);
        })

    },

    leaveTable: function (params, socket) {
        params.call = "leaveGame";
        params.callType = "game";
        let game;
        let tableId = params.tableId;
        return DB_MODELS.sequelize.transaction(function (t) {
            // chain all your queries here. make sure you return them.
            return PokerTable.findOne({
                where: {
                    id: tableId
                }
            }, { transaction: t }).then(function (table) {
                game = new Game(table.gameState);
                game.playerTurn(params, socket.user);
                table.set("gameState", game.getRawObject());
                return table.save({ transaction: t })
                    .then(function (table) {
                        return user.decrement('currentBalance', { by: params.playerInfo.chips || 0 }, { transaction: t })
                            .then(function () {
                                return UserPokerTable.destroy({
                                    where: {
                                        PokerTableId: table.id,
                                        UserId: user.id
                                    }
                                }, { transaction: t });
                            })
                    });
            })


        }).then(function (result) {
            socket.leave(GlobalConstant.gameRoomPrefix + table.uniqueId);
            socket.leave(GlobalConstant.chatRoomPrefix + table.uniqueId);
            let commonGameState = gameService.getCommonGameState(game);

            // Inform others that player has left
            SOCKET_IO.of("/poker-game-authorized").in(GlobalConstant.gameRoomPrefix + table.uniqueId).emit(eventConfig.turnCompleted, commonGameState);
            SOCKET_IO.of("/poker-game-unauthorized").in(GlobalConstant.gameRoomPrefix + table.uniqueId).emit(eventConfig.turnCompleted, commonGameState);

        }).catch(function (err) {
            console.log(`ERROR ::: Unable to leave table with id ${tableId}, error: ${err.message}, stack: ${err.stack}`);
        })
    },

    testQ: function () {
        gameService.gameOver();
    },

    addToWaiting: function (params, socket) {
        params.callType = "game";
        params.call = "addToWaiting";

        let tableId = params.tableId;
        return DB_MODELS.sequelize.transaction(function (t) {
            // chain all your queries here. make sure you return them.
            return PokerTable.findOne({
                where: {
                    id: tableId
                }
            }, { transaction: t }).then(function (table) {
                game = new Game(table.gameState);
                game.playerTurn(params, socket.user);
                table.set("gameState", game.getRawObject());
                return table.save({ transaction: t })
            })
        }).then(function (result) {
            console.log(`SUCCESS ::: Added to waiting list`);
        }).catch(function (err) {
            console.log(`ERROR ::: Unable to leave table with id ${tableId}, error: ${err.message}, stack: ${err.stack}`);
        })
    }
}