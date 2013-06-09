var canvas;
var ctx;
var check;
var radgrad;
var intervalID;

var isMouseDown = false;
var currentIndex = 0;

// Canvas Dimensions
var canvasW = 0;
var canvasH = 0;

// Puck Dimensions (and Half thereof)
var oneRadius = 15;

// Pushing first charge
var chargeId = 0;
var selectedId = 0;
var newCharge = new chargeElement (100, 100, 1, 1, chargeId);
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

    updateChargeList();
    currentIndexSelect(selectedId, -1);

    intervalID = setInterval(reDraw, 32); // repaint the canvas at intervals
}

function reDraw() {
	changedDraw();
	ctx.beginPath();
	ctx.strokeStyle = "#FFFF00";
	ctx.arc(chargeArray[currentIndex].xPos, chargeArray[currentIndex].yPos, oneRadius + 1, 0, Math.PI*2, true);
	ctx.stroke();
}

function mouseMoved(e){
	if ( cursorOverCircle(e.pageX, e.pageY) >= 0 )
    {
        document.body.style.cursor = 'pointer';
    }
    else
    {
        document.body.style.cursor = 'default';
    }
    if (isMouseDown)
    {
    	var id = chargeArray[currentIndex].id;
        chargeArray[currentIndex].xPos = (e.pageX - canvas.offsetLeft) - cursorX;
        chargeArray[currentIndex].yPos = (e.pageY - canvas.offsetTop) - cursorY;
        if (document.getElementById("eb" + id).alt == -1){
			document.getElementById("xPos" + id).innerHTML = chargeArray[currentIndex].xPos;
        	document.getElementById("yPos" + id).innerHTML = chargeArray[currentIndex].yPos;
        } 
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
			xResult += (Math.cos(sProbe) * chargeArray[i].chargeStrength/dProbe);
			yResult += (Math.sin(sProbe) * chargeArray[i].chargeStrength/dProbe);
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

function mouseUp()
{
    isMouseDown = false;
}

function mouseDown(e){
	e.preventDefault();
	var check = cursorOverCircle(e.pageX, e.pageY);
	if (check >= 0){
		// var newCharge = chargeArray[check];
		// chargeArray[check] = chargeArray[chargeArray.length - 1];
		// chargeArray[chargeArray.length - 1] = newCharge;
		// currentIndex = chargeArray.length - 1;
		currentIndexSelect(chargeArray[check].id, check);
        cursorX = (e.pageX - canvas.offsetLeft) - chargeArray[currentIndex].xPos;
        cursorY = (e.pageY - canvas.offsetTop) - chargeArray[currentIndex].yPos;
        isMouseDown = true;
	}
}

function cursorOverCircle(x, y)
{

    for (var i = chargeArray.length - 1; i >= 0; i--){
    	if ((x - canvas.offsetLeft) > (chargeArray[i].xPos - oneRadius)  &&  (x - canvas.offsetLeft) < (chargeArray[i].xPos + oneRadius)
        && (y - canvas.offsetTop) > (chargeArray[i].yPos - oneRadius)   &&  (y - canvas.offsetTop) < (chargeArray[i].yPos + oneRadius)){
        	// if (false == isMouseDown) currentIndex = i;
    		return i;
        }
    }

    return -1;
}

function addPosParticle()
{
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
	else if (xPos < 0 || yPos < 0) return;
	var newCharge = new chargeElement (xPos, yPos, polarity, strength, chargeId);
	chargeArray.push(newCharge);
	currentIndex = chargeArray.length - 1;
	updateChargeList();
	document.getElementById("li" + chargeId).className = "liClassShade";
	if (chargeArray.length == 1) {
		canvas.onmouseup = mouseUp;
	    canvas.onmousedown = mouseDown;
	    canvas.onmousemove = mouseMoved;
		intervalID = setInterval(reDraw, 32);
	}
	else {
		document.getElementById("li" + selectedId).className = "liClassNoShade";
	}
	selectedId = chargeId;
	highestID = chargeId;
	chargeId++;
}

function addNegParticle()
{
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
	else if (xPos < 0 || yPos < 0) return;
	var newCharge = new chargeElement (xPos, yPos, polarity, strength, chargeId);
	chargeArray.push(newCharge);
	currentIndex = chargeArray.length - 1;
	updateChargeList();
	document.getElementById("li" + chargeId).className = "liClassShade";
	if (chargeArray.length == 1) {
		canvas.onmouseup = mouseUp;
	    canvas.onmousedown = mouseDown;
	    canvas.onmousemove = mouseMoved;
		intervalID = setInterval(reDraw, 32);
	}
	else {
		document.getElementById("li" + selectedId).className = "liClassNoShade";
	}
	selectedId = chargeId;
	highestID = chargeId;
	chargeId++;
}

function updateChargeList () {
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
	
	if (chargeObject.polarity == 1) textElement.innerHTML += chargeObject.chargeStrength +" C </br>";
	else textElement.innerHTML += "-" + chargeObject.chargeStrength +" C </br>";
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

// arrayIndexParameter for when you already know the array index (used in the mouseDown() function)
function currentIndexSelect(id, arrayIndexParameter) {
	var arrayIndex;
	if (arrayIndexParameter < 0){
		// for (var i = 0; i < chargeArray.length; i++){
		// 	if (id == chargeArray[i].id) {
		// 		arrayIndex = i; 
		// 		break;
		// 	}
		// }
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
			xResult += (Math.cos(sProbe) * chargeArray[i].chargeStrength/dProbe);
			yResult += (Math.sin(sProbe) * chargeArray[i].chargeStrength/dProbe);
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

function addLine() {
	ctx.beginPath();
	ctx.strokeStyle = "#000000";
	ctx.lineWidth = 20;
	ctx.moveTo(50, 200);
	ctx.lineTo(400, 200);
	ctx.lineCap = "round";
	ctx.stroke();
	ctx.lineWidth = 1;
	ctx.lineCap = "butt";
}

function changedDraw() {
	var x = 25;
	var y = 25;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for (var i = 0; i < chargeArray.length; i++){
		radgrad = ctx.createRadialGradient(chargeArray[i].xPos,chargeArray[i].yPos,5,chargeArray[i].xPos,chargeArray[i].yPos,15);
		if(chargeArray[i].polarity == 1){
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
		ctx.arc(chargeArray[i].xPos, chargeArray[i].yPos, oneRadius, 0, Math.PI*2, true);
		ctx.fill();
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
				x1 += (Math.cos(s) * chargeArray[j].chargeStrength/d);
				y1 += (Math.sin(s) * chargeArray[j].chargeStrength/d);
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
	// ctx.stroke();
}

function slopeToRad (slope){
	var slopeRad;
	slopeRad = Math.atan(slope);
	return slopeRad;
}

function unlock() {
	canvas.onmousedown = mouseDown;
    intervalID = setInterval(reDraw, 10); // repaint the canvas at intervals
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
		// for (var i = 0; i < chargeArray.length; i++){
		// 	if (id == chargeArray[i].id) {
		// 		arrayIndex = i; 
		// 		break;
		// 	}
		// }
		arrayIndex = findArrayIndexFromID(id);
		document.getElementById("xPos" + id).innerHTML = chargeArray[arrayIndex].xPos;
		document.getElementById("yPos" + id).innerHTML = chargeArray[arrayIndex].yPos;
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
		intervalID = setInterval(reDraw, 32);
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

	// conditions for when it doesn't work
	if ((isNaN(xPosText) || xPosText == "") || (isNaN(yPosText) || yPosText == "")){
		if (isNaN(xPosText) || xPosText == ""){
			document.getElementById("optionsXPOS").style.borderColor = "#FF1414";
		}
		else {
			document.getElementById("optionsXPOS").style.borderColor = defaultTextBoxBorderColor;
		}
		if (isNaN(yPosText) || yPosText == ""){
			document.getElementById("optionsYPOS").style.borderColor = "#FF1414";
		}
		else {
			document.getElementById("optionsYPOS").style.borderColor = defaultTextBoxBorderColor;
		}
	}
	else {
		chargeObjectUpdate.xPos = xPosText;
		chargeObjectUpdate.yPos = yPosText;
		chargeObjectUpdate.polarity = polarity;

		document.getElementById("xPos" + id).innerHTML = xPosText;
		document.getElementById("yPos" + id).innerHTML = yPosText;

		if (polarity > 0) document.getElementById("colorCodeBar" + id).src = "images/posChargeColorCode.png";
		else document.getElementById("colorCodeBar" + id).src = "images/negChargeColorCode.png";

		closeOptionsPopUp(true);
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