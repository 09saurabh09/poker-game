/**
 * Created by saurabhk on 27/12/16.
 */
"use strict";

let env = process.env;

require('dotenv').config({path: `${__dirname}/environments/${env.NODE_ENV}.env`});


// Set DB credentials
global.DB_CREDENTIALS = {};
DB_CREDENTIALS.DB_HOST = env.DB_HOST;
DB_CREDENTIALS.DB_NAME = env.DB_NAME;
DB_CREDENTIALS.DB_USERNAME = env.DB_USERNAME;
DB_CREDENTIALS.DB_PASSWORD = env.DB_PASSWORD;
DB_CREDENTIALS.REDIS_HOST = env.REDIS_HOST;
DB_CREDENTIALS.REDIS_PORT = env.REDIS_PORT;

// Set endpoints