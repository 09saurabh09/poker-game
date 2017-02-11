"use strict";

module.exports = function (sequelize, DataTypes) {
    var User = sequelize.define("User", {
        name: {
            type: DataTypes.STRING
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: true
            }
        },
        mobileNumber: {
            type: DataTypes.STRING
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        uniqueId: {
            type: DataTypes.UUIDV4,
            defaultValue: DataTypes.UUIDV4
        },
        currentBalance: {
            type: DataTypes.BIGINT,
            defaultValue: 0
        },
        preferences: {
            type: DataTypes.JSONB
        },
        city: {
            type: DataTypes.STRING
        },
        country: {
            type: DataTypes.STRING
        }
    }, {
            classMethods: {
                associate: function (models) {
                    User.belongsToMany(models.Game, {
                        through: "UserGame"
                    });
                    User.belongsToMany(models.PokerTable, {
                        through: "UserPokerTables"
                    })
                }
            }
        });

    return User;
};