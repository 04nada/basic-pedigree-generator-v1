$(document).ready(function() {
	
});

//--- -----

const eyeColor = new AutosomalTrait("Blue eye color", 'B', 'b', "brown eyes", "blue eyes", "recessive");
eyeColor.setDescription(
	"lorem ipsum dolor sit amet"
);

const widowsPeak = new AutosomalTrait("Widow's peak", 'W', 'w', "widow's peak present", "widow's peak absent", "dominant");
widowsPeak.setDescription(
	"describe here"
);

const tritanopia = new AutosomalTrait("Tritanopia", "T", "t", "blue-yellow colorblind", "not colorblind", "dominant");
tritanopia.setDescription(
	"blue-yellow colorblindness"
);

//---

const id_traitName = document.getElementById("id-traitName");
const id_dominantTrait = document.getElementById("id-dominantTrait");
const id_recessiveTrait = document.getElementById("id-recessiveTrait");

//---

var activeTraitName, activeTrait, activePhenotype;
var ped1, pedGF, pedGM;

function generatePedigree() {
	activeTraitName = Object.keys(DefinedAutosomalTraits).getRandomElement();
	activeTrait = DefinedAutosomalTraits[activeTraitName];
	
	//---
		
	// keep generating new pedigrees until a sizable and solvable one is obtained
	while (true) {
		clearSVG();
		
		ped1 = new Pedigree(activeTrait);
		pedGF = ped1.Family.Grandfather;
		pedGM = ped1.Family.Grandmother;

		ped1.layoutFamily(pedGF);

		if (ped1.isContainableInSVG())
			break;
	}
	
	console.log(ped1.Family.Generations);
	
	//---
	
	id_traitName.innerHTML = "Trait: " + activeTraitName;
	
	id_dominantTrait.innerHTML = "Dominant: " + activeTrait.DominantPhenotype;
	id_recessiveTrait.innerHTML = "Recessive: " + activeTrait.RecessivePhenotype;
}

function clearSVG() {
	while (id_pedigreeSVG.firstChild) {
		id_pedigreeSVG.removeChild(id_pedigreeSVG.firstChild);
	}
}