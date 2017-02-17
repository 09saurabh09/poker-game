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
                    console.log(`SUCCESS Game history created for table ${gameHistory.pokerTableId} and game: ${gameHistory.GameId},
                     now pushing it to queue for updating game state in pokerTable`);

                    var job = GAME_QUEUE.create('gameStateUpdated', gameHistory)
                        .attempts(5)
                        .backoff({ type: 'exponential' })
                        .save(function (err) {
                            if (err) {
                                console.log(`ERROR ::: Unable to enqueue game state update job, error: ${err.message}`);
                                // Manually add to DB so that can be picked up by cron
                            } else {
                                console.log(`SUCCESS ::: game state update job has been successfully queued with id: ${job.id}`);
                            }
                        });

                }
            }
        });
    return GameHistory;
};