"use strict";

let Queue = require("bull");

let GameModel = DB_MODELS.Game;
let PokerTableModel = DB_MODELS.PokerTable;
let UserGamesModel = DB_MODELS.UserGame;


POKER_QUEUE.playerTurnTimer
    .on('ready', function () {
        let gameService = require('../game/gameService');
        let Game = require("../game/game");
        console.log(`INFO ::: started listening to playerTurnTimer`);
        POKER_QUEUE.playerTurnTimer.process(function (job, done) {
            console.log(`INFO ::: Job playerTurnTimer with data ${JSON.stringify(job.data)} is being picked up`);
            let data = job.data;
            let game = new Game(data.game)
            let user = game.getCurrentPlayer();
            let turnType = "timer";
            gameService.playerTurn({ user, game, turnType })
            done();
        });
    })
    .on('error', function (err) {
        console.log(`ERROR ::: Error in processing queue playerTurnTimer. error: ${err.message}, stack: ${err.stack}`);
    })