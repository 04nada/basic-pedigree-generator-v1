//--- ----- Person prototype (JS classes for the immersive object-oriented experience)

// default Person "constructor"
function Person() {
	this.AutosomalGenes = {};
}

//--- Person "constructors" (since JS doesn't support multiple constructors)

Person.prototype.init1 = function(sex = this.generateRandomSex()) {
	this.Sex = sex;
	this.SexChromosomes = "";
		
	switch (this.Sex) {
		case "male":
			this.SexChromosomes = "XY";
			break;
		case "female":
			this.SexChromosomes = "XX";
			break;
	}
}

//--- Person functions

Person.prototype.addAutosomalGene = function(geneName, gene) {
	this.AutosomalGenes[[geneName]] = gene;
}

Person.prototype.stringifyAutosomalGenes = function() {
	var arr_genes = Object.values(this.AutosomalGenes);
	
	return arr_genes.join("");
}

Person.prototype.generateRandomSex = function() {
	var int_MF = getRandomNumber(0, 1);
	
	if (int_MF == 1)
		return "female";
	else
		return "male";
}

Person.prototype.getRandomAlleles = function() {
	var arr_genes = Object.values(this.AutosomalGenes);
	var arr_alleles = [];
	var numberOfGenes = arr_genes.length;
	
	for (let i = 0; i < numberOfGenes; i++) {
		let int_LR = getRandomNumber(0, 1);
		
		arr_alleles.push(arr_genes[i].substr(int_LR, 1));
	}
	
	return arr_alleles;
}

//---

function makeChild(person1, person2) {
	var arr_parentAlleles1 = person1.getRandomAlleles();
	var arr_parentAlleles2 = person2.getRandomAlleles();
	var numberOfGenes = arr_parentAlleles1.length;
	
	//---
	
	var arr_geneNames = Object.keys(person1.AutosomalGenes);
	var arr_genes = [];
	
	for (let i = 0; i < numberOfGenes; i++) {		
		arr_genes[i] = arr_parentAlleles1[i] + arr_parentAlleles2[i];
		arr_genes[i] = arr_genes[i].split("").sort().join("");
	}
	
	//---
	
	var child = new Person();
	child.init1();
	
	for (let i = 0; i < numberOfGenes; i++) {
		child.addAutosomalGene(arr_geneNames[i], arr_genes[i]);
	}
	
	return child;
}

//---

function getRandomNumber(lowerBound, upperBound) {
	var int_randomNumber = Math.floor((upperBound+1 - lowerBound) * Math.random()) + lowerBound;
	
	return int_randomNumber;
}	