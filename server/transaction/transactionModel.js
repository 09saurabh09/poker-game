/**
 * Created by saurabhk on 03/01/17.
 */

"use strict";

module.exports = function(sequelize, DataTypes) {
    var Transaction = sequelize.define("Transaction", {
        amount: DataTypes.INTEGER,
        accountId: DataTypes.INTEGER,
        accountType: DataTypes.STRING,
        reference: DataTypes.STRING,
        type: DataTypes.STRING
    });

    return Transaction;
};