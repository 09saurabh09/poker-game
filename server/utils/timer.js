"use strict";

let moment = require('moment-timer');
let pokerTableConfig = require('../game/pokerTableConfig');

module.exports = {
    playerTurnTimer: function (self, game) {
        let user = game.getCurrentPlayer();
        // let pos = game.findPlayerPos(user.id);
        let playerTimeBank = user.timeBank;

        GlobalConstant.timers[game.tableId] = moment.duration(pokerTableConfig.timer.defaultDuration + playerTimeBank, "seconds").timer(function () {
            console.log(`INFO ::: Started timer for player ${user.id}`);
            let turnType = "timer";
            self.playerTurn({ user, game, turnType})
        });
        console.log(`Timer added for player ${user.id}`);
    }
}