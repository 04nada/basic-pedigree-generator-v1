//--- ----- Symbol prototype

var SYMBOL_LENGTH_px = parseFloat(document.getCSSPropertyById("id-pedigreeSVG", "width")) / 28.0;

function Symbol(person, activeTrait, x = 0) {
	if (!(activeTrait.TraitName in DefinedAutosomalTraits)) {
		logError("Symbol()", "Cannot draw symbol for undefined trait.");
	} else {
		personSex = person.Sex;
		personActivePhenotype = person.AutosomalPhenotypes[activeTrait.TraitName];
		
		this.Shape = (person.Sex === "female") ? "circle" : "square";
		this.Fill = (personActivePhenotype === activeTrait.getActivePhenotype()) ? "shaded" : "unshaded";
		
		this.X = x
		this.Y = (SYMBOL_LENGTH_px/2) + (person.Generation-1)*(2*SYMBOL_LENGTH_px);
		
		this.CenterX = this.X + (SYMBOL_LENGTH_px/2);
		this.CenterY = this.Y + (SYMBOL_LENGTH_px/2);
		
		person.Symbol = this;
		
		//--- SVG
		
		this.SVG = {};
		
		switch (this.Shape) {
			case "circle":
				this.SVG.Element = document.createElementNS("http://www.w3.org/2000/svg", "circle");
				this.SVG.Element.setAttribute("cx", this.CenterX);
				this.SVG.Element.setAttribute("cy", this.CenterY);
				this.SVG.Element.setAttribute("r", (SYMBOL_LENGTH_px/2));
				break;
			case "square":
				this.SVG.Element = document.createElementNS("http://www.w3.org/2000/svg", "rect");
				this.SVG.Element.setAttribute("x", this.X);
				this.SVG.Element.setAttribute("y", this.Y);
				this.SVG.Element.setAttribute("width", SYMBOL_LENGTH_px);
				this.SVG.Element.setAttribute("height", SYMBOL_LENGTH_px);
				break;
			default:
				logError("Symbol()", "Failed to get Symbol shape.");
				return;
		}
		
		this.SVG.Element.style.stroke = "black";
		this.SVG.Element.style.strokeWidth = "1";
		
		this.SVG.Element.style.fill = (this.Fill === "unshaded") ? "white" : "black";
	}
}

Symbol.prototype.setPositionX = function(x) {
	this.X = x;
	this.CenterX = this.X + (SYMBOL_LENGTH_px/2);
	
	this.PRIV_updateSVGPosition();
}

Symbol.prototype.translatePositionX = function(dx) {
	this.X += dx;
	this.CenterX += dx;
	
	if (this.SVG.AncestorLine != null)
		this.SVG.AncestorLine.translatePosition(dx, 0);
	
	this.PRIV_updateSVGPosition();
}

Symbol.prototype.PRIV_updateSVGPosition = function() {
	switch (this.Shape) {
		case "circle":
			this.SVG.Element.setAttribute("cx", this.CenterX);
			this.SVG.Element.setAttribute("cy", this.CenterY);
			break;
		case "square":
			this.SVG.Element.setAttribute("x", this.X);
			this.SVG.Element.setAttribute("y", this.Y);
			break;
		default:
			logError("Symbol.pt.PRIV_updateSVGPosition()", "Failed to get Symbol shape.");
			return;
	}
}