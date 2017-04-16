"use strict";

let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTcsIm5hbWUiOm51bGwsImVtYWlsIjoic2F1cmFiaGtAb2xhY2Ficy5jb20iLCJtb2JpbGVOdW1iZXIiOm51bGwsInVuaXF1ZUlkIjoiMWEzNDk1NDItM2FiOC00ZTMzLWIxZjMtNTVhZTk1Y2FlMzlkIiwiY3VycmVudEJhbGFuY2UiOm51bGwsInByZWZlcmVuY2VzIjpudWxsLCJjaXR5IjpudWxsLCJjb3VudHJ5IjpudWxsLCJjcmVhdGVkQXQiOiIyMDE3LTAxLTMwVDIwOjQ1OjE2LjI2OVoiLCJ1cGRhdGVkQXQiOiIyMDE3LTAxLTMwVDIwOjQ1OjE2LjI2OVoiLCJpYXQiOjE0ODYyMDYxNTEsImV4cCI6MTQ4NjI5MjU1MX0.ELv1h7hd4R_iOJWqMwbl0qShgooUQ5HBL6ISIi6_lhw";


var socket = require('socket.io-client')(`http://localhost:3100`);

socket.on('player-joined', function(data) {
    console.log(data);
})

// Auth socket
var socketAuthorized = require('socket.io-client')(`http://localhost:3100/poker-game-authorized?token=${token}`);
socketAuthorized.on('connect', function () {
    console.log(`Client connected to auth socket`);
});
socketAuthorized.on('event', function (data) { });
socketAuthorized.on('disconnect', function () { });

// Listen to all events before emitting

socketAuthorized.emit('table-join', {
    tableId: 1,
    playerInfo: {
        chips: 1000,
        isMaintainChips: false,
        maintainChips: 0,
        seat: 1
    }
})

// Unauth socket
var socketUnauthorized = require('socket.io-client')(`http://localhost:3100/poker-game-unauthorized`);
socketUnauthorized.on('connect', function () {
    console.log(`Client connected to unauth socket`);
});
socketUnauthorized.on('event', function (data) { });
socketUnauthorized.on('disconnect', function () { });