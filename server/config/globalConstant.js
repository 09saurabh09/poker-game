/**
 * Created by saurabhk on 27/12/16.
 */
"use strict";

let env = process.env;

require('dotenv').config({path: `${__dirname}/environments/${env.NODE_ENV}.env`});
let Promise = require("bluebird");
let lodash = require("lodash");
let async = require("async");
// let kue = require("kue");

// Set DB credentials
global.DB_CREDENTIALS = {};
DB_CREDENTIALS.DB_HOST = env.DB_HOST;
DB_CREDENTIALS.DB_NAME = env.DB_NAME;
DB_CREDENTIALS.DB_USERNAME = env.DB_USERNAME;
DB_CREDENTIALS.DB_PASSWORD = env.DB_PASSWORD;
DB_CREDENTIALS.REDIS_HOST = env.REDIS_HOST;
DB_CREDENTIALS.REDIS_PORT = env.REDIS_PORT;


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
global.SOCKET_IO = io;

global.GlobalConstant = {};
GlobalConstant.tokenSecret = env.TOKEN_SECRET;
GlobalConstant.chatRoomPrefix = "pokerChatRoom";
GlobalConstant.gameRoomPrefix = "pokerGameRoom";