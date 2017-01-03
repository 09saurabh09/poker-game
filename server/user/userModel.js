"use strict";

module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define("User", {
        name: DataTypes.STRING,
        email: DataTypes.STRING,
        currentBalance: DataTypes.BIGINT,
        preferences: DataTypes.JSONB,
        city: DataTypes.STRING,
        country: DataTypes.STRING
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