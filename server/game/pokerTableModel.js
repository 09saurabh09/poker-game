/**
 * Created by saurabhk on 03/01/17.
 */
"use strict";

module.exports = function (sequelize, DataTypes) {
    var PokerTable = sequelize.define("PokerTable", {
        preferenceId: DataTypes.BIGINT,
        gameState: { type: DataTypes.JSONB, defaultValue: {} },
        moneyRequest: { type: DataTypes.JSONB, defaultValue: {} },
        parentType: DataTypes.STRING,
        tableType: DataTypes.INTEGER,
        state: DataTypes.STRING
    });

    return PokerTable;
};