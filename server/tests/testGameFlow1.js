var Game = require('../game/game');

for(var i=0;i<15;i++){
    console.log("\n");
}

var gameParams = {
	bigBlind:20,
	maxPlayer: 6,
	minAmount:20*40,
	maxAmount:20*200,
    maxSitOutTIme: 30,
    maxDisconnectionTIme: 10,
    annyomousGame:false,
    runTimeType:2,
    rakeX: 5,
    rakeY: 5,
    rakeZ: 2
};

var playerParams1 = {
    callType: "game",
    call : "addPlayer",
    playerInfo : {
        chips: 1000,
        isMaintainChips: false,
        maintainChips: 0,
        seat : 1
    }
};

var userParams1 = {
    id: "id1",
    name: "A"
};

var playerParams2 = {
    callType: "game",
    call : "addPlayer",
    playerInfo : {
        chips: 1000,
        isMaintainChips: true,
        maintainChips: 400,
        seat : 3
    }
};

var userParams2 = {
    id: "id2",
    name: "B"
};

var playerParams3  = {
    callType: "game",
    call : "addPlayer",
    playerInfo : {
        chips: 1500,
        isMaintainChips: true,
        maintainChips: 0,
        seat : 2
    }
};

var userParams3 = {
    id: "id3",
    name: "C"
};

var playerParams4 = {
    callType: "game",
    call : "addPlayer",
    playerInfo : {
        chips: 1000,
        isMaintainChips: false,
        maintainChips: 0,
        seat : 4
    }
};

var userParams4 = {
    id: "id4",
    name: "D"
};

var playerParams5 = {
    callType: "game",
    call : "addPlayer",
    playerInfo : {
        chips: 2000,
        isMaintainChips: false,
        maintainChips: 0,
        seat : 6
    }
};

var userParams5 = {
    id: "id5",
    name: "E"
};


var game = new Game(gameParams);


//game.playerTurn(playerParams1);
game.playerTurn(playerParams2, userParams2);
game.playerTurn(playerParams3, userParams3);
game.playerTurn(playerParams4, userParams4);
game.playerTurn(playerParams5, userParams5);
// game.start();


var gameInstance = {
    dealerPos:4
};
var gameInstance = null;

var turnParamsCall = {
    callType:"player",
    call:"callOrCheck",
    amount:0,
    playerId:""
};

var turnParamsRaise = {
    callType:"player",
    call:"raise",
    amount:50,
    playerId:""
};

var turnParamsStack = {
    callType:"player",
    call:"unSetMaintainChips",
    amount:20,
    playerId:""
};

game.playerTurn(turnParamsCall,gameInstance);
game.playerTurn(turnParamsCall,gameInstance);
game.playerTurn(turnParamsCall,gameInstance);
game.playerTurn(turnParamsCall,gameInstance);
game.playerTurn(turnParamsCall,gameInstance);
game.playerTurn(turnParamsStack,gameInstance);
game.playerTurn(turnParamsRaise,gameInstance);
game.playerTurn(turnParamsRaise,gameInstance);
game.playerTurn(turnParamsCall,gameInstance);
game.playerTurn(turnParamsCall,gameInstance);
game.playerTurn(turnParamsCall,gameInstance);
game.playerTurn(turnParamsCall,gameInstance);
game.playerTurn(turnParamsRaise,gameInstance);
game.playerTurn(turnParamsCall,gameInstance);
game.playerTurn(turnParamsCall,gameInstance);
game.playerTurn(turnParamsCall,gameInstance);
// game.playerTurn(turnParamsCall,gameInstance);
// game.playerTurn(turnParamsCall,gameInstance);
// game.playerTurn(turnParamsCall,gameInstance);
// game.playerTurn(turnParamsCall,gameInstance);
// game.playerTurn(turnParamsCall,gameInstance);
// game.playerTurn(turnParamsCall,gameInstance);
// game.playerTurn(turnParamsCall,gameInstance);
// game.playerTurn(turnParamsCall,gameInstance);
// game.playerTurn(turnParamsCall,gameInstance);

// game.currentGameState();

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