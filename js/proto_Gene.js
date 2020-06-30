/*
function Gene(trait, allele1, allele2) {
	if (this.Alleles.toLowerCase() !== (this.Trait.RecessiveAllele + this.Trait.RecessiveAllele)) {
		logError("Gene()", "Alleles for the gene are invalid.");
	} else {
		this.Trait = trait;
		this.Alleles = [allele1, allele2];
		
		if (this.Alleles.toUpperCase() === this.Alleles) {
			this.Zygosity = "homozygous dominant";
			this.Phenotype = this.Trait.DominantPhenotype;
		} else if (this.Alleles.toLowerCase() === this.Alleles) {
			this.Zygosity = "homozygous recessive";
			this.Phenotype = this.Trait.RecessivePhenotype;
		} else {
			this.Zygosity = "heterozygous";
			this.Phenotype = this.Trait.DominantPhenotype;
		}
	}
}
*/

/*
	may be used in the future

	to simplify all references to AutosomalTrait and gene functions,
	and to (possibly) add SexLinkedTrait in the future
	
	every single "FromGene" function in AutosomalTrait would be transferred and implemented here
*/