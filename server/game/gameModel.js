/**
 * Created by saurabhk on 30/12/16.
 */
"use strict";

module.exports = function (sequelize, DataTypes) {
    var Game = sequelize.define("Game", {
        pokerTableId: DataTypes.INTEGER,
        finalGameState: DataTypes.JSONB,
        rake: DataTypes.FLOAT,
        status: {
            type: DataTypes.STRING,
            defaultValue: "initialized"
        }
    }, {
            classMethods: {
                associate: function (models) {
                    Game.belongsToMany(models.User, {
                        through: "UserGames"
                    });

                    Game.belongsTo(models.PokerTable);
                }
            }
        });
    return Game;
};