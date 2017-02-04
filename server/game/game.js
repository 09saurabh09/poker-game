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
function Game(gameState) {
    // Game attributes
    this.bigBlind = gameState.bigBlind;
    this.maxPlayer = gameState.maxPlayer;
    this.minAmount = gameState.minAmount;
    this.maxAmount = gameState.maxAmount;
    this.maxSitOutTIme = gameState.maxSitOutTIme;
    this.annyomousGame = gameState.annyomousGame;
    this.runTimeType = gameState.runTimeType;
    this.rakeX = gameState.rakeX;
    this.rakeY = gameState.rakeY;
    this.rakeZ = gameState.rakeZ;

    this.players = gameState.players || [];                     // Array of Player object, represents all players in this game
    this.waitingPlayers = gameState.waitingPlayers || [];       // Array of all the players who will be there in the waiting list
    this.oldPlayers = gameState.oldPlayers || [];               // Array of all the players who all have lastly Played the game.  
    this.round = gameState.round || 'idle';                     // current round in a game ['idle', 'deal', 'flop' , 'turn', 'river']
    this.dealerPos = gameState.dealerPos || 0;                  // to determine the dealer position for each game, incremented by 1 for each end game
    this.turnPos = gameState.turnPos || 0;                      // to determine whose turn it is in a playing game
    this.totalPot = gameState.totalPot || 0;                    // accumulated chips in center of the table
    this.minRaise = gameState.minRaise || 0;                    // Minimum raise to be have
    this.maxRaise = gameState.maxRaise || 0;                    // Maximum raise for the next player
    this.callValue = gameState.callValue || 0;                  // Call Value to be stored for next Player
    this.currentTotalPlayer = gameState.currentTotalPlayer || 0;// Total players on the table
    this.communityCards = gameState.communityCards || [];       // array of Card object, five cards in center of the table
    this.deck = gameState.deck || new Deck();                   // deck of playing cards
    this.gamePots = gameState.gamePots || [];                   // The Vairable to store all the game pots 
    this.lastRaise = gameState.lastRaise || 0;                  // Maintaing what was the last raise. 
    this.rakeEarning = gameState.rakeEarning || 0;              // Options for the rake earning per For Game

    if(this.players.length == 0){
        this.initPlayers();
    }
};



/**
 *  var params = {
        callType: "player"
        call : "fold",
        amount : 0
    }; 

    var params = {
        callType: "game"
        call : "addPlayer",
        playerInfo : {
            chips: 1000,
            isMaintainChips: false,
            maintainChips: 0,
            seat : 4
        },
    }

    user = {
        id : "ID",
        name : name,
    }
 */
Game.prototype.playerTurn = function(params, user){
    if(params.callType == "player"){
        if(params.playerId != this.getCurrentPlayer().id && false){
            logd("The Turn Positing is different for different Player");
            return;
        }
        switch(params.call){
            case "fold":
                logd("Fold has been called for -------- " + this.getCurrentPlayer().id + " " + this.getCurrentPlayer().name);
                this.getCurrentPlayer().fold();
                break;
            case "allin":
                logd("allIn has been called for -------- " + this.getCurrentPlayer().id + " " + this.getCurrentPlayer().name);
                this.getCurrentPlayer().allin();
                break;
            case "callOrCheck":
                logd("callOrCheck has been called for -------- " + this.getCurrentPlayer().id + " " + this.getCurrentPlayer().name);
                this.getCurrentPlayer().callOrCheck();
                break;
            case "raise":
                if( params.amount < this.mininumunRaise() || params.amount > this.maximumRaise()){
                    logd("Raise Amount  is not in range min ------ " + this.mininumunRaise() + " max " + this.maximumRaise());
                }
                else{
                    logd("Raise has been called for -------- " + this.getCurrentPlayer().id + " " + this.getCurrentPlayer().name);
                    this.lastRaise = params.amount;
                    this.getCurrentPlayer().raise(params.amount);
                }
                break;
            case "sitOut":
                logd("callOrCheck has been called for -------- " + this.getCurrentPlayer().id + " " + this.getCurrentPlayer().name);
                this.getCurrentPlayer().sitOut();
                break;
            case "sitIn":
                logd("callOrCheck has been called for -------- " + this.getCurrentPlayer().id + " " + this.getCurrentPlayer().name);
                this.getCurrentPlayer().sitIn();
                break;
            case "setMaintChips":
                logd("setMaintChips has been called for -------- " + this.getCurrentPlayer().id + " " + this.getCurrentPlayer().name);
                this.getCurrentPlayer().setMaintChips(params.amount);
                break;
            case "unSetMaintainChips":
                logd("unSetMaintChips has been called for -------- " + this.getCurrentPlayer().id + " " + this.getCurrentPlayer().name);
                this.getCurrentPlayer().unSetMaintainChips();
                break;
            case "turnOffAutoMuck":
                logd("turnOffAutoMuck has been called for -------- " + this.getCurrentPlayer().id + " " + this.getCurrentPlayer().name);
                this.getCurrentPlayer().turnOffAutoMuck();
                break;
            case "turnOnAutoMuck":
                logd("turnOnAutoMuck has been called for -------- " + this.getCurrentPlayer().id + " " + this.getCurrentPlayer().name);
                this.getCurrentPlayer().turnOnAutoMuck();
                break;
            default:
                logd("Call is not correct " + params.call);
                break;
        }
    }
    else if(params.callType == "game"){
        var player = params.playerInfo || {};
        player.id  = user.id;
        player.name = user.name;
        switch(params.call){
            case "addPlayer":
                logd("Add Player has been called for -------- " + user.id );
                this.addPlayer(player);
                break;
            case "addToWaiting":
                logd("waitingPlayer has been called for -------- " + user.id );
                this.addToWaiting(player);
                break;
            case "leaveGame":
                logd("leaveGame has been called for -------- " + user.id );
                var pos = 0;
                for(var i = 0; i < this.players.length; i++ ){
                    if(this.players[i].id == user.id){
                        pos = i;
                        break;
                    }
                }
                this.removeFromGame(pos);
                break;
            case "playerDisconnected":
                logd("playerDisconnected has been called for -------- " + user.id );
                var pos = 0;
                for(var i = 0; i < this.players.length; i++ ){
                    if(this.players[i].id == user.id){
                        pos = i;
                        break;
                    }
                }
                this.players[pos].playerDisconnected();
                break;
            case "playerConnected":
                logd("playerConnected has been called for -------- " + user.id );
                var pos = 0;
                for(var i = 0; i < this.players.length; i++ ){
                    if(this.players[i].id == user.id){
                        pos = i;
                        break;
                    }
                }
                this.players[pos].playerConnected();
                break;
            default:
                logd("Call is not correct " + params.call);
                break;
        }
    }
    else{
        logd("Incorrect CallType " + params.callType);
    }
    this.updateGameInstance();
}



/**
 * To store the Call/MinimummRaise/MaximumRaise for the next player
 */
Game.prototype.updateGameInstance = function(){
    if(this.round != "idle"){
        this.mininumunRaise();
        this.maximumRaise();
        this.nextCall();
    }
    //this.currentGameState();
    //Code to store Game State
}



/**
 * Intializing All the chair on the table with a null value
 */
Game.prototype.initPlayers = function(){
    for(var i = 0; i < this.maxPlayer; i++){
        this.players.push(null);
    }
};



/**
 * Intializing the Game Pot with the Share holder as all Players
 */
Game.prototype.initGamePots = function(){
    var mainPot = {};
    var stakeHolder = [];
    for(var i = 0; i < this.maxPlayer; i++){
        if(this.players[i]){
            stakeHolder.push(this.players[i].id);
        }
    }
    mainPot.stakeHolders = stakeHolder;
    mainPot.amount = 0;
    this.gamePots.push(mainPot);
}



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
    logd("## Game minRaise - " +this.minRaise);        
    logd("## Game maxRaise - " +this.maxRaise);        
    logd("## Game callValue - " +this.callValue);        
    logd("## Game turnPos - " +this.turnPos);           
    logd("## Game totalpot - " +this.totalPot);
    logd("## Game rakeEarning - " +this.rakeEarning);
    logd("## Game gamePots - " + JSON.stringify(this.gamePots));
    logd("## Game minimumRaise - " +this.minimumRaise);    
    logd("## Game currentTotalPlayer - " +this.currentTotalPlayer); 
    logd("## Game Community Cards - " + JSON.stringify(this.communityCards));
    logd("## Game waitingPlayers - " + JSON.stringify(this.waitingPlayers));
    logd("## Game oldPlayers - " + JSON.stringify(this.oldPlayers));
    for (var i=0;i<this.maxPlayer;i++){
        if(this.players[i]!=null){
            logd("## Seat-" + (i+1) 
                + "  has player " + this.players[i].name 
                + "  chips-" + this.players[i].chips 
                + "  bet-" + this.players[i].bet 
                + "  totalBet-" + this.players[i].totalBet
                + "  cards- " + JSON.stringify(this.players[i].firstCard) + "," 
                + JSON.stringify(this.players[i].secondCard) 
                + "  lastAct-" + this.players[i].lastAction
                + "  acted-"+this.players[i].hasActed 
                + "  hasDone-" + this.players[i].hasDone 
                + "  idle-" + this.players[i].idleForHand 
                + "  id-" + this.players[i].id
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
    // logd(JSON.stringify(newPlayer));
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
    else if (this.round != 'idle' && this.players[ newPlayer.seat - 1 ] == null && this.validOldPlayer(newPlayer)){
        logd('Player ' + newPlayer.name + ' added but will will idle for this hand');
        newPlayer.game = this;
        newPlayer.idleForHand = true;
        this.players[ newPlayer.seat - 1 ] = newPlayer;
        this.currentTotalPlayer += 1;
    }
    else if(this.round == 'idle' && this.players[ newPlayer.seat - 1 ] == null && this.validOldPlayer(newPlayer)){
        logd('Player ' + newPlayer.name + ' added to the game');
        newPlayer.game = this;
        this.players[ newPlayer.seat - 1 ] = newPlayer;
        this.currentTotalPlayer += 1;
    }
    else if(!this.validOldPlayer(newPlayer)){
        logd('Player ' + newPlayer.name + ' Cannot be added the game');
    }
    else{
        logd("Seat-> " + ( newPlayer.seat  - 1 ) + "  is Already Been Taken");
    }
    //this.currentGameState();
};



/**
 * Resets game to the default state
 */
Game.prototype.reset = function() {
    logd('^^^^^^Game reset^^^^^^^');
    this.round = 'idle';
    this.communityCards = [];   // clear cards on board
    this.totalPot = 0;               // clear pots on board
    this.deck = new Deck();     // use new deck of cards
    this.gamePots = [];
    this.lastRaise = 0;
    this.minRaise = 0;         
    this.maxRaise = 0            
    this.callValue = 0;         

    for (var i = 0; i < this.players.length; i++) {
        if(this.players[i])
            this.players[i].reset();
    }

    this.checkPlayersConnected();
    this.checkPlayersSitout();
    this.checkWaitingPlayers();
    //this.initGamePots();
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
                if(sitOutDuration / (1000*60) >= this.maxSitOutTIme ){
                    this.removeFromGame(i);
                }
                else{
                    this.players[i].idleForHand =  true;
                }
            }
        }
    }
}



/**
 * Check for the Waiting Players notifiy them
 */
Game.prototype.checkWaitingPlayers = function(){
    if(this.currentTotalPlayer < this.maxPlayer ){
        //Notifiy to the players in the parallel.
    }
}



/**
 * Check whether its a valid Old Players of not
 */
Game.prototype.validOldPlayer = function(params){
    for(var i = 0; i<this.oldPlayers.length; i++){
        if(this.oldPlayers[i].id == params.id){
            if(params.chips < this.oldPlayers[i].money){
                return false;
            }
        }
    }
    return true;
}



/**
 * Update the List of old Players
 */
Game.prototype.updateOldPlayerList = function(){
    for(var i = 0; i < oldPlayers.length; i++){
        var sitOutDuration = moment() - this.oldPlayers[i].leaveTime;
        if(sitOutDuration / (1000*60) >= 30 ){
            this.oldPlayers.splice(i,1);
            i--;
        }
    }
}



/**
 * Remove the Person Fromt he game
 */
Game.prototype.removeFromGame = function(pos){
    var player = {};
    player.id = this.players[pos].id;
    player.leaveTime = moment();
    player.money = this.players[pos].chips;
    this.oldPlayers.push(player); 
    this.players[i].leaveGame();
    this.players[i]=null;
    this.currentTotalPlayer--;
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
    if( !this.checkForGameRun() ){
        logd("Need More Player to start the Game ");
        return;
    }
    logd('========== STARTING GAME ==========');

    this.round = 'deal';
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

    this.dealerPosition();
    
    //Setting the value for smal Blind and big blind.
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
};



/**
 * Check which is the next Player int the row
 */
Game.prototype.nextPlayer = function(pos){
    for (var i=1; i<this.maxPlayer; i++ ){
        var p = ( pos + i ) % this.maxPlayer;
        if(this.players[p] != null && this.players[p].idleForHand == false && this.players[p].hasSitOut == false && this.players[p].hasDone == false){
            return p;
        }
    }
}


/**
 * Go to the next Player turn 
 */
Game.prototype.incrementPlayerTurn = function() {
    this.turnPos = this.nextPlayer(this.turnPos);
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
        this.managePots();
        this.flop();
        if(this.lastRaise == 0 ){
            this.turnPos = this.nextPlayer(this.dealerPos);
        }
    } else if (this.round === 'flop') {
        this.gatherBets();
        this.managePots();
        this.turn();
    } else if (this.round === 'turn') {
        this.gatherBets();
        this.managePots();
        this.river();
    } else if (this.round === 'river') {
        this.gatherBets();
        this.managePots();
        this.showdown();
    } else {
        this.start();
    }
    this.currentGameState();
    if(this.checkPlayerLeft()  <  2){
        this.showdown();
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

    if(this.checkPlayerLeft()  <  2){
        if(this.checkPlayerLeft() == 0){
            logd("All Have Folded or left Game No one won");
        }
        else{
            for(var i = 0; i <this.players.length; i++ ){
                if(this.players[i] && this.players[i].hasDone == false ){
                    if(this.players[i].autoMuck==true){
                        logd("Player " + this.players[i].name + " has won the game.");
                    }
                    else{
                        logd("Player  " + this.players[i].name+ " has won with cards " + this.players[i].firstCard + ", " + this.players[i].secondCard);  
                    }
                }
            }
        }
    }
    else{
        //Sorting all the players card accordingly
        logd('====================== Results ======================');
        var evalHands = evaluator.sortByRankHoldem(this.communityCards, this.players);
        for(var i = 0; i < evalHands.length; i++){
            logd("Player  " + evalHands[i].playerInfo + " has rank " + evalHands[i].hand.value + " card type " + evalHands[i].hand.handName);
        }
        var ranks = evaluator.resultsAfterRank(evalHands);
        for(var i = 0; i < ranks.length; i++ ){
            logd("*********" + JSON.stringify(ranks[i]) + '\n');
        }
        this.rakeForGame();
        this.winnersPerPot(ranks);
        this.handOverPot();
    }
    this.reset();
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
    this.totalPot = 0;
    for(var i=0; i<this.players.length; i++) {
        if(this.players[i]){
            this.players[i].totalBet = this.players[i].bet;
            this.totalPot += this.players[i].totalBet;
            //this.players[i].bet = 0;
        }
    }
    logd("Total Pot : " + this.totalPot)
};



/**
 * Maintaing the GamePots after Each Round
 */
Game.prototype.managePots = function(){
    var extraPot = [];
    this.gamePots = [];
    extraPot.push(0);
    var differentPot = {}; 
    for(var i = 0; i <this.players.length; i++){
        if( this.players[i] ){
            if( this.players[i].lastAction != "fold" && this.players[i].totalBet > 0 )
                differentPot[this.players[i].totalBet] = 1;
        }
    }
    for(var i in differentPot){
        extraPot.push(i);
    }
    extraPot = extraPot.sort();

    for(var i = 1; i < extraPot.length; i++){
        var sidePot = {};
        var stakeHolder = [];
        var potContribution = extraPot[i] - extraPot[i-1];
        sidePot.amount = 0;
        for(var j = 0; j < this.players.length ; j++ ){
            if(this.players[j] && this.players[j].totalBet >= potContribution && this.players[j].lastAction != "fold"){
                sidePot.amount += potContribution;
                this.players[j].totalBet -= potContribution;
                stakeHolder.push(this.players[j].id);
            }
            else if(this.players[j] && this.players[j].lastAction =="fold"){
                if(this.players[j].totalBet >= potContribution){
                    sidePot.amount += potContribution;
                    this.players[j].totalBet -= potContribution;
                }
                else{
                    sidePot.amount += this.players[j].totalBet;
                    this.players[j].totalBet = 0;
                }
            }
        }
        sidePot.stakeHolders = stakeHolder;
        sidePot.rakeMoney = 0;
        this.gamePots.push(sidePot);    
    }
}



/**
 * returns the player whose current turn it is
 * @returns {Player}
 */
Game.prototype.getCurrentPlayer = function() {
    //return new Player(this.players[this.turnPos]);
    this.players[this.turnPos] = new Player(this.players[this.turnPos]);
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



/**
 * Call for the next Player
 */
Game.prototype.nextCall = function(){
    this.callValue = this.getCurrentPlayer().getCallOrCheck();
}


/**
 * Check the Minimum Raise
 */
Game.prototype.mininumunRaise = function(){
    if(this.lastRaise == 0){
        this.minRaise = 2*this.bigBlind;
    }
    else{
       this.minRaise = this.lastRaise + this.getCurrentPlayer().getCallOrCheck();
    }
    return this.minRaise;
}



/**
 * Check the Maximum Raise
 */
Game.prototype.maximumRaise = function(){
    this.maxRaise = this.getCurrentPlayer().chips;

    //Maximum logic for omaha
    // if(this.getCurrentPlayer().chips  <  this.totalPot + 2 * this.getCurrentPlayer().getCallOrCheck()){
    //     this.maxRaise = this.getCurrentPlayer().chips;
    // }
    // else{
    //     this.maxRaise = this.totalPot + 2 * this.getCurrentPlayer().getCallOrCheck();
    // }

    return this.maxRaise;
}



/**
 * Deciding Winner for every Pot and Transfering Money to Wineer
 */
Game.prototype.winnersPerPot = function (ranks){
    for(var i = 0; i < this.gamePots.length; i++ ){
        var winners = [];
        var winnerRank = 10000;
        for(var j = 0; j < this.gamePots[i].stakeHolders.length; j++){
            for(var k = 0; k < ranks.length; k++){
                for(var l = 0; l < ranks[k].length; l++){
                    if(ranks[k][l].playerInfo == this.gamePots[i].stakeHolders[j]){
                        if(k < winnerRank){
                            winnerRank = k;
                        }
                    }
                }
            }
        }
        for(var j = 0; j < this.gamePots[i].stakeHolders.length; j++){
            for(var l = 0; l < ranks[winnerRank].length; l++){
                if(ranks[winnerRank][l].playerInfo == this.gamePots[i].stakeHolders[j] ){
                    winners.push(ranks[winnerRank][l].playerInfo);
                }
            }
        }
        this.gamePots[i].winners = winners;
    }
}



/**
 * Handover pots to whoever is the winner
 */
Game.prototype.handOverPot = function(){
    console.log("Handing over the pot to the winners");
    for(var i =0; i < this.gamePots.length; i++ ){
        if(this.gamePots[i].winners.length == 1){
            this.rakeEarning += this.gamePots[i].rakeMoney;
            for(var j = 0; j < this.players.length; j++){
                if(this.players[j] && this.players[j].id == this.gamePots[i].winners[0]){
                    this.players[j].addChips(this.gamePots[i].amount -  this.gamePots[i].rakeMoney);
                }
            }
        }
        else{
            var noOfWinners = this.gamePots[i].winners.length;
            var amountPerWinner = this.gamePots[i].amount / noOfWinners;
            for(var j = 0; j < this.players.length; j++){
                if(this.players[j] && this.gamePots[i].winners.indexOf(this.players[j].id) != -1){
                    this.players[j].addChips(amountPerWinner);
                    noOfWinners--;
                }
            }
            if(noOfWinners != 0 ){
                logd("Something went wrong while handing over the pot money");
            }
        }
    }
}



/**
 * Show off the Card
 */
Game.prototype.showCard = function(){
    for(var i = 0 ;i< this.gamePots.length; i++ ){
        for(var j = 0 ; j < this.gamePots[i].winners.length; j++){
            for(var k = 0; k <this.players.length; k++){
                if(this.players[k].id == this.gamePots[i].winners[j]){
                    this.players[k].showCards = true;
                }
            }
        }
    }
}



/**
 * choosing Dealer Position
 */
Game.prototype.dealerPosition = function(){
    //Will Increamene teverytime when the game will reset
    logd("Chossing the dealer postions ");
    for (var i=0; i<this.maxPlayer; i++ ){
        var p = ( this.dealerPos + i ) % this.maxPlayer;
        if(this.players[p] != null){
            this.dealerPos = p;
            break;
        }
    }
}



/**
 * Comission from the game
 */
Game.prototype.rakeForGame = function(){
    this.rakeMoney = 0;
    for(var i = 0; i <this.gamePots.length; i++ ){
        if( this.gamePots[i].stakeHolders.length <= this.rakeY ){
            this.gamePots[i].rakeMoney = (this.gamePots[i].amount * this.rakeX) / 100;
        }
        else{
            this.gamePots[i].rakeMoney = (this.gamePots[i].amount * this.rakeZ) / 100;
        }
    }
}



/**
 * Check if Only one Player left then end the Game.
 */
Game.prototype.checkPlayerLeft = function(){
    var totalPlaying = 0;
    for(var i = 0; i <this.players.length; i++ ){
        if(this.players[i] && this.players[i].hasDone == false ){
            totalPlaying++;
        }
    }
    return totalPlaying;
}
