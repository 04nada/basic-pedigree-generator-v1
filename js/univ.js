/* univ.js - universal JavaScript code for all webpages */

//--- ----- Numbers

function constrainInteger(integerToConstrain, minimum, maximum) {
	integerToConstrain = parseInt(integerToConstrain);
	
	if (minimum < maximum) {
		let temp = minimum;
		minimum = maximum;
		maximum = temp;
	}
	
	return Math.min(Math.max(integerToConstrain, minimum), maximum);
}

function getRandomInteger(lowerBound, upperBound) {
	var int_randomInteger = Math.floor((upperBound+1 - lowerBound) * Math.random()) + lowerBound;
	
	return int_randomInteger;
}

function getRandomValueByProbability(obj_probabilityTable) {
	//this will break unpredictably if total probability != 1
	
	var arr_values = Object.keys(obj_probabilityTable);
	var arr_probabilities = Object.values(obj_probabilityTable);
	var numberOfNumbers = arr_values.length;
	
	//---
	
	var lowerBound = 0;
	var upperBound = 0;
	var randomNumber = Math.random();

	for (let i = 0; i < numberOfNumbers; i++) {
		lowerBound = upperBound;
		upperBound += arr_probabilities[i];
				
		if ((randomNumber >= lowerBound) && (randomNumber < upperBound))
			return arr_values[i];
	}
	
	logError("getRandomValueByProbability()", "Random value failed to generate.");
}

//--- ----- Misc

function logError(source, message) {
	console.log("<" + source + "> ERROR: " + message);
}

function logDebug(source, message) {
	console.log("<" + source + "> DEBUG: " + message);
}