/**
 * Created by saurabhk on 03/01/17.
 */
"use strict";
let pokerTableConfig = require("./pokerTableConfig").pokerTableConfig;

module.exports = function (sequelize, DataTypes) {
    var PokerTable = sequelize.define("PokerTable", {
        uniqueId: {
            type: DataTypes.UUIDV4,
            defaultValue: DataTypes.UUIDV4
        },
        gameState: { 
            type: DataTypes.JSONB, 
            defaultValue: {} 
        },
        moneyRequest: { 
            type: DataTypes.JSONB, 
            defaultValue: {} 
        },
        parentType: { 
            type: DataTypes.STRING 
        },
        tableType: { 
            type: DataTypes.INTEGER 
        },
        state: { 
            type: DataTypes.STRING 
        },
        moneyType: {
            type: DataTypes.STRING,
            validate: {
                 isIn: [pokerTableConfig.moneyType.values], 
            }
        },
        bigBlind: {
            type: DataTypes.FLOAT,
            validate: {
                 isIn: [pokerTableConfig.bigBlind.values], 
            }
        },
        gameType: {
            type: DataTypes.STRING,
            validate: {
                 isIn: [pokerTableConfig.gameType.values], 
            }
        },
        accessType: {
            type: DataTypes.STRING,
            validate: {
                 isIn: [pokerTableConfig.accessType.values], 
            }
        },
        runTimeType: {
            type: DataTypes.STRING,
            validate: {
                 isIn: [pokerTableConfig.runTimeType.values], 
            }
        },
        maxPlayer: {
            type: DataTypes.INTEGER,
            validate: {
                 min: [pokerTableConfig.nOfPlayers.min], 
                 max: [pokerTableConfig.nOfPlayers.max],
            }
        },
        minAmount: { 
            type: DataTypes.FLOAT 
        },
        maxAmount: { 
            type: DataTypes.FLOAT 
        },
        maxSitOutTIme: { 
            type: DataTypes.INTEGER 
        },
        annyomousGame: { 
            type: DataTypes.BOOLEAN 
        },
        rakeX: { 
            type: DataTypes.FLOAT 
        },
        rakeY: { 
            type: DataTypes.FLOAT 
        },
        rakeZ: { 
            type: DataTypes.FLOAT 
        },
    });

    return PokerTable;
};