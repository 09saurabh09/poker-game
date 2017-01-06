"use strict";


var PokerEvaluator = require('poker-evaluator');

module.exports = Evaluator;

Evaluator.prototype.sortByRank = function(hands, players){
	var evalHands = [];

    for (i=0; i<hands.length; i++) {
    	var playerHand = {};
    	playerHand.player = players[i];
    	playerHand.hand = PokerEvaluator.evalHand(hands[i])
        evalHands.push(playerHand);
    }

    evalHands.sort(function(a,b){
		if(a.playerHand.val > b.playerHand.val)
			return 0;
		return 1;
	});

	return evalHands;
}