const id_pedigreeSVG = document.getElementById("id-pedigreeSVG");
const ACTIVE_TRAIT = "eye color";

//--- ----- Pedigree prototype

function Pedigree(activeTraitName = ACTIVE_TRAIT) {
	this.Family = new Family();
	
	for (let f of this.Family.Members) {
		let s = new Symbol(f, activeTraitName);
	}
	
	this.Family.Grandfather.Symbol.setPositionX(200);
}

Pedigree.prototype.appendElement = function(element) {
	id_pedigreeSVG.append(element);
}

//--- Making connections

Pedigree.layoutFamily = function(person1) {
	if (person1.Generation === MAX_GENERATION) {
		return;
	} else {
		if (person1.Partner == null)
			return;
		
		var person2 = person1.Partner;
		
		Pedigree.layoutMarriage(person1, person2);
		
		//---
		
		var numberOfChildren = person1.Children.length;
		
		if (person1.Children == null || numberOfChildren <= 0)
			return;
		
		Pedigree.layoutChildren(person1, person2);
		
		for (let i = 0; i < numberOfChildren; i++) {
			let child = person1.Children[i];

			if ((child.Partner != null) && (i < numberOfChildren-1)) {
				console.log("EXTEND BY: " + child.PedigreeID);
				
				child.Symbol.SVG.SiblingLine.extend(2*SYMBOL_LENGTH_px, "right");
				
				for (let j = i+1; j < person1.Children.length; j++) {
					let nextChild = person1.Children[j];

					nextChild.Symbol.translatePositionX(2*SYMBOL_LENGTH_px);
				}
			}	
			
			Pedigree.layoutFamily(child);
		}
	}
}

Pedigree.layoutMarriage = function(partner1, partner2) {
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
		
		Pedigree.drawMarriage(partner1, partner2);
	}
}

Pedigree.layoutChildren = function(parent1, parent2) {
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
		
		Pedigree.drawChildren(parent1, parent2);
	}
}

//--- Drawing connections to HTML

Pedigree.drawMarriage = function(partner1, partner2) {
	if ((partner1.Partner !== partner2) || (partner2.Partner !== partner1)) {
		logError("Symbol.layoutMarriage()", "Persons chosen to draw symbols are not married.");
	} else {	
		symbol1 = partner1.Symbol;
		symbol2 = partner2.Symbol;
		
		//---
		
		id_pedigreeSVG.append(symbol1.SVG.MarriageLine.SVG.Element);
		id_pedigreeSVG.append(symbol1.SVG.Element);
		id_pedigreeSVG.append(symbol2.SVG.Element);
	}
}

Pedigree.drawChildren = function(parent1, parent2) {
	if ((parent1.Partner !== parent2) || (parent2.Partner !== parent1)) {
		logError("Symbol.layoutChildren()", "Persons chosen to draw symbols are not married.");
	} else {
		symbol1 = parent1.Symbol;
		symbol2 = parent2.Symbol;
		
		//---
		
		id_pedigreeSVG.append(symbol1.SVG.DescendantLine.SVG.Element);
		
		for (let child of parent1.Children) {
			id_pedigreeSVG.append(child.Symbol.SVG.AncestorLine.SVG.Element);
			id_pedigreeSVG.append(child.Symbol.SVG.SiblingLine.SVG.Element);
		}
		
		for (let child of parent1.Children) {
			id_pedigreeSVG.append(child.Symbol.SVG.Element);
		}
	}
}