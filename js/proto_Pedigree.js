const id_pedigreeSVG = document.getElementById("id-pedigreeSVG");

//--- ----- Pedigree prototype

function Pedigree(activeTrait) {
	this.Family = new Family();
	
	for (let f of this.Family.Members1) {
		let s = new Symbol(f, activeTrait);
	}
	
	this.Family.Grandfather.Symbol.setPositionX(3.5 * SYMBOL_LENGTH_px);
	this.RecessiveIndividuals = [];
}

//--- Checking Pedigree validity

const SVGWidth = parseFloat(document.getCSSPropertyById("id-pedigreeSVG", "width"));

Pedigree.prototype.isContainableInSVG = function() {
	var rightmost = this.Family.Members1[0];
	
	for (var member of this.Family.Members1) {
		if (member.Symbol.X > rightmost.Symbol.X)
			rightmost = member;
	}
	
	return ((rightmost.Symbol.X+SYMBOL_LENGTH_px) <= (SVGWidth - 2*SYMBOL_LENGTH_px))
}

//--- Making connections

Pedigree.prototype.layoutFamily = function(person1) {
	if (person1.Generation === MAX_GENERATION) {
		return;
	} else {
		if (person1.Partner == null)
			return;
		
		var person2 = person1.Partner;
		
		this.layoutMarriage(person1, person2);
		
		//---
		
		var numberOfChildren = person1.Children.length;
		
		if (person1.Children == null || numberOfChildren <= 0)
			return;
		
		this.layoutChildren(person1, person2);
		
		//---
		
		for (let child of person1.Children) {			
			this.layoutFamily(child);
		}
		
		//---
		
		this.fixSymbolSpacing(person1);
	}
}

Pedigree.prototype.layoutMarriage = function(partner1, partner2) {
	if ((partner1.Partner !== partner2) || (partner2.Partner !== partner1)) {
		logError("Pedigree.layoutMarriage()", "Persons chosen to draw symbols are not married.");
	} else {
		symbol1 = partner1.Symbol;
		symbol2 = partner2.Symbol;
		
		//--- Marriage Line
		
		symbol2.setPositionX(symbol1.X + (2*SYMBOL_LENGTH_px));
		
		var marriageLine = new Line(
			symbol1.CenterX,
			symbol1.CenterY,
			symbol2.CenterX,
			symbol2.CenterY
		);
		
		symbol1.SVG.MarriageLine = marriageLine;
		symbol2.SVG.MarriageLine = marriageLine;
		
		//--- Draw to HTML
		
		this.drawMarriage(partner1, partner2);
	}
}

Pedigree.prototype.layoutChildren = function(parent1, parent2) {
	if ((parent1.Partner !== parent2) || (parent2.Partner !== parent1)) {
		logError("Pedigree.layoutChildren()", "Persons chosen to layout children of are not married.");
	} else if (parent1.Children == null || parent1.Children.length === 0) {
		logError("Pedigree.layoutChildren()", "Persons chosen do not have any children to layout.");
		return;
	} else {
		symbol1 = parent1.Symbol;
		symbol2 = parent2.Symbol;
		
		//--- Descendant Line (connects Marriage Line to Sibling Line vertically)
		
		var descendantLine = Line.init2(
			symbol1.SVG.MarriageLine.CenterX,
			symbol1.SVG.MarriageLine.CenterY,
			(SYMBOL_LENGTH_px),
			"down"
		);
		
		symbol1.SVG.DescendantLine = descendantLine;
		symbol2.SVG.DescendantLine = descendantLine;
		
		//--- Aligning Child Symbols based on parent Symbol positions
		
		var numberOfChildren = parent1.Children.length;
		
		if (numberOfChildren % 2 === 1) {
			let center = (numberOfChildren - 1)/2;
			let centerChild = parent1.Children[center];
			
			centerChild.Symbol.setPositionX(symbol1.SVG.DescendantLine.CenterX - (SYMBOL_LENGTH_px/2));
			
			for (let i = center-1; i >= 0; i--) {
				child = parent1.Children[i];
				
				child.Symbol.setPositionX(parent1.Children[i+1].Symbol.X - 2*SYMBOL_LENGTH_px);
			}
			
			for (let i = center+1; i < numberOfChildren; i++) {
				child = parent1.Children[i];
				
				child.Symbol.setPositionX(parent1.Children[i-1].Symbol.X + 2*SYMBOL_LENGTH_px);
			}	
		} else {
			let centerL = (numberOfChildren/2) - 1;
			let centerR = centerL + 1;
			let centerChildL = parent1.Children[centerL];
			let centerChildR = parent1.Children[centerR];
			
			centerChildL.Symbol.setPositionX(symbol1.X);
			centerChildR.Symbol.setPositionX(symbol2.X);
			
			for (let i = centerL-1; i >= 0; i--) {
				child = parent1.Children[i];
				
				child.Symbol.setPositionX(parent1.Children[i+1].Symbol.X - 2*SYMBOL_LENGTH_px);
			}
			
			for (let i = centerR+1; i < numberOfChildren; i++) {
				child = parent1.Children[i];
				
				child.Symbol.setPositionX(parent1.Children[i-1].Symbol.X + 2*SYMBOL_LENGTH_px);
			}	
		}
			
		//--- Ancestor Line (connects each Child Symbol to Sibling Line vertically)
			
		for (let i = 0; i < numberOfChildren; i++) {
			child = parent1.Children[i];
		
			let ancestorLine = Line.init2(
				child.Symbol.CenterX,
				child.Symbol.CenterY,
				(SYMBOL_LENGTH_px),
				"up"
			);
			
			child.Symbol.SVG.AncestorLine = ancestorLine;
		}
		
		//--- if a Child has a Partner, translate all siblings to the right
		
		for (let i = 0; i < numberOfChildren; i++) {
			let child = parent1.Children[i];

			if ((child.Partner != null) && (i < numberOfChildren-1)) {
				for (let j = i+1; j < numberOfChildren; j++) {
					let nextChild = parent1.Children[j];

					nextChild.Symbol.translatePositionX(2*SYMBOL_LENGTH_px);
				}
			}
		}
				
		//--- Sibling Line (branches out to all children)
		
		var siblingLine = new Line(
			parent1.Children[0].Symbol.SVG.AncestorLine.X2,
			parent1.Children[0].Symbol.SVG.AncestorLine.Y2,
			parent1.Children[numberOfChildren - 1].Symbol.SVG.AncestorLine.X2,
			parent1.Children[numberOfChildren - 1].Symbol.SVG.AncestorLine.Y2
		);
		
		for (let child of parent1.Children) {
			child.Symbol.SVG.SiblingLine = siblingLine;
		}
		
		//--- Draw Children to HTML
		
		this.drawChildren(parent1, parent2);
	}
}

Pedigree.prototype.fixSymbolSpacing = function(person1) {
	if (person1.Children == null || person1.Children.length === 0) {
		// no need to fix symbol spacing without any children
		return;
	} else {
		var numberOfChildren = person1.Children.length;
		var overlapRight_px = 0; 
		
		if (numberOfChildren > 2) {
			// This part accounts for excess children overlapping from the middle to the left.
			// 1*SYMBOL_LENGTH_px for every extra child from 2
			if (this.Family.Generations[person1.Generation-1].indexOf(person1) !== 0) {
				// fixes a rare bug when person1 is an only child with 3 children.
				// probably breaks stuff for >= 4 children.
				// but thankfully the webpage is set to allow at most 3 children so that'll never happen,
				// unless this code ever gets reused in the future to generalize random pedigree generation.
				if (!(person1.ChildOrder === 1 && person1.Father.Children.length === 1))
					this.PRIV_adjustFrom(person1, ((numberOfChildren-2) * SYMBOL_LENGTH_px));
				
				// this bug might be caused by the if() being too simple to
				// account for complex cases of overlapping to the left
			}
			
			// This part accounts for excess children overlapping from the middle to the right.			
			// 1*SYMBOL_LENGTH_px for every extra child from 2
			overlapRight_px += ((numberOfChildren-2) * SYMBOL_LENGTH_px);
		}
		
		// This part accounts for excess partners of children overlapping from the middle to the right;
		// 2*SYMBOL_LENGTH_px for every partner that each child has
		for (let child of person1.Children) {
			if (child.Partner != null)
				overlapRight_px += (2*SYMBOL_LENGTH_px);
		}
		
		//---
		
		// In Depth-First Search, the last descendant is the Family Member that
		// comes right before the first Family Member at the right
		var lastDescendant = person1.getAllDescendants_DF(true).getElementFromLast(0);
		var indexOfLastDescendant = this.Family.Members1.indexOf(lastDescendant);
		var indexOfFirstMemberToTheRight = indexOfLastDescendant + 1;
		
		// Move all Family Members at the right, further to the right,
		// but first check if such Family Members exist
		if (indexOfFirstMemberToTheRight < this.Family.Members1.length)
			this.PRIV_adjustFrom(this.Family.Members1[indexOfFirstMemberToTheRight], overlapRight_px);
	}
}

// To see if you can determine the Dominant gene using the pedigree

/* 
	
// Recursive findDominant fcn
	
Pedigree.prototype.findDominant = function(person1){
	if ((person1.Generation === MAX_GENERATION) || (person1.Partner == null)) {
		return;
	}
	else{
			for(let i = 0; i < person1.Children.length; i++){
				let child = person1.Children[i];
				if ((child.AutosomalPhenotypes[activeTraitName] != person1.AutosomalPhenotypes[activeTraitName]) && (person1.AutosomalPhenotypes[activeTraitName] == person1.Partner.AutosomalPhenotypes[activeTraitName])){
					console.log(person1.AutosomalPhenotypes[activeTraitName] + " is dominant.");
					console.log(child.PedigreeID);
					return;
				}
				for (let child of person1.Children) {			
					this.findDominant(child);
				}
			}
		}
}

*/

Pedigree.prototype.findDominant = function(){
	var generations = this.Family.Generations;
	for (let i = 0; i < generations.length-1; i++){
		for (let j = 0; j < generations[i].length; j++){
			let person1 = generations[i][j];
			if (person1.Partner != null){
				for (let k = 0; k < person1.Children.length; k++){
					let child = person1.Children[k];
					if ((child.AutosomalPhenotypes[activeTraitName] != child.Father.AutosomalPhenotypes[activeTraitName]) && (child.Father.AutosomalPhenotypes[activeTraitName] == child.Mother.AutosomalPhenotypes[activeTraitName])){
					console.log(person1.AutosomalPhenotypes[activeTraitName] + " is dominant. Homozygous recessive: " + child.PedigreeID);
					return true;
				}
				}
			}
		}
	}
	return false;
}

// Finding Heterozygous individuals

Pedigree.prototype.findHeterozygous = function(){
	var generations = this.Family.Generations;
	var RI = this.RecessiveIndividuals;
	var HeterozygousPresent = false;
	var RecessiveParent;
	var RIcheck = false;
	for (let i = 0; i < generations.length-1; i++){
		for (let j = 0; j < generations[i].length; j++){
			let person1 = generations[i][j];
			if (person1.Partner != null){
				for (let k = 0; k < person1.Children.length; k++){
					let child = person1.Children[k];
					if ((child.AutosomalPhenotypes[activeTraitName] == activeTrait.RecessivePhenotype) && (child.Father.AutosomalPhenotypes[activeTraitName] != child.Mother.AutosomalPhenotypes[activeTraitName])){
						if (child.Father.AutosomalPhenotypes[activeTraitName] == activeTrait.DominantPhenotype){
							console.log("Heterozygous: " + child.Father.PedigreeID);
							RecessiveParent = child.Father;
						}
						else{
							console.log("Heterozygous: " + child.Mother.PedigreeID);
							RecessiveParent = child.Mother;
						}
							HeterozygousPresent = true;
						for (let l = 0; l < RI.length; l++){
							if(RI[l] == RecessiveParent){
								RIcheck = true;
							}
						}
						if(!RIcheck){
							this.RecessiveIndividuals.push(RecessiveParent);
						}
							RIcheck = false;
					}
				}
			}
		}
	}
	return HeterozygousPresent;
}

Pedigree.prototype.PRIV_adjustFrom = function(person, dx) {
	var index1 = this.Family.Members1.indexOf(person);
	
	var SL_translate = [];
	var SL_extend = [];
	
	for (let i = index1; i < this.Family.Members1.length; i++) {
		// translate each Member, including partners
		member = this.Family.Members1[i];
		
		member.Symbol.translatePositionX(dx);
		
		//---
		
		// translate each SiblingLine only if a complete set of siblings is translates
		// only check the first child to avoid duplicate counting
		let mSL = member.Symbol.SVG.SiblingLine;
		
		if (mSL != null) {
			if ((member.ChildOrder === 1) && !(SL_translate.includes(mSL)))
				SL_translate.push(mSL);
			else if (!(SL_translate.includes(mSL)) && !(SL_extend.includes(mSL)))
				SL_extend.push(mSL);
		}
			
	}
	
	for (let SL of SL_translate)
		SL.translatePosition(dx, 0);
	
	for (let SL of SL_extend)
		SL.extend(dx, "right");
	
	//---
	
	var index2 = this.Family.Members2.indexOf(person);
	
	for (let i = index2; i < this.Family.Members2.length; i++) {
		member = this.Family.Members2[i];
		
		//---
		
		// translate each MarriageLine and DescendantLine for every pair
		// exclude partners from the for loop to avoid duplicate counting
		let mML = member.Symbol.SVG.MarriageLine;
		let mDL = member.Symbol.SVG.DescendantLine;
		
		if (mML != null)
			mML.translatePosition(dx, 0);
		
		if (mDL != null)
			mDL.translatePosition(dx, 0);
	}
}

//--- Drawing connections to HTML

Pedigree.prototype.drawMarriage = function(partner1, partner2) {
	if ((partner1.Partner !== partner2) || (partner2.Partner !== partner1)) {
		logError("Symbol.layoutMarriage()", "Persons chosen to draw symbols are not married.");
	} else {	
		symbol1 = partner1.Symbol;
		symbol2 = partner2.Symbol;
		
		//---
		
		// Marriage Line
		id_pedigreeSVG.append(symbol1.SVG.MarriageLine.SVG.Element);
		
		// Partner Symbols
		id_pedigreeSVG.append(symbol1.SVG.Element);
		id_pedigreeSVG.append(symbol2.SVG.Element);
	}
}

Pedigree.prototype.drawChildren = function(parent1, parent2) {
	if ((parent1.Partner !== parent2) || (parent2.Partner !== parent1)) {
		logError("Symbol.layoutChildren()", "Persons chosen to draw symbols are not married.");
	} else {
		symbol1 = parent1.Symbol;
		symbol2 = parent2.Symbol;
		
		//---
		
		// Descendant Line
		id_pedigreeSVG.append(symbol1.SVG.DescendantLine.SVG.Element);
		
		// Ancestor Lines
		for (let child of parent1.Children)
			id_pedigreeSVG.append(child.Symbol.SVG.AncestorLine.SVG.Element);
		
		// Sibling Line
		id_pedigreeSVG.append(parent1.Children[0].Symbol.SVG.SiblingLine.SVG.Element);
		
		// Child Symbols
		for (let child of parent1.Children)
			id_pedigreeSVG.append(child.Symbol.SVG.Element);
	}
}