//--- ----- Person prototype

const GenerationalFertility = [
	[0.00, 0.20, 0.40, 0.40],
	[0.50, 0.30, 0.15, 0.05],
	[0.60, 0.20, 0.20, 0.00],
	[1.00, 0.00, 0.00, 0.00]
];


// default Person "constructor"
function Person() {
	this.AutosomalGenes = {};
	
	// can/will cause circular referencing
	this.Mother = undefined; // {}
	this.Father = undefined; // {}
	this.Partner = undefined; // {}
	this.Children = undefined; // [{}]
}

//--- Person "constructors" (since JS doesn't support multiple constructors)

Person.prototype.init1 = function(generation = 1, sex = Person.generateRandomSex()) {
	this.Generation = generation;
	
	//---
	
	this.Sex = sex;
	this.SexChromosomes = "";
		
	switch (this.Sex) {
		case "female":
			this.SexChromosomes = "XX";
			break;
		case "male":
			this.SexChromosomes = "XY";
			break;
		default:
			logError("Person.init()", "SexChromosomes failed to assign properly.");
			break;
	}
}

Person.generateRandomSex = function() {
	var int_MF = getRandomInteger(0, 1);
	
	if (int_MF == 1)
		return "female";
	else
		return "male";
}

Person.generateRandomGenes = function() {
	var autosomalGenes = {};
	
	for (let trait in DefinedAutosomalTraits) {
		autosomalGenes[trait] = generateRandomGene(trait);
	}
	
	return autosomalGenes;
}

//--- Person gene functions

Person.prototype.addAutosomalGene = function(definedTrait, gene) {
	if (!(definedTrait in DefinedAutosomalTraits)) {
		logError("addAutosomalGene()", "Cannot add gene for undefined trait.");
	} else {
		this.AutosomalGenes[definedTrait] = gene;
	}
}

Person.prototype.stringifyAutosomalGenes = function() {
	var arr_genes = Object.values(this.AutosomalGenes);
	
	return arr_genes.join("");
}

Person.prototype.getRandomAlleles = function() {
	var arr_genes = Object.values(this.AutosomalGenes);
	var arr_alleles = [];
	var numberOfGenes = arr_genes.length;
	
	for (let i = 0; i < numberOfGenes; i++) {
		let int_LR = getRandomInteger(0, 1);
		
		arr_alleles[i] = arr_genes[i].substr(int_LR, 1);
	}
	
	return arr_alleles;
}

//--- Familial Growth

Person.marry = function(partner1, partner2 = null) {
	if (partner2 == null) {
		let sexOfPartner2 = (partner1.Sex === "female") ? "male" : "female";
		
		partner2 = new Person();
		partner2.init1(partner1.Generation, sexOfPartner2);
		partner2.AutosomalGenes = Person.generateRandomGenes();
	}
	
	partner1.Partner = partner2;
	partner2.Partner = partner1;
}

Person.haveChildren = function(partner1, partner2) {
	if ((partner1.Partner != partner2) || (partner2.Partner == partner1)) {
		logError("Person.haveChildren()", "Persons chosen to have children are not partners.");
	} else {
		// The parents can have 0-3 children; later generations are less likely to have children
		var obj_randomNumberOfChildren = {};
	
		var fertilityConstant = partner1.Generation - 1; //index ranges from 0 to 3
	
		// this generates an object that pairs a number to its probability (e.g. {0: 0.35, 1: 0.30, 2: 0.20, 3: 0.15
		for (let i = 0; i <= 3; i++) {
			obj_randomNumberOfChildren[i.toString()] = GenerationalFertility[fertilityConstant][i];
		}
	
		var numberOfChildren = getRandomValueByProbability(obj_randomNumberOfChildren);
		
		//---
		
		partner1.Children = [];
		partner2.Children = [];
		
		for (let i = 0; i < numberOfChildren; i++) {
			Person.makeChild(partner1, partner2);
		}
		
		console.log("Number of Children: " + numberOfChildren);
	}
}

Person.makeChild = function(person1, person2) {
	var arr_parentAlleles1 = person1.getRandomAlleles();
	var arr_parentAlleles2 = person2.getRandomAlleles();
	
	//--- Choosing random inherited genes for the Child
	var arr_traits = Object.keys(DefinedAutosomalTraits);
	var arr_genes = [];
	var numberOfGenes = arr_traits.length;
	
	for (let i = 0; i < numberOfGenes; i++) {		
		arr_genes[i] = arr_parentAlleles1[i] + arr_parentAlleles2[i];
		arr_genes[i] = arr_genes[i].split("").sort().join("");
	}
	
	//--- Making the Child
	
	var child = new Person();
	child.init1(person1.Generation+1, undefined);
	
	// Adding randomly generated AutosomalGenes to child
	for (let i = 0; i < numberOfGenes; i++) {
		child.addAutosomalGene(arr_traits[i], arr_genes[i]);
	}
	
	// Assigning Mother and Father to child
	if (person1.Sex == "female") {
		child.Mother = person1;
		child.Father = person2;
	} else {
		child.Mother = person2;
		child.Father = person1;
	}
	
	// Assigning Child to both mother and father
	person1.Children.push(child);
	person2.Children.push(child);
	
	return child;
}