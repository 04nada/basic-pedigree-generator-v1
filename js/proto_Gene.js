var DefinedAutosomalTraits = {};

function defineAutosomalTrait(trait, dominantAllele, recessiveAllele) {
	
	if (dominantAllele == recessiveAllele) {
		logError("defineAutosomalTrait", "Dominant allele cannot be the same as recessive allele.");
	} else {
		var autosomalTrait = {
			Dominance: "complete dominance",
			
			DominantAllele: dominantAllele,
			RecessiveAllele: recessiveAllele
		}
		
		DefinedAutosomalTraits[[trait]] = autosomalTrait;
	}
}

function generateRandomGene(definedTrait) {
	if (!(definedTrait in DefinedAutosomalTraits)) {
		logError("generateRandomAllele()", "Cannot generate genes for undefined trait.");
	} else {
		var D = DefinedAutosomalTraits[definedTrait].DominantAllele;
		var R = DefinedAutosomalTraits[definedTrait].RecessiveAllele;
		
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
}

// prototype coming soon

function DefinedAutosomalTrait() {
	this.Dominance = "complete dominance";
	this.Expression = ""; // dominant or recessive

	this.DominantAllele = "";
	this.RecessiveAllele = "";
	
	this.Phenotypes = {
		HomozygousDominant: "",
		Heterozygous: "",
		HomozygousRecessive: ""
	}
}
