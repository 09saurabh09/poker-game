"use strict";

let bcrypt = require('bcrypt');

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
            type: DataTypes.BIGINT
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
                        through: "UserGames"
                    });
                }
            }
        });

    return User;
};