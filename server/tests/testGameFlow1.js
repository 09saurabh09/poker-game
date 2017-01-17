var Game = require('../game/game');

var gameParams = {
	bigBlind:20,
	maxPlayer: 3,
	minAmount:20*40,
	maxAmount:20*200,
};

var playerParams1 = {
	id: "id1",
    name: "A",
    chips: 1000,
    isMaintainChips: false,
    maintainChips: 0,
    seat : 1
};

var playerParams2 = {
	id: "id2",
    name: "B",
    chips: 1000,
    isMaintainChips: true,
    maintainChips: 400,
    seat : 3
};

var playerParams3 = {
	id: "id3",
    name: "C",
    chips: 1500,
    isMaintainChips: false,
    maintainChips: 0,
    seat : 2
};

var playerParams4 = {
	id: "id4",
    name: "D",
    chips: 1000,
    isMaintainChips: false,
    maintainChips: 0,
    seat : 4
};

var playerParams5 = {
	id: "id5",
    name: "E",
    chips: 2000,
    isMaintainChips: false,
    maintainChips: 0,
    seat : 6
};



var game = new Game(gameParams);

//game.addPlayer(playerParams1);
game.addPlayer(playerParams2);
game.addPlayer(playerParams3);
game.addPlayer(playerParams4);
game.start();
game.addPlayer(playerParams5);



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