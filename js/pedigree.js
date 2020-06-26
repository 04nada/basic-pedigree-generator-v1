$(document).ready(function() {
	clearSVG();
	resetTextDivs();
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
	
	console.clear();
	
	// keep generating new pedigrees until a sizable and solvable one is obtained
	while (true) {
		clearSVG();
		resetTextDivs();
		
		ped1 = new Pedigree(activeTrait);
		pedGF = ped1.Family.Grandfather;
		pedGM = ped1.Family.Grandmother;

		ped1.layoutFamily(pedGF);

		if ((ped1.isContainableInSVG()) && (ped1.isSolvable()) && (ped1.Family.Generations[2].length > 0))
			break;
	}
	
	id_textDiv.style.visibility = "visible";
	
	console.log("by Generation: ");
	console.log(ped1.Family.Generations);
	
	console.log("by Genotype: ");
	console.log(ped1.Family.MembersBySolvableGenotype);
	
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

//--- -----

const id_textDiv = document.getElementById("id-textDiv");

const id_traitExpressionForm = document.getElementById("id-traitExpressionForm");
const id_traitExpressionOutput = document.getElementById("id-traitExpressionOutput");

//---

function resetTextDivs() {
	id_traitExpressionOutput.innerHTML = "";
	
	id_textDiv.style.visibility = "hidden";
}

//---

function submitTraitExpression() {
	var submit_expression = id_traitExpressionForm.elements["name-traitExpression"];
	
	if (submit_expression.value === ped1.ActiveTrait.Expression) {
		id_traitExpressionOutput.innerHTML = "Correct: " + ped1.ActiveTrait.TraitName + " is " + ped1.ActiveTrait.Expression + ".";
	} else {
		id_traitExpressionOutput.innerHTML = "Wrong: " + ped1.ActiveTrait.TraitName + " is " + ped1.ActiveTrait.Expression + ".";
	}
	
	return false;
}