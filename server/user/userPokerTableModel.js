"use strict";

module.exports = function (sequelize, DataTypes) {
    var UserPokerTable = sequelize.define("UserPokerTable", {
        status: {
            type: DataTypes.STRING
        },
    });
    return UserPokerTable;
};