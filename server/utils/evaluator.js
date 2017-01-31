"use strict";

var PokerEvaluator = require('poker-evaluator');


/**
 * To sort By rank in HoldemGame
 * Require community card and players details who Played the game
 */
function sortByRankHoldem(communityCards, players){
	var evalHands = [];

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
            playerHand.playerInfo = players[i].name;
            playerHand.cards = hand;
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

	return evalHands;
}



/**
 * To sort By rank in Omaha
 * Require community card and players details who Played the game
 */
function sortByRankOmaha(communityCards, players){
    var evalHands = [];

    for (var i = 0; i < players.length ; i++ ) {
        var playerHand = {};
        var hand = [];
        if(players[i]){
            var playerBestCard = bestHandInOmaha(communityCards, players[i]);
            playerHand.playerInfo = players[i].name;
            playerHand.cards = playerBestCard.cards;
            playerHand.hand = playerBestCard.hand;
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
    return evalHands;
}



/**
 * To find the best hand for the Player by including one of his two cards.
 * Require community card and player detail.
 */
function bestHandInOmaha(communityCards, player){
    var evalHands = [];
    for(var i = 0; i < 3; i++ ){
        for(var j = i + 1; j < 4 ; j++ ){
            var playerHand = {}
            var hand=[];
            hand.push(
                player.cards[i],
                player.cards[j],
                communityCards[0],
                communityCards[1],
                communityCards[2],
                communityCards[3],
                communityCards[4]
            );
            playerHand.cards = hand;
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
    return evalHands;
}



/**
 *  In case of Draw and all the cards with the same ranks clubbed together
 */
function resultsAfterRank(evalHands){
    var ranks = [];
    ranks.push([evalHands[0]]);
    var rank = 0;
    for(var i = 1; i <evalHands.length; i++ ){
        if(evalHands[i].hand.value == evalHands[i-1].hand.value ){
            ranks[rank].push(evalHands[i]);
        }
        else {
            rank++;
            ranks.push([evalHands[i]]);
        }
    }
    return ranks;
}



/**
 * Exporting all the function
 */
module.exports = {
    sortByRankHoldem : sortByRankHoldem,
    sortByRankOmaha : sortByRankOmaha,
    resultsAfterRank: resultsAfterRank
};

