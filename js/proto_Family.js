//--- ----- Generating a Family

var PedigreeIDOptions = [];

function Family() {
	//--- "Adam and Eve"
	
	PedigreeIDOptions = [];

	this.Grandfather = new Person(1, "male");
	this.Grandfather.assignRandomGenes();
	
	this.Grandmother = new Person(1, "female");
	this.Grandmother.assignRandomGenes();
	
	//--- Recursively Generating the Family Tree
	
	Person.marry(this.Grandfather, this.Grandmother);
	
	Person.haveChildren(this.Grandfather, this.Grandmother);
	
	for (let child of this.Grandfather.Children) {
		this.PRIV_continueFamily(child);
	}
	
	this.Members1 = this.Grandfather.getSubfamily_DF(true);
	this.Members2 = this.Grandfather.getSubfamily_DF(false);
	
	//--- Placing the Family in arrays by Generation
	
	this.Generations = [];

	for (let i = 0; i < MAX_GENERATION; i++)
		this.Generations[i] = [];
	
	for (let familyMember of this.Members1) {
		let fmGeneration = familyMember.Generation;
		
		// set Pedigree ID for labelling purposes (I-1)
		let temp = this.Generations[fmGeneration - 1].length + 1;
		familyMember.PedigreeID = (fmGeneration.toRomanNumerals() + "-" + temp);
		
		if (temp > PedigreeIDOptions.length){
			PedigreeIDOptions.push(temp);
		}
		
		this.Generations[fmGeneration - 1].push(familyMember);
	}
	
	//--- Placing the Family in arrays by solvable Genotype
	
	this.MembersBySolvableGenotype = {
		Unknown: [],
		Heterozygous: [],
		Recessive: []
	};
}

//recursive magic
Family.prototype.PRIV_continueFamily = function(person) {
	if (person.Generation <= MAX_GENERATION) {
		var personIsMarried = person.tryToMarry();
		
		if (personIsMarried) {
			Person.haveChildren(person, person.Partner);
			
			for (let child of person.Children) {
				this.PRIV_continueFamily(child);
			}
		}
	}
}

//--- -----

Family.prototype.getRandomMember = function(withPartners) {
	var memberArray = (withPartners) ? this.Members1 : this.Members2;
	var randomIndex = getRandomInteger(0, memberArray.length-1);
		
	return memberArray[randomIndex];
}