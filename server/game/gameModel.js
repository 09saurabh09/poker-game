/**
 * Created by saurabhk on 30/12/16.
 */
"use strict";

module.exports = function(sequelize, DataTypes) {
    var Game = sequelize.define("Game", {
        pokerTableId: DataTypes.BIGINT,
        gameState: DataTypes.JSONB,
        city: DataTypes.STRING,
        country: DataTypes.STRING
    }, {
        classMethods: {
            associate: function (models) {
                console.log(models);
                Game.belongsToMany(models.User, {
                    through: "UserGames"
                });
            }
        }
    });
    return Game;
};