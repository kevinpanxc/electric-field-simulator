var canvas;
var ctx;
var check;
var radgrad;
var intervalID;
var intervalTime = 32;

var isMouseDown = false;
var isMouseOverRotate = false;
var isMouseDownToRotate = false;
var currentIndex = 0;

// Canvas Dimensions
var canvasW = 0;
var canvasH = 0;

// Puck Dimensions (and Half thereof)
var radiusOne = 15;
var radiusLineCircle = 6;
var radiusRotate = 3;

// Pushing first charge
var chargeId = 0;
var selectedId = 0;
var newCharge = new chargeElement().initPointCharge(100, 100, 1, 1, chargeId);
var chargeArray = [];
chargeArray.push(newCharge);
chargeId++;

// necessary for special cases in the delete function 
var highestID = 0;

// Probe checker
var probeCheck = -1;

// cursor offset relative to a charge
var cursorX = 0;
var cursorY = 0;

// Attr:Actual dimensions Scale
var scaleX = 1.0;
var scaleY = 1.0;

// meters per unit variable
var distanceScale = 1;

// for the update options box
var defaultTextBoxBorderColor;
var errorTextBoxBorderColor = "#FF1414";

function init(){
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    canvasW = canvas.width;
    canvasH = canvas.height;

    // Scaling factor
    // scaleX = canvas.width/canvas.offsetWidth;
    // scaleY = canvas.height/canvas.offsetHeight;

    // Rescale the one position
    // oneX = oneX;
    // oneY = oneY;

    radgrad = ctx.createRadialGradient(chargeArray[currentIndex].xPos,chargeArray[currentIndex].yPos,5,chargeArray[currentIndex].xPos,chargeArray[currentIndex].yPos,15);
	radgrad.addColorStop(0, 'rgba(0,0,0,1)');
	radgrad.addColorStop(0.8, 'rgba(200,200,200,.9)');
	radgrad.addColorStop(1, 'rgba(255,255,255,0)');

	$(".probeInfoContainer").hide();

    changedDraw();

    canvas.onmouseup = mouseUp;
    canvas.onmousedown = mouseDown;
    canvas.onmousemove = mouseMoved;

    updateChargeListPointCharge();
    currentIndexSelect(selectedId, -1);

    reDraw();
}

function reDraw() {
	changedDraw();
	ctx.beginPath();
	if (chargeArray[currentIndex].pointOrLine == 1){
		ctx.strokeStyle = "#FFFF00";
		ctx.arc(chargeArray[currentIndex].xPos, chargeArray[currentIndex].yPos, radiusOne + 1, 0, Math.PI*2, true);
	}
	else {
		ctx.strokeStyle = "#FFFF00";
		var angleOne = Math.PI/2 + chargeArray[currentIndex].angle;
		var angleTwo = 3*(Math.PI/2) + chargeArray[currentIndex].angle;
		if (chargeArray[currentIndex].sXPos > chargeArray[currentIndex].eXPos) {
			ctx.arc(chargeArray[currentIndex].sXPos, chargeArray[currentIndex].sYPos, radiusLineCircle + 5, angleOne, angleTwo, true);
			ctx.arc(chargeArray[currentIndex].eXPos, chargeArray[currentIndex].eYPos, radiusLineCircle + 5, angleTwo, angleOne, true);
			ctx.arc(chargeArray[currentIndex].sXPos, chargeArray[currentIndex].sYPos, radiusLineCircle + 5, angleOne, angleOne, true);
		}
		else {
			ctx.arc(chargeArray[currentIndex].sXPos, chargeArray[currentIndex].sYPos, radiusLineCircle + 5, angleTwo, angleOne, true);
			ctx.arc(chargeArray[currentIndex].eXPos, chargeArray[currentIndex].eYPos, radiusLineCircle + 5, angleOne, angleTwo, true);
			ctx.arc(chargeArray[currentIndex].sXPos, chargeArray[currentIndex].sYPos, radiusLineCircle + 5, angleTwo, angleTwo, true);
		}
	}
	ctx.stroke();
}

function changedDraw() {
	var x = 25;
	var y = 25;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for (var i = 0; i < chargeArray.length; i++){
		var currentElement = chargeArray[i];
		if (currentElement.pointOrLine == 1){
			radgrad = ctx.createRadialGradient(currentElement.xPos,currentElement.yPos,5,currentElement.xPos,currentElement.yPos,15);
			if(currentElement.polarity == 1){
				radgrad.addColorStop(0, 'rgba(0,0,0,1)');
				radgrad.addColorStop(0.8, 'rgba(200,200,200,.9)');
				radgrad.addColorStop(1, 'rgba(255,255,255,0)');
			}
			else {
				radgrad.addColorStop(0, 'rgba(255,36,36,1)');
				radgrad.addColorStop(0.8, 'rgba(255,125,125,.5)');
				radgrad.addColorStop(1, 'rgba(255,255,255,0)');
			}
			ctx.fillStyle = radgrad;
			ctx.beginPath();
			ctx.arc(currentElement.xPos, currentElement.yPos, radiusOne, 0, Math.PI*2, true);
			ctx.fill();
		}
		else {
			ctx.beginPath();
			if(currentElement.polarity == 1) ctx.strokeStyle = "#222222";
			else ctx.strokeStyle = "#F04D4D";
			ctx.lineWidth = radiusOne;
			ctx.moveTo(currentElement.sXPos, currentElement.sYPos);
			ctx.lineTo(currentElement.eXPos, currentElement.eYPos);
			ctx.lineCap = "round";
			ctx.stroke();
			ctx.lineWidth = 1;
			ctx.lineCap = "butt";

			ctx.fillStyle = "#6EA6F5";
			ctx.beginPath();
			ctx.arc(currentElement.centerX, currentElement.centerY, radiusLineCircle, 0, Math.PI*2, true);
			ctx.arc(currentElement.sXPos, currentElement.sYPos, radiusRotate, 0, Math.PI * 2, true);
			ctx.arc(currentElement.eXPos, currentElement.eYPos, radiusRotate, 0, Math.PI * 2, true);
			ctx.fill();
		}
	}
	ctx.strokeStyle = "#99CCFF";

    var slope;
    var xMiddle;
    var yMiddle;
    var xDisplacement;
    var yDisplacement = 0;
	var d;
	var s;
	var x1 = 0;
	var y1 = 0;
	var check = 0;
    for (var h = 0; h < 24; h++){
 	    for (var i = 0; i < 24; i++){
	    	xMiddle = x/2 + x * i;
 	    	yMiddle = y/2 + y * h;
			x1 = 0;
			y1 = 0;
			for (var j = 0; j < chargeArray.length; j++){
				if (chargeArray[j].pointOrLine == 1){
					d = (chargeArray[j].xPos - xMiddle) * (chargeArray[j].xPos - xMiddle) + (chargeArray[j].yPos - yMiddle) * (chargeArray[j].yPos - yMiddle);
					if (d < 500) {
						check = 1;
						break;
					}
					d = d / 1000000;
					if (xMiddle - chargeArray[j].xPos > -0.01 && xMiddle - chargeArray[j].xPos < 0.01){
						s = Math.PI/2;
						if (yMiddle - chargeArray[j].yPos < 0){
							s = -(Math.PI/2);
						}
					}
					else {
						s = (yMiddle - chargeArray[j].yPos)/(xMiddle - chargeArray[j].xPos);
						s = slopeToRad(s);
						if ((yMiddle - chargeArray[j].yPos > 0 && s < 0) || (yMiddle - chargeArray[j].yPos < 0 && s > 0)) {
							s = Math.PI + s;
						}
					}
					if (chargeArray[j].polarity == -1) s = s + Math.PI;
					if (s > 2 * Math.PI) s = s - 2 * Math.PI;
					x1 += (Math.cos(s) * chargeArray[j].pointChargeStrength/d);
					y1 += (Math.sin(s) * chargeArray[j].pointChargeStrength/d);
				}
				else {}
			}
			if (check != 1){
	 	    	if (x1 < 0.01 && x1 > -0.01){
	 	    		yDisplacement = 9;
	 	    		xDisplacement = 0;
	 	    	}
	 	    	else {
	 	    		slope = y1/x1;
	 	    		xDisplacement = 9 * (Math.sqrt(1/((slope * slope) + 1))); // ensures every line is the same length
	 	    		yDisplacement = 0;
	 	    	}
	 	    	ctx.beginPath();
	 	    	if (x1 < 0) ctx.strokeStyle = "#99CCFF";
	 	    	else ctx.strokeStyle = "#FF4D4D";
				ctx.moveTo(xMiddle + xDisplacement, yMiddle + (xDisplacement * slope) + yDisplacement);
				ctx.lineTo(xMiddle, yMiddle);
				ctx.stroke();
				ctx.beginPath();
	 	    	if (x1 < 0) ctx.strokeStyle = "#FF4D4D";
	 	    	else ctx.strokeStyle = "#99CCFF";
				ctx.moveTo(xMiddle, yMiddle);
				ctx.lineTo(xMiddle - xDisplacement, yMiddle - (xDisplacement * slope) - yDisplacement);	
				ctx.stroke();
				// ctx.moveTo(xMiddle + xDisplacement, yMiddle + (xDisplacement * slope) + yDisplacement);
				// ctx.lineTo(xMiddle - xDisplacement, yMiddle - (xDisplacement * slope) - yDisplacement);	
			}
			else check = 0;
 	   	}
	}
}

function slopeToRad (slope){
	var slopeRad;
	slopeRad = Math.atan(slope);
	return slopeRad;
}

function mouseMoved(e){
    if (isMouseDown) {
    	document.body.style.cursor = 'pointer';
    	var newXPosition = (e.pageX - canvas.offsetLeft) - cursorX;
    	var newYPosition = (e.pageY - canvas.offsetTop) - cursorY;
    	var currentElement = chargeArray[currentIndex];
    	if (currentElement.pointOrLine == 1){
    		var id = currentElement.id;
	        currentElement.xPos = newXPosition;
	        currentElement.yPos = newYPosition;
	        if (document.getElementById("eb" + id).alt == -1){
				document.getElementById("xPos" + id).innerHTML = currentElement.xPos;
	        	document.getElementById("yPos" + id).innerHTML = currentElement.yPos;
	        } 
    	}
    	else {
    		if (isMouseDownToRotate){
    			rotateLine(e.pageX - canvas.offsetLeft, e.pageY - canvas.offsetTop);
    		}
    		else {
    			var xDiff = currentElement.centerX - currentElement.eXPos;
	    		var yDiff = currentElement.centerY - currentElement.eYPos;
	    		currentElement.centerX = newXPosition;
		        currentElement.centerY = newYPosition;
		        currentElement.sXPos = newXPosition + xDiff;
		        currentElement.eXPos = newXPosition - xDiff;
		        currentElement.sYPos = newYPosition + yDiff;
		        currentElement.eYPos = newYPosition - yDiff;
    		}
    	}
    }
    else {
    	if ( cursorOverCircle(e.pageX, e.pageY) >= 0 ) document.body.style.cursor = 'pointer';
	    else document.body.style.cursor = 'default';
    }
	var probeMagnitude = document.getElementById("probeMagnitude");
	var probeAngle = document.getElementById("probeAngle");
    if (probeCheck == 1 && isMouseDown == false){
    	var dProbe;
    	var sProbe = 0;
    	var xProbe = e.pageX - canvas.offsetLeft;
    	var yProbe = e.pageY - canvas.offsetTop;
    	var xResult = 0;
    	var yResult = 0;
    	var strengthResult;
    	var angleResult;
	    var probeXText = document.getElementById("probeXText");
	    var probeYText = document.getElementById("probeYText");
    	for (var i = 0; i < chargeArray.length; i++){
    		dProbe = (chargeArray[i].xPos - xProbe) * (chargeArray[i].xPos - xProbe) + (chargeArray[i].yPos - yProbe) * (chargeArray[i].yPos - yProbe);
    		dProbe = dProbe / 1000000;
			if (xProbe - chargeArray[i].xPos > -0.01 && xProbe - chargeArray[i].xPos < 0.01){
				sProbe = Math.PI/2;
				if (yProbe - chargeArray[i].yPos < 0){
					sProbe = -sProbe;
				}
			}
			else {
				sProbe = (yProbe - chargeArray[i].yPos)/(xProbe - chargeArray[i].xPos);
				sProbe = slopeToRad(sProbe);
				if ((yProbe - chargeArray[i].yPos > 0 && sProbe < 0) || (yProbe - chargeArray[i].yPos < 0 && sProbe > 0)) {
					sProbe = Math.PI + sProbe;
				}
			}
			if (chargeArray[i].polarity == -1) sProbe = sProbe + Math.PI;
			if (sProbe > 2 * Math.PI) sProbe = sProbe - 2 * Math.PI;
			xResult += (Math.cos(sProbe) * chargeArray[i].pointChargeStrength/dProbe);
			yResult += (Math.sin(sProbe) * chargeArray[i].pointChargeStrength/dProbe);
    	}
    	yResult = -yResult;
    	if (xResult > -0.01 && xResult < 0.01) {
    		sProbe = Math.PI/2;
    		if (yResult < 0) sProbe = -sProbe;
    	}
    	else {
    		sProbe = yResult/xResult;
    		sProbe = slopeToRad(sProbe);
			if ((yResult > 0 && sProbe < 0) || (yResult < 0 && sProbe > 0)) sProbe = Math.PI + sProbe;
    	}
    	// sProbe = 2 * Math.PI - sProbe;
    	if (sProbe > 2 * Math.PI) sProbe = sProbe - 2 * Math.PI;
    	probeMagnitude.innerHTML = "STRENGTH: " + parseFloat(Math.sqrt(xResult * xResult + yResult * yResult)).toFixed(3);
    	probeAngle.innerHTML = "ANGLE: " + parseFloat(sProbe).toFixed(3);
    	probeXText.value = xProbe;
    	probeYText.value = yProbe;
    }
    else if (probeCheck == 1 && isMouseDown) {
    	probeMagnitude.innerHTML = "STRENGTH: ";
    	probeAngle.innerHTML = "ANGLE: ";
    }
}

function mouseUp(){
    isMouseDown = false;
    isMouseDownToRotate = false;
    clearInterval(intervalID);
    reDraw(); // sometimes interval is cleared too fast and last drawn location of charge object not the same as actual position recorded
}

function mouseDown(e){
	e.preventDefault();
	intervalID = setInterval(reDraw, intervalTime);
	var check = cursorOverCircle(e.pageX, e.pageY);
	if (check >= 0){
		if (chargeArray[check].pointOrLine == 1){
			currentIndexSelect(chargeArray[check].id, check);
	        cursorX = (e.pageX - canvas.offsetLeft) - chargeArray[currentIndex].xPos;
	        cursorY = (e.pageY - canvas.offsetTop) - chargeArray[currentIndex].yPos; 
	    }
	    else {
	    	currentIndexSelect(chargeArray[check].id, check);
	    	cursorX = (e.pageX - canvas.offsetLeft) - chargeArray[currentIndex].centerX;
	        cursorY = (e.pageY - canvas.offsetTop) - chargeArray[currentIndex].centerY;
	    }
	    isMouseDown = true;
	    if (isMouseOverRotate) isMouseDownToRotate = true;
	}
}

function cursorOverCircle(x, y){
    for (var i = chargeArray.length - 1; i >= 0; i--){
    	if (chargeArray[i].pointOrLine == 1){
    		if ((x - canvas.offsetLeft) > (chargeArray[i].xPos - radiusOne)  &&  (x - canvas.offsetLeft) < (chargeArray[i].xPos + radiusOne)
	        && (y - canvas.offsetTop) > (chargeArray[i].yPos - radiusOne)   &&  (y - canvas.offsetTop) < (chargeArray[i].yPos + radiusOne)){
	    		return i;
	        }
    	}
    	else {
    		if ((x - canvas.offsetLeft) > (chargeArray[i].centerX - radiusLineCircle)  &&  (x - canvas.offsetLeft) < (chargeArray[i].centerX + radiusLineCircle)
	        && (y - canvas.offsetTop) > (chargeArray[i].centerY - radiusLineCircle)   &&  (y - canvas.offsetTop) < (chargeArray[i].centerY + radiusLineCircle)){
	    		return i;
	        }
	        else if ((x - canvas.offsetLeft) > (chargeArray[i].sXPos - radiusRotate)  &&  (x - canvas.offsetLeft) < (chargeArray[i].sXPos + radiusRotate)
	        && (y - canvas.offsetTop) > (chargeArray[i].sYPos - radiusRotate)   &&  (y - canvas.offsetTop) < (chargeArray[i].sYPos + radiusRotate)){
	    		isMouseOverRotate = true;
	    		return i;
	        }
	        else if ((x - canvas.offsetLeft) > (chargeArray[i].eXPos - radiusRotate)  &&  (x - canvas.offsetLeft) < (chargeArray[i].eXPos + radiusRotate)
	        && (y - canvas.offsetTop) > (chargeArray[i].eYPos - radiusRotate)   &&  (y - canvas.offsetTop) < (chargeArray[i].eYPos + radiusRotate)){
	    		isMouseOverRotate = true;
	    		return i;
	        }
    	}
    }
    isMouseOverRotate = false;
    return -1;
}

function addPosPointCharge(){
	var inputStrength = document.getElementById("strengthText");
	var xPosition = document.getElementById("xPosText");
	var yPosition = document.getElementById("yPosText");
	var strength = Number(inputStrength.value);
	var xPos = Number(xPosition.value);
	var yPos = Number(yPosition.value);
	var polarity = 1;
	if (inputStrength.value == "") strength = 1;
	else if(isNaN(strength) || strength == 0) return;
	else if (strength < 0) {
		strength = -strength;
		polarity = -polarity;
	}
	if (xPosition.value == "" || yPosition.value == "") {
		xPos = Math.floor(Math.random() * 500) + 50;
		yPos = Math.floor(Math.random() * 500) + 50;
	}
	else if (isNaN(xPos) || isNaN(yPos)) return;
	else if (xPos < 0 || xPos > 600 || yPos < 0 || yPos > 600) return;
	var newCharge = new chargeElement().initPointCharge(xPos, yPos, polarity, strength, chargeId);
	chargeArray.push(newCharge);
	currentIndex = chargeArray.length - 1;
	updateChargeListPointCharge();
	document.getElementById("li" + chargeId).className = "liClassShade";
	if (chargeArray.length == 1) {
		canvas.onmouseup = mouseUp;
	    canvas.onmousedown = mouseDown;
	    canvas.onmousemove = mouseMoved;
		reDraw();
	}
	else {
		document.getElementById("li" + selectedId).className = "liClassNoShade";
	}
	selectedId = chargeId;
	highestID = chargeId;
	chargeId++;

	reDraw();
}

function addNegPointCharge(){
	var inputStrength = document.getElementById("strengthText");
	var xPosition = document.getElementById("xPosText");
	var yPosition = document.getElementById("yPosText");
	var strength = Number(inputStrength.value);
	var xPos = Number(xPosition.value);
	var yPos = Number(yPosition.value);
	var polarity = -1;
	if (inputStrength.value == "") strength = 1;
	else if(isNaN(strength) || strength == 0) return;
	else if (strength < 0) {
		strength = -strength;
		polarity = -polarity;
	}
	if (xPosition.value == "" || yPosition.value == "") {
		xPos = Math.floor(Math.random() * 500) + 50;
		yPos = Math.floor(Math.random() * 500) + 50;
	}
	else if (isNaN(xPos) || isNaN(yPos)) return;
	else if (xPos < 0 || xPos > 600 || yPos < 0 || yPos > 600) return;
	var newCharge = new chargeElement().initPointCharge(xPos, yPos, polarity, strength, chargeId);
	chargeArray.push(newCharge);
	currentIndex = chargeArray.length - 1;
	updateChargeListPointCharge();
	document.getElementById("li" + chargeId).className = "liClassShade";
	if (chargeArray.length == 1) {
		canvas.onmouseup = mouseUp;
	    canvas.onmousedown = mouseDown;
	    canvas.onmousemove = mouseMoved;
		reDraw();
	}
	else {
		document.getElementById("li" + selectedId).className = "liClassNoShade";
	}
	selectedId = chargeId;
	highestID = chargeId;
	chargeId++;

	reDraw();
}

function addPosLineCharge() {
	var byStartEnd = !document.getElementById("addLineChargeStartEnd").disabled;
	var byAngleLength = !document.getElementById("addLineChargeLengthAngle").disabled;
	var polarity = 1;
	if (byStartEnd && byAngleLength) {
		var chargeDensity = 1;
		var sXPos = 50;
		var sYPos = 100;
		var eXPos = 100;
		var eYPos = 50;
	}
	else if (byStartEnd){
		if (!validateAddLineChargeForm(1)) return;
		var chargeDensity = document.getElementById("chargeDensityText").value;
		var sXPos = document.getElementById("startXTextStartEnd").value;
		var sYPos = document.getElementById("startYTextStartEnd").value;
		var eXPos = document.getElementById("endXText").value;
		var eYPos = document.getElementById("endYText").value;
	}
	else {
		if (!validateAddLineChargeForm(2)) return;
		var chargeDensity = document.getElementById("chargeDensityText").value;
		var angle = document.getElementById("angleText").value;
		var length = document.getElementById("lengthText").value;
		var sXPos = document.getElementById("startXTextLengthAngle").value;
		var sYPos = document.getElementById("startYTextLengthAngle").value;

		var eXPos = determineXEndPoint(sXPos, angle, length);
		var eYPos = determineYEndPoint(sYPos, angle, length);
	}

	var newCharge = new chargeElement().initLineChargeByStartEnd(sXPos, sYPos, eXPos, eYPos, 1, 0, 0, chargeId);
	newCharge.centerX = determineCenter(sXPos, eXPos);
	newCharge.centerY = determineCenter(sYPos, eYPos);

	if (newCharge.centerX < 0 || newCharge.centerX > 600 || newCharge.centerY < 0 || newCharge.centerY > 600){
		return;
	}

	newCharge.angle = findAngle(sXPos, eXPos, sYPos, eYPos);
	newCharge.length = findLength(sXPos, eXPos, sYPos, eYPos);
	chargeArray.push(newCharge);
	currentIndex = chargeArray.length - 1;
	updateChargeListLineCharge();
	document.getElementById("li" + chargeId).className = "liClassShade";
	if (chargeArray.length == 1) {
		canvas.onmouseup = mouseUp;
	    canvas.onmousedown = mouseDown;
	    canvas.onmousemove = mouseMoved;
		reDraw();
	}
	else {
		document.getElementById("li" + selectedId).className = "liClassNoShade";
	}

	selectedId = chargeId;
	highestID = chargeId;
	chargeId++;

	reDraw();
}

function addNegLineCharge() {
	var sXPos = 100;
	var sYPos = 50;
	var eXPos = 50;
	var eYPos = 100;
	var polarity = 1;

	var newCharge = new chargeElement().initLineChargeByStartEnd(sXPos, sYPos, eXPos, eYPos, -1, 0, 0, chargeId);
	newCharge.centerX = determineCenter(sXPos, eXPos);
	newCharge.centerY = determineCenter(sYPos, eYPos);
	newCharge.angle = findAngle(sXPos, eXPos, sYPos, eYPos);
	newCharge.length = findLength(sXPos, eXPos, sYPos, eYPos);
	chargeArray.push(newCharge);
	currentIndex = chargeArray.length - 1;
	updateChargeListLineCharge();
	document.getElementById("li" + chargeId).className = "liClassShade";
	if (chargeArray.length == 1) {
		canvas.onmouseup = mouseUp;
	    canvas.onmousedown = mouseDown;
	    canvas.onmousemove = mouseMoved;
		reDraw();
	}
	else {
		document.getElementById("li" + selectedId).className = "liClassNoShade";
	}

	selectedId = chargeId;
	highestID = chargeId;
	chargeId++;

	reDraw();
}

function validateAddLineChargeForm (method) {
	var chargeDensity = document.getElementById("chargeDensityText");
	if (method == 1) {
		var startXTextStartEnd = document.getElementById("startXTextStartEnd");
		var startYTextStartEnd = document.getElementById("startYTextStartEnd");
		var endXText = document.getElementById("endXText");
		var endYText = document.getElementById("endYText");

		if (isNaN(chargeDensity.value) || isNaN(startXTextStartEnd.value) || isNaN(startYTextStartEnd.value) || isNaN(endXText.value) || isNaN(endYText.value)){
			return false;
		}
		else if (chargeDensity.value <= 0) {
			return false;
		}
		else if (startXTextStartEnd.value < 0 || startYTextStartEnd.value < 0 || endXText.value < 0 || endYText.value < 0) {
			return false;
		}
		else if (startXTextStartEnd.value > 600 || startYTextStartEnd.value > 600 || endXText.value > 600 || endYText.value > 600) {
			return false;
		}
		else if ((startXTextStartEnd.value + startYTextStartEnd.value + endXText.value + endYText.value) == 0) {
			return false;
		}
		else return true;
	}
	else {
		var angleText = document.getElementById("angleText");
		var lengthText = document.getElementById("lengthText");
		var startXTextLengthAngle = document.getElementById("startXTextLengthAngle");
		var startYTextLengthAngle = document.getElementById("startYTextLengthAngle");

		if (isNaN(chargeDensity.value) || isNaN(angleText.value) || isNaN(lengthText.value) || isNaN(startXTextLengthAngle.value) || isNaN(startYTextLengthAngle.value)){
			return false;
		}
		else if (chargeDensity.value <= 0) {
			return false;
		}
		else if (lengthText.value <= 0 || startXTextLengthAngle.value < 0 || startYTextLengthAngle.value < 0){
			return false;
		}
		else if (startXTextLengthAngle.value > 600 || startYTextLengthAngle.value > 600) {
			return false;
		}
		else return true;
	}
}

function determineCenter (first, second) {
	var center;
	if (second > first) center = Math.floor((second - first)/2) + parseInt(first);
	else center = Math.floor((first - second)/2) + parseInt(second);
	return center;
}

function determineXEndPoint (xPos, angle, length) {
	var xEndPoint = xPos + Math.cos(angle);
	return xEndPoint;
}

function determineYEndPoint (yPos, angle, length) {
	var yEndPoint = yPos - Math.sin(angle);
	return yEndPoint;
}

function findAngle (sXPos, eXPos, sYPos, eYPos) {
	var angle;
	var length;
	var height;
	if (eXPos == sXPos) return Math.PI/2;
	else if (eYPos == sYPos) return 0;
	height = eYPos - sYPos;
	length = eXPos - sXPos;
	angle = Math.atan(height/length); 
	// if line is / then the angle will definitely be negative
	// if line is \ then the angle will definitely be positive
	// angle range will only be from Math.PI/2 to -Math.PI/2
	return angle;
}

function findLength(sXPos, eXPos, sYPos, eYPos){
	var xLength = eXPos - sXPos;
	var yLength = eYPos - sYPos;

	return Math.sqrt((xLength * xLength) + (yLength * yLength));
}

function rotateLine(mouseX, mouseY) {
	var angle;
	var length;
	var height;
	var index = chargeArray.length - 1;
	if (mouseX == chargeArray[index].centerX) {
		chargeArray[index].sXPos = chargeArray[index].centerX;
		chargeArray[index].sYPos = chargeArray[index].centerY + Math.ceil(length/2);
		chargeArray[index].eXPos = chargeArray[index].centerX;
		chargeArray[index].eYPos = chargeArray[index].centerY - Math.ceil(length/2);
	}
	else {
		height = chargeArray[index].centerY - mouseY;
		length = chargeArray[index].centerX - mouseX;
		angle = Math.atan(height/length);
		var newAddedXPos = Math.ceil(chargeArray[index].length/2) * Math.cos(-angle);
		var newAddedYPos = Math.ceil(chargeArray[index].length/2) * Math.sin(-angle);
		chargeArray[index].angle = angle;
		chargeArray[index].sXPos = chargeArray[index].centerX + newAddedXPos;
		chargeArray[index].sYPos = chargeArray[index].centerY - newAddedYPos;
		chargeArray[index].eXPos = chargeArray[index].centerX - newAddedXPos;
		chargeArray[index].eYPos = chargeArray[index].centerY + newAddedYPos;
	}
}

function updateChargeListPointCharge () {
	var chargeList = document.getElementById ("chargeList");
	var listElement = document.createElement("li");
	var rightBlock = document.createElement("div");
	var textElement = document.createElement("div");
	var colorCodeElement = document.createElement("img");
	var expandButton = document.createElement("img");
	var optionsButton = document.createElement("div");
	var xPosContainer = document.createElement("div");
	var yPosContainer = document.createElement("div");
	var xPosContainerText = document.createElement("span");
	var xPosContainerInput = document.createElement("span");
	var yPosContainerText = document.createElement("span");
	var yPosContainerInput = document.createElement("span");

	var chargeObject = chargeArray[chargeArray.length - 1];

	if (chargeObject.polarity > 0) colorCodeElement.src = "images/posChargeColorCode.png";
	else colorCodeElement.src = "images/negChargeColorCode.png";
	rightBlock.className = "liMainDiv";
	colorCodeElement.id = "colorCodeBar" + chargeObject.id;
	listElement.className = "liClassNoShade";
	listElement.id = "li" + chargeObject.id;
	textElement.className = "textElement";
	expandButton.src = "images/expandPanel.png";
	expandButton.width = "170";
	expandButton.className = "listElementExpandButton";
	expandButton.id = "eb" + chargeObject.id;
	expandButton.alt = "1";
	optionsButton.className = "listOptionsButton";
	optionsButton.id = "ob" + chargeObject.id;

	xPosContainer.className = "listPosContainer";
	xPosContainer.id = "xPosCont" + chargeObject.id;
	xPosContainerText.className = "promptStyle";
	xPosContainerText.innerHTML = "X POSITION: "
	xPosContainerInput.className = "promptStyle";
	xPosContainerInput.id = "xPos" + chargeObject.id;
	xPosContainerInput.innerHTML = chargeObject.xPos;

	yPosContainer.className = "listPosContainer";
	yPosContainer.id = "yPosCont" + chargeObject.id;
	yPosContainerText.className = "promptStyle";
	yPosContainerText.innerHTML = "Y POSITION: "
	yPosContainerInput.className = "promptStyle";
	yPosContainerInput.id = "yPos" + chargeObject.id;
	yPosContainerInput.innerHTML = chargeObject.yPos;

	// listElement.style.background = "#EAEAEA"; // COMMENT: setting the background in js overrides the background hover property in css? need to look into topic: "specificity"
	chargeList.appendChild(listElement);
	listElement.appendChild(colorCodeElement);
	listElement.appendChild(rightBlock);
	listElement.setAttribute("onClick", "currentIndexSelect(" + chargeObject.id + ", -1)");
	expandButton.setAttribute("onClick", "expandButtonListClick(" + chargeObject.id + ")");
	
	// stops the click action to propagating to the overall li element and cause currentSelectClick() to run
	$(expandButton).click(function(event) {event.stopPropagation()});
	optionsButton.setAttribute("onClick", "optionsButtonListClick(" +chargeObject.id + ")");
	// stops the click action to propagating to the overall li element and cause currentSelectClick() to run
	$(optionsButton).click(function(event) {event.stopPropagation()});
	rightBlock.appendChild(textElement);
	rightBlock.appendChild(xPosContainer);
	rightBlock.appendChild(yPosContainer);
	rightBlock.appendChild(optionsButton);
	rightBlock.appendChild(expandButton);
	
	if (chargeObject.polarity == 1) textElement.innerHTML += chargeObject.pointChargeStrength +" C </br>";
	else textElement.innerHTML += "-" + chargeObject.pointChargeStrength +" C </br>";
	textElement.innerHTML += "Point Charge </br>";
	xPosContainer.appendChild(xPosContainerText);
	xPosContainer.appendChild(xPosContainerInput);
	yPosContainer.appendChild(yPosContainerText);
	yPosContainer.appendChild(yPosContainerInput);
    $("#xPosCont" + chargeObject.id).hide();
    $("#yPosCont" + chargeObject.id).hide();
    $("#ob" + chargeObject.id).hide();
    $("#eb" + chargeObject.id).toggle(function() { 
    // the prevAll jQuery function returns the *sibling* predecessors of an element        
        $(this).prevAll(".listPosContainer").slideDown(); 
        $(this).prevAll(".listOptionsButton").slideDown();
    }, function() {                      
        $(this).prevAll(".listPosContainer").slideUp();
        $(this).prevAll(".listOptionsButton").slideUp();
    }); 
}

function updateChargeListLineCharge() {
	var chargeList = document.getElementById ("chargeList");
	var listElement = document.createElement("li");
	var rightBlock = document.createElement("div");
	var textElement = document.createElement("div");
	var colorCodeElement = document.createElement("img");
	var expandButton = document.createElement("img");
	var optionsButton = document.createElement("div");
	var xPosCenterContainer = document.createElement("div");
	var yPosCenterContainer = document.createElement("div");
	var angleContainer = document.createElement("div");
	var xPosCenterContainerText = document.createElement("span");
	var xPosCenterContainerInput = document.createElement("span");
	var yPosCenterContainerText = document.createElement("span");
	var yPosCenterContainerInput = document.createElement("span");
	var angleContainerText = document.createElement("span");
	var angleContainerInput = document.createElement("span");

	var chargeObject = chargeArray[chargeArray.length - 1];

	if (chargeObject.polarity > 0) colorCodeElement.src = "images/posChargeColorCode.png";
	else colorCodeElement.src = "images/negChargeColorCode.png";
	rightBlock.className = "liMainDiv";
	colorCodeElement.id = "colorCodeBar" + chargeObject.id;
	listElement.className = "liClassNoShade";
	listElement.id = "li" + chargeObject.id;
	textElement.className = "textElement";
	expandButton.src = "images/expandPanel.png";
	expandButton.width = "170";
	expandButton.className = "listElementExpandButton";
	expandButton.id = "eb" + chargeObject.id;
	expandButton.alt = "1";
	optionsButton.className = "listOptionsButton";
	optionsButton.id = "ob" + chargeObject.id;

	xPosCenterContainer.className = "listPosContainer";
	xPosCenterContainer.id = "xCentPosCont" + chargeObject.id;
	xPosCenterContainerText.className = "promptStyle";
	xPosCenterContainerText.innerHTML = "CENTER X: "
	xPosCenterContainerInput.className = "promptStyle";
	xPosCenterContainerInput.id = "xCentPos" + chargeObject.id;
	xPosCenterContainerInput.innerHTML = chargeObject.centerX;

	yPosCenterContainer.className = "listPosContainer";
	yPosCenterContainer.id = "yCentPosCont" + chargeObject.id;
	yPosCenterContainerText.className = "promptStyle";
	yPosCenterContainerText.innerHTML = "CENTER Y: "
	yPosCenterContainerInput.className = "promptStyle";
	yPosCenterContainerInput.id = "yCentPos" + chargeObject.id;
	yPosCenterContainerInput.innerHTML = chargeObject.centerY;

	angleContainer.className = "listPosContainer";
	angleContainer.id = "angleCont" + chargeObject.id;
	angleContainerText.className = "promptStyle";
	angleContainerText.innerHTML = "ANGLE: ";
	angleContainerInput.className = "promptStyle";
	angleContainerInput.id = "angle" + chargeObject.id;
	angleContainerInput.innerHTML = chargeObject.angle;

	// listElement.style.background = "#EAEAEA"; // COMMENT: setting the background in js overrides the background hover property in css? need to look into topic: "specificity"
	chargeList.appendChild(listElement);
	listElement.appendChild(colorCodeElement);
	listElement.appendChild(rightBlock);
	listElement.setAttribute("onClick", "currentIndexSelect(" + chargeObject.id + ", -1)");
	expandButton.setAttribute("onClick", "expandButtonListClick(" + chargeObject.id + ")");
	
	// stops the click action to propagating to the overall li element and cause currentSelectClick() to run
	$(expandButton).click(function(event) {event.stopPropagation()});
	optionsButton.setAttribute("onClick", "");
	// stops the click action to propagating to the overall li element and cause currentSelectClick() to run
	$(optionsButton).click(function(event) {event.stopPropagation()});
	rightBlock.appendChild(textElement);
	rightBlock.appendChild(xPosCenterContainer);
	rightBlock.appendChild(yPosCenterContainer);
	rightBlock.appendChild(angleContainer);
	rightBlock.appendChild(optionsButton);
	rightBlock.appendChild(expandButton);
	
	if (chargeObject.polarity == 1) textElement.innerHTML += chargeObject.pointChargeStrength +" C </br>";
	else textElement.innerHTML += "-" + chargeObject.pointChargeStrength +" C </br>";
	textElement.innerHTML += "Line Charge </br>";
	xPosCenterContainer.appendChild(xPosCenterContainerText);
	xPosCenterContainer.appendChild(xPosCenterContainerInput);
	yPosCenterContainer.appendChild(yPosCenterContainerText);
	yPosCenterContainer.appendChild(yPosCenterContainerInput);
	angleContainer.appendChild(angleContainerText);
	angleContainer.appendChild(angleContainerInput);
    $("#xCentPosCont" + chargeObject.id).hide();
    $("#yCentPosCont" + chargeObject.id).hide();
    $("#angleCont" + chargeObject.id).hide();
    $("#ob" + chargeObject.id).hide();
    $("#eb" + chargeObject.id).toggle(function() { 
    // the prevAll jQuery function returns the *sibling* predecessors of an element        
        $(this).prevAll(".listPosContainer").slideDown(); 
        $(this).prevAll(".listOptionsButton").slideDown();
    }, function() {                      
        $(this).prevAll(".listPosContainer").slideUp();
        $(this).prevAll(".listOptionsButton").slideUp();
    });
}

// arrayIndexParameter for when you already know the array index (used in the mouseDown() function)
function currentIndexSelect(id, arrayIndexParameter) {
	var arrayIndex;
	if (arrayIndexParameter < 0){
		arrayIndex = findArrayIndexFromID(id);
	}
	else arrayIndex = arrayIndexParameter;
	var newCharge = chargeArray[arrayIndex];
	chargeArray[arrayIndex] = chargeArray[chargeArray.length - 1];
	chargeArray[chargeArray.length - 1] = newCharge;
	currentIndex = chargeArray.length - 1;
	document.getElementById("li" + selectedId).className = "liClassNoShade";
	document.getElementById("li" + id).className = "liClassShade";
	selectedId = id;
	reDraw();
}

function probe() {
	var probeMagnitude = document.getElementById("probeMagnitude");
    var probeAngle = document.getElementById("probeAngle");
    var probeXText = document.getElementById("probeXText");
    var probeYText = document.getElementById("probeYText");
    var probeButton = document.getElementById("probeButton");
	probeCheck = -probeCheck;
    if (probeCheck == 1) {
    	$(".probeInfoContainer").show();
    	probeButton.style.backgroundPosition="65px 70px";

    	// conditions for when it works
    	if (!isNaN(probeXText.value) && !isNaN(probeYText.value) && probeYText.value != "" && probeXText.Value != ""){
    		if (probeYText.value >= 0 && probeYText.value <= canvas.height && probeXText.value >= 0 && probeXText.value <= canvas.width) {
    			strengthAngleSet(probeXText.value, probeYText.value);
    		}
    	}
    }
    else {
    	$(".probeInfoContainer").hide();
		probeMagnitude.innerHTML = "";
		probeAngle.innerHTML = "";
    	probeButton.style.backgroundPosition="0px 70px";
    }
}

function strengthAngleSet(xProbe, yProbe) {
    	var dProbe;
    	var sProbe = 0;
    	var xResult = 0;
    	var yResult = 0;
    	var strengthResult;
    	var angleResult;
		var probeMagnitude = document.getElementById("probeMagnitude");
	    var probeAngle = document.getElementById("probeAngle");
    	for (var i = 0; i < chargeArray.length; i++){
    		dProbe = (chargeArray[i].xPos - xProbe) * (chargeArray[i].xPos - xProbe) + (chargeArray[i].yPos - yProbe) * (chargeArray[i].yPos - yProbe);
    		dProbe = dProbe / 1000000;
			if (xProbe - chargeArray[i].xPos > -0.01 && xProbe - chargeArray[i].xPos < 0.01){
				sProbe = Math.PI/2;
				if (yProbe - chargeArray[i].yPos < 0){
					sProbe = -sProbe;
				}
			}
			else {
				sProbe = (yProbe - chargeArray[i].yPos)/(xProbe - chargeArray[i].xPos);
				sProbe = slopeToRad(sProbe);
				if ((yProbe - chargeArray[i].yPos > 0 && sProbe < 0) || (yProbe - chargeArray[i].yPos < 0 && sProbe > 0)) {
					sProbe = Math.PI + sProbe;
				}
			}
			if (chargeArray[i].polarity == -1) sProbe = sProbe + Math.PI;
			if (sProbe > 2 * Math.PI) sProbe = sProbe - 2 * Math.PI;
			xResult += (Math.cos(sProbe) * chargeArray[i].pointChargeStrength/dProbe);
			yResult += (Math.sin(sProbe) * chargeArray[i].pointChargeStrength/dProbe);
    	}
    	yResult = -yResult;
    	if (xResult > -0.01 && xResult < 0.01) {
    		sProbe = Math.PI/2;
    		if (yResult < 0) sProbe = -sProbe;
    	}
    	else {
    		sProbe = yResult/xResult;
    		sProbe = slopeToRad(sProbe);
			if ((yResult > 0 && sProbe < 0) || (yResult < 0 && sProbe > 0)) sProbe = Math.PI + sProbe;
    	}
    	// sProbe = 2 * Math.PI - sProbe;
    	if (sProbe > 2 * Math.PI) sProbe = sProbe - 2 * Math.PI;
    	probeMagnitude.innerHTML = "STRENGTH: " + parseFloat(Math.sqrt(xResult * xResult + yResult * yResult)).toFixed(3);
    	probeAngle.innerHTML = "ANGLE: " + parseFloat(sProbe).toFixed(3);
}

function updateScale() {
	var scaleText = document.getElementById("scaleText");
	var temp = Number(scaleText.value);
	if (isNaN(temp)) return;
	else distanceScale = temp;
}

function expandButtonListClick(id) {
	var expandButton = document.getElementById("eb" + id);
	var arrayIndex;
	if (expandButton.alt == "1") {
		expandButton.src = "images/contractPanel.png";
		arrayIndex = findArrayIndexFromID(id);
		if (chargeArray[arrayIndex].pointOrLine == 1) {
			document.getElementById("xPos" + id).innerHTML = chargeArray[arrayIndex].xPos;
			document.getElementById("yPos" + id).innerHTML = chargeArray[arrayIndex].yPos;			
		}
		else {
			document.getElementById("xCentPos" + id).innerHTML = chargeArray[arrayIndex].centerX;
			document.getElementById("yCentPos" + id).innerHTML = chargeArray[arrayIndex].centerY;	
			document.getElementById("angle" + id).innerHTML = chargeArray[arrayIndex].angle;
		}

	}
	else expandButton.src = "images/expandPanel.png";
	expandButton.alt = -expandButton.alt;
}

function optionsButtonListClick(id) {
	currentIndexSelect(id, -1);
	var canvasContainer = document.getElementById("canvasContainer");
	var optionsPopUp = createNewElement("div", "popUp", "optionsPopUp fullScreenDivFade", "");
	var optionsHeadingPopUp = createNewElement("div", "", "optionsHeadingPopUp fullScreenDivFade", "OPTIONS");
	var crossImage = createNewElement("div", "", "crossImage", "");
	var optionsLeftContainer = createNewElement("div", "", "optionsLeftContainer", "");
	var optionsRightContainer = createNewElement("div", "", "optionsRightContainer", "");
	var optionsBottomContainer = createNewElement("div", "", "optionsBottomContainer", "");
	var optionsUpdateButton = createNewElement("div", "", "optionsUpdateDeleteButton", "Update");
	var optionsDeleteButton = createNewElement("div", "", "optionsUpdateDeleteButton", "Delete");
	var fullScreenDiv = createNewElement("div", "fullScreenDiv", "fullScreenDiv fullScreenDivFade", "");

	var otcLeft1 = createNewElement("div", "", "optionsTextContainer", "X POSITION: ");
	var otcLeft2 = createNewElement("div", "", "optionsTextContainer", "Y POSITION: ");
	var otcLeft3 = createNewElement("div", "", "optionsTextContainer", "POLARITY: ");

	var otcRight1 = createNewElement("div", "", "optionsTextContainer", "");
	var otcRight2 = createNewElement("div", "", "optionsTextContainer", "");

	var input1 = createNewElement("input", "optionsXPOS", "", "");
	var input2 = createNewElement("input", "optionsYPOS", "", "");

	input1.type = "text";
	input2.type = "text";

	input1.size = 6;
	input2.size = 6;

	var polarityDiv = document.createElement("div");
	var polarityDivPic = createNewElement("img", "polarityDivPic", "optionsPosNegSel", "");

	var arrayIndex = findArrayIndexFromID(id);
	var chargeArrayTemp = chargeArray[arrayIndex];

	if (chargeArrayTemp.polarity == 1) {
		polarityDivPic.src = "images/posCharge.png";
		polarityDivPic.alt = "1";
	}
	else {
		polarityDivPic.src = "images/negCharge.png";
		polarityDivPic.alt = "-1";
	}

	input1.value = chargeArrayTemp.xPos;
	input2.value = chargeArrayTemp.yPos;
 
 	canvasContainer.appendChild(fullScreenDiv);
	canvasContainer.appendChild(optionsPopUp);
	optionsPopUp.appendChild(optionsHeadingPopUp);
	optionsHeadingPopUp.appendChild(crossImage);
	optionsPopUp.appendChild(optionsLeftContainer);
	optionsPopUp.appendChild(optionsRightContainer);
	optionsPopUp.appendChild(optionsBottomContainer);
	optionsLeftContainer.appendChild(otcLeft1);
	optionsLeftContainer.appendChild(otcLeft2);
	optionsLeftContainer.appendChild(otcLeft3);
	optionsRightContainer.appendChild(otcRight1);
	otcRight1.appendChild(input1);
	otcRight2.appendChild(input2);
	optionsRightContainer.appendChild(otcRight2);
	optionsRightContainer.appendChild(polarityDiv);
	polarityDiv.appendChild(polarityDivPic);
	optionsBottomContainer.appendChild(optionsUpdateButton);
	optionsBottomContainer.appendChild(optionsDeleteButton);

	fullScreenDiv.setAttribute("onClick", "closeOptionsPopUp(true)");
	crossImage.setAttribute("onClick", "closeOptionsPopUp(true)");
	polarityDivPic.setAttribute("onClick", "changeChargePolarity()");
	optionsUpdateButton.setAttribute("onClick", "updateCharge("+ id +")");
	optionsDeleteButton.setAttribute("onClick", "deleteCharge("+ id +")");

	// $("#fullScreenDiv").hover(
	// 	function () {
	// 		$(".fullScreenDivFade").fadeTo(500, 0.3);
	// 	},
	// 	function () {
	// 		$(".fullScreenDivFade").fadeTo(500, 1.0);
	// 	}
	// );

	defaultTextBoxBorderColor = document.getElementById("optionsXPOS").style.borderColor;

	canvas.onmouseup = null;
    canvas.onmousedown = null;
    canvas.onmousemove = null;
	clearInterval(intervalID);
}

function createNewElement (type, id, className, text){
	var temp = document.createElement(type);
	temp.id = id;
	temp.className = className;
	temp.innerHTML = text;
	return temp;
}

function closeOptionsPopUp (continueDrawing) {
	var canvasContainer = document.getElementById("canvasContainer");
	canvasContainer.removeChild(document.getElementById("fullScreenDiv"));
	canvasContainer.removeChild(document.getElementById("popUp"));

	if (continueDrawing) {
	    canvas.onmouseup = mouseUp;
	    canvas.onmousedown = mouseDown;
	    canvas.onmousemove = mouseMoved;
	    reDraw();
	}
	else {
		canvas.onmouseup = null;
	    canvas.onmousedown = null;
	    canvas.onmousemove = null;
		clearInterval(intervalID);
	}
}

function findArrayIndexFromID (id) {
	for (var i = 0; i < chargeArray.length; i++){
		if (chargeArray[i].id == id) return i;
	}
	return -1;
}

function changeChargePolarity () {
	var polarityDivPic = document.getElementById("polarityDivPic");
	polarityDivPic.alt = -polarityDivPic.alt;
	if (polarityDivPic.alt == "-1") polarityDivPic.src = "images/negCharge.png";
	else polarityDivPic.src = "images/posCharge.png";
}

function updateCharge (id) {
	var arrayIndex = findArrayIndexFromID(id);
	var chargeObjectUpdate = chargeArray[arrayIndex];
	var xPosText = document.getElementById("optionsXPOS").value;
	var yPosText = document.getElementById("optionsYPOS").value;
	var polarity = document.getElementById("polarityDivPic").alt;

	var xPosHasError = false;
	var yPosHasError = false;

	if (isNaN(xPosText) || xPosText == "") xPosHasError = true;
	else if (xPosText < 0 || xPosText > 600) xPosHasError = true;

	if (isNaN(yPosText) || yPosText == "") yPosHasError = true;
	else if (yPosText < 0 || yPosText > 600) yPosHasError = true;

	if (!xPosHasError && !yPosHasError) {
		chargeObjectUpdate.xPos = xPosText;
		chargeObjectUpdate.yPos = yPosText;
		chargeObjectUpdate.polarity = polarity;

		document.getElementById("xPos" + id).innerHTML = xPosText;
		document.getElementById("yPos" + id).innerHTML = yPosText;

		if (polarity > 0) document.getElementById("colorCodeBar" + id).src = "images/posChargeColorCode.png";
		else document.getElementById("colorCodeBar" + id).src = "images/negChargeColorCode.png";

		closeOptionsPopUp(true);

		reDraw();

		return;
	}

	if (xPosHasError) {
		document.getElementById("optionsXPOS").style.borderColor = errorTextBoxBorderColor;
	}
	else {
		document.getElementById("optionsXPOS").style.borderColor = defaultTextBoxBorderColor;
	}

	if (yPosHasError) {
		document.getElementById("optionsYPOS").style.borderColor = errorTextBoxBorderColor;
	}
	else {
		document.getElementById("optionsYPOS").style.borderColor = defaultTextBoxBorderColor;
	}
}

function deleteCharge (id) {
	chargeArray.pop();

	var chargeList = document.getElementById("chargeList");
	var listElementDelete = document.getElementById("li" + id);

	if (chargeArray.length == 0){
		chargeList.removeChild(listElementDelete);
		canvas.width = canvas.width;
		closeOptionsPopUp(false);
	}
	else {
		if (id != highestID) selectedId = higherAvailableID(id);
		else {
			selectedId = lowerAvailableID(id);
			highestID = selectedId;
		}
		currentIndexSelect(selectedId, -1);

		// if (highestID == id) highestID -= 1;

		// var testString = "";
		// for (var i = 0; i < chargeArray.length; i++) {
		// 	testString += chargeArray[i].id;
		// 	testString += ", ";
		// }
		// alert(testString);
		// alert("Highest ID: " + highestID);

		chargeList.removeChild(listElementDelete);

		closeOptionsPopUp(true);
	}

	// when no elements in chargeArray -> functions to deal with
	// changed draw
	// mouse moved (probe)
	// cursor over circle
}

function higherAvailableID(id){
	var nextElementFullID = $("#li" + id).next().attr("id");
	var nextElementNumberID = nextElementFullID.substr(2);
	return Number(nextElementNumberID);
}

function lowerAvailableID(id){
	var nextElementFullID = $("#li" + id).prev().attr("id");
	var nextElementNumberID = nextElementFullID.substr(2);
	return Number(nextElementNumberID);
}