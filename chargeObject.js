function chargeElement() {
	this.pointChargeStrength;

	this.length;
	this.linearChargeDensity;
	this.chargeResolution;
	this.angle;

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

chargeElement.prototype.initLineChargeByAngle = function (xPos, yPos, length, angle, polarity, linearChargeDensity, chargeResolution) {
	this.xPos = xPos;
	this.yPos = yPos;
	this.length = length;
	this.angle = angle;
	this.polarity = polarity;
	this.linearChargeDensity = linearChargeDensity;
	this.chargeResolution = chargeResolution;

	this.pointOrLine = -1;
	return this;
};

chargeElement.prototype.initLineChargeByStartEnd = function (sXPos, sYPos, eXPos, eYPos, polarity, linearChargeDensity, chargeResolution) {
	this.sXPos = sXPos;
	this.sYPos = sYPos;
	this.eXPos = eXPos;
	this.eYPos = eYPos;
	this.polarity = polarity;
	this.linearChargeDensity = linearChargeDensity;
	this.chargeResolution = chargeResolution;
	this.length = length;
	this.angle = angle;

	this.pointOrLine = -1;
	return this;
};