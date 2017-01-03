/**
 * Created by saurabhk on 03/01/17.
 */
"use strict";

module.exports = function(sequelize, DataTypes) {
    var TournamentPreference = sequelize.define("TournamentPreference", {
        preferences: DataTypes.JSONB
    });

    return TournamentPreference;
};