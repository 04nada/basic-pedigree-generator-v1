$(document).ready(function() {
	clearSVG();
	resetContent();
	
	id_pedigreeSVG.style.height = (2 * MAX_GENERATION * SYMBOL_LENGTH_px) + "px";
	
	alert(SYMBOL_LENGTH_px);
});

// resize SVG when device is rotated
window.addEventListener("orientationchange", function(){
	setTimeout(function() {
		SYMBOL_LENGTH_px = parseFloat(document.getCSSPropertyById("id-pedigreeSVG", "width")) / 28.0;
		
		id_pedigreeSVG.style.height = (2 * MAX_GENERATION * SYMBOL_LENGTH_px) + "px";
	}, 1000);
});

//--- ----- Autosomal Traits

const eyeColor = new AutosomalTrait("Blue eye color", 'B', 'b', "brown eyes", "blue eyes", "recessive");
eyeColor.setDescription(
	"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed " +
	"do eiusmod tempor incididunt ut labore et dolore magna aliqua. " + 
	"Ut enim ad minim veniam, quis nostrud exercitation ullamco " +
	"laboris nisi ut aliquip ex ea commodo consequat. "
);

const widowsPeak = new AutosomalTrait("Widow's peak", 'W', 'w', "widow's peak present", "widow's peak absent", "dominant");
widowsPeak.setDescription(
	"describe here"
);

const tritanopia = new AutosomalTrait("Tritanopia", "T", "t", "blue-yellow colorblind", "not colorblind", "dominant");
tritanopia.setDescription(
	"blue-yellow colorblindness"
);

//---  ----- HTML Elements by ID

const id_traitExpressionDiv = document.getElementById("id-traitExpressionDiv");
	const id_traitExpressionForm = document.getElementById("id-traitExpressionForm");
		const id_submitTraitExpression = document.getElementById("id-submitTraitExpression");
	const id_traitExpressionOutput = document.getElementById("id-traitExpressionOutput");

const id_traitAnalysisDiv = document.getElementById("id-traitAnalysisDiv");
	const id_traitInfo = document.getElementById("id-traitInfo");
		const id_traitName = document.getElementById("id-traitName");
		const id_dominantTrait = document.getElementById("id-dominantTrait");
		const id_recessiveTrait = document.getElementById("id-recessiveTrait");
		const id_traitDescription = document.getElementById("id-traitDescription");
	const id_traitAnalysisForm = document.getElementById("id-traitAnalysisForm");
		const id_question = document.getElementById("id-question");
		const id_nextQuestion = document.getElementById("id-nextQuestion");

//---

function clearSVG() {
	while (id_pedigreeSVG.firstChild) {
		id_pedigreeSVG.removeChild(id_pedigreeSVG.firstChild);
	}
}

function resetContent() {
	id_traitExpressionDiv.style.display = "none";
	
		id_traitExpressionOutput.innerHTML = "";
		id_traitExpressionOutput.style.display = "none";
	
	id_traitAnalysisDiv.style.display = "none";
		
		const submit_expression = id_traitExpressionForm.elements["name-traitExpression"];
		submit_expression.selectedIndex = 0;

		id_traitInfo.style.display = "none";
}

//--- ----- 

var activeTraitName, activeTrait;
var ped1, pedGF, pedGM;

function generatePedigree() {
	console.clear();
	resetContent();
	
	//--- Pedigree Generation
	
	// choose a random trait for the pedigree
	activeTraitName = Object.keys(DefinedAutosomalTraits).getRandomElement();
	activeTrait = DefinedAutosomalTraits[activeTraitName];
	
	// keep generating new pedigrees until a sizable and solvable one is obtained
	while (true) {
		clearSVG();

		ped1 = new Pedigree(activeTrait);
		pedGF = ped1.Family.Grandfather;
		pedGM = ped1.Family.Grandmother;

		ped1.layoutFamily(pedGF);

		if ((ped1.isContainableInSVG()) && (ped1.isSolvable()) && (ped1.Family.Generations[2].length > 0))
			break;
	}
	
	console.log("by Generation: ");
	console.log(ped1.Family.Generations);
	
	console.log("by Genotype: ");
	console.log(ped1.Family.MembersBySolvableGenotype);
	
	//--- Display HTML Divs
	
	id_traitExpressionDiv.style.display = "block";
	
		id_submitTraitExpression.disabled = false;
		id_submitTraitExpression.style.cursor = "pointer";
		
		for (let el of id_traitExpressionForm.getAllFormElements()) {
			el.disabled = false;
			el.style.cursor = "pointer";
		}
}

//--- -----

function submitTraitExpression() {
	for (let el of id_traitExpressionForm.getAllFormElements()) {
		el.disabled = true;
		el.style.cursor = "not-allowed";
	}
	
	//--- -----
	
	id_traitExpressionOutput.style.display = "block";
	
	//---
	
	const submit_expression = id_traitExpressionForm.elements["name-traitExpression"];
	
	if (submit_expression.value === ped1.ActiveTrait.Expression) {
		id_traitExpressionOutput.style.backgroundColor = "#BFB";
		id_traitExpressionOutput.innerHTML = "Correct: The trait is " + ped1.ActiveTrait.Expression + ".";
	} else {
		id_traitExpressionOutput.style.backgroundColor = "#FBB";
		id_traitExpressionOutput.innerHTML = "Incorrect: The trait is " + ped1.ActiveTrait.Expression + ".";
	}
	
	//--- ----- Display Trait Info
	
	id_traitAnalysisDiv.style.display = "block";
	
		id_traitInfo.style.display = "block";
	
	//---
	
	id_traitName.innerHTML = "Trait: " + activeTraitName;
	
	id_dominantTrait.innerHTML = "Dominant (" + activeTrait.DominantAllele + "): " + activeTrait.DominantPhenotype;
	id_recessiveTrait.innerHTML = "Recessive (" + activeTrait.RecessiveAllele + "): " + activeTrait.RecessivePhenotype;
	
	id_traitDescription.innerHTML = activeTrait.Description;
	
	//--- -----
	
	generateQuestion();
	
	return false;
}

//---

var questionType;

function generateQuestion() {
	id_traitAnalysisForm.reset();
	id_nextQuestion.style.display = "none";
	
	//---
	
	/*
		01 - 
		02 - given a specific PedigreeID, ask for genotype kind
		03 - given a specific PedigreeID, ask for genotype alleles
		04 - given a specific PedigreeID, ask for phenotype
	*/
	
	questionType = 2//getRandomInteger(01, 04);

	switch (questionType) {
		case 01:
			break;
		case 02:
			let randomPerson = ped1.Family.getRandomMember();
			
			id_question.innerHTML = "What kind of genotype does " + randomPerson.PedigreeID + " have?"
			
			//---
			
			let choices = document.createElement("select");
			
			
			break;
		default:
			logError("generateQuestion()", "The given for the question could not be produced.");
			return;
	}
}

function submitTraitAnalysis() {
	id_nextQuestion.style.display = "block";
	
	return false;
}