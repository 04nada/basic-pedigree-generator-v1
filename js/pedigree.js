$(document).ready(function() {
	clearSVG();
	resetContent();
	
	id_pedigreeSVG.style.height = (2 * MAX_GENERATION * SYMBOL_LENGTH_px) + "px";
	
	// alert(SYMBOL_LENGTH_px);
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
eyeColor.setPrintablePhenotypes(
	"has brown eyes",
	"has blue eyes"
);
eyeColor.setDescription(
	"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed " +
	"do eiusmod tempor incididunt ut labore et dolore magna aliqua. " + 
	"Ut enim ad minim veniam, quis nostrud exercitation ullamco " +
	"laboris nisi ut aliquip ex ea commodo consequat. "
);

const widowsPeak = new AutosomalTrait("Widow's peak", 'W', 'w', "widow's peak present", "widow's peak absent", "dominant");
widowsPeak.setPrintablePhenotypes(
	"has a widow's peak",
	"has no widow's peak"
);
widowsPeak.setDescription(
	"describe here"
);

const tritanopia = new AutosomalTrait("Tritanopia", "T", "t", "blue-yellow colorblind", "not colorblind", "dominant");
tritanopia.setPrintablePhenotypes(
	"is blue-yellow colorblind",
	"is not blue-yellow colorblind"
);
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
		const id_submitTraitAnalysis = document.getElementById("id-submitTraitAnalysis");
		const id_traitAnalysisOutput = document.getElementById("id-traitAnalysisOutput");
		const id_nextQuestion = document.getElementById("id-nextQuestion");
		
//--- -----

function clearSVG() {
	while (id_pedigreeSVG.firstChild) {
		id_pedigreeSVG.removeChild(id_pedigreeSVG.firstChild);
	}
}

function resetContent() {
	id_traitExpressionDiv.style.display = "none";
	
	id_traitAnalysisDiv.style.display = "none";
}

var activeTraitName, activeTrait;
var ped1, pedGF, pedGM;

function generatePedigree() {
	console.clear();
	resetContent();
	
	//--- ----- Pedigree Generation
	
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
	
	// log sorted family in console
	console.log("by Generation: ");
	console.log(ped1.Family.Generations);
	
	console.log("by Genotype: ");
	console.log(ped1.Family.MembersBySolvableGenotype);
	
	//--- ----- Display Trait Expression
	
	id_traitExpressionDiv.style.display = "block";
	
	resetTraitExpression();
}

//----- 

function resetTraitExpression() {
	// select "blank" option by default
	id_traitExpressionForm.elements["name-traitExpression"].selectedIndex = 0;
	
	// enable interaction with Trait Expression form elements
	for (let el of id_traitExpressionForm.getAllFormElements()) {
		el.disabled = false;
		el.style.cursor = "pointer";
	}
	
	// clear and hide Trait Expression output
	id_traitExpressionOutput.innerHTML = "";
	id_traitExpressionOutput.style.display = "none";
}

function submitTraitExpression() {
	// disable interaction with Trait Expression form elements
	for (let el of id_traitExpressionForm.getAllFormElements()) {
		el.disabled = true;
		el.style.cursor = "not-allowed";
	}
	
	// show Trait Expression output
	id_traitExpressionOutput.style.display = "block";
	
	//--- ----- Check Answer to Trait Expression
	
	const submit_expression = id_traitExpressionForm.elements["name-traitExpression"];
	
	if (submit_expression.value === ped1.ActiveTrait.Expression) {
		id_traitExpressionOutput.style.backgroundColor = "#BFB";
		id_traitExpressionOutput.innerHTML = "Correct: ";
	} else {
		id_traitExpressionOutput.style.backgroundColor = "#FBB";
		id_traitExpressionOutput.innerHTML = "Incorrect: ";
	}
	
	id_traitExpressionOutput.innerHTML += "The trait is " + ped1.ActiveTrait.Expression + ".";
	
	//--- ----- Display Trait Analysis
	
	switch (minBreakpoint) {
		case "600px":
			id_traitAnalysisDiv.style.display = "flex";
			break;
		default:
			id_traitAnalysisDiv.style.display = "block";
			break;
	}
		
	//--- Display Trait Info
	
	id_traitName.innerHTML = "Trait: " + activeTraitName;
	
	id_dominantTrait.innerHTML = "Dominant (" + activeTrait.DominantAllele + "): " + activeTrait.DominantPhenotype;
	id_recessiveTrait.innerHTML = "Recessive (" + activeTrait.RecessiveAllele + "): " + activeTrait.RecessivePhenotype;
	
	id_traitDescription.innerHTML = activeTrait.Description;
	
	//---
	
	generateQuestion();
	
	return false;
}

//--- ----- Trait Analysis

function resetTraitAnalysis() {
	// clear all input/select elements in the form when a new question is generated
	let traitAnalysisInputs = document.getElementsByClassName("class-traitAnalysisInput");
	
	while (traitAnalysisInputs[0]) {
		id_traitAnalysisForm.removeChild(traitAnalysisInputs[0]);
	}
	
	// enable interaction with Trait Analysis form elements
	for (let el of id_traitAnalysisForm.getAllFormElements()) {
		el.disabled = false;
		el.style.cursor = "pointer";
	}
	
	// clear and hide Trait Analysis output
	id_traitAnalysisOutput.innerHTML = "";
	id_traitAnalysisOutput.style.display = "none";
	
	// hide new question button
	id_nextQuestion.style.display = "none";
}

var questionType;
var randomPerson;

function generateQuestion() {
	resetTraitAnalysis();
	
	/*
		01 - 
		02 - given a specific PedigreeID, ask for phenotype
		03 - given a specific PedigreeID, ask for genotype
	*/
	
	questionType = getRandomInteger(02, 03);

	switch (questionType) {
		case 01:
			break;
		case 02: {
			randomPerson = ped1.Family.getRandomMember();
			
			id_question.innerHTML = "What is " + randomPerson.PedigreeID + "'s phenotype for " + activeTraitName.toLowerCase() + "?";
			
			//---
			
			let select_phenotype = document.createElement("select");
			select_phenotype.setAttribute("name", "name-choicePhenotype");
			select_phenotype.setAttribute("class", "class-traitAnalysisInput");
			select_phenotype.setAttribute("required", "required");
			
			let option_blank = document.createElement("option");
			option_blank.setAttribute("hidden", "hidden");
			option_blank.setAttribute("disabled", "disabled");
			option_blank.setAttribute("selected", "selected");
			select_phenotype.append(option_blank);
			
			let options = [
				activeTrait.DominantPhenotype,
				activeTrait.RecessivePhenotype
			];
			
			for (let i = 0; i < options.length; i++) {
				let opt = document.createElement("option");
				opt.text = options[i];
				opt.setAttribute("value", options[i]);
				
				select_phenotype.append(opt);
			}
			
			id_traitAnalysisForm.insertBefore(select_phenotype, id_submitTraitAnalysis);
			
			
			break;
		} case 03: {
			randomPerson = ped1.Family.getRandomMember();
			
			id_question.innerHTML = "What is " + randomPerson.PedigreeID + "'s zygosity for " + activeTraitName.toLowerCase() + "?";
			
			//---
			
			let select_zygosity = document.createElement("select");
			select_zygosity.setAttribute("name", "name-choiceZygosity");
			select_zygosity.setAttribute("class", "class-traitAnalysisInput");
			select_zygosity.setAttribute("required", "required");
			
			let option_blank = document.createElement("option");
			option_blank.setAttribute("hidden", "hidden");
			option_blank.setAttribute("disabled", "disabled");
			option_blank.setAttribute("selected", "selected");
			select_zygosity.append(option_blank);
			
			let options = [
				["Homozygous Dominant", "homozygous dominant"],
				["Heterozygous", "heterozygous"],
				["Homozygous Recessive", "homozygous recessive"],
				["Cannot be determined", "unknown"]
			];
				
			for (let i = 0; i < options.length; i++) {
				let opt = document.createElement("option");
				opt.text = options[i][0];
				opt.setAttribute("value", options[i][1]);
				
				select_zygosity.append(opt);
			}
			
			id_traitAnalysisForm.insertBefore(select_zygosity, id_submitTraitAnalysis);
			
			break;
		} default:
			logError("generateQuestion()", "The given for the question could not be produced.");
			return;
	}
}

function submitTraitAnalysis() {
	id_traitAnalysisOutput.style.display = "block";
	
	switch (questionType) {
		case 01:
			break;
		case 02:
			let guessedPhenotype = id_traitAnalysisForm.elements["name-choicePhenotype"].value;
			let correctPhenotype = randomPerson.AutosomalPhenotypes[activeTraitName];
		
			id_traitAnalysisOutput.innerHTML = (guessedPhenotype === correctPhenotype) ? "Correct: " : "Incorrect: ";
			id_traitAnalysisOutput.innerHTML += randomPerson.PedigreeID + " " + activeTrait.getPrintablePhenotypeFromGene(randomPerson.AutosomalGenes[activeTraitName]) + ".";
			
			//---
			
			for (let el of id_traitAnalysisForm.getAllFormElements()) {
				el.disabled = true;
				el.style.cursor = "not-allowed";
			}
			
			break;
		case 03: {
			let guessedZygosity = id_traitAnalysisForm.elements["name-choiceZygosity"].value;
			let correctZygosity = randomPerson.Solver.SolvableZygosity;
			
			id_traitAnalysisOutput.innerHTML = (guessedZygosity === correctZygosity) ? "Correct: " : "Incorrect: ";
			
			if (randomPerson.Solver.SolvableZygosity === "unknown")
				id_traitAnalysisOutput.innerHTML += randomPerson.PedigreeID + "'s zygosity cannot be determined.";
			else
				id_traitAnalysisOutput.innerHTML += randomPerson.PedigreeID + " is " + randomPerson.Solver.SolvableZygosity + " for " + activeTraitName.toLowerCase();
			
			//---
			
			// disable interaction with Trait Analysis form
			for (let el of id_traitAnalysisForm.getAllFormElements()) {
				el.disabled = true;
				el.style.cursor = "not-allowed";
			}
			
			break;
		} default:
			logError("submitTraitAnalysis()", "The question type could not be determined.");
	}
	
	//--- -----
	
	id_nextQuestion.style.display = "block";
	
	return false;
}