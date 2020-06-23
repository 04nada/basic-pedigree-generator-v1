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

Number.prototype.toRomanNumerals = function() {
	var romanNumeral = "";
	var arabicNumeral = this;
	
	var lookupAR = {
		"01000": "M",
		"0900": "CM",
		"0500": "D",
		"0400": "CD",
		"0100": "C",
		"090": "XC",
		"050": "L",
		"040": "XL",
		"010": "X",
		"09": "IX",
		"05": "V",
		"04": "IV",
		"01": "I"
	}
		
	while (arabicNumeral !== 0) {
		for (let a in lookupAR) {
			let a2 = parseInt(a);
			
			if (a2 <= arabicNumeral) {
				romanNumeral += lookupAR[a];
				arabicNumeral -= a2;
				break;
			}	
		}
	}
	
	return romanNumeral;
}

//--- ----- Arrays

Array.prototype.getElementFromLast = function(i) {
	var arrayLength = this.length;
	
	return this[arrayLength-1 - i];
}

Array.prototype.getRandomElement = function() {
	var arrayLength = this.length;
	var randomIndex = getRandomInteger(0, arrayLength-1);
	
	return this[randomIndex];
}

//--- ----- CSS

HTMLDocument.prototype.getCSSPropertyById = function(id, property) {
	return window.getComputedStyle(document.getElementById(id), null).getPropertyValue(property);
}

//--- ----- Console Logging

function logError(source, message) {
	console.log("<" + source + "> ERROR: " + message);
}

function logDebug(source, message) {
	console.log("<" + source + "> DEBUG: " + message);
}