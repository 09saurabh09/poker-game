"use strict";

module.exports = {
    /**
     * This function will adjust all add money request made during the game
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
                    console.log(`ERROR ::: ${err.message}`);
                    reject(err);
                })
            }

        });
    },

    divideGameState: function (gameState) {
        // Sit with Amar and Vishal to figure it out

        return { commonGameState, IndividualGameStates };
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

    gameOver: function () {
        let pots = [{ "amount": 480, "stakeHolders": [1, 2, 3], "rakeMoney": 24 },
        { "amount": 500, "stakeHolders": [1, 2], "rakeMoney": 50 },
        { "amount": 1000, "stakeHolders": [1, 2, 3, 4], "rakeMoney": 100 }];
        var job = GAME_QUEUE.create('gameOverMoneyTransaction', pots)
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
    }
} 