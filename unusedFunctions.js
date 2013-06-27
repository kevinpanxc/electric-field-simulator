function drawVectorField()
{
	var x = 50;
	var y = 50;
	clearInterval(intervalID);
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	// for (var i = 1; i < 10; i++){
	// 	ctx.beginPath();
	// 	ctx.moveTo(x * i, 0);
	// 	ctx.lineTo(x * i, 500);
	// 	ctx.stroke();
	// }
	// for (var i = 1; i < 10; i++){
	// 	ctx.beginPath();
	// 	ctx.moveTo(0, y * i);
	// 	ctx.lineTo(500, y * i);
	// 	ctx.stroke();
	// }
	for (var i = 0; i < xPos.length; i++){
		radgrad = ctx.createRadialGradient(xPos[i],yPos[i],5,xPos[i],yPos[i],15);
		radgrad.addColorStop(0, 'rgba(0,0,0,1)');
		radgrad.addColorStop(0.8, 'rgba(200,200,200,.9)');
		radgrad.addColorStop(1, 'rgba(255,255,255,0)');

		ctx.fillStyle = radgrad;


		ctx.beginPath();
		ctx.arc(xPos[i], yPos[i], oneRadius, 0, Math.PI*2, true);
		ctx.closePath();
		ctx.fill();
	}
	isMouseDown = false;
    canvas.onmousedown = 0;

    ctx.strokeStyle = "#99CCFF";

    var slope;
    var xMiddle;
    var yMiddle;
    var xDisplacement;
    var yDisplacement = 0;

    for (var h = 0; h < 10; h++){
 	    for (var i = 0; i < 10; i++){
	    	xMiddle = x/2 + x * i;
 	    	yMiddle = y/2 + y * h;
 	    	if (Math.abs(xPos[0] - xMiddle) < 19 && Math.abs(yPos[0] - yMiddle) < 19) continue; // ensures no line is drawn too close to the charged particle
 	    	else {
	 	    	if (xMiddle - xPos[0] > -0.01 && xMiddle - xPos[0] < 0.01){
	 	    		yDisplacement = 9;
	 	    		xDisplacement = 0;
	 	    	}
	 	    	else {
	 	    		slope = ((yMiddle - yPos[0])/(xMiddle - xPos[0]));
	 	    		xDisplacement = Math.sqrt(121/((slope * slope) + 1)); // ensures every line is the same length
	 	    		yDisplacement = 0;
	 	    	}
				ctx.moveTo(xMiddle + xDisplacement, yMiddle + (xDisplacement * slope) + yDisplacement);
				ctx.lineTo(xMiddle - xDisplacement, yMiddle - (xDisplacement * slope) - yDisplacement);
				ctx.stroke();
 	    	}
	    }
    }
}

function drawCircle () {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.strokeStyle = "#D9D9D9";
	var x = 50;
	var y = 50;
	for (var i = 1; i < 10; i++){
		ctx.beginPath();
		ctx.moveTo(x * i, 0);
		ctx.lineTo(x * i, 500);
		ctx.stroke();
	}
	for (var i = 1; i < 10; i++){
		ctx.beginPath();
		ctx.moveTo(0, y * i);
		ctx.lineTo(500, y * i);
		ctx.stroke();
	}
	for (var i = 0; i < xPos.length; i++){
		ctx.beginPath();
		ctx.moveTo(xPos[i],yPos[i]);
		ctx.lineTo(xPos[i],0);
		ctx.moveTo(xPos[i],yPos[i]);
		ctx.lineTo(0,yPos[i]);
		ctx.moveTo(xPos[i],yPos[i]);
		ctx.lineTo(canvasW,yPos[i]);
		ctx.moveTo(xPos[i],yPos[i]);
		ctx.lineTo(xPos[i],canvasH);
		ctx.moveTo(xPos[i],yPos[i]);
		ctx.lineTo(0,yPos[i] + xPos[i]);
		ctx.moveTo(xPos[i],yPos[i]);
		ctx.lineTo(0,yPos[i] - xPos[i]);
		ctx.moveTo(xPos[i],yPos[i]);
		ctx.lineTo(canvasW,yPos[i] + (canvasW - xPos[i]));
		ctx.moveTo(xPos[i],yPos[i]);
		ctx.lineTo(canvasW,yPos[i] - (canvasW - xPos[i]));
	}
	ctx.stroke();
	for (var i = 0; i < xPos.length; i++){
		radgrad = ctx.createRadialGradient(xPos[i],yPos[i],5,xPos[i],yPos[i],15);
		radgrad.addColorStop(0, 'rgba(0,0,0,1)');
		radgrad.addColorStop(0.8, 'rgba(200,200,200,.9)');
		radgrad.addColorStop(1, 'rgba(255,255,255,0)');

		ctx.fillStyle = radgrad;


		ctx.beginPath();
		ctx.arc(xPos[i], yPos[i], oneRadius, 0, Math.PI*2, true);
		ctx.fill();
	}
}

// deleteCharge that takes into account cases when an element with options page
// open is not the current selected element

// new deleteCharge ignores this case. When options page open for an element
// that element is the current selected element

function deleteCharge (id) {
	// console.log("--BEFORE--");
	// console.log("Array index: " + arrayIndex);
	// console.log("Current index: " + currentIndex);
	// console.log("Highest ID: " + highestID);
	// console.log("Selected ID: " + selectedId);

	var arrayIndex = findArrayIndexFromID(id);
	var chargeObjectDelete = chargeArray[arrayIndex];
	// var chargeObjectDeleteID = chargeObjectDelete.id;
	chargeArray[arrayIndex] = chargeArray[chargeArray.length - 1];
	chargeArray.pop();

	var chargeList = document.getElementById("chargeList");
	var listElementDelete = document.getElementById("li" + id);

	if (selectedId == id){
		if (id != highestID) selectedId = higherAvailableID(id);
		else selectedId = lowerAvailableID(id);
		currentIndexSelect(selectedId, -1);
	}
	else {
		currentIndex = arrayIndex;
	}

	if (highestID == id) highestID -= 1;

	chargeList.removeChild(listElementDelete);

	closeOptionsPopUp();

	// when no elements in chargeArray -> functions to deal with
	// changed draw
	// mouse moved (probe)
	// cursor over circle
}

function unlock() {
	canvas.onmousedown = mouseDown;
    intervalID = setInterval(reDraw, 10); // repaint the canvas at intervals
}