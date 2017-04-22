"use strict";

module.exports = function (sequelize, DataTypes) {
    var GameHistory = sequelize.define("GameHistory", {
        pokerTableId: DataTypes.INTEGER,
        gameState: DataTypes.JSONB,
        GameId: DataTypes.INTEGER,
        status: {
            type: DataTypes.STRING,
            defaultValue: "pending"
        }
    }, {
            classMethods: {
                associate: function (models) {
                    GameHistory.belongsTo(models.Game);
                }
            },
            hooks: {
                afterCreate: function (gameHistory, options) {
                    let PokerTableModel = DB_MODELS.PokerTable;
                    // console.log(`SUCCESS Game history created for table ${gameHistory.pokerTableId} and game: ${gameHistory.GameId},
                    //  now pushing it to queue for updating game state in pokerTable`);

                    // POKER_QUEUE.gameStateUpdated.add(gameHistory, GlobalConstant.bullQueueDefaultJobOptions)
                    //     .then(function (job) {
                    //         console.log(`SUCCESS ::: game state update job has been successfully queued with id: ${job.data.id}`);
                    //     })
                    //     .catch(function (err) {
                    //         console.log(`ERROR ::: Unable to enqueue game state update job, error: ${err.message}`);
                    //     })

                    let pokerTableId = gameHistory.pokerTableId;
                    let updateObject = {
                        gameState: gameHistory.gameState
                    }

                    if (gameHistory.gameState.round == "idle") {
                        updateObject.state = "idle";
                    } else {
                        updateObject.state = "running";
                    }

                    return PokerTableModel.update(updateObject, { where: { id: pokerTableId, updatedAt: { "$lte": gameHistory.createdAt } }, transaction: options.transaction })
                }
            }
        });
    return GameHistory;
};