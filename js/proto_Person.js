//--- --- Global Constants

// chances of a Person getting married if a Partner is not specified
const GenerationalSoloMarriage = [
	1.00,
	0.70,
	0.30,
	0.00
]

// chances of a married couple having 0-3 Children, per Generation
const GenerationalFertility = [
	[0.00, 0.20, 0.40, 0.40],
	[0.15, 0.30, 0.30, 0.15],
	[0.30, 0.35, 0.35, 0.00],
	[1.00, 0.00, 0.00, 0.00]
];

// Generations go from 1 to 4
const MaxGeneration = 4;

//--- ----- Person prototype

function Person(generation = 1, sex = Person.generateRandomSex()) {
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
	
	//---
	
	this.AutosomalGenes = {};
	
	//---
	
	// can/will cause circular referencing
	this.Mother = undefined; // {}
	this.Father = undefined; // {}
	this.Partner = undefined; // {}
	this.Children = undefined; // [{}]
}

//--- Person 

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

//--- Person Gene functions

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

//--- Familial Growth (Marriage, Children)

Person.prototype.tryToMarry = function() {
	var chanceOfSoloMarrying = GenerationalSoloMarriage[this.Generation - 1];
		
	var choseToMarry = (getRandomValueByProbability({
		"married": chanceOfSoloMarrying,
		"unmarried": (1 - chanceOfSoloMarrying)
	}) == "married");
	
	if (choseToMarry) {
		let sexOfPartner = (this.Sex === "female") ? "male" : "female";
		
		var partner = new Person(this.Generation, sexOfPartner);
		partner.AutosomalGenes = Person.generateRandomGenes();
		
		Person.marry(this, partner);
		
		return true;
	} else {
		//logDebug("Person.prototype.tryToMarry()", "Solo person chose not to get married.");
		return false;
	}
}

Person.marry = function(person1, person2) {
	person1.Partner = person2;
	person2.Partner = person1;
}

Person.haveChildren = function(partner1, partner2) {
	if ((partner1.Partner !== partner2) || (partner2.Partner !== partner1)) {
		logError("Person.haveChildren()", "Persons chosen to have children are not partners.");
	} else if (partner1.Sex === partner2.Sex) {
		let numberOfChildren = 0;
		
		partner1.Children = [];
		partner2.Children = [];
		
		//console.log("Number of Children: " + numberOfChildren);
		
		return partner1.Children;
	} else {
		// The parents can have 0-3 children; later generations are less likely to have children
		var obj_randomNumberOfChildren = {};
	
		// this generates an object that pairs a number to its probability (e.g. {0: 0.35, 1: 0.30, 2: 0.20, 3: 0.15
		for (let i = 0; i <= 3; i++) {
			obj_randomNumberOfChildren[i.toString()] = GenerationalFertility[partner1.Generation-1][i];
		}
	
		let numberOfChildren = getRandomValueByProbability(obj_randomNumberOfChildren);
		
		//---
		
		partner1.Children = [];
		partner2.Children = [];
		
		for (let i = 0; i < numberOfChildren; i++) {
			Person.makeChild(partner1, partner2);
		}
		
		console.log("Generation: " + partner1.Generation);
		console.log("Number of Children: " + numberOfChildren);
		
		return partner1.Children;
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
		arr_genes[i] = "" + arr_parentAlleles1[i] + arr_parentAlleles2[i];
		arr_genes[i] = arr_genes[i].split("").sort().join("");
	}
	
	//--- Making the Child
	
	var child = new Person(person1.Generation+1, undefined);
	
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