/**
 * Created by Vishal Kumar
 */
"use strict";
module.exports = Game;

var debugGameFlow = true;

var Player = require('./player.js');
var Deck = require('../utils/deck.js');
var evaluator = require('../utils/evaluator.js');
var moment = require("moment");
if(debugGameFlow)
    var gameService = require('./gameService.js');


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
    this.gameType = gameState.gameType;  
    this.parentType = gameState.parentType;                       //The type of Game it is holdem or omaha.

    // attributes needed post game
    this.currentGameId = gameState.currentGameId;
    this.tableId = gameState.tableId;

    this.debugMode = gameState.debugMode;

    this.players = gameState.players || [];                     // Array of Player object, represents all players in this game
    this.waitingPlayers = gameState.waitingPlayers || [];       // Array of all the players who will be there in the waiting list
    this.oldPlayers = gameState.oldPlayers || [];               // Array of all the players who all have lastly Played the game.  
    this.round = gameState.round || 'idle';                     // current round in a game ['idle', 'deal', 'flop' , 'turn', 'river']
    this.dealerPos = gameState.dealerPos || 0;                  // to determine the dealer position for each game, incremented by 1 for each end game
    this.turnPos = gameState.turnPos || 0;                      // to determine whose turn it is in a playing game
    this.totalPot = gameState.totalPot || 0;                    // accumulated chips in center of the table after each Game
    this.currentPot = gameState.currentPot || 0;                // Current Pot at any point of time. 
    this.minRaise = gameState.minRaise || 0;                    // Minimum raise to be have
    this.maxRaise = gameState.maxRaise || 0;                    // Maximum raise for the next player
    this.callValue = gameState.callValue || 0;                  // Call Value to be stored for next Player
    this.currentTotalPlayer = gameState.currentTotalPlayer || 0;// Total players on the table
    this.communityCards = gameState.communityCards || [];       // array of Card object, five cards in center of the table
    this.deck = new Deck(gameState.deck);                       // deck of playing cards
    this.gamePots = gameState.gamePots || [];                   // The Vairable to store all the game pots 
    this.lastRaise = gameState.lastRaise || 0;                  // Maintaing what was the last raise. 
    this.rakeEarning = gameState.rakeEarning || 0;              // Options for the rake earning per For Game

    if(this.players.length == 0){
        this.initPlayers();
    }
};



/**
 * Logd for complete flow
 */
Game.prototype.logd = function(message) {
    if (this.debugMode) {
        console.log(message);
    }
}



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
    let self = this;
    this.reloadAllPlayers();
    if(params.callType == "player"){
        if(params.playerId != this.getCurrentPlayer().id && false){
            this.logd("The Turn Positing is different for different Player");
            return;
        }
        switch(params.call){
            case "fold":
                this.logd("Fold has been called for -------- " + this.getCurrentPlayer().id + " " + this.getCurrentPlayer().name);
                this.getCurrentPlayer().fold();
                break;
            case "allin":
                this.logd("allIn has been called for -------- " + this.getCurrentPlayer().id + " " + this.getCurrentPlayer().name);
                this.getCurrentPlayer().allin();
                break;
            case "callOrCheck":
                this.logd("callOrCheck has been called for -------- " + this.getCurrentPlayer().id + " " + this.getCurrentPlayer().name);
                this.getCurrentPlayer().callOrCheck();
                break;
            case "raise":
                if( params.amount < this.mininumunRaise() || params.amount > this.maximumRaise()){
                    this.logd("Raise Amount  is not in range min ------ " + this.mininumunRaise() + " max " + this.maximumRaise());
                }
                else{
                    this.logd("Raise has been called for -------- " + this.getCurrentPlayer().id + " " + this.getCurrentPlayer().name);
                    this.lastRaise = params.amount;
                    this.getCurrentPlayer().raise(params.amount);
                }
                break;
            case "doBestCall":
                this.logd("callOrCheck has been called for -------- " + this.getCurrentPlayer().id + " " + this.getCurrentPlayer().name);
                this.getCurrentPlayer().doBestCall();
            default:
                this.logd("Call is not correct " + params.call);
                break;
        }
    }
    else if(params.callType == "game"){
        var player = params.playerInfo || {};
        player.id  = user.id;
        player.name = user.name;
        player.sessionKey = user.sessionKey;
        switch(params.call){
            case "addPlayer":
                this.logd("Add Player has been called for -------- " + user.id );
                return this.addPlayer(player);
                break;

            case "addToWaiting":
                this.logd("waitingPlayer has been called for -------- " + user.id );
                this.addToWaiting(player);
                break;

            case "leaveGame":
                this.logd("leaveGame has been called for -------- " + user.id );
                var pos = self.findPlayerPos(user.id);
                if(pos == -1){
                    this.logd("Player not present " + user.id);
                    break;
                }
                this.removeFromGame(pos);
                break;

            case "playerDisconnected":
                this.logd("playerDisconnected has been called for -------- " + user.id );
                var pos = self.findPlayerPos(user.id);
                if(pos == -1){
                    this.logd("Player not present " + user.id);
                    break;
                }
                this.players[pos].playerDisconnected();
                break;

            case "playerConnected":
                this.logd("playerConnected has been called for -------- " + user.id );
                var pos = self.findPlayerPos(user.id);
                if(pos == -1){
                    this.logd("Player not present " + user.id);
                    break;
                }
                this.players[pos].playerConnected();
                break;

            case "sitOut":
                this.logd("sitOut has been called for -------- " + user.id );
                var pos = self.findPlayerPos(user.id);
                if(pos == -1){
                    this.logd("Player not present " + user.id);
                    break;
                }
                this.players[pos].sitOut();
                break;

            case "sitIn":
                this.logd("sitIn has been called for -------- " + user.id );
                var pos = self.findPlayerPos(user.id);
                if(pos == -1){
                    this.logd("Player not present " + user.id);
                    break;
                }
                this.players[pos].sitIn();
                break;

            case "setMaintChips":
                this.logd("setMaintChips has been called for -------- " + user.id );
                var pos = self.findPlayerPos(user.id);
                if(pos == -1){
                    this.logd("Player not present " + user.id);
                    break;
                }
                this.players[pos].setMaintChips(params.playerInfo.chips);
                break;

            case "unSetMaintainChips":
                this.logd("unSetMaintainChips has been called for -------- " + user.id );
                var pos = self.findPlayerPos(user.id);
                if(pos == -1){
                    this.logd("Player not present " + user.id);
                    break;
                }
                this.players[pos].unSetMaintainChips();
                break;

            case "turnOffAutoMuck":
                this.logd("turnOffAutoMuck has been called for -------- " + user.id );
                var pos = self.findPlayerPos(user.id);
                if(pos == -1){
                    this.logd("Player not present " + user.id);
                    break;
                }
                this.players[pos].turnOffAutoMuck();
                break;

            case "turnOnAutoMuck":
                this.logd("turnOnAutoMuck has been called for -------- " + user.id );
                var pos = self.findPlayerPos(user.id);
                if(pos == -1){
                    this.logd("Player not present " + user.id);
                    break;
                }
                this.players[pos].turnOnAutoMuck();
                break;

            default:
                this.logd("Call is not correct " + params.call);
                break;
        }
    }
    else{
        this.logd("Incorrect CallType " + params.callType);
    }
    this.updateGameInstance();
    this.currentGameState();
}



/**
 * Find Player pos return the seat number 0 index
 */
Game.prototype.findPlayerPos = function(id){
    var pos = -1;
    for(var i = 0; i < this.players.length; i++ ){
        if(this.players[i] && this.players[i].id == id){
            pos = i;
            break;
        }
    }
    return pos;
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
    this.logd("------------------------------------------------------GAME STATE START-----------------------------------------------------------");
    this.logd("## Game bigBlind - " +this.bigBlind);
    this.logd("## Game maxPlayer - " +this.maxPlayer);
    this.logd("## Game minAmount - " +this.minAmount);
    this.logd("## Game maxAmount - " +this.maxAmount);
    this.logd("## Game maxSitOutTIme - " +this.maxSitOutTIme);
    this.logd("## Game dealerPos - " +this.dealerPos);        
    this.logd("## Game gameType - " +this.gameType);        
    this.logd("## Game Round - " + this.round);
    this.logd("## Game minRaise - " +this.minRaise);        
    this.logd("## Game maxRaise - " +this.maxRaise);        
    this.logd("## Game callValue - " +this.callValue);        
    this.logd("## Game currentPot - " +this.currentPot);           
    this.logd("## Game lastRaise - " +this.lastRaise);           
    this.logd("## Game turnPos - " +this.turnPos);           
    this.logd("## Game totalpot - " +this.totalPot);
    this.logd("## Game rakeEarning - " +this.rakeEarning);
    this.logd("## Game gamePots - " + JSON.stringify(this.gamePots));   
    this.logd("## Game currentTotalPlayer - " +this.currentTotalPlayer); 
    this.logd("## Game Community Cards - " + JSON.stringify(this.communityCards));
    this.logd("## Game waitingPlayers - " + JSON.stringify(this.waitingPlayers));
    this.logd("## Game oldPlayers - " + JSON.stringify(this.oldPlayers));
    for (var i=0;i<this.maxPlayer;i++){
        if(this.players[i]!=null){
            this.logd("## Seat-" + (i+1) 
                + "  has player " + this.players[i].name 
                + "  chips-" + this.players[i].chips 
                + "  bet-" + this.players[i].bet 
                + "  totalBet-" + this.players[i].totalBet
                + "  betForRound-" + this.players[i].betForRound
                + "  cards- " + JSON.stringify(this.players[i].cards)
                + "  lastAct-" + this.players[i].lastAction
                + "  acted-"+this.players[i].hasActed 
                + "  hasDone-" + this.players[i].hasDone 
                + "  idle-" + this.players[i].idleForHand 
                + "  id-" + this.players[i].id
                + "  sitout-"+this.players[i].hasSitOut+","+ this.players[i].sitOutTime
                + "  maintinChips-"+ this.players[i].isMaintainChips + "," + this.players[i].maintainChips);
        }
        else{
            this.logd("## Seat-> " + (i+1) + " is empty ");
        }
    }
    this.logd("------------------------------------------------------GAME STATE END-----------------------------------------------------------");
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
    this.logd( waitingPlayer.name + " has been added to the waiting List.");
};



/**
 * Adds new player to the game
 * @param attr
 */
Game.prototype.addPlayer = function(attr) {
    let playerAdded = false;
    var newPlayer = new Player(attr);
    // this.logd(JSON.stringify(newPlayer));
    for(var i = 0; i < this.players.length; i++){
        if(this.players[i] && this.players[i].id == newPlayer.id){
            this.logd("Player Aready Added");
            return playerAdded;
        }
    }
    if(this.currentTotalPlayer >= this.maxPlayer){
        this.addToWaiting(attr);
        this.logd("Table is full You have been added to the waiting List");
    }
    else if(newPlayer.chips < this.minAmount){
        this.logd("Insufficient Chips for player " + newPlayer.name );
    }
    else if(newPlayer.chips > this.maxAmount){
        this.logd("Insufficient Chips for player " + newPlayer.name );
    }
    else if(newPlayer.seat > this.maxPlayer){
        this.logd("NO Seat Availabe for Player " + newPlayer.name);
    }
    else if (this.round != 'idle' && this.players[ newPlayer.seat - 1 ] == null && this.validOldPlayer(newPlayer)){
        this.logd('Player ' + newPlayer.name + ' added but will will idle for this hand');
        newPlayer.game = this;
        newPlayer.idleForHand = true;
        this.players[ newPlayer.seat - 1 ] = newPlayer;
        this.currentTotalPlayer += 1;

        playerAdded = true;
    }
    else if(this.round == 'idle' && this.players[ newPlayer.seat - 1 ] == null && this.validOldPlayer(newPlayer)){
        this.logd('Player ' + newPlayer.name + ' added to the game');
        newPlayer.game = this;
        this.players[ newPlayer.seat - 1 ] = newPlayer;
        this.currentTotalPlayer += 1;
        
        playerAdded = true
    }
    else if(!this.validOldPlayer(newPlayer)){
        this.logd('Player ' + newPlayer.name + ' Cannot be added the game');
    }
    else{
        this.logd("Seat-> " + ( newPlayer.seat  - 1 ) + "  is Already Been Taken");
    }
    
    if(this.currentTotalPlayer > 1 && this.round == 'idle'){
        if(!debugGameFlow){
            this.start();
        }
    }

    return playerAdded;
};



/**
 * Resets game to the default state
 */
Game.prototype.reset = function() {
    this.logd('^^^^^^Game reset^^^^^^^');
    this.round = 'idle';
    this.communityCards = [];   
    this.totalPot = 0;          
    this.deck = new Deck();     
    this.gamePots = [];
    this.lastRaise = 0;
    this.minRaise = 0;         
    this.maxRaise = 0            
    this.callValue = 0;         

    //this.currentGameId = gameState.currentGameId;
    this.rakeEarning = 0;

    for (var i = 0; i < this.players.length; i++) {
        if(this.players[i])
            this.players[i].reset();
    }

    this.checkPlayersConnected();
    this.checkPlayersSitout();
    this.checkWaitingPlayers();

    this.start();
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
        if(sitOutDuration / (1000*60) >= this.maxSitOutTIme ){
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
 * Function to Draw Card For each Players
 */
Game.prototype.getPlayersCard = function(noOfCards){
    for (var i=0; i<this.players.length; i++) {
        if(this.players[i]){
            for (var j = 0; j < noOfCards; j++ ){
                var c = this.deck.drawCard();
                this.players[i].cards.push(c);
            }
            this.logd('Player ' + this.players[i].id + ' gets card : ' + JSON.stringify(this.players[i].cards));
        }
    }
}



/**
 * Starts the 'deal' Round
 */
Game.prototype.start = function() {
    if( !this.checkForGameRun() ){
        this.logd("Need More Player to start the Game ");
        return;
    }
    this.logd('========== STARTING GAME ==========');
    

    this.round = 'deal';
    
    if(this.gameType == "holdem"){
        this.getPlayersCard(2);
    }
    else if(this.gameType == "omaha"){
        this.getPlayersCard(4);
    }

    this.dealerPosition();
    
    //Setting the value for smal Blind and big blind.
    this.logd('Player ' + this.players[this.dealerPos].name + ' is the dealer');
    var smallBlindPos = this.nextPlayer(this.dealerPos);
    var bigBlindPos =  this.nextPlayer(smallBlindPos);

    // small and big pays blind
    this.players[smallBlindPos].addBet(1/2 * this.bigBlind);
    this.players[bigBlindPos].addBet(this.bigBlind);

    this.logd('Player ' + this.players[smallBlindPos].name + ' pays small blind : ' + (1/2 * this.bigBlind));
    this.logd('Player ' + this.players[bigBlindPos].name + ' pays big blind : ' + this.bigBlind);

    // determine whose turn it is
    this.turnPos = this.nextPlayer(bigBlindPos);
    this.logd('Now its player ' + this.players[this.turnPos].name + '\'s turn');

    // begin game, start 'deal' Round
    this.updateGameInstance();
    this.currentGameState();
    this.logd('========== Round DEAL ==========');
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
        if(this.players[i] && !this.players[i].idleForHand){
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
        //this.start();
        this.logd("Current is in IDLE round");
    } else if (this.round === 'deal') {
        this.updatePotAndBet();
        this.flop();
        if(this.lastRaise == 0 ){
            this.turnPos = this.nextPlayer(this.dealerPos);
        }
    } else if (this.round === 'flop') {
        this.updatePotAndBet();
        this.turn();
    } else if (this.round === 'turn') {
        this.updatePotAndBet();
        this.river();
    } else if (this.round === 'river') {
        this.updatePotAndBet();
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
 *
 */
Game.prototype.updatePotAndBet = function(){
    this.gatherBets();
    this.managePots();
    this.unsetBetForRound();
}


/**
 * Function to set Value for Bet For Round to 0.
 */
Game.prototype.unsetBetForRound = function(){
    for(var i =0 ; i < this.players.length; i++){
        if(this.players[i]){
            this.players[i].betForRound = 0;
        }
    }
}



/**
 * Checks if ready to next round
 * If yes, starts the next round
 */
Game.prototype.checkForNextRound = function() {
    if(this.checkPlayerLeft() < 2){
        this.showdown();
    }
    else{
        if (this.isEndRound()) {
            this.logd('begin next round');
            this.nextRound();
        } else {
            this.logd('cannot begin next round');
        }
    }   
};



/**
 * Starts the 'flop' Round
 */
Game.prototype.flop = function() {
    this.logd('========== Round FLOP ==========');
    this.round = 'flop';
    // deal three cards in board
    this.communityCards[0] = this.deck.drawCard();
    this.communityCards[1] = this.deck.drawCard();
    this.communityCards[2] = this.deck.drawCard();
    // begin betting
    this.logd('Community cards : ' + this.communityCards[0] + ', ' + this.communityCards[1] + ', ' + this.communityCards[2]);
    // other players must act
    this.requestPlayerAction();
};



/**
 * Starts the 'turn' Round
 */
Game.prototype.turn = function() {
    this.logd('========== Round TURN ==========');
    this.round = 'turn';
    // deal fourth card
    this.communityCards[3] = this.deck.drawCard();
    // begin betting
    this.logd('Community cards : ' + this.communityCards[0] + ', ' + this.communityCards[1] + ', ' + this.communityCards[2] + ', ' + this.communityCards[3]);
    // other players must act
    this.requestPlayerAction();
};



/**
 * Starts the 'river' Round
 */
Game.prototype.river = function() {
    this.logd('========== Round RIVER ==========');
    this.round = 'river';
    // deal fifth card
    this.communityCards[4] = this.deck.drawCard();
    // begin betting
    this.logd('Community cards : ' + this.communityCards[0] + ', ' + this.communityCards[1] + ', ' + this.communityCards[2] + ', ' + this.communityCards[3] + ', '  + this.communityCards[4]);
    // other players must act
    this.requestPlayerAction();
};



/**
 * Starts the 'showdown' Round
 */
Game.prototype.showdown = function() {
    this.logd('====================== SHOWDOWN ======================');
    this.round = 'showdown';

    if(this.checkPlayerLeft()  <  2){
        if(this.checkPlayerLeft() == 0){
            this.logd("All Have Folded or left Game No one won");
        }
        else{
            for(var i = 0; i <this.players.length; i++ ){
                if(this.players[i] && this.players[i].hasDone == false && this.players[i].idleForHand == false){
                    if(this.players[i].autoMuck==true){
                        this.logd("Player " + this.players[i].name + " has won the game.");
                    }
                    else{
                        this.logd("Player  " + this.players[i].name+ " has won with cards " + JSON.stringify(this.players[i].cards));  
                    }
                }
            }
        }
    }
    else{
        //Sorting all the players card accordingly
        this.logd('====================== Results ======================');

        if(this.gameType == "holdem"){
            var evalHands = evaluator.sortByRankHoldem(this.communityCards, this.players);
            for(var i = 0; i < evalHands.length; i++){
                this.logd("Player  " + evalHands[i].playerInfo + " has rank " + evalHands[i].hand.value + " card type " + evalHands[i].hand.handName);
            }
            var ranks = evaluator.resultsAfterRank(evalHands);
            for(var i = 0; i < ranks.length; i++ ){
                this.logd("*********" + JSON.stringify(ranks[i]) + '\n');
            }
        }
        else if(this.gameType == "omaha"){
            var evalHands = evaluator.sortByRankOmaha(this.communityCards, this.players);
            for(var i = 0; i < evalHands.length; i++){
                this.logd("Player  " + evalHands[i].playerInfo + " has rank " + evalHands[i].hand.value + " card type " + evalHands[i].hand.handName);
            }
            var ranks = evaluator.resultsAfterRank(evalHands);
            for(var i = 0; i < ranks.length; i++ ){
                this.logd("*********" + JSON.stringify(ranks[i]) + '\n');
            }
        }
    }

    this.rakeForGame();
    this.winnersPerPot(ranks);
    //this.logd( "VISHal" + JSON.stringify(this.gamePots));
    this.handOverPot();
    this.showCard();

    this.currentGameState();
    this.callGameOver();
    //this.reset();
    setTimeout(this.startNewGame(), 1000);
};



/**
 * Call Game Over With the Given Params
        { 
            earnings : [{
                id: 1,
                amount: 10
            }, {
                id: 17,
                amount: -60
            }],
            rakeEarning: 10,
            gameState:  this(raw object)
        }
 */
Game.prototype.callGameOver = function(){
    var gameOverParams = {};
    gameOverParams.gameState = this.getRawObject();
    gameOverParams.rakeEarning = this.rakeEarning;
    gameOverParams.earnings = this.gameEarnings();
    if(debugGameFlow)
        gameService.gameOver(gameOverParams);
}



/**
 * Calculate Game Earning at the end of the Game
 */
Game.prototype.gameEarnings = function(){
    this.logd("calculating the earnings");
    var earnings = []
    for(var i = 0; i < this.players.length; i++){
        if(this.players[i] && this.players[i].idleForHand == false){
            var p = {}
            p.id = this.players[i].id;
            p.amount =  this.players[i].bet * (-1);
            earnings.push(p);
        }
    }
    for(var i =0; i < this.gamePots.length; i++ ){
        if(this.gamePots[i].winners.length == 1){
            this.rakeEarning += this.gamePots[i].rakeMoney;
            for(var j = 0; j < this.players.length; j++){
                if(this.players[j] && this.players[j].id == this.gamePots[i].winners[0]){
                    for(var k = 0; k < earnings.length; k++ ){
                        if(earnings[k].id == this.players[j].id){
                            earnings[k].amount += (this.gamePots[i].amount -  this.gamePots[i].rakeMoney);
                        }
                    }
                }
            }
        }
        else{
            var noOfWinners = this.gamePots[i].winners.length;
            var amountPerWinner = this.gamePots[i].amount / noOfWinners;
            for(var j = 0; j < this.players.length; j++){
                if(this.players[j] && this.gamePots[i].winners.indexOf(this.players[j].id) != -1){
                   for(var k = 0; k < earnings.length; k++ ){
                        if(earnings[k].id == this.players[j].id){
                            earnings[k].amount += amountPerWinner;
                        }
                    }
                    noOfWinners--;
                }
            }
            if(noOfWinners != 0 ){
                this.logd("Something went wrong while calculating the earnings");
            }
        }
    }
    return earnings;
}



/**
 * Start A new Game when the game Ends
 */
Game.prototype.startNewGame = function(){
    var newGame = new Game(this);
    newGame.reset();
    if(debugGameFlow)
        gameService.startGame(newGame);
}



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
    this.logd("Total Pot : " + this.totalPot)
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
    // this.players[this.turnPos] = new Player(this.players[this.turnPos]);
    // this.players[this.turnPos].game = this;
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
    if(this.gameType == "holdem"){
        this.maxRaise = this.getCurrentPlayer().chips;
    }
    else if(this.gameType == "omaha"){
        if(this.lastRaise == 0){
            this.maxRaise = this.currentPot + 2 * this.bigBlind;
        }
        else{
            this.maxRaise = this.currentPot + 2 * this.getCurrentPlayer().getCallOrCheck();
        }

        if(this.getCurrentPlayer().chips  <  this.maxRaise){
            this.maxRaise = this.getCurrentPlayer().chips;
        }
    }
    return this.maxRaise;
}



/**
 * Deciding Winner for every Pot and Transfering Money to Wineer
 */
Game.prototype.winnersPerPot = function (ranks){
    if(this.checkPlayerLeft() < 2 ){
        for(var i= 0; i< this.players.length; i++){
            if(this.players[i] && this.players[i].idleForHand ==  false && this.players[i].hasDone == false){
                for(var j= 0; j < this.gamePots.length; j++){
                    this.gamePots[j].winners = [];
                    this.gamePots[j].winners.push ( this.players[i].id ); 
                }
            }
        }
    }
    else{
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
}



/**
 * Handover pots to whoever is the winner
 */
Game.prototype.handOverPot = function(){
    this.logd("Handing over the pot to the winners");
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
                this.logd("Something went wrong while handing over the pot money");
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
                if(this.players[k] && this.players[k].id == this.gamePots[i].winners[j]){
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
    this.logd("Chossing the dealer postions ");
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
    if(this.checkPlayerLeft() <  2){
        //Decide Whether the rake money has to be calculated or to be not calc.
    }
    else {
        for(var i = 0; i <this.gamePots.length; i++ ){
            if( this.gamePots[i].stakeHolders.length <= this.rakeY ){
                this.gamePots[i].rakeMoney = (this.gamePots[i].amount * this.rakeX) / 100;
            }
            else{
                this.gamePots[i].rakeMoney = (this.gamePots[i].amount * this.rakeZ) / 100;
            }
        }
    }
}



/**
 * Check if Only one Player left then end the Game.
 */
Game.prototype.checkPlayerLeft = function(){
    var totalPlaying = 0;
    for(var i = 0; i <this.players.length; i++ ){
        if(this.players[i] && this.players[i].hasDone == false && this.players[i].idleForHand == false){
            totalPlaying++;
        }
    }
    return totalPlaying;
}




/**
 * Intialiase all players
 */
Game.prototype.reloadAllPlayers = function(){
    for(var i = 0; i<this.players.length; i++){
        if(this.players[i]){
            this.players[i] = new Player(this.players[i]);
            this.players[i].game = this;
        }
    }
}



/**
 * Raw Object to be called by the GameServie
 */
Game.prototype.getRawObject = function() {
    this.players.forEach(function(player) {
        if(player) {
            delete player.game;
        }
    })
    return this;
}