/**
 * Created by saurabhk on 27/12/16.
 */
"use strict";

let env = process.env;

require('dotenv').config({ path: `${__dirname}/environments/${env.NODE_ENV}.env` });
let Promise = require("bluebird");
let lodash = require("lodash");
let async = require("async");
const redis = require('redis');

// let kue = require("kue");
// let Queue = require("bull");
let Queue = require('../queue/bullQueueManager');

// Set DB credentials
global.DB_CREDENTIALS = {};
DB_CREDENTIALS.DB_HOST = env.DB_HOST;
DB_CREDENTIALS.DB_NAME = env.DB_NAME;
DB_CREDENTIALS.DB_USERNAME = env.DB_USERNAME;
DB_CREDENTIALS.DB_PASSWORD = env.DB_PASSWORD;
DB_CREDENTIALS.REDIS_HOST = env.REDIS_HOST;
DB_CREDENTIALS.REDIS_PORT = env.REDIS_PORT;
DB_CREDENTIALS.DATABASE_URL = env.DATABASE_URL;
DB_CREDENTIALS.REDIS_URL = env.REDISCLOUD_URL;

// Create DB connection, do not change position as it require above variables
var database = require('../config/database');

// Set endpoints

// Set important gloabls
global.DB_MODELS = database;
global.PROMISE = Promise;
global._ = lodash;
global.async = async;

// Do not change the position
let io = require('../socket/socketRoute');
const client = redis.createClient(DB_CREDENTIALS.REDIS_URL);
global.SOCKET_IO = io;
global.REDIS_CLIENT = client;

global.GlobalConstant = {};
GlobalConstant.tokenSecret = env.TOKEN_SECRET;
GlobalConstant.chatRoomPrefix = "pokerChatRoom";
GlobalConstant.gameRoomPrefix = "pokerGameRoom";
GlobalConstant.playerTurnTimers = {};
GlobalConstant.tableJoinTimers = {};
GlobalConstant.playerTurnTimerPrefix = "playerTurn:";
GlobalConstant.disconnectionTimerPrefix = "disconnect:";

global.POKER_QUEUE = {};

GlobalConstant.bullQueueRedisConnectionOptions = {
    // host: DB_CREDENTIALS.REDIS_HOST,
    // port: DB_CREDENTIALS.REDIS_PORT,
    // keyPrefix: 'bullPokerQueue',
    retryStrategy: function (options) {
        if (options.error && options.error.code === 'ECONNREFUSED') {
            // End reconnecting on a specific error and flush all commands with a individual error
            return new Error('The server refused the connection');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
            // End reconnecting after a specific timeout and flush all commands with a individual error
            return new Error('Retry time exhausted');
        }
        if (options.times_connected > 10) {
            // End reconnecting with built in error
            return undefined;
        }
        // reconnect after
        return Math.min(options.attempt * 100, 3000);
    }
}

GlobalConstant.bullQueueDefaultJobOptions = {
    attempts: 10,
    backoff: {
        type: 'exponential',
        delay: 10000
    }
}
// POKER_QUEUE.gameStateUpdated = Queue('gameStateUpdated', DB_CREDENTIALS.REDIS_URL, GlobalConstant.bullQueueRedisConnectionOptions); 
POKER_QUEUE.gameOverUpdateGame = Queue('gameOverUpdateGame'); 
POKER_QUEUE.gameStartCreateUserGames = Queue('gameStartCreateUserGames');
POKER_QUEUE.playerTurnTimer = Queue('playerTurnTimer');
// global.GAME_QUEUE = kue.createQueue({
//     prefix: 'pokerQueue',
//     jobEvents: false,
//     redis: {
//         port: DB_CREDENTIALS.REDIS_PORT,
//         host: DB_CREDENTIALS.REDIS_HOST,
//         options: {
//             retry_strategy: function (options) {
//                 if (options.error && options.error.code === 'ECONNREFUSED') {
//                     // End reconnecting on a specific error and flush all commands with a individual error
//                     return new Error('The server refused the connection');
//                 }
//                 if (options.total_retry_time > 1000 * 60 * 60) {
//                     // End reconnecting after a specific timeout and flush all commands with a individual error
//                     return new Error('Retry time exhausted');
//                 }
//                 if (options.times_connected > 10) {
//                     // End reconnecting with built in error
//                     return undefined;
//                 }
//                 // reconnect after
//                 return Math.min(options.attempt * 100, 3000);
//             }
//         }
//     }
// });

require('../queue/bullQueueWorker');