function chargeElement() {
	this.pointChargeStrength;

	this.length;
	this.angle;
	this.linearChargeDensity;
	this.lengthPerPoint;
	this.sXPos;
	this.sYPos;
	this.eXPos;
	this.eYPos;
	this.centerX;
	this.centerY;
	this.simplePCArray;

	this.pointOrLine;
	this.xPos;
	this.yPos;
	this.polarity;
	this.id;
}

chargeElement.prototype.initPointCharge = function (xPos, yPos, polarity, pointChargeStrength, id) {
	this.xPos = xPos;
	this.yPos = yPos;
	this.polarity = polarity;
	this.pointChargeStrength = pointChargeStrength;
	this.id = id;

	this.pointOrLine = 1;
	return this;
};

chargeElement.prototype.initLineChargeByAngle = function (sXPos, sYPos, length, angle, polarity, linearChargeDensity, lengthPerPoint, id) {
	this.sXPos = parseFloat(sXPos);
	this.sYPos = parseFloat(sYPos);
	this.length = parseFloat(length);
	this.angle = parseFloat(angle);
	this.polarity = polarity;
	this.linearChargeDensity = linearChargeDensity;
	this.lengthPerPoint = lengthPerPoint;
	this.id = id;
	this.simplePCArray = new Array();

	this.pointOrLine = -1;
	return this;
};

chargeElement.prototype.initLineChargeByStartEnd = function (sXPos, sYPos, eXPos, eYPos, polarity, linearChargeDensity, lengthPerPoint, id) {
	this.sXPos = parseFloat(sXPos);
	this.sYPos = parseFloat(sYPos);
	this.eXPos = parseFloat(eXPos);
	this.eYPos = parseFloat(eYPos);
	this.polarity = polarity;
	this.linearChargeDensity = linearChargeDensity;
	this.lengthPerPoint = lengthPerPoint;
	this.id = id;
	this.simplePCArray = new Array();

	this.pointOrLine = -1;
	return this;
};

chargeElement.prototype.initSimplePointCharge = function (xPos, yPos, pointChargeStrength) {
	this.xPos = xPos;
	this.yPos = yPos;
	this.pointChargeStrength = pointChargeStrength;
	return this;
};