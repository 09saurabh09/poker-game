"use strict";

let cron = require('node-cron');
let moment = require('moment');

let PokerTable = DB_MODELS.PokerTable;
let GameHistoryModel = DB_MODELS.GameHistory;
let UserPokerTable = DB_MODELS.UserPokerTable;

console.log("INFO ::: setting up cron for kicking users from table");

cron.schedule('* */2 * * *', function () {
    console.log('INFO ::: Running cron kicking users in idle table');
    let Game = require("../game/game");
    PokerTable.findAll({
        where: {
            state: "idle"
        },
        raw: true
    }).then(function (tables) {
        tables.forEach(function (table) {
            table.gameState.players.forEach(function (player) {
                if (player && player.hasSitOut) {
                    let playerSitOutTime = moment(player.sitOutTime);
                    console.log(moment.duration(moment().diff(playerSitOutTime)).asHours());
                    if (moment.duration(moment().diff(playerSitOutTime)).asHours() > 2) {
                        let game = new Game(table.gameState);
                        game.reloadAllPlayers();
                        game.removeFromGame(game.findPlayerPos(player.id));

                        return DB_MODELS.sequelize.transaction(function (t) {
                            return GameHistoryModel.create({
                                gameState: game.getRawObject(),
                                pokerTableId: table.id,
                                GameId: game.currentGameId
                            }, { transaction: t }).then(function (gameHistory) {
                                return UserPokerTable.destroy({
                                    where: {
                                        PokerTableId: table.id,
                                        UserId: player.id
                                    }
                                }, { transaction: t });
                            });
                        }).then(function () {
                            console.log(`SUCCESS ::: Player ${player.id} has been kicked from table ${table.id}`);
                        })

                    }
                }
            })
        })
    }).catch(function (err) {
        console.log(`ERROR ::: Error in kicking players from tables, error: ${err.message}, stack: ${err.stack}`);
    })
});