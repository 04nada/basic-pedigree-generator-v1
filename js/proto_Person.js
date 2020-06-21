//--- --- Global Constants

// chances of a Person getting married if a Partner is not specified
const GENERATIONAL_SOLO_MARRIAGE = [
	1.00,
	0.90,
	0.30,
	0.00
]

// chances of a married couple having 0-3 Children, per Generation
const GENERATIONAL_FERTILITY = [
	[0.00, 0.20, 0.40, 0.40],
	[0.00, 0.30, 0.40, 0.30],
	[0.30, 0.35, 0.35, 0.00],
	[1.00, 0.00, 0.00, 0.00]
];

// Generations go from 1 to 4
const MAX_GENERATION = 4;

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
			logError("Person()", "Sex assigned was not recognized.");
			return;
	}
	
	//---
	
	this.AutosomalGenes = {};
	this.AutosomalPhenotypes = {};
	
	//---
	
	// can/will cause circular referencing
	this.Mother = (this.Generation === 1) ? null : undefined; // {}
	this.Father = (this.Generation === 1) ? null : undefined; // {}
	this.Partner = undefined; // {}
	this.Children = undefined; // [{}]
}

//--- Person constructor functions

Person.generateRandomSex = function() {
	var int_MF = getRandomInteger(0, 1);
	
	if (int_MF == 1)
		return "female";
	else
		return "male";
}

Person.prototype.assignRandomGenes = function() {
	var autosomalGenes = {};
	
	for (let traitName in DefinedAutosomalTraits) {
		let currentTrait = DefinedAutosomalTraits[traitName];
		
		autosomalGenes[traitName] = currentTrait.PRIV_generateRandomGene();
	}
	
	this.AutosomalGenes = autosomalGenes;
	
	this.PRIV_assignPhenotypes();
}

Person.prototype.PRIV_assignPhenotypes = function() {
	var autosomalPhenotypes = {};
	
	for (let traitName in DefinedAutosomalTraits) {
		let currentTrait = DefinedAutosomalTraits[traitName];
		let currentGene = this.AutosomalGenes[traitName]
		
		autosomalPhenotypes[traitName] = currentTrait.PRIV_getPhenotypeFromGene(currentGene);
	}
	
	this.AutosomalPhenotypes = autosomalPhenotypes;
}

//--- Person getter functions

// gets a subFamily consisting of a Person and all their descendants, including in-laws
Person.prototype.getSubfamily_DF = function() {
	var subfamily = [];
	
	subfamily.push(this);
	
	if (this.Partner != null) {
		subfamily.push(this.Partner);
	}
	
	subfamily.push(this.getAllDescendants_DF(true));
	subfamily = subfamily.flat(Infinity);
	
	return subfamily;
}

// (Depth-First Search) recursively gets all Children, (?) their Partners, and their Children's Descendants
Person.prototype.getAllDescendants_DF = function(withPartners) {
	if (this.Children == null) {
		return [];
	} else {
		var descendants = [];

		for (let i = 0; i < this.Children.length; i++) {
			child = this.Children[i];
			
			descendants.push(child);
			
			if ((child.Partner != null) && withPartners) {
				descendants.push(child.Partner);
			}
			
			descendants.push(child.getAllDescendants_DF(withPartners));
		}
		
		descendants = descendants.flat(Infinity);
		
		return descendants;
	}
}


//--- Person Gene functions

Person.prototype.PRIV_addAutosomalGene = function(traitName, gene) {
	if (!(traitName in DefinedAutosomalTraits)) {
		logError("Person.pt.PRIV_addAutosomalGene()", "Cannot add gene for undefined trait.");
	} else {
		this.AutosomalGenes[traitName] = gene;
	}
}

Person.prototype.getGenotypes = function() {
	var arr_genes = Object.values(this.AutosomalGenes);
	
	return arr_genes.join("");
}

Person.prototype.getPhenotype = function(traitName) {
	if (!(traitName in DefinedAutosomalTraits)) {
		logError("Person.pt.getPhenotype()", "Cannot add gene for undefined trait.");
	} else {
		var trait = DefinedAutosomalTraits[traitName];
		var gene = this.AutosomalGenes[traitName];
		
		return trait.PRIV_getPhenotypeFromGene(gene);
	}
}

//--- Familial Growth (Marriage)

Person.prototype.tryToMarry = function() {
	var chanceOfSoloMarrying = GENERATIONAL_SOLO_MARRIAGE[this.Generation - 1];
		
	var choseToMarry = (getRandomValueByProbability({
		"married": chanceOfSoloMarrying,
		"unmarried": (1 - chanceOfSoloMarrying)
	}) == "married");
	
	if (choseToMarry) {
		let sexOfPartner = (this.Sex === "female") ? "male" : "female";
		
		var partner = new Person(this.Generation, sexOfPartner);
		partner.assignRandomGenes();
		
		Person.marry(this, partner);
		
		return true;
	} else {
		//logDebug("Person.pt.tryToMarry()", "Solo person chose not to get married.");
		this.Partner = null;
		this.Children = null;
		//putangina nitong linya na to ilang oras kong di mahanap kung bakit ayaw gumana ng code
		
		return false;
	}
}

Person.marry = function(person1, person2) {
	if (person1.Generation !== person2.Generation) {
		logError("Person.marry()", "Persons from different generations cannot be married.");
	} else if (person1 === person2) {
		logError("Person.marry()", "Person cannot marry themselves.");
	} else {
		person1.Partner = person2;
		person2.Partner = person1;
	}
}

//--- Familial Growth (Children)

Person.haveChildren = function(partner1, partner2) {
	if ((partner1.Partner !== partner2) || (partner2.Partner !== partner1)) {
		logError("Person.haveChildren()", "Persons chosen to have children are not partners.");
	} else if (partner1.Sex === partner2.Sex) {
		let numberOfChildren = 0;
		
		partner1.Children = [];
		partner2.Children = [];
		
		//logDebug("Person.prototype.tryToMarry()", "Number of Children: " + numberOfChildren);
		
		return partner1.Children;
	} else {
		// The parents can have 0-3 children; later generations are less likely to have children
		var obj_randomNumberOfChildren = {};
	
		// this generates an object that pairs a number to its probability (e.g. {0: 0.35, 1: 0.30, 2: 0.20, 3: 0.15
		for (let i = 0; i <= 3; i++) {
			obj_randomNumberOfChildren[i.toString()] = GENERATIONAL_FERTILITY[partner1.Generation-1][i];
		}
	
		let numberOfChildren = getRandomValueByProbability(obj_randomNumberOfChildren);
		
		//---
		
		partner1.Children = [];
		partner2.Children = [];
		
		for (let i = 0; i < numberOfChildren; i++) {
			Person.PRIV_makeChild(partner1, partner2);
		}
		
		/*
		console.log("");
		console.log("Generation: " + partner1.Generation);
		console.log("Number of Children: " + numberOfChildren);
		console.log("");
		*/
		
		return partner1.Children;
	}
}

Person.prototype.PRIV_getRandomAlleles = function() {
	var arr_genes = Object.values(this.AutosomalGenes);
	var arr_alleles = [];
	var numberOfGenes = arr_genes.length;
	
	for (let i = 0; i < numberOfGenes; i++) {
		let int_LR = getRandomInteger(0, 1);
		
		arr_alleles[i] = arr_genes[i].substr(int_LR, 1);
	}
	
	return arr_alleles;
}

Person.PRIV_makeChild = function(person1, person2) {
	var arr_parentAlleles1 = person1.PRIV_getRandomAlleles();
	var arr_parentAlleles2 = person2.PRIV_getRandomAlleles();
	
	//--- Choosing random inherited genes for the Child
	
	var arr_traitnames = Object.keys(DefinedAutosomalTraits);
	var arr_genes = [];
	var numberOfGenes = arr_traitnames.length;
	
	for (let i = 0; i < numberOfGenes; i++) {		
		arr_genes[i] = "" + arr_parentAlleles1[i] + arr_parentAlleles2[i];
		arr_genes[i] = arr_genes[i].split("").sort().join("");
	}
	
	//--- Making the Child
	
	var child = new Person((person1.Generation+1), undefined);
	
	// Adding randomly generated AutosomalGenes to child
	for (let i = 0; i < numberOfGenes; i++) {
		child.PRIV_addAutosomalGene(arr_traitnames[i], arr_genes[i]);
	}
	
	child.PRIV_assignPhenotypes();
	
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