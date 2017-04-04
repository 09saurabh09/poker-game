"use strict";

let Queue = require("bull");

let GameModel = DB_MODELS.Game;
let PokerTableModel = DB_MODELS.PokerTable;
let UserGamesModel = DB_MODELS.UserGame;


POKER_QUEUE.playerTurnTimer
    .on('ready', function () {
        let gameService = require('../game/gameService');
        let Game = require("../game/game");
        console.log(`INFO started listening to playerTurnTimer`);
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
    .on('active', function (job, jobPromise) {
        console.log(`INFO ::: Active job ${job.jobId}`);
        // Job started
        // You can use jobPromise.cancel() to abort this job.
    })
    .on('stalled', function (job) {
        console.log(`INFO ::: job stalled ${job.jobId}`);
        // Job that was considered stalled. Useful for debugging job workers that crash or pause the event loop.
    })
    .on('progress', function (job, progress) {
        console.log(`INFO ::: progress job ${job.jobId}`);
        // Job progress updated!
    })
    .on('completed', function (job, result) {
        // Job completed with output result!
    })
    .on('failed', function (job, err) {
        console.log(`INFO ::: job failed ${job.jobId}`);
        // Job failed with reason err!
    })
    .on('paused', function () {
        console.log(`INFO ::: Queue paused`);
        // The queue has been paused
    })
    .on('resumed', function (job) {
        console.log(`INFO ::: resumed job ${job.jobId}`);
        // The queue has been resumed
    })
    .on('cleaned', function (jobs, type) {
        console.log(`INFO ::: cleaning job`);
        //jobs is an array of cleaned jobs
        //type is the type of job cleaned
        //see clean for details
    });