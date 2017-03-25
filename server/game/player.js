/**
 * Created by Vishal Kumar
 */
 
"use strict";

var moment = require("moment");
var debugGameFlow = true;

if(debugGameFlow)
    var gameService = require("./gameService");

module.exports = Player;

var debug = true;
function logd(message) {
    if (debug) {
        console.log(message);
    }
}


/**
 * Player State and value 
 */
function Player(options) {
    this.id = options.id;
    this.name = options.name;
    this.chips = options.chips;
    this.isMaintainChips = options.isMaintainChips; // Thyis should be intialised with the game boolean value
    this.maintainChips = options.chips;             // The value to which we need to maintain stack
    this.seat = options.seat;                       // Seat on Game
    this.sessionKey = options.sessionKey;

    this.game = options.game || null;

    this.cards = options.cards || [];
    this.bet = options.bet || 0;
    this.totalBet = options.totalBet || 0;
    this.betForRound = options.betForRound || 0;
    this.showCards = options.showCards || false;

    this.lastAction =options.lastAction || "";
    this.hasActed = options.hasActed || false;              // acted for one round (call/check/raise)
    this.hasDone = options.hasDone || false;               // finish acted for one game (fold/allin)
    this.hasSitOut = options.hasSitOut || false;             // Whether the persone is disconnected or not
    this.sitOutTime = options.sitOutTime || 0;                // This will be a time stamp
    this.idleForHand = options.idleForHand || false;           // Used by Game Flow if a person join in between game
    this.connectionStatus = options.connectionStatus || true;       // This is for checking whether the player is connected or not
    this.disconnectionTIme = options.disconnectionTIme || 0;         // TIme since the person has been Disconnected
    this.autoMuck = options.disconnectionTIme || true;               // Default True for the every Player 
    this.timeBank = options.timeBank || 0;                          //To store the TimeBank for a player
    this.expCallValue = options.expCallValue || 0;              //Expected Call Value
}


/**
 * Folds the game
 */
Player.prototype.fold = function() {
    logd('Player ' + this.name + ' FOLD');

    this.lastAction = "fold";
    this.hasDone = true;

    this.moveNext();
};


/**
 * Puts all your chips to your bet
 */
Player.prototype.allin = function() {
    logd('Player ' + this.name + ' ALL-IN : ' + this.chips);

    this.lastAction = "allin";
    this.hasDone = true;

    this.addBet(this.chips);
    this.moveNext();
};



/**
 * Adds some chips to your bet
 * So that your bet is equal
 * With the highest bet in the table
 * If highest bet is 0, will do nothing
 */
Player.prototype.callOrCheck = function() {
    this.hasActed = true;

    var diff = this.game.getHighestBet() - this.bet;

    if(diff >= this.chips){
        this.allin();
    } else {
        this.addBet(diff);
        if (diff > 0) {
            this.lastAction = "call";
            logd('Player ' + this.name + ' CALL : ' + diff);
        } else {
            this.lastAction = "check";
            logd('Player ' + this.name + ' CHECK');
        }
        this.moveNext();
    }
};



/**
 * Get the Value of call for the player
 */
Player.prototype.getCallOrCheck = function(){
    var diff = this.game.getHighestBet() - this.bet;
    return diff;
};



/**
 * When the user cannot move its turn in given time 
 * then do the best call whatever is possible.
 */
Player.prototype.doBestCall = function(){
    //this.sitOut();
    this.timeBank = 0;
    if(this.getCallOrCheck() == 0){
        this.callOrCheck();
    } else{
        this.fold();
    }
}



/**
 * Raise your bet
 * If your bet is not the same with highest bet
 * Add to your bet altogether with difference
 * @param amount
 */
Player.prototype.raise = function(amount) {
    this.lastAction = "raise";

    var diff = amount - this.bet;

    this.game.updateLastRaise(amount - this.game.getHighestBet());

    if(diff >= this.chips){
        this.allin();
    } else {
        this.addBet(diff);
        logd('Player ' + this.name + ' Raises To : ' + amount + "raise Amount" + diff );
        this.game.requestPlayerAction(); // other players must act
        this.hasActed = true;
        this.moveNext();
    }
};



/**
 * Resets the player state
 */
Player.prototype.reset = function() {
    this.cards = [];
    this.bet = 0;
    this.totalBet = 0;
    this.betForRound = 0;

    this.lastAction = "";
    this.hasActed = false;
    this.hasDone = false;
    this.showCards = false;

    if(this.isMaintainChips){
        this.maintainChipsStack();
    }

    //At Every time need to check whether the Player have money greater than a given value
    //Need to update the sitouttime. and check whether its greater than a greater value.
};



/**
 * Removes player's chip
 * Adds them to player's bet
 * @param amount
 */
Player.prototype.addBet = function(amount) {
    if (this.chips < amount) {
        return "error - not enough chips";
    }
    this.chips -= amount;
    this.bet += amount;
    this.game.currentPot += amount;
    this.betForRound += amount;
};



Player.prototype.moveNext = function(){
    this.game.incrementPlayerTurn();
    this.game.checkForNextRound();
}



/**
 * When Players what to do sit Out at any Point of time
 */
Player.prototype.sitOut = function(){
    this.hasSitOut = true;
    this.sitOutTime = moment();
}



/**
 * When Players waht to sit back In.
 */
Player.prototype.sitIn = function(){
    this.hasSitOut = false;
    this.sitOutTime = 0;
}


/**
 * When Player will leave Game
 */
Player.prototype.leaveGame = function(){
    var params = {
        id:17,
        chips: 500 
    }
    if(debugGameFlow)
        gameService.leaveGame(params);
}



/**
 * Adding more mondey to the game 
 * Gave over berfore hand
 */
Player.prototype.addChips = function(amount){
    //To Do
    //saurabnK Here to Cut money from the account transactions
    this.chips += amount; 
}



/**
 * Maintaining the chips stack after every game
 */
Player.prototype.maintainChipsStack = function(){
    var stackDifference = this.maintainChips - this.chips;
    if( stackDifference > 0 ){
        this.addChips(stackDifference); 
    }
}



/**
 * setMaintainChips Changing the value and making it true
 */
Player.prototype.setMaintainChips = function(amount){
    this.isMaintainChips = true;
    if(amount > this.game.minAmount && amount < this.game.maxAmount && amount >= this.chips ){
        logd("For Player "+this.player.name +" maintainStack Changed " + amount);
        this.maintainChips = amount;

    } else{
        logd("For Player "+this.player.name +" requested maintainStack cannot be changed " + amount );
    }
}



/**
 * Removing the Maintain Stack Features
 */
Player.prototype.unSetMaintainChips = function(){
   this.isMaintainChips = false;
}



/**
 * To be called when Player got Disconnected 
 */
Player.prototype.playerDisconnected = function(){
    this.connectionStatus = false;
    this.disconnectionTIme =moment();
}



/**
 * To be called when Player got Connected 
 */
Player.prototype.playerConnected = function(){
    this.connectionStatus = true;
    this.disconnectionTIme = 0;
}



/**
 * Player can turn off Auto Muck
 */
Player.prototype.turnOffAutoMuck = function(){
    this.autoMuck = false;
}


/**
 * Subtracting the time Bank Of Player 
 */
Player.prototype.subtractTimeBank = function(timeBankUsed){
    this.timeBank -= timeBankUsed;
}



/**
 * Player can turn on Auto Muck
 */
Player.prototype.turnOnAutoMuck = function(){
    this.autoMuck = true;
}