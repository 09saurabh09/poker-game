/**
 * Created by Vishal Kumar
 */
 
"use strict";

let moment = require("moment");

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
    this.seat = options.seat;                       // Seat on Gmae

    this.game = null;

    this.firstCard = {};
    this.secondCard = {};
    this.bet = 0;

    this.lastAction = "";
    this.hasActed = false;              // acted for one round (call/check/raise)
    this.hasDone = false;               // finish acted for one game (fold/allin)
    this.hasSitOut = false;             // Whether the persone is disconnected or not
    this.sitOutTime = 0;                // This will be a time stamp
    this.idleForHand = false;           // Used by Game Flow if a person join in between game
    this.connectionStatus = true;       // This is for checking whether the player is connected or not
    this.disconnectionTIme = 0;         // TIme since the person has been Disconnected
    this.autoMuck = true;               // Default True for the every Player 
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
    this.addBet(diff);

    if (diff > 0) {
        this.lastAction = "call";
        logd('Player ' + this.name + ' CALL : ' + diff);
    } else {
        this.lastAction = "check";
        logd('Player ' + this.name + ' CHECK');
    }
    this.moveNext();
};



/**
 * Raise your bet
 * If your bet is not the same with highest bet
 * Add to your bet altogether with difference
 * @param amount
 */
Player.prototype.raise = function(amount) {
    this.lastAction = "raise";

    var diff = this.game.getHighestBet() - this.bet;
    this.addBet(diff + amount);

    logd('Player ' + this.name + ' Raises : ' + (diff + amount));

    this.game.requestPlayerAction(); // other players must act
    this.hasActed = true;
    this.moveNext();
};



/**
 * Resets the player state
 */
Player.prototype.reset = function() {
    this.firstCard = {};
    this.secondCard = {};
    this.bet = 0;

    this.lastAction = "";
    this.hasActed = false;
    this.hasDone = false;

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



Player.prototype.leaveGame = function(){
    //saurabhk -- To Do 
    //When this leave game for player is being called need to do all the transactions back to the DB.
    // Adding money back to the user 
    // Removing Player from the game
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

    }
    else{
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
}



/**
 *
 */
Player.prototype.turnOffAutoMuck = function(){
    this.autoMuck = false;
}



/**
 *
 */
Player.prototype.turnOnAutoMuck = function(){
    this.autoMuck = true;
}





