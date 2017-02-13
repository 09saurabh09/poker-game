"use strict";

module.exports = function (sequelize, DataTypes) {
    var UserPokerTable = sequelize.define("UserPokerTable", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true // Automatically gets converted to SERIAL for postgres
        },
        // Both UserId and PokerTableId columns are Automatically created by sequalize
        PokerTableId: {
            type: DataTypes.INTEGER,
        },
        UserId: {
            type: DataTypes.INTEGER,
        },
        status: {
            type: DataTypes.STRING
        },
    });
    return UserPokerTable;
};