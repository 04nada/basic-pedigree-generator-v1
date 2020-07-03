var DefinedAutosomalTraits = {};

//---

function AutosomalTrait(traitName, char_dominantAllele, char_recessiveAllele, dominantPhenotype, recessivePhenotype, expression) {
	if (char_dominantAllele.charCodeAt(0) < 65 || char_dominantAllele.charCodeAt(0) > 90) {
		logError("AutosomalTrait()", "Dominant allele must be a single uppercase letter.");
	} else if (char_recessiveAllele.charCodeAt(0) < 97 || char_recessiveAllele.charCodeAt(0) > 122) {
		logError("AutosomalTrait()", "Recessive allele must be a single lowercase letter.");
	} else if (char_dominantAllele.toLowerCase() !== char_recessiveAllele) {
		logError("AutosomalTrait()", "Dominant allele and recessive allele must represent the same letter.");
	} else {
		this.TraitName = traitName;
		
		this.DominantAllele = char_dominantAllele;
		this.RecessiveAllele = char_recessiveAllele;
		this.DominantPhenotype = dominantPhenotype;
		this.RecessivePhenotype = recessivePhenotype;
		
		this.Expression = expression;	
	
		this.Description = "";
		this.PrintablePhenotypes = {};
		
		DefinedAutosomalTraits[this.TraitName] = this;
	}
	
	return this;
}

AutosomalTrait.prototype.getActivePhenotype = function() {
	switch (this.Expression) {
		case "dominant":
			return this.DominantPhenotype;
		case "recessive":
			return this.RecessivePhenotype;
		default:
			logError("AutosomalTrait.pt.getActivePhenotype()", "Trait expression could not be read.");
	}
}

AutosomalTrait.prototype.setDescription = function(description) {
	this.Description = description;
}

AutosomalTrait.prototype.setPrintablePhenotypes = function(printableDominant, printableRecessive) {
	this.PrintablePhenotypes.Dominant = printableDominant;
	this.PrintablePhenotypes.Recessive = printableRecessive;
}

AutosomalTrait.prototype.PRIV_generateRandomGene = function() {
	var D = this.DominantAllele;
	var R = this.RecessiveAllele;
	
	var int_RD = getRandomInteger(0, 3);
		
	switch (int_RD) {
		case 0:
			return D+D;
		case 1:
		case 2:
			return D+R;
		case 3:
			return R+R;
	}
}

AutosomalTrait.prototype.getZygosityFromGene = function(gene) {
	if (gene.toLowerCase() !== (this.RecessiveAllele + this.RecessiveAllele)) {
		logError("AutosomalTrait.pt.getZygosityFromGene()", "Gene is invalid and cannot give a phenotype.");
	} else {
		if (gene.toUpperCase() === gene)
			return "homozygous dominant";
		else if (gene.toLowerCase() === gene)
			return "homozygous recessive";
		else
			return "heterozygous";
	}
}

AutosomalTrait.prototype.getPhenotypeFromGene = function(gene) {
	if (gene.toLowerCase() !== (this.RecessiveAllele + this.RecessiveAllele)) {
		logError("AutosomalTrait.pt.getPhenotypeFromGene()", "Gene is invalid and cannot give a phenotype.");
	} else {
		if (gene.toLowerCase() === gene)
			return this.RecessivePhenotype;
		else
			return this.DominantPhenotype;
	}	
}

AutosomalTrait.prototype.getPrintablePhenotypeFromGene = function(gene) {
		if (gene.toLowerCase() !== (this.RecessiveAllele + this.RecessiveAllele)) {
		logError("AutosomalTrait.pt.getPrintablePhenotypeFromGene()", "Gene is invalid and cannot give a phenotype.");
	} else {
		if (gene.toLowerCase() === gene)
			return this.PrintablePhenotypes.Recessive;
		else
			return this.PrintablePhenotypes.Dominant;
	}
}

//---

