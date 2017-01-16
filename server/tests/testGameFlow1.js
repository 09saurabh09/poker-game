var Game = require('../game/game');

var gameParams = {
	bigBlind:20,
	maxPlayer: 6,
	minAmount:100,
	maxAmount:1000,
};

var playerParams1 = {
	id: "id1",
    name: "A",
    chips: 400,
    isMaintainChips: false,
    maintainChips: 0,
    seat : 1
};

var playerParams2 = {
	id: "id2",
    name: "B",
    chips: 400,
    isMaintainChips: true,
    maintainChips: 400,
    seat : 4
};

var playerParams3 = {
	id: "id3",
    name: "C",
    chips: 500,
    isMaintainChips: false,
    maintainChips: 0,
    seat : 2
};

var playerParams4 = {
	id: "id4",
    name: "D",
    chips: 600,
    isMaintainChips: false,
    maintainChips: 0,
    seat : 3
};

var playerParams5 = {
	id: "id5",
    name: "E",
    chips: 700,
    isMaintainChips: false,
    maintainChips: 0,
    seat : 5
};



var game = new Game(gameParams);

game.addPlayer(playerParams1);
game.addPlayer(playerParams2);
game.addPlayer(playerParams3);
game.addPlayer(playerParams4);
game.addPlayer(playerParams5);

// game.start();

// game.getCurrentPlayer().callOrCheck();      // A
// game.getCurrentPlayer().callOrCheck();      // B
// game.getCurrentPlayer().fold();
// game.getCurrentPlayer().raise(2000);        // C
// game.getCurrentPlayer().raise(2000);        // A
// game.getCurrentPlayer().fold();             // B
// game.getCurrentPlayer().callOrCheck();      // C
// game.getCurrentPlayer().callOrCheck();      // A
// game.getCurrentPlayer().raise(1000);        // C
// game.getCurrentPlayer().callOrCheck();      // A
// game.getCurrentPlayer().callOrCheck();      // C
// game.getCurrentPlayer().raise(3000);        // A
// game.getCurrentPlayer().callOrCheck();      // C
// game.getCurrentPlayer().callOrCheck();      // A
// game.getCurrentPlayer().callOrCheck();      // C