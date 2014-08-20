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

    // NO NEED TO SCALE, OFFSETWIDTH and CANVAS WIDTH are the same

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

    reDraw();

    canvas.onmouseup = mouseUp;
    canvas.onmousedown = mouseDown;
    canvas.onmousemove = mouseMoved;

    updateChargeListPointCharge();
    currentIndexSelect(selectedId, -1);
}

function reDraw() {
	var currentElement = chargeArray[currentIndex];
	changedDraw();
	ctx.beginPath();
	if (currentElement.pointOrLine == 1){
		ctx.strokeStyle = "#FFFF00";
		ctx.arc(currentElement.xPos, currentElement.yPos, radiusOne + 1, 0, Math.PI*2, true);
	}
	else {
		ctx.strokeStyle = "#FFFF00";
		var angleOne = Math.PI/2 + currentElement.angle;
		var angleTwo = 3*(Math.PI/2) + currentElement.angle;
		if (currentElement.sXPos > currentElement.eXPos) {
			ctx.arc(currentElement.sXPos, currentElement.sYPos, radiusLineCircle + 5, angleOne, angleTwo, true);
			ctx.arc(currentElement.eXPos, currentElement.eYPos, radiusLineCircle + 5, angleTwo, angleOne, true);
			ctx.arc(currentElement.sXPos, currentElement.sYPos, radiusLineCircle + 5, angleOne, angleOne, true);
		}
		else if (currentElement.sXPos < currentElement.eXPos){
			ctx.arc(currentElement.sXPos, currentElement.sYPos, radiusLineCircle + 5, angleTwo, angleOne, true);
			ctx.arc(currentElement.eXPos, currentElement.eYPos, radiusLineCircle + 5, angleOne, angleTwo, true);
			ctx.arc(currentElement.sXPos, currentElement.sYPos, radiusLineCircle + 5, angleTwo, angleTwo, true);
		}
		else {
			if (currentElement.sYPos < currentElement.eYPos) {
				ctx.arc(currentElement.sXPos, currentElement.sYPos, radiusLineCircle + 5, angleTwo, angleOne, true);
				ctx.arc(currentElement.eXPos, currentElement.eYPos, radiusLineCircle + 5, angleOne, angleTwo, true);
				ctx.arc(currentElement.sXPos, currentElement.sYPos, radiusLineCircle + 5, angleTwo, angleTwo, true);
			}
			else {
				ctx.arc(currentElement.sXPos, currentElement.sYPos, radiusLineCircle + 5, angleOne, angleTwo, true);
				ctx.arc(currentElement.eXPos, currentElement.eYPos, radiusLineCircle + 5, angleTwo, angleOne, true);
				ctx.arc(currentElement.sXPos, currentElement.sYPos, radiusLineCircle + 5, angleOne, angleOne, true);				
			}
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
			ctx.fill();
			// ie needs this
			ctx.beginPath();
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
				else {
					var tempSimplePCArray = chargeArray[j].simplePCArray;
					for (var k = 0; k < tempSimplePCArray.length; k++){
						d = (tempSimplePCArray[k].xPos - xMiddle) * (tempSimplePCArray[k].xPos - xMiddle) + (tempSimplePCArray[k].yPos - yMiddle) * (tempSimplePCArray[k].yPos - yMiddle);
						if (d < 350) {
							check = 1;
							break;
						}
						d = d / 1000000;
						if (xMiddle - tempSimplePCArray[k].xPos > -0.01 && xMiddle - tempSimplePCArray[k].xPos < 0.01){
							s = Math.PI/2;
							if (yMiddle - tempSimplePCArray[k].yPos < 0){
								s = -(Math.PI/2);
							}
						}
						else {
							s = (yMiddle - tempSimplePCArray[k].yPos)/(xMiddle - tempSimplePCArray[k].xPos);
							s = slopeToRad(s);
							if ((yMiddle - tempSimplePCArray[k].yPos > 0 && s < 0) || (yMiddle - tempSimplePCArray[k].yPos < 0 && s > 0)) {
								s = Math.PI + s;
							}
						}
						if (chargeArray[j].polarity == -1) s = s + Math.PI;
						if (s > 2 * Math.PI) s = s - 2 * Math.PI;
						x1 += (Math.cos(s) * tempSimplePCArray[k].pointChargeStrength/d);
						y1 += (Math.sin(s) * tempSimplePCArray[k].pointChargeStrength/d);
					}
				}
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
    		var id = currentElement.id;
    		if (isMouseDownToRotate){
    			rotateLine(e.pageX - canvas.offsetLeft, e.pageY - canvas.offsetTop);
    		}
    		else {
		     	var xDiff = newXPosition - currentElement.centerX;
		     	var yDiff = newYPosition - currentElement.centerY;
	    		currentElement.centerX = newXPosition;
		        currentElement.centerY = newYPosition;
		        currentElement.sXPos += xDiff;
		        currentElement.eXPos += xDiff;
		        currentElement.sYPos += yDiff;
		        currentElement.eYPos += yDiff;

		        var tempSimplePCArray = currentElement.simplePCArray;
		        for (var i = 0; i < tempSimplePCArray.length; i++){
		        	tempSimplePCArray[i].xPos += xDiff;
		        	tempSimplePCArray[i].yPos += yDiff;
		        }
    		}
    		if (document.getElementById("eb" + id).alt == -1){
				document.getElementById("startCoordsX" + id).innerHTML = currentElement.sXPos;
	        	document.getElementById("startCoordsY" + id).innerHTML = currentElement.sYPos;
	        	document.getElementById("endCoordsX" + id).innerHTML = currentElement.eXPos;
	        	document.getElementById("endCoordsY" + id).innerHTML = currentElement.eYPos;
	        	document.getElementById("angle" + id).innerHTML = -(currentElement.angle).toFixed(4);
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
    		if (chargeArray[i].pointOrLine == 1){
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
    		else {
    			var tempArray = chargeArray[i].simplePCArray;
    			for (var j = 0; j < tempArray.length; j++){
    				dProbe = (tempArray[j].xPos - xProbe) * (tempArray[j].xPos - xProbe) + (tempArray[j].yPos - yProbe) * (tempArray[j].yPos - yProbe);
		    		dProbe = dProbe / 1000000;
					if (xProbe - tempArray[j].xPos > -0.01 && xProbe - tempArray[i].xPos < 0.01){
						sProbe = Math.PI/2;
						if (yProbe - tempArray[j].yPos < 0){
							sProbe = -sProbe;
						}
					}
					else {
						sProbe = (yProbe - tempArray[j].yPos)/(xProbe - tempArray[j].xPos);
						sProbe = slopeToRad(sProbe);
						if ((yProbe - tempArray[j].yPos > 0 && sProbe < 0) || (yProbe - tempArray[j].yPos < 0 && sProbe > 0)) {
							sProbe = Math.PI + sProbe;
						}
					}
					if (chargeArray[i].polarity == -1) sProbe = sProbe + Math.PI;
					if (sProbe > 2 * Math.PI) sProbe = sProbe - 2 * Math.PI;
					xResult += (Math.cos(sProbe) * tempArray[j].pointChargeStrength/dProbe);
					yResult += (Math.sin(sProbe) * tempArray[j].pointChargeStrength/dProbe);
    			}
    		}
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

function addPointCharge(polarityPassedIn){
	var inputStrength = document.getElementById("strengthText");
	var xPosition = document.getElementById("xPosText");
	var yPosition = document.getElementById("yPosText");
	var strength = Number(inputStrength.value);
	var xPos = Number(xPosition.value);
	var yPos = Number(yPosition.value);
	if (polarityPassedIn == 1) var polarity = 1;
	else if (polarityPassedIn == -1) var polarity = -1;
	if (inputStrength.value == "") strength = 1;
	else if(isNaN(strength) || strength == 0) return;
	else if (strength < 0) {
		strength = -strength;
		polarity = -polarity;
	}
	if (xPosition.value == "" || yPosition.value == "") {
		xPos = Math.round(Math.random() * 500) + 50;
		yPos = Math.round(Math.random() * 500) + 50;
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

function addLineCharge(polarityPassedIn) {
	var byStartEnd = !document.getElementById("addLineChargeStartEnd").disabled;
	var byAngleLength = !document.getElementById("addLineChargeLengthAngle").disabled;
	if (polarityPassedIn == 1) var polarity = 1;
	else if (polarityPassedIn == -1) var polarity = -1;
	else return;
	if (byStartEnd && byAngleLength) {
		var chargeDensity = 0.2;
		var lengthPerPoint = 5;
		var sXPos = 50;
		var sYPos = 100;
		var eXPos = 180;
		var eYPos = 130;
	}
	else if (byStartEnd){
		if (!validateAddLineChargeForm(1)) return;
		var chargeDensity = document.getElementById("chargeDensityText").value;
		var lengthPerPoint = document.getElementById("lengthPerPointText").value;
		var sXPos = document.getElementById("startXTextStartEnd").value;
		var sYPos = document.getElementById("startYTextStartEnd").value;
		var eXPos = document.getElementById("endXText").value;
		var eYPos = document.getElementById("endYText").value;

		sXPos = parseFloat(sXPos);
		sYPos = parseFloat(sYPos);
		eXPos = parseFloat(eXPos);
		eYPos = parseFloat(eYPos);
	}
	else {
		if (!validateAddLineChargeForm(2)) return;
		var chargeDensity = document.getElementById("chargeDensityText").value;
		var lengthPerPoint = document.getElementById("lengthPerPointText").value;
		var angle = document.getElementById("angleText").value;
		var length = document.getElementById("lengthText").value;
		var sXPos = document.getElementById("startXTextLengthAngle").value;
		var sYPos = document.getElementById("startYTextLengthAngle").value;

		sXPos = parseFloat(sXPos);
		sYPos = parseFloat(sYPos);
		length = parseFloat(length);

		var eXPos = Math.round(determineXEndPoint(sXPos, angle, length));
		var eYPos = Math.round(determineYEndPoint(sYPos, angle, length));
	}

	var newCharge = new chargeElement().initLineChargeByStartEnd(sXPos, sYPos, eXPos, eYPos, polarity, chargeDensity, lengthPerPoint, chargeId);
	
	newCharge.centerX = determineCenter(sXPos, eXPos);
	newCharge.centerY = determineCenter(sYPos, eYPos);

	if (newCharge.centerX < 0 || newCharge.centerX > 600 || newCharge.centerY < 0 || newCharge.centerY > 600){
		return;
	}

	newCharge.angle = findAngle(sXPos, eXPos, sYPos, eYPos);
	newCharge.length = findLength(sXPos, eXPos, sYPos, eYPos);

	chargeArray.push(newCharge);

	partitionLineCharge(parseFloat(sXPos), parseFloat(eXPos), parseFloat(sYPos), parseFloat(eYPos));

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

function partitionLineCharge (sXPos, eXPos, sYPos, eYPos) {
	var currentElement = chargeArray[chargeArray.length - 1];
	var length = Math.floor(currentElement.length);

	var xMultiplier;
	var yMultiplier;

	if (sXPos > eXPos) xMultiplier = -1;
	else if (sXPos < eXPos) xMultiplier = 1;
	else xMultiplier = 0;

	if (sYPos > eYPos) yMultiplier = -1;
	else if (sYPos < eYPos) yMultiplier = 1;
	else yMultiplier = 0;

	var simpleChargeX = sXPos;
	var simpleChargeY = sYPos;

	var xIncrement = Math.abs((sXPos - eXPos) / (currentElement.simplePCArray.length - 1));
	var yIncrement = Math.abs((sYPos - eYPos) / (currentElement.simplePCArray.length - 1));

	var chargeStrength = currentElement.linearChargeDensity * currentElement.lengthPerPoint;

	if (currentElement.simplePCArray.length == 0) {
		var arrayLength = Math.floor(length/currentElement.lengthPerPoint);

		xIncrement = Math.abs((sXPos - eXPos) / arrayLength);
		yIncrement = Math.abs((sYPos - eYPos) / arrayLength);

		var newSimpleCharge;

		for (var i = 0; i <= arrayLength; i++) {
			newSimpleCharge = new chargeElement().initSimplePointCharge(simpleChargeX, simpleChargeY, chargeStrength);
			currentElement.simplePCArray.push(newSimpleCharge);
			simpleChargeX += xMultiplier * xIncrement;
			simpleChargeY += yMultiplier * yIncrement;
		}
	}
	else {
		for (var i = 0; i < currentElement.simplePCArray.length; i++) {
			currentElement.simplePCArray[i].pointChargeStrength = chargeStrength;
			currentElement.simplePCArray[i].xPos = simpleChargeX;
			currentElement.simplePCArray[i].yPos = simpleChargeY;
			simpleChargeX += xMultiplier * xIncrement;
			simpleChargeY += yMultiplier * yIncrement;
		}
	}


	// floating point coordinates are meaningless here, each pixel on the physical screen corresponds to a canvas point
	// but it doesn't matter since I'm not drawing the simple point charges
}

function validateAddLineChargeForm (method) {
	var chargeDensity = document.getElementById("chargeDensityText");
	var lengthPerPoint = document.getElementById("lengthPerPointText");

	if (isNaN(chargeDensity.value) || isNaN(lengthPerPoint.value)){
		return false;
	}
	else if (chargeDensity.value <= 0 || lengthPerPoint.value < 1) {
		return false;
	}

	if (method == 1) {
		var startXTextStartEnd = document.getElementById("startXTextStartEnd");
		var startYTextStartEnd = document.getElementById("startYTextStartEnd");
		var endXText = document.getElementById("endXText");
		var endYText = document.getElementById("endYText");

		if (isNaN(startXTextStartEnd.value) || isNaN(startYTextStartEnd.value) || isNaN(endXText.value) || isNaN(endYText.value)){
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

		if (isNaN(angleText.value) || isNaN(lengthText.value) || isNaN(startXTextLengthAngle.value) || isNaN(startYTextLengthAngle.value)){
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
	if (second > first) center = Math.round((second - first)/2) + first;
	else center = Math.round((first - second)/2) + second;
	return center;
}

function determineXEndPoint (xPos, angle, length) {
	var xEndPoint = xPos + Math.cos(angle) * length;
	return xEndPoint;
}

function determineYEndPoint (yPos, angle, length) {
	var yEndPoint = yPos - Math.sin(angle) * length;
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

	var length = Math.sqrt((xLength * xLength) + (yLength * yLength));

	return length;
}

function rotateLine(mouseX, mouseY) {
	var angle;
	var length;
	var height;
	var index = chargeArray.length - 1;
	var currentElement = chargeArray[index];
	if (mouseX == currentElement.centerX) {
		currentElement.angle = Math.PI/2;
		currentElement.sXPos = currentElement.centerX;
		currentElement.sYPos = currentElement.centerY + Math.round(currentElement.length/2);
		currentElement.eXPos = currentElement.centerX;
		currentElement.eYPos = currentElement.centerY - Math.round(currentElement.length/2);
	}
	else {
		height = currentElement.centerY - mouseY;
		length = currentElement.centerX - mouseX;
		angle = Math.atan(height/length);
		var newAddedXPos = (currentElement.length/2) * Math.cos(-angle);
		var newAddedYPos = (currentElement.length/2) * Math.sin(-angle);
		currentElement.angle = angle;
		currentElement.sXPos = Math.round(currentElement.centerX + newAddedXPos);
		currentElement.sYPos = Math.round(currentElement.centerY - newAddedYPos);
		currentElement.eXPos = Math.round(currentElement.centerX - newAddedXPos);
		currentElement.eYPos = Math.round(currentElement.centerY + newAddedYPos);
	}
	partitionLineCharge(currentElement.sXPos, currentElement.eXPos, currentElement.sYPos, currentElement.eYPos);
}

function updateChargeListPointCharge () {
	var chargeList = document.getElementById ("chargeList");
	var listElement = document.createElement("li");
	var rightBlock = document.createElement("div");
	var textElement = document.createElement("div");
	var colorCodeElement = document.createElement("img");
	var expandButton = document.createElement("img");
	var optionsButton = document.createElement("div");
	var pcCoordsContainer = document.createElement("div");
	var pcCoordsContainerInput = document.createElement("span");
	var pcCoordsContainerXInput = document.createElement("span");
	var pcCoordsContainerYInput = document.createElement("span");

	var chargeObject = chargeArray[chargeArray.length - 1];

	if (chargeObject.polarity > 0) colorCodeElement.src = "images/posChargeColorCode.png";
	else colorCodeElement.src = "images/negChargeColorCode.png";
	rightBlock.className = "liMainDiv";
	colorCodeElement.id = "colorCodeBar" + chargeObject.id;
	listElement.className = "liClassNoShade";
	listElement.id = "li" + chargeObject.id;
	textElement.id = "pcStrength" + chargeObject.id;
	textElement.className = "textElement";
	expandButton.src = "images/expandPanel.png";
	expandButton.width = "170";
	expandButton.className = "listElementExpandButton";
	expandButton.id = "eb" + chargeObject.id;
	expandButton.alt = "1";
	optionsButton.className = "listOptionsButton";
	optionsButton.id = "ob" + chargeObject.id;

	pcCoordsContainer.className = "listPosContainer";
	pcCoordsContainer.id = "pcCoordsCont" + chargeObject.id;
	pcCoordsContainerXInput.innerHTML = chargeObject.xPos;
	pcCoordsContainerXInput.id = "xPos" + chargeObject.id;
	pcCoordsContainerYInput.innerHTML = chargeObject.yPos;
	pcCoordsContainerYInput.id = "yPos" + chargeObject.id;
	pcCoordsContainerInput.innerHTML = "COORDS: ";
	pcCoordsContainerInput = formatCoords(pcCoordsContainerInput, pcCoordsContainerXInput, pcCoordsContainerYInput);
	pcCoordsContainerInput.className = "promptStyle";

	// listElement.style.background = "#EAEAEA"; // COMMENT: setting the background in js overrides the background hover property in css? need to look into topic: "specificity"
	chargeList.appendChild(listElement);
	listElement.appendChild(colorCodeElement);
	listElement.appendChild(rightBlock);
	listElement.setAttribute("onClick", "currentIndexSelect(" + chargeObject.id + ", -1)");
	expandButton.setAttribute("onClick", "expandButtonListClick(" + chargeObject.id + ")");
	
	// stops the click action to propagating to the overall li element and cause currentSelectClick() to run
	$(expandButton).click(function(event) {event.stopPropagation()});
	optionsButton.setAttribute("onClick", "optionsButtonPointChargeListClick(" +chargeObject.id + ")");
	// stops the click action to propagating to the overall li element and cause currentSelectClick() to run
	$(optionsButton).click(function(event) {event.stopPropagation()});
	rightBlock.appendChild(textElement);
	rightBlock.appendChild(pcCoordsContainer);
	rightBlock.appendChild(optionsButton);
	rightBlock.appendChild(expandButton);
	
	if (chargeObject.polarity == 1) textElement.innerHTML += chargeObject.pointChargeStrength +" C </br>";
	else textElement.innerHTML += "-" + chargeObject.pointChargeStrength +" C </br>";

	textElement.innerHTML += "Point Charge </br>";

	pcCoordsContainer.appendChild(pcCoordsContainerInput);

    $("#pcCoordsCont" + chargeObject.id).hide();
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
	var lengthContainer = document.createElement("div");
	var lengthContainerText = document.createElement("span");
	var lengthContainerInput = document.createElement("span");
	var lengthPerPointContainer = document.createElement("div");
	var lengthPerPointContainerText = document.createElement("span");
	var lengthPerPointContainerInput = document.createElement("span");
	var startCoordsContainer = document.createElement("div");
	var startCoordsContainerInput = document.createElement("span");
	var startCoordsContainerXInput = document.createElement("span");
	var startCoordsContainerYInput = document.createElement("span");
	var endCoordsContainer = document.createElement("div");
	var endCoordsContainerInput = document.createElement("span");
	var endCoordsContainerXInput = document.createElement("span");
	var endCoordsContainerYInput = document.createElement("span");
	var angleContainer = document.createElement("div");
	var angleContainerText = document.createElement("span");
	var angleContainerInput = document.createElement("span");

	var chargeObject = chargeArray[chargeArray.length - 1];

	if (chargeObject.polarity > 0) colorCodeElement.src = "images/posChargeColorCode.png";
	else colorCodeElement.src = "images/negChargeColorCode.png";
	rightBlock.className = "liMainDiv";
	colorCodeElement.id = "colorCodeBar" + chargeObject.id;
	listElement.className = "liClassNoShade";
	listElement.id = "li" + chargeObject.id;
	textElement.id = "lcChargeDensity" + chargeObject.id;
	textElement.className = "textElement";
	expandButton.src = "images/expandPanel.png";
	expandButton.width = "170";
	expandButton.className = "listElementExpandButton";
	expandButton.id = "eb" + chargeObject.id;
	expandButton.alt = "1";
	optionsButton.className = "listOptionsButton";
	optionsButton.id = "ob" + chargeObject.id;

	lengthContainer.className = "listPosContainer";
	lengthContainer.id = "lengthCont" + chargeObject.id;

	lengthPerPointContainer.className = "listPosContainer";
	lengthPerPointContainer.id = "lengthPerPointCont" + chargeObject.id;
	
	startCoordsContainer.className = "listPosContainer";
	startCoordsContainer.id = "startCoordsCont" + chargeObject.id;
	
	endCoordsContainer.className = "listPosContainer";
	endCoordsContainer.id = "endCoordsCont" + chargeObject.id;

	lengthContainerText.className = "promptStyle";
	lengthContainerText.innerHTML = "LENGTH: ";
	lengthContainerInput.className = "promptStyle";
	lengthContainerInput.id = "length" + chargeObject.id;
	lengthContainerInput.innerHTML = (chargeObject.length).toFixed(4);

	lengthPerPointContainerText.className = "promptStyle";
	lengthPerPointContainerText.innerHTML = "LENGTH/CHARGE: ";
	lengthPerPointContainerInput.className = "promptStyle";
	lengthPerPointContainerInput.id = "lengthPerPoint" + chargeObject.id;
	lengthPerPointContainerInput.innerHTML = chargeObject.lengthPerPoint;
	
	startCoordsContainerXInput.innerHTML = chargeObject.sXPos;
	startCoordsContainerXInput.id = "startCoordsX" + chargeObject.id;
	startCoordsContainerYInput.innerHTML = chargeObject.sYPos;
	startCoordsContainerYInput.id = "startCoordsY" + chargeObject.id;
	startCoordsContainerInput.innerHTML = "POINT 1: ";
	startCoordsContainerInput = formatCoords(startCoordsContainerInput, startCoordsContainerXInput, startCoordsContainerYInput);
	startCoordsContainerInput.className = "promptStyle";

	endCoordsContainerXInput.innerHTML = chargeObject.eXPos;
	endCoordsContainerXInput.id = "endCoordsX" + chargeObject.id;
	endCoordsContainerYInput.innerHTML = chargeObject.eYPos;
	endCoordsContainerYInput.id = "endCoordsY" + chargeObject.id;
	endCoordsContainerInput.innerHTML = "POINT 2: ";
	endCoordsContainerInput = formatCoords(endCoordsContainerInput, endCoordsContainerXInput, endCoordsContainerYInput);
	endCoordsContainerInput.className = "promptStyle";

	angleContainer.className = "listPosContainer";
	angleContainer.id = "angleCont" + chargeObject.id;
	angleContainerText.className = "promptStyle";
	angleContainerText.innerHTML = "ANGLE: ";
	angleContainerInput.className = "promptStyle";
	angleContainerInput.id = "angle" + chargeObject.id;
	angleContainerInput.innerHTML = -(chargeObject.angle).toFixed(3);

	// listElement.style.background = "#EAEAEA"; // COMMENT: setting the background in js overrides the background hover property in css? need to look into topic: "specificity"
	chargeList.appendChild(listElement);
	listElement.appendChild(colorCodeElement);
	listElement.appendChild(rightBlock);
	listElement.setAttribute("onClick", "currentIndexSelect(" + chargeObject.id + ", -1)");
	expandButton.setAttribute("onClick", "expandButtonListClick(" + chargeObject.id + ")");
	
	// stops the click action to propagating to the overall li element and cause currentSelectClick() to run
	$(expandButton).click(function(event) {event.stopPropagation()});
	optionsButton.setAttribute("onClick", "optionsButtonLineChargeListClick(" +chargeObject.id + ")");
	// stops the click action to propagating to the overall li element and cause currentSelectClick() to run
	$(optionsButton).click(function(event) {event.stopPropagation()});

	rightBlock.appendChild(textElement);
	rightBlock.appendChild(lengthContainer);
	rightBlock.appendChild(lengthPerPointContainer);
	rightBlock.appendChild(startCoordsContainer);
	rightBlock.appendChild(endCoordsContainer);
	rightBlock.appendChild(angleContainer);
	rightBlock.appendChild(optionsButton);
	rightBlock.appendChild(expandButton);
	
	if (chargeObject.polarity == 1) textElement.innerHTML += chargeObject.linearChargeDensity +" C/unit </br>";
	else textElement.innerHTML += "-" + chargeObject.linearChargeDensity +" C/unit </br>";
	textElement.innerHTML += "Line Charge </br>";

	lengthContainer.appendChild(lengthContainerText);
	lengthContainer.appendChild(lengthContainerInput);

	lengthPerPointContainer.appendChild(lengthPerPointContainerText);
	lengthPerPointContainer.appendChild(lengthPerPointContainerInput);

	startCoordsContainer.appendChild(startCoordsContainerInput);

	endCoordsContainer.appendChild(endCoordsContainerInput);

	angleContainer.appendChild(angleContainerText);
	angleContainer.appendChild(angleContainerInput);

  	$("#eb" + chargeObject.id).prevAll(".listOptionsButton").hide();
    $("#eb" + chargeObject.id).prevAll(".listPosContainer").hide();
    $("#eb" + chargeObject.id).toggle(function() { 
    // the prevAll jQuery function returns the *sibling* predecessors of an element        
        $(this).prevAll(".listPosContainer").slideDown(); 
        $(this).prevAll(".listOptionsButton").slideDown();
    }, function() {                      
        $(this).prevAll(".listPosContainer").slideUp();
        $(this).prevAll(".listOptionsButton").slideUp();
    });
}

function formatCoords(temp, xCoord, yCoord) {
	temp.innerHTML += "(";
	temp.appendChild(xCoord);
	temp.innerHTML += ", ";
	temp.appendChild(yCoord);
	temp.innerHTML += ")";
	return temp;
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
		var currentElement = chargeArray[arrayIndex];
		if (currentElement.pointOrLine == 1) {
			document.getElementById("xPos" + id).innerHTML = currentElement.xPos;
			document.getElementById("yPos" + id).innerHTML = currentElement.yPos;			
		}
		else {
			document.getElementById("startCoordsX" + id).innerHTML = currentElement.sXPos;
			document.getElementById("startCoordsY" + id).innerHTML = currentElement.sYPos;
			document.getElementById("endCoordsX" + id).innerHTML = currentElement.eXPos;
			document.getElementById("endCoordsY" + id).innerHTML = currentElement.eYPos;
			document.getElementById("angle" + id).innerHTML = -(currentElement.angle).toFixed(4);
		}
	}
	else expandButton.src = "images/expandPanel.png";
	expandButton.alt = -expandButton.alt;
}

function optionsButtonPointChargeListClick(id) {
	currentIndexSelect(id, -1);
	var canvasContainer = document.getElementById("canvasContainer");
	var optionsPopUp = createNewElement("div", "popUp", "optionsPointChargePopUp fullScreenDivFade", "");
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
	var currentElement = chargeArray[arrayIndex];

	if (currentElement.polarity == 1) {
		polarityDivPic.src = "images/posCharge.png";
		polarityDivPic.alt = "1";
	}
	else {
		polarityDivPic.src = "images/negCharge.png";
		polarityDivPic.alt = "-1";
	}

	input1.value = currentElement.xPos;
	input2.value = currentElement.yPos;
 
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
	optionsUpdateButton.setAttribute("onClick", "updatePointCharge("+ id +")");
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

function optionsButtonLineChargeListClick(id) {
	currentIndexSelect(id, -1);
	var canvasContainer = document.getElementById("canvasContainer");
	var optionsPopUp = createNewElement("div", "popUp", "optionsLineChargePopUp fullScreenDivFade", "");
	var optionsHeadingPopUp = createNewElement("div", "", "optionsHeadingPopUp fullScreenDivFade", "OPTIONS");
	var crossImage = createNewElement("div", "", "crossImage", "");
	var optionsLeftContainer = createNewElement("div", "", "optionsLineChargeLeftContainer", "");
	var optionsRightContainer = createNewElement("div", "", "optionsLineChargeRightContainer", "");
	var optionsBottomContainer = createNewElement("div", "", "optionsBottomContainer", "");
	var optionsUpdateButton = createNewElement("div", "", "optionsUpdateDeleteButton", "Update");
	var optionsDeleteButton = createNewElement("div", "", "optionsUpdateDeleteButton", "Delete");
	var fullScreenDiv = createNewElement("div", "fullScreenDiv", "fullScreenDiv fullScreenDivFade", "");

	var otcLeft1 = createNewElement("div", "", "optionsTextContainer", "CHARGE DENSITY: ");
	var otcLeft2 = createNewElement("div", "", "optionsTextContainer", "LENGTH PER CHARGE: ");
	var otcLeft3 = createNewElement("div", "", "optionsTextContainer", "START X: ");
	var otcLeft4 = createNewElement("div", "", "optionsTextContainer", "START Y: ");
	var otcLeft5 = createNewElement("div", "", "optionsTextContainer", "END X: ");
	var otcLeft6 = createNewElement("div", "", "optionsTextContainer", "END Y: ");
	var otcLeft7 = createNewElement("div", "", "optionsTextContainer", "POLARITY: ");

	var otcRight1 = createNewElement("div", "", "optionsTextContainer", "");
	var otcRight2 = createNewElement("div", "", "optionsTextContainer", "");
	var otcRight3 = createNewElement("div", "", "optionsTextContainer", "");
	var otcRight4 = createNewElement("div", "", "optionsTextContainer", "");
	var otcRight5 = createNewElement("div", "", "optionsTextContainer", "");
	var otcRight6 = createNewElement("div", "", "optionsTextContainer", "");

	var input1 = createNewElement("input", "optionsChargeDensity", "", "");
	var input2 = createNewElement("input", "optionsLengthPerPoint", "", "");
	var input3 = createNewElement("input", "optionsStartXPos", "", "");
	var input4 = createNewElement("input", "optionsStartYPos", "", "");
	var input5 = createNewElement("input", "optionsEndXPos", "", "");
	var input6 = createNewElement("input", "optionsEndYPos", "", "");

	input1.type = "text";
	input2.type = "text";
	input3.type = "text";
	input4.type = "text";
	input5.type = "text";
	input6.type = "text";

	input1.size = 6;
	input2.size = 6;
	input3.size = 6;
	input4.size = 6;
	input5.size = 6;
	input6.size = 6;

	var polarityDiv = document.createElement("div");
	var polarityDivPic = createNewElement("img", "polarityDivPic", "optionsPosNegSel", "");

	var arrayIndex = findArrayIndexFromID(id);
	var currentElement = chargeArray[arrayIndex];

	if (currentElement.polarity == 1) {
		polarityDivPic.src = "images/posCharge.png";
		polarityDivPic.alt = "1";
	}
	else {
		polarityDivPic.src = "images/negCharge.png";
		polarityDivPic.alt = "-1";
	}

	input1.value = currentElement.linearChargeDensity;
	input2.value = currentElement.lengthPerPoint;
	input3.value = currentElement.sXPos;
	input4.value = currentElement.sYPos;
	input5.value = currentElement.eXPos;
	input6.value = currentElement.eYPos;
 
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
	optionsLeftContainer.appendChild(otcLeft4);
	optionsLeftContainer.appendChild(otcLeft5);
	optionsLeftContainer.appendChild(otcLeft6);
	optionsLeftContainer.appendChild(otcLeft7);
	optionsRightContainer.appendChild(otcRight1);
	optionsRightContainer.appendChild(otcRight2);
	optionsRightContainer.appendChild(otcRight3);
	optionsRightContainer.appendChild(otcRight4);
	optionsRightContainer.appendChild(otcRight5);
	optionsRightContainer.appendChild(otcRight6);
	otcRight1.appendChild(input1);
	otcRight2.appendChild(input2);
	otcRight3.appendChild(input3);
	otcRight4.appendChild(input4);
	otcRight5.appendChild(input5);
	otcRight6.appendChild(input6);
	optionsRightContainer.appendChild(polarityDiv);
	polarityDiv.appendChild(polarityDivPic);
	optionsBottomContainer.appendChild(optionsUpdateButton);
	optionsBottomContainer.appendChild(optionsDeleteButton);

	fullScreenDiv.setAttribute("onClick", "closeOptionsPopUp(true)");
	crossImage.setAttribute("onClick", "closeOptionsPopUp(true)");
	polarityDivPic.setAttribute("onClick", "changeChargePolarity()");
	optionsUpdateButton.setAttribute("onClick", "updateLineCharge("+ id +")");
	optionsDeleteButton.setAttribute("onClick", "deleteCharge("+ id +")");

	// $("#fullScreenDiv").hover(
	// 	function () {
	// 		$(".fullScreenDivFade").fadeTo(500, 0.3);
	// 	},
	// 	function () {
	// 		$(".fullScreenDivFade").fadeTo(500, 1.0);
	// 	}
	// );

	defaultTextBoxBorderColor = document.getElementById("optionsChargeDensity").style.borderColor;

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

function updatePointCharge (id) {
	var chargeObjectUpdate = chargeArray[chargeArray.length - 1];
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

		if (polarity == "1") {
			document.getElementById("pcStrength" + id).innerHTML = chargeObjectUpdate.pointChargeStrength +" C </br>Point Charge </br>";
			document.getElementById("colorCodeBar" + id).src = "images/posChargeColorCode.png";
		}
		else {
			document.getElementById("pcStrength" + id).innerHTML = "-" + chargeObjectUpdate.pointChargeStrength +" C </br>Point Charge </br>";
			document.getElementById("colorCodeBar" + id).src = "images/negChargeColorCode.png";
		}

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

function updateLineCharge (id) {
	var chargeObjectUpdate = chargeArray[chargeArray.length - 1];
	var chargeDensityText = document.getElementById("optionsChargeDensity").value;
	var lengthPerPointText = document.getElementById("optionsLengthPerPoint").value;
	var sXPosText = document.getElementById("optionsStartXPos").value;
	var sYPosText = document.getElementById("optionsStartYPos").value;
	var eXPosText = document.getElementById("optionsEndXPos").value;
	var eYPosText = document.getElementById("optionsEndYPos").value;
	var polarity = document.getElementById("polarityDivPic").alt;

	var newCenterX;
	var newCenterY;
	var newAngle;

	var chargeDensityHasError = false;
	var lengthPerPointHasError = false;
	var sXPosHasError = false;
	var sYPosHasError = false;
	var eXPosHasError = false;
	var eYPosHasError = false;
	var centerHasError = false;

	if (isNaN(chargeDensityText) || chargeDensityText == "") chargeDensityHasError = true;
	else if (chargeDensityText <= 0) chargeDensityHasError = true;

	if (isNaN(lengthPerPointText) || lengthPerPointText == "") lengthPerPointHasError = true;
	else if (lengthPerPointText < 1) lengthPerPointHasError = true;

	if (isNaN(sXPosText) || sXPosText == "") sXPosHasError = true;

	if (isNaN(sYPosText) || sYPosText == "") sYPosHasError = true;

	if (isNaN(eXPosText) || eXPosText == "") eXPosHasError = true;

	if (isNaN(eYPosText) || eYPosText == "") eYPosHasError = true;

	if (!chargeDensityHasError && !lengthPerPointHasError && !sXPosHasError && !sYPosHasError && !eXPosHasError && !eYPosHasError) {

		sXPosText = parseFloat(sXPosText);
		sYPosText = parseFloat(sYPosText);
		newCenterX = determineCenter(sXPosText, eXPosText);
		newCenterY = determineCenter(sYPosText, eYPosText);

		if (newCenterX < 0 || newCenterX > 600 || newCenterY < 0 || newCenterY > 600){
			centerHasError = true;
		}

		if (!centerHasError) {
			chargeObjectUpdate.linearChargeDensity = parseFloat(chargeDensityText);

			if (chargeObjectUpdate.lengthPerPoint != parseFloat(lengthPerPointText)) chargeObjectUpdate.simplePCArray.length = 0;

			chargeObjectUpdate.lengthPerPoint = parseFloat(lengthPerPointText);
			chargeObjectUpdate.sXPos = parseFloat(sXPosText);
			chargeObjectUpdate.sYPos = parseFloat(sYPosText);
			chargeObjectUpdate.eXPos = parseFloat(eXPosText);
			chargeObjectUpdate.eYPos = parseFloat(eYPosText);
			chargeObjectUpdate.centerX = parseFloat(newCenterX);
			chargeObjectUpdate.centerY = parseFloat(newCenterY);
			chargeObjectUpdate.length = findLength (chargeObjectUpdate.sXPos, chargeObjectUpdate.eXPos, chargeObjectUpdate.sYPos, chargeObjectUpdate.eYPos);
			chargeObjectUpdate.angle = findAngle (chargeObjectUpdate.sXPos, chargeObjectUpdate.eXPos, chargeObjectUpdate.sYPos, chargeObjectUpdate.eYPos);
			chargeObjectUpdate.polarity = polarity;

			partitionLineCharge(chargeObjectUpdate.sXPos, chargeObjectUpdate.eXPos, chargeObjectUpdate.sYPos, chargeObjectUpdate.eYPos);

			document.getElementById("length" + id).innerHTML = chargeObjectUpdate.length.toFixed(4);
			document.getElementById("lengthPerPoint" + id).innerHTML = lengthPerPointText;
			document.getElementById("startCoordsX" + id).innerHTML = sXPosText;
			document.getElementById("startCoordsY" + id).innerHTML = sYPosText;
			document.getElementById("endCoordsX" + id).innerHTML = eXPosText;
			document.getElementById("endCoordsY" + id).innerHTML = eYPosText;

			if (polarity == "1") {
				document.getElementById("lcChargeDensity" + id).innerHTML = chargeObjectUpdate.linearChargeDensity +" C/unit </br>Line Charge</br>";
				document.getElementById("colorCodeBar" + id).src = "images/posChargeColorCode.png";
			}
			else {
				document.getElementById("lcChargeDensity" + id).innerHTML = "-" + chargeObjectUpdate.linearChargeDensity +" C/unit </br>Line Charge </br>";
				document.getElementById("colorCodeBar" + id).src = "images/negChargeColorCode.png";
			}

			closeOptionsPopUp(true);

			reDraw();

			return;
		}
	}

	if (chargeDensityHasError) {
		document.getElementById("optionsChargeDensity").style.borderColor = errorTextBoxBorderColor;
	}
	else {
		document.getElementById("optionsChargeDensity").style.borderColor = defaultTextBoxBorderColor;
	}

	if (lengthPerPointHasError) {
		document.getElementById("optionsLengthPerPoint").style.borderColor = errorTextBoxBorderColor;
	}
	else {
		document.getElementById("optionsLengthPerPoint").style.borderColor = defaultTextBoxBorderColor;
	}

	if (sXPosHasError || centerHasError) {
		document.getElementById("optionsStartXPos").style.borderColor = errorTextBoxBorderColor;
	}
	else {
		document.getElementById("optionsStartXPos").style.borderColor = defaultTextBoxBorderColor;
	}

	if (sYPosHasError || centerHasError) {
		document.getElementById("optionsStartYPos").style.borderColor = errorTextBoxBorderColor;
	}
	else {
		document.getElementById("optionsStartYPos").style.borderColor = defaultTextBoxBorderColor;
	}

	if (eXPosHasError || centerHasError) {
		document.getElementById("optionsEndXPos").style.borderColor = errorTextBoxBorderColor;
	}
	else {
		document.getElementById("optionsEndXPos").style.borderColor = defaultTextBoxBorderColor;
	}

	if (eYPosHasError || centerHasError) {
		document.getElementById("optionsEndYPos").style.borderColor = errorTextBoxBorderColor;
	}
	else {
		document.getElementById("optionsEndYPos").style.borderColor = defaultTextBoxBorderColor;
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