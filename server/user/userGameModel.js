"use strict";

module.exports = function (sequelize, DataTypes) {
    var UserGame = sequelize.define("UserGame", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true // Automatically gets converted to SERIAL for postgres
        },
        // Both UserId and GameId columns are Automatically created by sequalize
        GameId: {
            type: Sequelize.INTEGER,
        },
        UserId: {
            type: Sequelize.INTEGER,
        },
        status: {
            type: DataTypes.STRING
        },
    });
    return UserGame;
};