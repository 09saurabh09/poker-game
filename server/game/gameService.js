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
    }
} 