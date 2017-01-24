/**
 * Created by Vishal Kumar
 */
"use strict";
module.exports = Game;

var Player = require('./player.js');
var Deck = require('../utils/deck.js');
var evaluator = require('../utils/evaluator.js');
var moment = require("moment");

var debug = true;
function logd(message) {
    if (debug) {
        console.log(message);
    }
}



/**
 * Constructor with the required Parameter and variables
 */
function Game(options) {
    // Game attributes
    this.bigBlind = options.bigBlind;
    this.maxPlayer = options.maxPlayer;
    this.minAmount = options.minAmount;
    this.maxAmount = options.maxAmount;
    this.maxSitOutTIme = options.maxSitOutTIme;

    this.players = [];          // Array of Player object, represents all players in this game
    this.waitingPlayers = [];   // Array of all the players who will be there in the waiting list
    this.oldPlayers = [];       // Array of all the players who all have lastly Played the game.  
    this.round = 'idle';        // current round in a game ['idle', 'deal', 'flop' , 'turn', 'river']
    this.dealerPos = 0;         // to determine the dealer position for each game, incremented by 1 for each end game
    this.turnPos = 0;           // to determine whose turn it is in a playing game
    this.pot = 0;               // accumulated chips in center of the table
    this.minimumRaise =  0;     // Minimum raise to be have
    this.currentTotalPlayer = 0;// Total players on the table
    this.communityCards = [];   // array of Card object, five cards in center of the table
    this.deck = new Deck();     // deck of playing cards


    this.initVariable();
    this.currentGameState();
};


/**
 * 
 */
Game.prototype.playerTurn = function(params, gameInstance){
    // var params = {
    //     callType : "fold",
    //     amount: 0,
    //     playerId : id
    // }; 

    if(params.playerId != this.getCurrentPlayer().id){
        logd("The Turn Positing is different for different Player");
        //return;
    }
    switch(params.callType){
        case "fold":
            logd("Fold has been called for -------- " + this.getCurrentPlayer().id);
            this.getCurrentPlayer().fold();
            break;
        case "allin":
            logd("allIn has been called for -------- " + this.getCurrentPlayer().id);
            this.getCurrentPlayer().allin();
            break;
        case "callOrCheck":
            logd("callOrCheck has been called for -------- " + this.getCurrentPlayer().id);
            this.getCurrentPlayer().callOrCheck();
            break;
        case "raise":
            logd("callOrCheck has been called for -------- " + this.getCurrentPlayer().id);
            this.getCurrentPlayer().raise(params.amount);
            break;
        case "sitOut":
            logd("callOrCheck has been called for -------- " + this.getCurrentPlayer().id);
            this.getCurrentPlayer().sitOut();
            break;
        case "sitIn":
            logd("callOrCheck has been called for -------- " + this.getCurrentPlayer().id);
            this.getCurrentPlayer().sitIn();
            break;
        case "setMaintChips":
            logd("setMaintChips has been called for -------- " + this.getCurrentPlayer().id);
            this.getCurrentPlayer().setMaintChips(params.amount);
            break;
        case "unSetMaintainChips":
            logd("unSetMaintChips has been called for -------- " + this.getCurrentPlayer().id);
            this.getCurrentPlayer().unSetMaintainChips();
            break;
        case "playerDisconnected":
            logd("playerDisconnected has been called for -------- " + this.getCurrentPlayer().id);
            this.getCurrentPlayer().playerDisconnected();
            break;
        case "playerConnected":
            logd("playerConnected has been called for -------- " + this.getCurrentPlayer().id);
            this.getCurrentPlayer().playerConnected();
            break;
        case "turnOffAutoMuck":
            logd("turnOffAutoMuck has been called for -------- " + this.getCurrentPlayer().id);
            this.getCurrentPlayer().turnOffAutoMuck();
            break;
        case "turnOnAutoMuck":
            logd("turnOnAutoMuck has been called for -------- " + this.getCurrentPlayer().id);
            this.getCurrentPlayer().turnOnAutoMuck();
            break;
        case "leaveGame":
            logd("leaveGame has been called for -------- " + this.getCurrentPlayer().id);
            this.getCurrentPlayer().leaveGame();
            break;
    }   
}


/**
 * Intializing All the chair on the table with a null value
 */
Game.prototype.initVariable = function(){
    for(var i = 0; i < this.maxPlayer; i++){
        this.players.push(null);
    }
};



/**
 *  Current Table State for Testing
 */
Game.prototype.currentGameState = function(){
    logd("------------------------------------------------------GAME STATE START-----------------------------------------------------------");
    logd("## Game bigBlind - " +this.bigBlind);
    logd("## Game maxPlayer - " +this.maxPlayer);
    logd("## Game minAmount - " +this.minAmount);
    logd("## Game maxAmount - " +this.maxAmount);
    logd("## Game maxSitOutTIme - " +this.maxSitOutTIme);
    logd("## Game dealerPos - " +this.dealerPos);        
    logd("## Game turnPos - " +this.turnPos);           
    logd("## Game pot - " +this.pot);            
    logd("## Game minimumRaise - " +this.minimumRaise);    
    logd("## Game currentTotalPlayer - " +this.currentTotalPlayer); 
    logd("## Game Community Cards - " + JSON.stringify(this.communityCards));
    logd("## Game waitingPlayers - " + JSON.stringify(this.waitingPlayers));
    logd("## Game oldPlayers - " + JSON.stringify(this.oldPlayers));
    for (var i=0;i<this.maxPlayer;i++){
        if(this.players[i]!=null){
            logd("## Seat-" + (i+1) + " has player " + this.players[i].name + "  chips-" + this.players[i].chips 
                + "  bet-" + this.players[i].bet + "  cards- " + JSON.stringify(this.players[i].firstCard) + "," 
                + JSON.stringify(this.players[i].secondCard) + "  lastAct-" + this.players[i].lastAction
                + "  acted-"+this.players[i].hasActed + "  hasDone-" + this.players[i].hasDone 
                + "  idle-" + this.players[i].idleForHand + "  id-" + this.players[i].id
                + "  sitout-"+this.players[i].hasSitOut+","+ this.players[i].sitOutTime
                + "  maintinChips-"+ this.players[i].isMaintainChips + "," + this.players[i].maintainChips);
        }
        else{
            logd("## Seat-> " + (i+1) + " is empty ");
        }
    }
    logd("------------------------------------------------------GAME STATE END-----------------------------------------------------------");
};



/**
 * If a table is full add Player to the waiting List
 */
Game.prototype.addToWaiting = function(attr){
    var waitingPlayer = {
        id : attr.id,
        name : attr.name
    };
    this.waitingPlayers.push(waitingPlayer);
    logd( waitingPlayer.name + " has been added to the waiting List.");
};



/**
 * Adds new player to the game
 * @param attr
 */
Game.prototype.addPlayer = function(attr) {
    var newPlayer = new Player(attr);
    if(this.currentTotalPlayer >= this.maxPlayer){
        this.addToWaiting(attr);
        logd("Table is full You have been added to the waiting List");
    }
    else if(newPlayer.chips < this.minAmount){
        logd("Insufficient Chips for player " + newPlayer.name );
    }
    else if(newPlayer.chips > this.maxAmount){
        logd("Insufficient Chips for player " + newPlayer.name );
    }
    else if(newPlayer.seat > this.maxPlayer){
        logd("NO Seat Availabe for Player " + newPlayer.name);
    }
    else if (this.round != 'idle' && this.players[ newPlayer.seat - 1 ] == null){
        logd('Player ' + newPlayer.name + ' added but will will idle for this hand');
        newPlayer.game = this;
        newPlayer.idleForHand = true;
        this.players[ newPlayer.seat - 1 ] = newPlayer;
        this.currentTotalPlayer += 1;
    }
    else if(this.round == 'idle' && this.players[ newPlayer.seat - 1 ] == null ){
        logd('Player ' + newPlayer.name + ' added to the game');
        newPlayer.game = this;
        this.players[ newPlayer.seat - 1 ] = newPlayer;
        this.currentTotalPlayer += 1;
    }
    else{
        logd("Seat-> " + ( newPlayer.seat  - 1 ) + "  is Already Been Taken");
    }
    this.currentGameState();
};



/**
 * Resets game to the default state
 */
Game.prototype.reset = function() {
    logd('^^^^^^Game reset^^^^^^^');
    this.round = 'idle';
    this.communityCards = [];   // clear cards on board
    this.pot = 0;               // clear pots on board
    this.deck = new Deck();     // use new deck of cards
    for (var i = 0; i < this.players.length; i++) {
        if(this.players[i])
            this.players[i].reset();
    }
    this.checkPlayersConnected();
    this.checkPlayersSitout();
};



/**
 * To Check who are all the players got connected.
 */
Game.prototype.checkPlayersConnected = function(){
    for(var i = 0; i < this.players.length; i++){
        if(this.players[i] && this.players[i].connectionStatus == false){
            this.players[i].hasSitOut = true;
            this.players[i].connectionStatus = true;
        }
    }
}



/**
 * Check the sitout Status of all the Players
 */
Game.prototype.checkPlayersSitout = function(){
    for(var i = 0; i< this.players.length; i++){
        if(this.players[i]){
            if( this.players[i].idleForHand ){
                if(this.players[i].hasSitOut == false){
                    this.players[i].idleForHand = false;
                }
                else{
                    this.players[i].idleForHand = true;
                }
            }
            if(this.players[i].hasSitOut){
                var sitOutDuration = moment() - this.players[i].sitOutTime;
                if(sitOutDuration / (1000*60) >= 30 ){
                    this.players[i].leaveGame();
                    this.players[i]=null;
                }
                else{
                    this.players[i].idleForHand =  true;
                }
            }
        }
    }
}

/**
 * Check the Conditions before starting a Game
 */
Game.prototype.checkForGameRun = function(){
    if(this.currentTotalPlayer < 2){
        return false;
    }
    var cnt = 0;
    for(var i = 0; i < this.maxPlayer; i++){
        if(this.players[i] && this.players[i].hasSitOut == false)
            cnt++;
    }
    if(cnt < 2)
        return false;
    return true;
}



/**
 * Starts the 'deal' Round
 */
Game.prototype.start = function() {
    this.reset();
    if( !this.checkForGameRun() ){
        logd("Need More Player to start the Game ");
        return;
    }
    logd('========== STARTING GAME ==========');

    // deal two cards to each players
    for (var i=0; i<this.players.length; i++) {
        if(this.players[i]){
            var c1 = this.deck.drawCard();
            var c2 = this.deck.drawCard();
            logd('Player ' + this.players[i].name + ' gets card : ' + c1 + ' & ' + c2);
            this.players[i].firstCard = c1;
            this.players[i].secondCard = c2;
        }
    }

    // determine dealer, small blind, big blind
    // modulus with total number of players
    // numbers will back to 0 if exceeds the number of players
    for (var i=0; i<this.maxPlayer; i++ ){
        var p = ( this.dealerPos + i ) % this.maxPlayer;
        if(this.players[p] != null){
            this.dealerPos = p;
            break;
        }
    }
    logd('Player ' + this.players[this.dealerPos].name + ' is the dealer');
    var smallBlindPos = this.nextPlayer(this.dealerPos);
    var bigBlindPos =  this.nextPlayer(smallBlindPos);

    // small and big pays blind
    this.players[smallBlindPos].addBet(1/2 * this.bigBlind);
    this.players[bigBlindPos].addBet(this.bigBlind);

    logd('Player ' + this.players[smallBlindPos].name + ' pays small blind : ' + (1/2 * this.bigBlind));
    logd('Player ' + this.players[bigBlindPos].name + ' pays big blind : ' + this.bigBlind);

    // determine whose turn it is
    this.turnPos = this.nextPlayer(bigBlindPos);
    logd('Now its player ' + this.players[this.turnPos].name + '\'s turn');

    // begin game, start 'deal' Round
    logd('========== Round DEAL ==========');
    this.round = 'deal';
};



/**
 * Check which is the next Player int the row
 */
Game.prototype.nextPlayer = function(pos){
    for (var i=1; i<this.maxPlayer; i++ ){
        var p = ( pos + i ) % this.maxPlayer;
        if(this.players[p] != null && this.players[p].idleForHand == false && this.players[p].hasSitOut == false){
            return p;
        }
    }
}


/**
 * Go to the next Player turn 
 */
Game.prototype.incrementPlayerTurn = function() {
    do {
        this.turnPos = this.nextPlayer(this.turnPos);
    } while( this.players[this.turnPos].hasDone && this.players[this.turnPos].hasSitOut);
};



/**
 * Check if ready to begin new round
 * Round ends when all players' bet are equal,
 * With exception Fold and All-in players
 * @returns {boolean}
 */
Game.prototype.isEndRound = function() {
    var endOfRound = true;
    //For each player, check
    for(var i=0; i<this.players.length; i++) {
        if(this.players[i]){
            var plyr = this.players[i];
            if (!plyr.hasActed && !plyr.hasDone) {
                endOfRound = false;
            }
        }
    }
    return endOfRound;
};



/**
 * Play the next round
 */
Game.prototype.nextRound = function() {
    if (this.round === 'idle') {
        this.start();
    } else if (this.round === 'deal') {
        this.gatherBets();
        this.flop();
    } else if (this.round === 'flop') {
        this.gatherBets();
        this.turn();
    } else if (this.round === 'turn') {
        this.gatherBets();
        this.river();
    } else if (this.round === 'river') {
        this.gatherBets();
        this.showdown();
    } else {
        this.start();
    }
};



/**
 * Checks if ready to next round
 * If yes, starts the next round
 */
Game.prototype.checkForNextRound = function() {
    if (this.isEndRound()) {
        logd('begin next round');
        this.nextRound();
    } else {
        logd('cannot begin next round');
    }
};



/**
 * Starts the 'flop' Round
 */
Game.prototype.flop = function() {
    logd('========== Round FLOP ==========');
    this.round = 'flop';
    // deal three cards in board
    this.communityCards[0] = this.deck.drawCard();
    this.communityCards[1] = this.deck.drawCard();
    this.communityCards[2] = this.deck.drawCard();
    // begin betting
    logd('Community cards : ' + this.communityCards[0] + ', ' + this.communityCards[1] + ', ' + this.communityCards[2]);
    // other players must act
    this.requestPlayerAction();
};



/**
 * Starts the 'turn' Round
 */
Game.prototype.turn = function() {
    logd('========== Round TURN ==========');
    this.round = 'turn';
    // deal fourth card
    this.communityCards[3] = this.deck.drawCard();
    // begin betting
    logd('Community cards : ' + this.communityCards[0] + ', ' + this.communityCards[1] + ', ' + this.communityCards[2] + ', ' + this.communityCards[3]);
    // other players must act
    this.requestPlayerAction();
};



/**
 * Starts the 'river' Round
 */
Game.prototype.river = function() {
    logd('========== Round RIVER ==========');
    this.round = 'river';
    // deal fifth card
    this.communityCards[4] = this.deck.drawCard();
    // begin betting
    logd('Community cards : ' + this.communityCards[0] + ', ' + this.communityCards[1] + ', ' + this.communityCards[2] + ', ' + this.communityCards[3] + ', '  + this.communityCards[4]);
    // other players must act
    this.requestPlayerAction();
};



/**
 * Starts the 'showdown' Round
 */
Game.prototype.showdown = function() {
    logd('====================== SHOWDOWN ======================');
    this.round = 'showdown';

    this.currentGameState();

    //Sorting all the players card accordingly

    logd('====================== Results ======================');
    var evalHands = evaluator.sortByRankHoldem(this.communityCards, this.players);
    logd('Player ' + evalHands[0].player.name + ' wins with ' + evalHands[0].hand.handName);
    for(var i = 0; i < evalHands.length; i++){
        logd("Player  " + evalHands[i].player.name + " has rank " + evalHands[i].hand.value + " card type " + evalHands[i].hand.handName);
    }
};



/**
 * Get the highest bet from all players
 * @returns {number} highestBet
 */
Game.prototype.getHighestBet = function() {
    var highestBet = -999;
    for(var i=0; i<this.players.length; i++) {
        if (this.players[i] && highestBet < this.players[i].bet) {
            highestBet = this.players[i].bet;
        }
    }
    return highestBet;
};



/**
 * Collect all bets from players to the board's pot
 */
Game.prototype.gatherBets = function() {
    for(var i=0; i<this.players.length; i++) {
        if(this.players[i]){
            this.pot += this.players[i].bet;
            this.players[i].bet = 0;
        }
    }
    logd("Total Pot : " + this.pot)
};



/**
 * returns the player whose current turn it is
 * @returns {Player}
 */
Game.prototype.getCurrentPlayer = function() {
    return this.players[this.turnPos];
};



/**
 * Sets all players' hasActed to false
 */
Game.prototype.requestPlayerAction = function() {
    for (var i=0; i<this.players.length; i++) {
        if(this.players[i]){
            if (!this.players[i].hasDone) {
                this.players[i].hasActed = false;
            }
        }
    }
};
