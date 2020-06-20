const id_pedigreeSVG = document.getElementById("id-pedigreeSVG");
const ACTIVE_TRAIT = "eye color";

//--- ----- Pedigree prototype

function Pedigree(activeTraitName = ACTIVE_TRAIT) {
	var FamilyTreeSVG = document.createElementNS("http://www.w3.org/2000/svg", "g");
	
	//---
	
	this.Family = new Family();
	
	for (let f of this.Family.Members) {
		let s = new Symbol(f, activeTraitName);
		
		FamilyTreeSVG.append(s.SVG.Element);
	}
	
	//id_pedigreeSVG.append(FamilyTreeSVG);
	
	//grandfather
}

Pedigree.prototype.appendElement = function(element) {
	id_pedigreeSVG.append(element);
}

//--- Making connections

Pedigree.getConnection = function(symbol1, symbol2) {
	var connectingLine = new Line(
		symbol1.CenterX,
		symbol1.CenterY,
		symbol2.CenterX,
		symbol2.CenterY
	);
	
	return connectingLine;
}

Pedigree.layoutMarriage = function(partner1, partner2) {
	if ((partner1.Partner !== partner2) || (partner2.Partner !== partner1)) {
		logError("Symbol.layoutMarriage()", "Persons chosen to draw symbols are not married.");
	} else {	
		symbol1 = partner1.Symbol;
		symbol2 = partner2.Symbol;
		
		//--- Marriage Line
		
		symbol2.setPosition(symbol1.X + (2*SYMBOL_LENGTH_px));
		
		var marriageLine = Pedigree.getConnection(symbol1, symbol2);
		
		symbol1.SVG.MarriageLine = marriageLine;
		symbol2.SVG.MarriageLine = marriageLine;
		
		//---
		
		Pedigree.drawMarriage(partner1, partner2);
	}
}

Pedigree.layoutChildren = function(parent1, parent2) {
	if ((parent1.Partner !== parent2) || (parent2.Partner !== parent1)) {
		logError("Pedigree.layoutChildren()", "Persons chosen to layout children of are not married.");
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
		
		//--- Ancestor Line (connects each Child Symbol to Sibling Line vertically)
		
		var numberOfChildren = parent1.Children.length;
		
		for (let i = 0; i < numberOfChildren; i++) {
			child = parent1.Children[i];
			
			if (i != 0)
				child.Symbol.setPosition(parent1.Children[i-1].Symbol.X + (2*SYMBOL_LENGTH_px));
			
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
		
		console.log(parent1.Children);
		for (let child of parent1.Children) {
			id_pedigreeSVG.append(child.Symbol.SVG.AncestorLine.SVG.Element);
			id_pedigreeSVG.append(child.Symbol.SVG.SiblingLine.SVG.Element);
		}
		
		for (let child of parent1.Children) {
			id_pedigreeSVG.append(child.Symbol.SVG.Element);
		}
	}
}