"use strict";

var PokerEvaluator = require('poker-evaluator');

function sortByRank(communityCards, players){
	var evalHands = [];

    //console.log("------------Evaluator---------");
    //console.log(JSON.stringify(communityCards));

    for (var i = 0; i < players.length ; i++ ) {
    	var playerHand = {};
        var hand = [];
        if(players[i]){
            hand.push(
                players[i].firstCard,
                players[i].secondCard,
                communityCards[0],
                communityCards[1],
                communityCards[2],
                communityCards[3],
                communityCards[4]
            );
            //console.log(hand);
            playerHand.player = players[i];
            playerHand.hand = PokerEvaluator.evalHand(hand);
            evalHands.push(playerHand);
        }
    }

    evalHands = evalHands.sort(function(a,b){
		if(a.hand.value > b.hand.value)
			return -1;
        else if (a.hand == b.hand)
            return 0;
		return 1;
	});

    for(var i = 0; i < evalHands.length; i++){
        console.log("Player  " + evalHands[i].player.name + " has rank " + evalHands[i].hand.value + " card type " + evalHands[i].hand.handName);
    }
	return evalHands;
}

module.exports = {
    sortByRank : sortByRank
};