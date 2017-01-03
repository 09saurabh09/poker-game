/**
 * Created by saurabhk on 03/01/17.
 */
"use strict";

module.exports = function(sequelize, DataTypes) {
    var PokerTableType = sequelize.define("PokerTableType", {
        preferences: DataTypes.JSONB
    });

    return PokerTableType;
};