//--- ----- Line Prototype

function Line(x1, y1, x2, y2) {
	this.X1 = x1;
	this.Y1 = y1;
	this.X2 = x2;
	this.Y2 = y2;
	
	this.CenterX = (this.X1 + this.X2)/2.0;
	this.CenterY = (this.Y1 + this.Y2)/2.0;
	
	//---
	
	this.SVG = {};
	
	this.SVG.Element = document.createElementNS("http://www.w3.org/2000/svg", "line");
	this.SVG.Element.setAttribute("x1", this.X1);
	this.SVG.Element.setAttribute("y1", this.Y1);
	this.SVG.Element.setAttribute("x2", this.X2);
	this.SVG.Element.setAttribute("y2", this.Y2);
	
	this.SVG.Element.style.stroke = "black";
	this.SVG.Element.style.strokeWidth = "1";
}

Line.init2 = function(x1, y1, length, direction) {
	var dx, dy;
	
	switch (direction) {
		case "up":
			dx = 0;
			dy = -length;
			break;
		case "down":
			dx = 0;
			dy = length;
			break;
		case "left":
			dx = -length;
			dy = 0;
			break;
		case "right":
			dx = length;
			dy = 0;
			break;
		default:
			return;
	}
	
	return new Line(x1, y1, (x1 + dx), (y1 + dy));
}

Line.prototype.extend = function(length, direction) {
	switch (direction) {
		case "up":
			(this.Y1 < this.Y2) ? (this.Y1 -= length) : (this.Y2 -= length);
			break;
		case "down":
			(this.Y1 > this.Y2) ? (this.Y1 += length) : (this.Y2 += length);
			break;
		case "left":
			(this.X1 < this.X2) ? (this.X1 -= length) : (this.X2 -= length);
			break;
		case "right":
			(this.X1 > this.X2) ? (this.X1 += length) : (this.X2 += length);
			break;
		default:
			return;
	}
	
	this.CenterX = (this.X1 + this.X2)/2.0;
	this.CenterY = (this.Y1 + this.Y2)/2.0;
	
	this.PRIV_updateSVGPosition();
}

Line.prototype.PRIV_updateSVGPosition = function() {
	this.SVG.Element.setAttribute("x1", this.X1);
	this.SVG.Element.setAttribute("y1", this.Y1);
	this.SVG.Element.setAttribute("x2", this.X2);
	this.SVG.Element.setAttribute("y2", this.Y2);
}