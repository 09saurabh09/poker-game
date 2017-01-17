/**
 * Created by saurabhk on 28/12/16.
 */
"use strict";

module.exports = function (io) {
    io.on('connection', function (socket) {
        console.log("Client connected");
        // Socket event for player turn
        socket.on('turn', function(data) {
            let job = GAME_QUEUE.create('turn', data)
                        .save( function(err){
                            if( !err ) console.log( job.id );
                        });
        })
    });
};