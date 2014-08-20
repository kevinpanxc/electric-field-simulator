/* ==========================
   global helper functions... */

function determine_center (first, second) {
    var center;
    if (second > first) center = Math.round((second - first)/2) + first;
    else center = Math.round((first - second)/2) + second;
    return center;
}

function find_angle (s_x_pos, e_x_pos, s_y_pos, e_y_pos) {   
    var angle;
    var length;
    var height;
    if (e_x_pos == s_x_pos) return Math.PI/2;
    else if (e_y_pos == s_y_pos) return 0;
    height = e_y_pos - s_y_pos;
    length = e_x_pos - s_x_pos;
    angle = Math.atan(height/length); 
    // if line is / then the angle will definitely be negative
    // if line is \ then the angle will definitely be positive
    // angle range will only be from Math.PI/2 to -Math.PI/2
    return angle;
}

function find_length(s_x_pos, e_x_pos, s_y_pos, e_y_pos){
    var x_length = e_x_pos - s_x_pos;
    var y_length = e_y_pos - s_y_pos;
    var length = Math.sqrt((x_length * x_length) + (y_length * y_length));
    return length;
}

/* ========================== */

function PointCharge () {
    this.charge_strength;
    this.x_pos;
    this.y_pos;
    this.polarity;
    this.id;

    this.point_or_line = 1;
}

PointCharge.prototype.initialize = function (charge_strength, x_pos, y_pos, polarity, id) {
    this.charge_strength = charge_strength;
    this.x_pos = x_pos;
    this.y_pos = y_pos;
    this.polarity = polarity;
    this.id = id;

    return this;
}

PointCharge.prototype.initialize_simple = function (charge_strength, x_pos, y_pos) {
    this.charge_strength = charge_strength;
    this.x_pos = x_pos;
    this.y_pos = y_pos;

    return this;
}

function LineCharge () {
    this.length;
    this.angle;
    this.linear_charge_density;
    this.length_per_point;
    this.s_x_pos;
    this.s_y_pos;
    this.e_x_pos;
    this.e_y_pos;
    this.c_x_pos;
    this.c_y_pos;
    this.polarity;
    this.id;

    this.point_charge_array = new Array();
    this.point_or_line = -1;
}

LineCharge.prototype.initialize_by_angle = function (s_x_pos, s_y_pos, length, angle, polarity, linear_charge_density, length_per_point, id) {
    this.s_x_pos = parseFloat(s_x_pos);
    this.s_y_pos = parseFloat(s_y_pos);
    this.length = parseFloat(length);
    this.angle = parseFloat(angle);
    this.polarity = polarity;
    this.linear_charge_density = linear_charge_density;
    this.length_per_point = length_per_point;
    this.id = id;

    return this;
}

LineCharge.prototype.initialize_by_points = function (s_x_pos, s_y_pos, e_x_pos, e_y_pos, polarity, linear_charge_density, length_per_point, id) {
    this.s_x_pos = parseFloat(s_x_pos);
    this.s_y_pos = parseFloat(s_y_pos);
    this.e_x_pos = parseFloat(e_x_pos);
    this.e_y_pos = parseFloat(e_y_pos);
    this.polarity = polarity;
    this.linear_charge_density = linear_charge_density;
    this.length_per_point = length_per_point;
    this.id = id;

    return this;
}

var UI = (function () {
    var default_text_box_border_colour;
    var error_text_box_border_colour = "#FF1414";

    function build_coordinates_span(parent_span, x_span, y_span) {
        parent_span.innerHTML += "(";
        parent_span.appendChild(x_span);
        parent_span.innerHTML += ", ";
        parent_span.appendChild(y_span);
        parent_span.innerHTML += ")";
        return parent_span;
    }

    function add_new_point_charge_to_list (point_charge) {
        var charge_list = document.getElementById ("chargeList");
        var list_element = document.createElement("li");
        var right_block = document.createElement("div");
        var text_element = document.createElement("div");
        var color_code_element = document.createElement("img");
        var expand_button = document.createElement("img");
        var options_button = document.createElement("div");
        var coords_container = document.createElement("div");
        var coords_container_parent_span = document.createElement("span");
        var coords_container_x_span = document.createElement("span");
        var coords_container_y_span = document.createElement("span");

        if (point_charge.polarity > 0) color_code_element.src = "images/posChargeColorCode.png";
        else color_code_element.src = "images/negChargeColorCode.png";
        right_block.className = "liMainDiv";
        color_code_element.id = "colorCodeBar" + point_charge.id;
        list_element.className = "liClassNoShade";
        list_element.id = "li" + point_charge.id;
        text_element.id = "pcStrength" + point_charge.id;
        text_element.className = "textElement";
        expand_button.src = "images/expandPanel.png";
        expand_button.width = "170";
        expand_button.className = "listElementExpandButton";
        expand_button.id = "eb" + point_charge.id;
        expand_button.alt = "1";
        options_button.className = "listOptionsButton";
        options_button.id = "ob" + point_charge.id;

        coords_container.className = "listPosContainer";
        coords_container.id = "pcCoordsCont" + point_charge.id;
        coords_container_x_span.innerHTML = point_charge.x_pos;
        coords_container_x_span.id = "xPos" + point_charge.id;
        coords_container_y_span.innerHTML = point_charge.y_pos;
        coords_container_y_span.id = "yPos" + point_charge.id;
        coords_container_parent_span.innerHTML = "COORDS: ";
        coords_container_parent_span = build_coordinates_span(coords_container_parent_span, coords_container_x_span, coords_container_y_span);
        coords_container_parent_span.className = "promptStyle";

        // listElement.style.background = "#EAEAEA"; // COMMENT: setting the background in js overrides the background hover property in css? need to look into topic: "specificity"
        charge_list.appendChild(list_element);
        list_element.appendChild(color_code_element);
        list_element.appendChild(right_block);
        list_element.setAttribute("onClick", "CanvasField.select_charge_element(" + point_charge.id + ", -1)");
        expand_button.setAttribute("onClick", "UI.expand_list_element(" + point_charge.id + ")");
        
        // stops the click action to propagating to the overall li element and cause currentSelectClick() to run
        $(expand_button).click(function(event) {event.stopPropagation()});
        options_button.setAttribute("onClick", "CanvasField.options_button_for_point_charge_clicked(" +point_charge.id + ")");
        // stops the click action to propagating to the overall li element and cause currentSelectClick() to run
        $(options_button).click(function(event) {event.stopPropagation()});
        right_block.appendChild(text_element);
        right_block.appendChild(coords_container);
        right_block.appendChild(options_button);
        right_block.appendChild(expand_button);
        
        if (point_charge.polarity == 1) text_element.innerHTML += point_charge.charge_strength +" C </br>";
        else text_element.innerHTML += "-" + point_charge.charge_strength +" C </br>";

        text_element.innerHTML += "Point Charge </br>";

        coords_container.appendChild(coords_container_parent_span);

        $("#pcCoordsCont" + point_charge.id).hide();
        $("#ob" + point_charge.id).hide();
        $("#eb" + point_charge.id).toggle(function() { 
        // the prevAll jQuery function returns the *sibling* predecessors of an element        
            $(this).prevAll(".listPosContainer").slideDown(); 
            $(this).prevAll(".listOptionsButton").slideDown();
        }, function() {                      
            $(this).prevAll(".listPosContainer").slideUp();
            $(this).prevAll(".listOptionsButton").slideUp();
        }); 
    }

    function add_new_line_charge_to_list (line_charge) {
        var charge_list = document.getElementById ("chargeList");
        var list_element = document.createElement("li");
        var right_block = document.createElement("div");
        var text_element = document.createElement("div");
        var color_code_element = document.createElement("img");
        var expand_button = document.createElement("img");
        var options_button = document.createElement("div");
        var length_container = document.createElement("div");
        var length_container_parent_span = document.createElement("span");
        var length_container_span = document.createElement("span");
        var length_per_point_container = document.createElement("div");
        var length_per_point_container_parent_span = document.createElement("span");
        var length_per_point_container_span = document.createElement("span");
        var start_coords_container = document.createElement("div");
        var start_coords_container_span_parent = document.createElement("span");
        var start_coords_container_x_span = document.createElement("span");
        var start_coords_container_y_span = document.createElement("span");
        var end_coords_container = document.createElement("div");
        var end_coords_container_parent_span = document.createElement("span");
        var end_coords_container_x_span = document.createElement("span");
        var end_coords_container_y_span = document.createElement("span");
        var angle_container = document.createElement("div");
        var angle_container_span_parent = document.createElement("span");
        var angle_container_span = document.createElement("span"); 

        if (line_charge.polarity > 0) color_code_element.src = "images/posChargeColorCode.png";
        else color_code_element.src = "images/negChargeColorCode.png";
        right_block.className = "liMainDiv";
        color_code_element.id = "colorCodeBar" + line_charge.id;
        list_element.className = "liClassNoShade";
        list_element.id = "li" + line_charge.id;
        text_element.id = "lcChargeDensity" + line_charge.id;
        text_element.className = "textElement";
        expand_button.src = "images/expandPanel.png";
        expand_button.width = "170";
        expand_button.className = "listElementExpandButton";
        expand_button.id = "eb" + line_charge.id;
        expand_button.alt = "1";
        options_button.className = "listOptionsButton";
        options_button.id = "ob" + line_charge.id;

        length_container.className = "listPosContainer";
        length_container.id = "lengthCont" + line_charge.id;

        length_per_point_container.className = "listPosContainer";
        length_per_point_container.id = "lengthPerPointCont" + line_charge.id;
        
        start_coords_container.className = "listPosContainer";
        start_coords_container.id = "startCoordsCont" + line_charge.id;
        
        end_coords_container.className = "listPosContainer";
        end_coords_container.id = "endCoordsCont" + line_charge.id;

        length_container_parent_span.className = "promptStyle";
        length_container_parent_span.innerHTML = "LENGTH: ";
        length_container_span.className = "promptStyle";
        length_container_span.id = "length" + line_charge.id;
        length_container_span.innerHTML = (line_charge.length).toFixed(4);

        length_per_point_container_parent_span.className = "promptStyle";
        length_per_point_container_parent_span.innerHTML = "LENGTH/CHARGE: ";
        length_per_point_container_span.className = "promptStyle";
        length_per_point_container_span.id = "lengthPerPoint" + line_charge.id;
        length_per_point_container_span.innerHTML = line_charge.length_per_point;
        
        start_coords_container_x_span.innerHTML = line_charge.s_x_pos;
        start_coords_container_x_span.id = "startCoordsX" + line_charge.id;
        start_coords_container_y_span.innerHTML = line_charge.s_y_pos;
        start_coords_container_y_span.id = "startCoordsY" + line_charge.id;
        start_coords_container_span_parent.innerHTML = "POINT 1: ";
        start_coords_container_span_parent = build_coordinates_span(start_coords_container_span_parent, start_coords_container_x_span, start_coords_container_y_span);
        start_coords_container_span_parent.className = "promptStyle";

        end_coords_container_x_span.innerHTML = line_charge.e_x_pos;
        end_coords_container_x_span.id = "endCoordsX" + line_charge.id;
        end_coords_container_y_span.innerHTML = line_charge.e_y_pos;
        end_coords_container_y_span.id = "endCoordsY" + line_charge.id;
        end_coords_container_parent_span.innerHTML = "POINT 2: ";
        end_coords_container_parent_span = build_coordinates_span(end_coords_container_parent_span, end_coords_container_x_span, end_coords_container_y_span);
        end_coords_container_parent_span.className = "promptStyle";

        angle_container.className = "listPosContainer";
        angle_container.id = "angleCont" + line_charge.id;
        angle_container_span_parent.className = "promptStyle";
        angle_container_span_parent.innerHTML = "ANGLE: ";
        angle_container_span.className = "promptStyle";
        angle_container_span.id = "angle" + line_charge.id;
        angle_container_span.innerHTML = -(line_charge.angle).toFixed(3);

        // listElement.style.background = "#EAEAEA"; // COMMENT: setting the background in js overrides the background hover property in css? need to look into topic: "specificity"
        chargeList.appendChild(list_element);
        list_element.appendChild(color_code_element);
        list_element.appendChild(right_block);
        list_element.setAttribute("onClick", "CanvasField.select_charge_element(" + line_charge.id + ", -1)");
        expand_button.setAttribute("onClick", "UI.expand_list_element(" + line_charge.id + ")");
        
        // stops the click action to propagating to the overall li element and cause currentSelectClick() to run
        $(expand_button).click(function(event) {event.stopPropagation()});
        options_button.setAttribute("onClick", "optionsButtonLineChargeListClick(" +line_charge.id + ")");
        // stops the click action to propagating to the overall li element and cause currentSelectClick() to run
        $(options_button).click(function(event) {event.stopPropagation()});

        right_block.appendChild(text_element);
        right_block.appendChild(length_container);
        right_block.appendChild(length_per_point_container);
        right_block.appendChild(start_coords_container);
        right_block.appendChild(end_coords_container);
        right_block.appendChild(angle_container);
        right_block.appendChild(options_button);
        right_block.appendChild(expand_button);
        
        if (line_charge.polarity == 1) text_element.innerHTML += line_charge.linear_charge_density +" C/unit </br>";
        else text_element.innerHTML += "-" + line_charge.linear_charge_density +" C/unit </br>";
        text_element.innerHTML += "Line Charge </br>";

        length_container.appendChild(length_container_parent_span);
        length_container.appendChild(length_container_span);

        length_per_point_container.appendChild(length_per_point_container_parent_span);
        length_per_point_container.appendChild(length_per_point_container_span);

        start_coords_container.appendChild(start_coords_container_span_parent);

        end_coords_container.appendChild(end_coords_container_parent_span);

        angle_container.appendChild(angle_container_span_parent);
        angle_container.appendChild(angle_container_span);

        $("#eb" + line_charge.id).prevAll(".listOptionsButton").hide();
        $("#eb" + line_charge.id).prevAll(".listPosContainer").hide();
        $("#eb" + line_charge.id).toggle(function() { 
        // the prevAll jQuery function returns the *sibling* predecessors of an element        
            $(this).prevAll(".listPosContainer").slideDown(); 
            $(this).prevAll(".listOptionsButton").slideDown();
        }, function() {                      
            $(this).prevAll(".listPosContainer").slideUp();
            $(this).prevAll(".listOptionsButton").slideUp();
        });     
    }

    function expand_list_element(id) {
        var expand_button = document.getElementById("eb" + id);
        var array_index;
        if (expand_button.alt == "1") {
            expand_button.src = "images/contractPanel.png";
            var current_element = CanvasField.get_charge_element_from_id(id);
            if (current_element.point_or_line == 1) {
                document.getElementById("xPos" + id).innerHTML = current_element.x_pos;
                document.getElementById("yPos" + id).innerHTML = current_element.y_pos;           
            }
            else {
                document.getElementById("startCoordsX" + id).innerHTML = current_element.s_x_pos;
                document.getElementById("startCoordsY" + id).innerHTML = current_element.s_y_pos;
                document.getElementById("endCoordsX" + id).innerHTML = current_element.e_x_pos;
                document.getElementById("endCoordsY" + id).innerHTML = current_element.e_y_pos;
                document.getElementById("angle" + id).innerHTML = -(current_element.angle).toFixed(4);
            }
        }
        else expand_button.src = "images/expandPanel.png";
        expand_button.alt = -expand_button.alt;
    }

    function update_point_charge_information (point_charge) {
        if (document.getElementById("eb" + point_charge.id).alt == -1){
            document.getElementById("xPos" + point_charge.id).innerHTML = point_charge.x_pos;
            document.getElementById("yPos" + point_charge.id).innerHTML = point_charge.y_pos;
        }
    }

    function update_line_charge_information (line_charge) {
        if (document.getElementById("eb" + line_charge.id).alt == -1){
            document.getElementById("startCoordsX" + line_charge.id).innerHTML = line_charge.s_x_pos;
            document.getElementById("startCoordsY" + line_charge.id).innerHTML = line_charge.s_y_pos;
            document.getElementById("endCoordsX" + line_charge.id).innerHTML = line_charge.e_x_pos;
            document.getElementById("endCoordsY" + line_charge.id).innerHTML = line_charge.e_y_pos;
            document.getElementById("angle" + line_charge.id).innerHTML = -(line_charge.angle).toFixed(4);
        }
    }

    function update_element_list_shading (new_charge_id, previous_charge_id) {
        var previous_shaded_list_element = document.getElementById("li" + previous_charge_id);

        if (previous_shaded_list_element) previous_shaded_list_element.className = "liClassNoShade";
        document.getElementById("li" + new_charge_id).className = "liClassShade";
    }

    function get_input_to_add_point_charge (polarity) {
        var input_strength = document.getElementById("strengthText");
        var x_pos_element = document.getElementById("xPosText");
        var y_pos_element = document.getElementById("yPosText");

        var strength = Number(input_strength.value);
        var x_pos = Number(x_pos_element.value);
        var y_pos = Number(y_pos_element.value);
        if (input_strength.value == "") strength = 1;
        else if(isNaN(strength) || strength == 0) return false;
        else if (strength < 0) {
            strength = -strength;
            polarity = -polarity;
        }
        if (x_pos_element.value == "" || y_pos_element.value == "") {
            x_pos = Math.round(Math.random() * 500) + 50;
            y_pos = Math.round(Math.random() * 500) + 50;
        }
        else if (isNaN(x_pos) || isNaN(y_pos)) return false;
        else if (x_pos < 0 || x_pos > 600 || y_pos < 0 || y_pos > 600) return false;

        return {
            "strength" : strength,
            "x_pos" : x_pos,
            "y_pos" : y_pos,
            "polarity" : polarity
        }
    }

    function get_input_to_add_line_charge (polarity) {
        var by_start_end_points = !document.getElementById("addLineChargeStartEnd").disabled;
        var by_angle_and_length = !document.getElementById("addLineChargeLengthAngle").disabled;

        var linear_charge_density, s_x_pos, s_y_pos, e_x_pos, e_y_pos, length_per_point;

        if (by_start_end_points && by_angle_and_length) {
            // if both buttons are enabled, then set to default return values
            linear_charge_density = 0.2;
            length_per_point = 5;
            s_x_pos = 50;
            s_y_pos = 100;
            e_x_pos = 180;
            e_y_pos = 130;
        }
        else if (by_start_end_points){
            if (!validate_add_line_charge_form("start_end_points")) return false;
            linear_charge_density = document.getElementById("chargeDensityText").value;
            length_per_point = document.getElementById("lengthPerPointText").value;
            s_x_pos = document.getElementById("startXTextStartEnd").value;
            s_y_pos = document.getElementById("startYTextStartEnd").value;
            e_x_pos = document.getElementById("endXText").value;
            e_y_pos = document.getElementById("endYText").value;

            s_x_pos = parseFloat(s_x_pos);
            s_y_pos = parseFloat(s_y_pos);
            e_x_pos = parseFloat(e_x_pos);
            e_y_pos = parseFloat(e_y_pos);
        }
        else {
            if (!validate_add_line_charge_form("angle_and_length")) return false;
            linear_charge_density = document.getElementById("chargeDensityText").value;
            length_per_point = document.getElementById("lengthPerPointText").value;
            angle = document.getElementById("angleText").value;
            length = document.getElementById("lengthText").value;
            s_x_pos = document.getElementById("startXTextLengthAngle").value;
            s_y_pos = document.getElementById("startYTextLengthAngle").value;

            s_x_pos = parseFloat(s_x_pos);
            s_y_pos = parseFloat(s_y_pos);
            length = parseFloat(length);
            e_x_pos = Math.round(s_x_pos + Math.cos(angle) * length);
            e_y_pos = Math.round(s_y_pos - Math.sin(angle) * length);
        }
        return {
            "s_x_pos" : s_x_pos,
            "s_y_pos" : s_y_pos,
            "e_x_pos" : e_x_pos,
            "e_y_pos" : e_y_pos,
            "linear_charge_density" : linear_charge_density,
            "length_per_point" : length_per_point
        }
    }

    function validate_add_line_charge_form (method) {
        var linear_charge_density = document.getElementById("chargeDensityText");
        var length_per_point = document.getElementById("lengthPerPointText");

        if (isNaN(linear_charge_density.value) || isNaN(length_per_point.value)){
            return false;
        }
        else if (linear_charge_density.value <= 0 || length_per_point.value < 1) {
            return false;
        }

        if (method == "start_end_points") {
            var s_x_pos = document.getElementById("startXTextStartEnd");
            var s_y_pos = document.getElementById("startYTextStartEnd");
            var e_x_pos = document.getElementById("endXText");
            var e_y_pos = document.getElementById("endYText");

            if (isNaN(s_x_pos.value) || isNaN(s_y_pos.value) || isNaN(e_x_pos.value) || isNaN(e_y_pos.value)){
                return false;
            }
            else if (s_x_pos.value < 0 || s_y_pos.value < 0 || e_x_pos.value < 0 || e_y_pos.value < 0) {
                return false;
            }
            else if (s_x_pos.value > 600 || s_y_pos.value > 600 || e_x_pos.value > 600 || e_y_pos.value > 600) {
                return false;
            }
            else if ((s_x_pos.value + s_y_pos.value + e_x_pos.value + e_y_pos.value) == 0) {
                return false;
            }
            else return true;
        }
        else if (method == "angle_and_length") {
            var angle = document.getElementById("angleText");
            var length = document.getElementById("lengthText");
            var s_x_pos = document.getElementById("startXTextLengthAngle");
            var s_y_pos = document.getElementById("startYTextLengthAngle");

            if (isNaN(angle.value) || isNaN(length.value) || isNaN(s_x_pos.value) || isNaN(s_y_pos.value)){
                return false;
            }
            else if (length.value <= 0 || s_x_pos.value < 0 || s_y_pos.value < 0){
                return false;
            }
            else if (s_x_pos.value > 600 || s_y_pos.value > 600) {
                return false;
            }
            else return true;
        } else {
            return false;
        }
    }

    function show_probe_container () {
        var probe_button = document.getElementById("probeButton");

        $(".probeInfoContainer").show();
        probe_button.style.backgroundPosition="65px 70px";
    }

    function hide_probe_container () {
        var probe_magnitude = document.getElementById("probeMagnitude");
        var probe_angle = document.getElementById("probeAngle");
        var probe_button = document.getElementById("probeButton");

        $(".probeInfoContainer").hide();
        probe_magnitude.innerHTML = "";
        probe_angle.innerHTML = "";
        probe_button.style.backgroundPosition="0px 70px";
    }

    function get_input_to_probe_field () {
        var probe_x_element = document.getElementById("probeXText");
        var probe_y_element = document.getElementById("probeYText");

        if (!isNaN(probe_x_element.value) && !isNaN(probe_y_element.value) && probe_y_element.value != "" && probe_x_element.Value != ""){
            if (probe_y_element.value >= 0 && probe_y_element.value <= canvas.height && probe_x_element.value >= 0 && probe_x_element.value <= canvas.width) {
                return {
                    "x" : probe_x_element.value,
                    "y" : probe_y_element.value
                }
            }
        }
        return false;
    }

    function open_point_charge_options_modal (point_charge) {
        var canvas_container = document.getElementById("canvasContainer");
        var options_pop_up = create_new_element("div", "popUp", "optionsPointChargePopUp fullScreenDivFade", "");
        var options_heading_pop_up = create_new_element("div", "", "optionsHeadingPopUp fullScreenDivFade", "OPTIONS");
        var cross_image = create_new_element("div", "", "crossImage", "");
        var options_left_container = create_new_element("div", "", "optionsLeftContainer", "");
        var options_right_container = create_new_element("div", "", "optionsRightContainer", "");
        var options_bottom_container = create_new_element("div", "", "optionsBottomContainer", "");
        var options_update_button = create_new_element("div", "", "optionsUpdateDeleteButton", "Update");
        var options_delete_button = create_new_element("div", "", "optionsUpdateDeleteButton", "Delete");
        var fullscreen_div = create_new_element("div", "fullScreenDiv", "fullScreenDiv fullScreenDivFade", "");

        var otc_left_1 = create_new_element("div", "", "optionsTextContainer", "X POSITION: ");
        var otc_left_2 = create_new_element("div", "", "optionsTextContainer", "Y POSITION: ");
        var otc_left_3 = create_new_element("div", "", "optionsTextContainer", "POLARITY: ");

        var otc_right_1 = create_new_element("div", "", "optionsTextContainer", "");
        var otc_right_2 = create_new_element("div", "", "optionsTextContainer", "");

        var x_pos_element = create_new_element("input", "optionsXPOS", "", "");
        var y_pos_element = create_new_element("input", "optionsYPOS", "", "");

        x_pos_element.type = "text";
        y_pos_element.type = "text";

        x_pos_element.size = 6;
        y_pos_element.size = 6;

        var polarity_div = document.createElement("div");
        var polarity_div_image = create_new_element("img", "polarityDivPic", "optionsPosNegSel", "");

        if (point_charge.polarity == 1) {
            polarity_div_image.src = "images/posCharge.png";
            polarity_div_image.alt = "1";
        }
        else {
            polarity_div_image.src = "images/negCharge.png";
            polarity_div_image.alt = "-1";
        }

        x_pos_element.value = point_charge.x_pos;
        y_pos_element.value = point_charge.y_pos;
     
        canvas_container.appendChild(fullscreen_div);
        canvas_container.appendChild(options_pop_up);
        options_pop_up.appendChild(options_heading_pop_up);
        options_heading_pop_up.appendChild(cross_image);
        options_pop_up.appendChild(options_left_container);
        options_pop_up.appendChild(options_right_container);
        options_pop_up.appendChild(options_bottom_container);
        options_left_container.appendChild(otc_left_1);
        options_left_container.appendChild(otc_left_2);
        options_left_container.appendChild(otc_left_3);
        options_right_container.appendChild(otc_right_1);
        otc_right_1.appendChild(x_pos_element);
        otc_right_2.appendChild(y_pos_element);
        options_right_container.appendChild(otc_right_2);
        options_right_container.appendChild(polarity_div);
        polarity_div.appendChild(polarity_div_image);
        options_bottom_container.appendChild(options_update_button);
        options_bottom_container.appendChild(options_delete_button);

        fullscreen_div.setAttribute("onClick", "UI.close_options_pop_up()");
        cross_image.setAttribute("onClick", "UI.close_options_pop_up()");
        polarity_div_image.setAttribute("onClick", "UI.change_charge_polarity_image_in_options_modal()");
        options_update_button.setAttribute("onClick", "CanvasField.update_point_charge()");
        options_delete_button.setAttribute("onClick", "deleteCharge("+ point_charge.id +")");

        // $("#fullScreenDiv").hover(
        //  function () {
        //      $(".fullScreenDivFade").fadeTo(500, 0.3);
        //  },
        //  function () {
        //      $(".fullScreenDivFade").fadeTo(500, 1.0);
        //  }
        // );

        default_text_box_border_colour = document.getElementById("optionsXPOS").style.borderColor;
    }

    function get_input_to_update_point_charge (point_charge) {
        var x_pos = document.getElementById("optionsXPOS").value;
        var y_pos = document.getElementById("optionsYPOS").value;
        var polarity = document.getElementById("polarityDivPic").alt;

        var x_pos_has_error = false;
        var y_pos_has_error = false;

        if (isNaN(x_pos) || x_pos == "") x_pos_has_error = true;
        else if (x_pos < 0 || x_pos > 600) x_pos_has_error = true;

        if (isNaN(y_pos) || y_pos == "") y_pos_has_error = true;
        else if (y_pos < 0 || y_pos > 600) y_pos_has_error = true;

        if (!x_pos_has_error && !y_pos_has_error) {
            document.getElementById("xPos" + point_charge.id).innerHTML = x_pos;
            document.getElementById("yPos" + point_charge.id).innerHTML = y_pos;

            if (polarity == "1") {
                document.getElementById("pcStrength" + point_charge.id).innerHTML = point_charge.charge_strength +" C </br>Point Charge </br>";
                document.getElementById("colorCodeBar" + point_charge.id).src = "images/posChargeColorCode.png";
            }
            else {
                document.getElementById("pcStrength" + point_charge.id).innerHTML = "-" + point_charge.charge_strength +" C </br>Point Charge </br>";
                document.getElementById("colorCodeBar" + point_charge.id).src = "images/negChargeColorCode.png";
            }

            point_charge.x_pos = x_pos;
            point_charge.y_pos = y_pos;
            point_charge.polarity = polarity;

            return true;
        } else {
            if (x_pos_has_error) {
                document.getElementById("optionsXPOS").style.borderColor = error_text_box_border_colour;
            }
            else {
                document.getElementById("optionsXPOS").style.borderColor = default_text_box_border_colour;
            }

            if (y_pos_has_error) {
                document.getElementById("optionsYPOS").style.borderColor = error_text_box_border_colour;
            }
            else {
                document.getElementById("optionsYPOS").style.borderColor = default_text_box_border_colour;
            }
            return false;
        }   
    }

    function get_input_to_update_line_charge (line_charge) {
        var charge_density = document.getElementById("optionsChargeDensity").value;
        var length_per_point = document.getElementById("optionsLengthPerPoint").value;
        var s_x_pos = document.getElementById("optionsStartXPos").value;
        var s_y_pos = document.getElementById("optionsStartYPos").value;
        var e_x_pos = document.getElementById("optionsEndXPos").value;
        var e_y_pos = document.getElementById("optionsEndYPos").value;
        var polarity = document.getElementById("polarityDivPic").alt;

        var new_c_x_pos;
        var new_c_y_pos;

        var charge_density_has_error = false;
        var length_per_point_has_error = false;
        var s_x_pos_has_error = false;
        var s_y_pos_has_error = false;
        var e_x_pos_has_error = false;
        var e_y_pos_has_error = false;
        var center_has_error = false;

        if (isNaN(charge_density) || charge_density == "") charge_density_has_error = true;
        else if (charge_density <= 0) charge_density_has_error = true;

        if (isNaN(length_per_point) || length_per_point == "") length_per_point_has_error = true;
        else if (length_per_point < 1) length_per_point_has_error = true;

        if (isNaN(s_x_pos) || s_x_pos == "") s_x_pos_has_error = true;

        if (isNaN(s_y_pos) || s_y_pos == "") s_y_pos_has_error = true;

        if (isNaN(e_x_pos) || e_x_pos == "") e_x_pos_has_error = true;

        if (isNaN(e_y_pos) || e_y_pos == "") e_y_pos_has_error = true;

        if (!charge_density_has_error && !length_per_point_has_error && !s_x_pos_has_error && !s_y_pos_has_error && !e_x_pos_has_error && !e_y_pos_has_error) {

            s_x_pos = parseFloat(s_x_pos);
            s_y_pos = parseFloat(s_y_pos);
            new_c_x_pos = determine_center(s_x_pos, e_x_pos);
            new_c_y_pos = determine_center(s_y_pos, e_y_pos);

            if (new_c_x_pos < 0 || new_c_x_pos > 600 || new_c_y_pos < 0 || new_c_y_pos > 600){
                center_has_error = true;
            }

            if (!center_has_error) {
                line_charge.linear_charge_density = parseFloat(charge_density);

                if (line_charge.length_per_point != parseFloat(length_per_point)) line_charge.point_charge_array.length = 0;

                line_charge.length_per_point = parseFloat(length_per_point);
                line_charge.s_x_pos = parseFloat(s_x_pos);
                line_charge.s_y_pos = parseFloat(s_y_pos);
                line_charge.e_x_pos = parseFloat(e_x_pos);
                line_charge.e_y_pos = parseFloat(e_y_pos);
                line_charge.c_x_pos = parseFloat(new_c_x_pos);
                line_charge.c_y_pos = parseFloat(new_c_y_pos);
                line_charge.length = findLength (line_charge.s_x_pos, line_charge.e_x_pos, line_charge.s_y_pos, line_charge.e_y_pos);
                line_charge.angle = findAngle (line_charge.s_x_pos, line_charge.e_x_pos, line_charge.s_y_pos, line_charge.e_y_pos);
                line_charge.polarity = polarity;

                document.getElementById("length" + id).innerHTML = line_charge.length.toFixed(4);
                document.getElementById("lengthPerPoint" + id).innerHTML = length_per_point;
                document.getElementById("startCoordsX" + id).innerHTML = s_x_pos;
                document.getElementById("startCoordsY" + id).innerHTML = s_y_pos;
                document.getElementById("endCoordsX" + id).innerHTML = e_x_pos;
                document.getElementById("endCoordsY" + id).innerHTML = e_y_pos;

                if (polarity == "1") {
                    document.getElementById("lcChargeDensity" + id).innerHTML = line_charge.linear_charge_density +" C/unit </br>Line Charge</br>";
                    document.getElementById("colorCodeBar" + id).src = "images/posChargeColorCode.png";
                }
                else {
                    document.getElementById("lcChargeDensity" + id).innerHTML = "-" + line_charge.linear_charge_density +" C/unit </br>Line Charge </br>";
                    document.getElementById("colorCodeBar" + id).src = "images/negChargeColorCode.png";
                }

                return;
            }
        }

        if (charge_density_has_error) {
            document.getElementById("optionsChargeDensity").style.borderColor = error_text_box_border_colour;
        }
        else {
            document.getElementById("optionsChargeDensity").style.borderColor = default_text_box_border_colour;
        }

        if (length_per_point_has_error) {
            document.getElementById("optionsLengthPerPoint").style.borderColor = error_text_box_border_colour;
        }
        else {
            document.getElementById("optionsLengthPerPoint").style.borderColor = default_text_box_border_colour;
        }

        if (s_x_pos_has_error || center_has_error) {
            document.getElementById("optionsStartXPos").style.borderColor = error_text_box_border_colour;
        }
        else {
            document.getElementById("optionsStartXPos").style.borderColor = default_text_box_border_colour;
        }

        if (s_y_pos_has_error || center_has_error) {
            document.getElementById("optionsStartYPos").style.borderColor = error_text_box_border_colour;
        }
        else {
            document.getElementById("optionsStartYPos").style.borderColor = default_text_box_border_colour;
        }

        if (e_x_pos_has_error || center_has_error) {
            document.getElementById("optionsEndXPos").style.borderColor = error_text_box_border_colour;
        }
        else {
            document.getElementById("optionsEndXPos").style.borderColor = default_text_box_border_colour;
        }

        if (e_y_pos_has_error || center_has_error) {
            document.getElementById("optionsEndYPos").style.borderColor = error_text_box_border_colour;
        }
        else {
            document.getElementById("optionsEndYPos").style.borderColor = default_text_box_border_colour;
        }
    }

    function change_charge_polarity_image_in_options_modal () {
        var polarity_div_image = document.getElementById("polarityDivPic");
        polarity_div_image.alt = -polarity_div_image.alt;
        if (polarity_div_image.alt == "-1") polarity_div_image.src = "images/negCharge.png";
        else polarity_div_image.src = "images/posCharge.png";
    }

    function close_options_pop_up () {
        var canvasContainer = document.getElementById("canvasContainer");
        canvasContainer.removeChild(document.getElementById("fullScreenDiv"));
        canvasContainer.removeChild(document.getElementById("popUp"));
    }

    function create_new_element (type, id, className, text){
        var temp = document.createElement(type);
        temp.id = id;
        temp.className = className;
        temp.innerHTML = text;
        return temp;
    }

    return {
        initialize : function () {
            $(".probeInfoContainer").hide();
        },

        add_new_point_charge_to_list : add_new_point_charge_to_list,

        add_new_line_charge_to_list : add_new_line_charge_to_list,

        get_input_to_add_line_charge : get_input_to_add_line_charge,

        get_input_to_add_point_charge : get_input_to_add_point_charge,

        get_input_to_update_point_charge : get_input_to_update_point_charge,

        update_element_list_shading : update_element_list_shading,

        update_point_charge_information : update_point_charge_information,

        update_line_charge_information : update_line_charge_information,

        expand_list_element : expand_list_element,

        show_probe_container : show_probe_container,

        hide_probe_container : hide_probe_container,

        get_input_to_probe_field : get_input_to_probe_field,

        open_point_charge_options_modal : open_point_charge_options_modal,

        close_options_pop_up : close_options_pop_up,

        change_charge_polarity_image_in_options_modal : change_charge_polarity_image_in_options_modal
    }
})();

var CanvasField = (function () {
    var canvas;

    // program loop information
    var interval_id;
    var interval_time = 32;

    // selected charge and its corresponding index
    var selected_charge_id = 0;
    var current_charge_index = 0;

    // point charge properties
    var point_charge_gradient;
    var point_charge_radius = 15;

    // line charge properties
    var line_charge_radius = 6;
    var rotate_button_radius = 3;

    // mouse booleans
    var is_mouse_down = false;
    var is_mouse_over_rotate = false;
    var is_mouse_down_to_rotate = false;

    // probe boolean
    var probe_mode = -1;

    // cursor offset relative to a charge
    var cursor_x = 0;
    var cursor_y = 0;

    // necessary for special cases in the delete function 
    var highest_active_id = 0;

    // pushing first charge
    var current_charge_id = 0;
    var charge_array = [];
    charge_array.push(new PointCharge().initialize(1, 100, 100, 1, current_charge_id++));

    function slope_to_radians (slope){
        return Math.atan(slope);
    }

    function re_draw () {
        re_draw_charge_lines();
        re_draw_highlight_lines();
    }

    function re_draw_highlight_lines() {
        var current_element = charge_array[current_charge_index];
        ctx.beginPath();
        if (current_element.point_or_line == 1){
            ctx.strokeStyle = "#FFFF00";
            ctx.arc(current_element.x_pos, current_element.y_pos, point_charge_radius + 1, 0, Math.PI*2, true);
        }
        else {
            ctx.strokeStyle = "#FFFF00";
            var angle_one = Math.PI/2 + current_element.angle;
            var angle_two = 3*(Math.PI/2) + current_element.angle;
            if (current_element.s_x_pos > current_element.e_x_pos) {
                ctx.arc(current_element.s_x_pos, current_element.s_y_pos, line_charge_radius + 5, angle_one, angle_two, true);
                ctx.arc(current_element.e_x_pos, current_element.e_y_pos, line_charge_radius + 5, angle_two, angle_one, true);
                ctx.arc(current_element.s_x_pos, current_element.s_y_pos, line_charge_radius + 5, angle_one, angle_one, true);
            }
            else if (current_element.s_x_pos < current_element.e_x_pos){
                ctx.arc(current_element.s_x_pos, current_element.s_y_pos, line_charge_radius + 5, angle_two, angle_one, true);
                ctx.arc(current_element.e_x_pos, current_element.e_y_pos, line_charge_radius + 5, angle_one, angle_two, true);
                ctx.arc(current_element.s_x_pos, current_element.s_y_pos, line_charge_radius + 5, angle_two, angle_two, true);
            }
            else {
                if (current_element.s_y_pos < current_element.e_y_pos) {
                    ctx.arc(current_element.s_x_pos, current_element.s_y_pos, line_charge_radius + 5, angle_two, angle_one, true);
                    ctx.arc(current_element.e_x_pos, current_element.e_y_pos, line_charge_radius + 5, angle_one, angle_two, true);
                    ctx.arc(current_element.s_x_pos, current_element.s_y_pos, line_charge_radius + 5, angle_two, angle_two, true);
                }
                else {
                    ctx.arc(current_element.s_x_pos, current_element.s_y_pos, line_charge_radius + 5, angle_one, angle_two, true);
                    ctx.arc(current_element.e_x_pos, current_element.e_y_pos, line_charge_radius + 5, angle_two, angle_one, true);
                    ctx.arc(current_element.s_x_pos, current_element.s_y_pos, line_charge_radius + 5, angle_one, angle_one, true);                
                }
            }
        }
        ctx.stroke();        
    }

    function re_draw_charge_lines () {
        var x = 25;
        var y = 25;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // draw all charge elements again, can be optimized to only draw the one that is moving
        for (var i = 0; i < charge_array.length; i++){
            var current_element = charge_array[i];
            if (current_element.point_or_line == 1){
                point_charge_gradient = ctx.createRadialGradient(current_element.x_pos,current_element.y_pos,5,current_element.x_pos,current_element.y_pos,15);
                if(current_element.polarity == 1){
                    point_charge_gradient.addColorStop(0, 'rgba(0,0,0,1)');
                    point_charge_gradient.addColorStop(0.8, 'rgba(200,200,200,.9)');
                    point_charge_gradient.addColorStop(1, 'rgba(255,255,255,0)');
                }
                else {
                    point_charge_gradient.addColorStop(0, 'rgba(255,36,36,1)');
                    point_charge_gradient.addColorStop(0.8, 'rgba(255,125,125,.5)');
                    point_charge_gradient.addColorStop(1, 'rgba(255,255,255,0)');
                }
                ctx.fillStyle = point_charge_gradient;
                ctx.beginPath();
                ctx.arc(current_element.x_pos, current_element.y_pos, point_charge_radius, 0, Math.PI*2, true);
                ctx.fill();
            }
            else {
                ctx.beginPath();
                if(current_element.polarity == 1) ctx.strokeStyle = "#222222";
                else ctx.strokeStyle = "#F04D4D";
                ctx.lineWidth = point_charge_radius;
                ctx.moveTo(current_element.s_x_pos, current_element.s_y_pos);
                ctx.lineTo(current_element.e_x_pos, current_element.e_y_pos);
                ctx.lineCap = "round";
                ctx.stroke();
                ctx.lineWidth = 1;
                ctx.lineCap = "butt";

                ctx.fillStyle = "#6EA6F5";
                ctx.beginPath();
                ctx.arc(current_element.c_x_pos, current_element.c_y_pos, line_charge_radius, 0, Math.PI*2, true);
                ctx.fill();
                // ie needs this
                ctx.beginPath();
                ctx.arc(current_element.s_x_pos, current_element.s_y_pos, rotate_button_radius, 0, Math.PI * 2, true);
                ctx.arc(current_element.e_x_pos, current_element.e_y_pos, rotate_button_radius, 0, Math.PI * 2, true);
                ctx.fill();
            }
        }

        var slope;
        var x_middle;
        var y_middle;
        var x_displacement;
        var y_displacement;
        var d;
        var s;
        var x1 = 0;
        var y1 = 0;
        var draw_field_line = true;
        for (var h = 0; h < 24; h++){
            for (var i = 0; i < 24; i++){
                x_middle = x/2 + x * i;
                y_middle = y/2 + y * h;
                x1 = 0;
                y1 = 0;
                for (var j = 0; j < charge_array.length; j++){
                    if (charge_array[j].point_or_line == 1){
                        d = (charge_array[j].x_pos - x_middle) * (charge_array[j].x_pos - x_middle) + (charge_array[j].y_pos - y_middle) * (charge_array[j].y_pos - y_middle);
                        if (d < 500) {
                            draw_field_line = false;
                            break;
                        }
                        d = d / 1000000;
                        if (x_middle - charge_array[j].x_pos > -0.01 && x_middle - charge_array[j].x_pos < 0.01){
                            s = Math.PI/2;
                            if (y_middle - charge_array[j].y_pos < 0){
                                s = -(Math.PI/2);
                            }
                        }
                        else {
                            s = (y_middle - charge_array[j].y_pos)/(x_middle - charge_array[j].x_pos);
                            s = slope_to_radians(s);
                            if ((y_middle - charge_array[j].y_pos > 0 && s < 0) || (y_middle - charge_array[j].y_pos < 0 && s > 0)) {
                                s = Math.PI + s;
                            }
                        }
                        if (charge_array[j].polarity == -1) s = s + Math.PI;
                        if (s > 2 * Math.PI) s = s - 2 * Math.PI;
                        x1 += (Math.cos(s) * charge_array[j].charge_strength/d);
                        y1 += (Math.sin(s) * charge_array[j].charge_strength/d);
                    }
                    else {
                        var cuurent_pc_array = charge_array[j].point_charge_array;
                        for (var k = 0; k < cuurent_pc_array.length; k++){
                            d = (cuurent_pc_array[k].x_pos - x_middle) * (cuurent_pc_array[k].x_pos - x_middle) + (cuurent_pc_array[k].y_pos - y_middle) * (cuurent_pc_array[k].y_pos - y_middle);
                            if (d < 350) {
                                draw_field_line = false;
                                break;
                            }
                            d = d / 1000000;
                            if (x_middle - cuurent_pc_array[k].x_pos > -0.01 && x_middle - cuurent_pc_array[k].x_pos < 0.01){
                                s = Math.PI/2;
                                if (y_middle - cuurent_pc_array[k].y_pos < 0){
                                    s = -(Math.PI/2);
                                }
                            }
                            else {
                                s = (y_middle - cuurent_pc_array[k].y_pos)/(x_middle - cuurent_pc_array[k].x_pos);
                                s = slope_to_radians(s);
                                if ((y_middle - cuurent_pc_array[k].y_pos > 0 && s < 0) || (y_middle - cuurent_pc_array[k].y_pos < 0 && s > 0)) {
                                    s = Math.PI + s;
                                }
                            }
                            if (charge_array[j].polarity == -1) s = s + Math.PI;
                            if (s > 2 * Math.PI) s = s - 2 * Math.PI;
                            x1 += (Math.cos(s) * cuurent_pc_array[k].charge_strength/d);
                            y1 += (Math.sin(s) * cuurent_pc_array[k].charge_strength/d);
                        }
                    }
                }
                if (draw_field_line){
                    if (x1 < 0.01 && x1 > -0.01){
                        y_displacement = 9;
                        x_displacement = 0;
                    }
                    else {
                        slope = y1/x1;
                        x_displacement = 9 * (Math.sqrt(1/((slope * slope) + 1))); // ensures every line is the same length
                        y_displacement = 0;
                    }
                    ctx.beginPath();
                    if (x1 < 0) ctx.strokeStyle = "#99CCFF";
                    else ctx.strokeStyle = "#FF4D4D";
                    ctx.moveTo(x_middle + x_displacement, y_middle + (x_displacement * slope) + y_displacement);
                    ctx.lineTo(x_middle, y_middle);
                    ctx.stroke();
                    ctx.beginPath();
                    if (x1 < 0) ctx.strokeStyle = "#FF4D4D";
                    else ctx.strokeStyle = "#99CCFF";
                    ctx.moveTo(x_middle, y_middle);
                    ctx.lineTo(x_middle - x_displacement, y_middle - (x_displacement * slope) - y_displacement); 
                    ctx.stroke();
                }
                else draw_field_line = true;
            }
        }
    }

    function mouse_moved(e){
        if (is_mouse_down) {
            document.body.style.cursor = 'pointer';
            var new_x_position = (e.pageX - canvas.offsetLeft) - cursor_x;
            var new_y_position = (e.pageY - canvas.offsetTop) - cursor_y;
            var current_element = charge_array[current_charge_index];
            if (current_element.point_or_line == 1){
                var id = current_element.id;
                current_element.x_pos = new_x_position;
                current_element.y_pos = new_y_position;

                UI.update_point_charge_information(current_element);
            }
            else {
                var id = current_element.id;
                if (is_mouse_down_to_rotate){
                    rotate_line(e.pageX - canvas.offsetLeft, e.pageY - canvas.offsetTop);
                }
                else {
                    var x_diff = new_x_position - current_element.c_x_pos;
                    var y_diff = new_y_position - current_element.c_y_pos;
                    current_element.c_x_pos = new_x_position;
                    current_element.c_y_pos = new_y_position;
                    current_element.s_x_pos += x_diff;
                    current_element.e_x_pos += x_diff;
                    current_element.s_y_pos += y_diff;
                    current_element.e_y_pos += y_diff;

                    var current_pc_array = current_element.point_charge_array;
                    for (var i = 0; i < current_pc_array.length; i++){
                        current_pc_array[i].x_pos += x_diff;
                        current_pc_array[i].y_pos += y_diff;
                    }
                }

                UI.update_line_charge_information(current_element);
            }
        }
        else {
            if ( mouse_check_and_return_index(e.pageX, e.pageY) >= 0 ) document.body.style.cursor = 'pointer';
            else document.body.style.cursor = 'default';
        }
        var probe_magnitude = document.getElementById("probeMagnitude");
        var probe_angle = document.getElementById("probeAngle");
        if (probe_mode == 1 && is_mouse_down == false){
            var x_probe = e.pageX - canvas.offsetLeft;
            var y_probe = e.pageY - canvas.offsetTop;
            var probe_result = probe_location(x_probe, y_probe);
            probe_magnitude.innerHTML = "STRENGTH: " + probe_result["strength"].toFixed(3);
            probe_angle.innerHTML = "ANGLE: " + probe_result["angle"].toFixed(3);
            probe_x_element.value = x_probe;
            probe_y_element.value = y_probe;
        }
        else if (probe_mode == 1 && is_mouse_down) {
            probe_magnitude.innerHTML = "STRENGTH: ";
            probe_angle.innerHTML = "ANGLE: ";
        }
    }

    function mouse_up(){
        is_mouse_down = false;
        is_mouse_down_to_rotate = false;
        clearInterval(interval_id);
        re_draw(); // sometimes interval is cleared too fast and last drawn location of charge object not the same as actual position recorded
    }

    function mouse_down(e){
        e.preventDefault();
        interval_id = setInterval(re_draw, interval_time);
        var index_of_charge_element = mouse_check_and_return_index(e.pageX, e.pageY);
        if (index_of_charge_element >= 0){
            if (charge_array[index_of_charge_element].point_or_line == 1){
                select_charge_element(charge_array[index_of_charge_element].id, index_of_charge_element);
                cursor_x = (e.pageX - canvas.offsetLeft) - charge_array[current_charge_index].x_pos;
                cursor_y = (e.pageY - canvas.offsetTop) - charge_array[current_charge_index].y_pos; 
            }
            else {
                select_charge_element(charge_array[index_of_charge_element].id, index_of_charge_element);
                cursor_x = (e.pageX - canvas.offsetLeft) - charge_array[current_charge_index].c_x_pos;
                cursor_y = (e.pageY - canvas.offsetTop) - charge_array[current_charge_index].c_y_pos;
            }
            is_mouse_down = true;
            if (is_mouse_over_rotate) is_mouse_down_to_rotate = true;
        }
    }

    function mouse_check_and_return_index(x, y){
        // sets mouse booleans
        // returns relevant charge element index
        for (var i = charge_array.length - 1; i >= 0; i--){
            if (charge_array[i].point_or_line == 1){
                if ((x - canvas.offsetLeft) > (charge_array[i].x_pos - point_charge_radius)  &&  (x - canvas.offsetLeft) < (charge_array[i].x_pos + point_charge_radius)
                && (y - canvas.offsetTop) > (charge_array[i].y_pos - point_charge_radius)   &&  (y - canvas.offsetTop) < (charge_array[i].y_pos + point_charge_radius)){
                    return i;
                }
            }
            else {
                if ((x - canvas.offsetLeft) > (charge_array[i].c_x_pos - line_charge_radius)  &&  (x - canvas.offsetLeft) < (charge_array[i].c_x_pos + line_charge_radius)
                && (y - canvas.offsetTop) > (charge_array[i].c_y_pos - line_charge_radius)   &&  (y - canvas.offsetTop) < (charge_array[i].c_y_pos + line_charge_radius)){
                    return i;
                }
                else if ((x - canvas.offsetLeft) > (charge_array[i].s_x_pos - rotate_button_radius)  &&  (x - canvas.offsetLeft) < (charge_array[i].s_x_pos + rotate_button_radius)
                && (y - canvas.offsetTop) > (charge_array[i].s_y_pos - rotate_button_radius)   &&  (y - canvas.offsetTop) < (charge_array[i].s_y_pos + rotate_button_radius)){
                    is_mouse_over_rotate = true;
                    return i;
                }
                else if ((x - canvas.offsetLeft) > (charge_array[i].e_x_pos - rotate_button_radius)  &&  (x - canvas.offsetLeft) < (charge_array[i].e_x_pos + rotate_button_radius)
                && (y - canvas.offsetTop) > (charge_array[i].e_y_pos - rotate_button_radius)   &&  (y - canvas.offsetTop) < (charge_array[i].e_y_pos + rotate_button_radius)){
                    is_mouse_over_rotate = true;
                    return i;
                }
            }
        }
        is_mouse_over_rotate = false;
        return -1;
    }

    function add_point_charge(polarity) {
        var user_input = UI.get_input_to_add_point_charge(polarity);
        if (!user_input) return;
        var new_charge = new PointCharge().initialize(
                user_input["strength"], user_input["x_pos"], user_input["y_pos"], user_input["polarity"], current_charge_id);
        charge_array.push(new_charge);
        current_charge_index = charge_array.length - 1;
        UI.add_new_point_charge_to_list(new_charge);
        UI.update_element_list_shading(current_charge_id, selected_charge_id);
        if (charge_array.length == 1) {
            canvas.onmouseup = mouse_up;
            canvas.onmousedown = mouse_down;
            canvas.onmousemove = mouse_moved;
        }
        selected_charge_id = current_charge_id;
        highest_active_id = current_charge_id;
        current_charge_id++;

        re_draw();        
    }

    function add_line_charge (polarity) {
        var user_input = UI.get_input_to_add_line_charge(polarity);
        if (!user_input) return;
        var new_charge = new LineCharge().initialize_by_points(
            user_input["s_x_pos"], user_input["s_y_pos"], user_input["e_x_pos"], user_input["e_y_pos"], polarity, user_input["linear_charge_density"], user_input["length_per_point"], current_charge_id);

        new_charge.c_x_pos = determine_center(new_charge.s_x_pos, new_charge.e_x_pos);
        new_charge.c_y_pos = determine_center(new_charge.s_y_pos, new_charge.e_y_pos);

        if (new_charge.c_x_pos < 0 || new_charge.c_x_pos > 600 || new_charge.c_y_pos < 0 || new_charge.c_y_pos > 600){
            return;
        }

        new_charge.angle = find_angle(new_charge.s_x_pos, new_charge.e_x_pos, new_charge.s_y_pos, new_charge.e_y_pos);
        new_charge.length = find_length(new_charge.s_x_pos, new_charge.e_x_pos, new_charge.s_y_pos, new_charge.e_y_pos);

        charge_array.push(new_charge);

        partition_line_charge(new_charge.s_x_pos, new_charge.e_x_pos, new_charge.s_y_pos, new_charge.e_y_pos);

        current_charge_index = charge_array.length - 1;
        UI.add_new_line_charge_to_list(new_charge);
        UI.update_element_list_shading(current_charge_id, selected_charge_id);
        if (charge_array.length == 1) {
            canvas.onmouseup = mouse_up;
            canvas.onmousedown = mouse_down;
            canvas.onmousemove = mouse_moved;
        }
        selected_charge_id = current_charge_id;
        highest_active_id = current_charge_id;
        current_charge_id++;

        re_draw();
    }

    function rotate_line(mouse_x, mouse_y) {
        var angle;
        var length;
        var height;
        var index = charge_array.length - 1;
        var current_element = charge_array[index];
        if (mouse_x == current_element.c_x_pos) {
            current_element.angle = Math.PI/2;
            current_element.s_x_pos = current_element.c_x_pos;
            current_element.s_y_pos = current_element.c_y_pos + Math.round(current_element.length/2);
            current_element.e_x_pos = current_element.c_x_pos;
            current_element.e_y_pos = current_element.c_y_pos - Math.round(current_element.length/2);
        }
        else {
            height = current_element.c_y_pos - mouse_y;
            length = current_element.c_x_pos - mouse_x;
            angle = Math.atan(height/length);
            var new_added_x_pos = (current_element.length/2) * Math.cos(-angle);
            var new_added_y_pos = (current_element.length/2) * Math.sin(-angle);
            current_element.angle = angle;
            current_element.s_x_pos = Math.round(current_element.c_x_pos + new_added_x_pos);
            current_element.s_y_pos = Math.round(current_element.c_y_pos - new_added_y_pos);
            current_element.e_x_pos = Math.round(current_element.c_x_pos - new_added_x_pos);
            current_element.e_y_pos = Math.round(current_element.c_y_pos + new_added_y_pos);
        }
        partition_line_charge(current_element.s_x_pos, current_element.e_x_pos, current_element.s_y_pos, current_element.e_y_pos);
    }

    function partition_line_charge (s_x_pos, e_x_pos, s_y_pos, e_y_pos) {
        var current_element = charge_array[charge_array.length - 1];
        var length = Math.floor(current_element.length);

        var x_multiplier;
        var y_multiplier;

        if (s_x_pos > e_x_pos) x_multiplier = -1;
        else if (s_x_pos < e_x_pos) x_multiplier = 1;
        else x_multiplier = 0;

        if (s_y_pos > e_y_pos) y_multiplier = -1;
        else if (s_y_pos < e_y_pos) y_multiplier = 1;
        else y_multiplier = 0;

        var simple_charge_x = s_x_pos;
        var simple_charge_y = s_y_pos;

        var x_increment = Math.abs((s_x_pos - e_x_pos) / (current_element.point_charge_array.length - 1));
        var y_increment = Math.abs((s_y_pos - e_y_pos) / (current_element.point_charge_array.length - 1));

        var charge_strength = current_element.linear_charge_density * current_element.length_per_point;

        if (current_element.point_charge_array.length == 0) {
            var array_length = Math.floor(length/current_element.length_per_point);

            x_increment = Math.abs((s_x_pos - e_x_pos) / array_length);
            y_increment = Math.abs((s_y_pos - e_y_pos) / array_length);

            var new_simple_charge;

            for (var i = 0; i <= array_length; i++) {
                new_simple_charge = new PointCharge().initialize_simple(charge_strength, simple_charge_x, simple_charge_y);
                current_element.point_charge_array.push(new_simple_charge);
                simple_charge_x += x_multiplier * x_increment;
                simple_charge_y += y_multiplier * y_increment;
            }
        }
        else {
            for (var i = 0; i < current_element.point_charge_array.length; i++) {
                current_element.point_charge_array[i].charge_strength = charge_strength;
                current_element.point_charge_array[i].x_pos = simple_charge_x;
                current_element.point_charge_array[i].y_pos = simple_charge_y;
                simple_charge_x += x_multiplier * x_increment;
                simple_charge_y += y_multiplier * y_increment;
            }
        }


        // floating point coordinates are meaningless here, each pixel on the physical screen corresponds to a canvas point
        // but it doesn't matter since I'm not drawing the simple point charges
    }

    // array_index_param for when you already know the array index (used in the mouseDown() function)
    function select_charge_element(id, array_index_param) {
        var array_index;
        if (array_index_param < 0){
            array_index = find_array_index_from_id(id);
        }
        else array_index = array_index_param;
        var new_charge = charge_array[array_index];
        charge_array[array_index] = charge_array[charge_array.length - 1];
        charge_array[charge_array.length - 1] = new_charge;
        current_charge_index = charge_array.length - 1;

        UI.update_element_list_shading(id, selected_charge_id);

        selected_charge_id = id;
        re_draw();
    }

    function toggle_probe_mode_and_probe_location () {
        probe_mode = -probe_mode;
        if (probe_mode == 1) {
            UI.show_probe_container();

            var user_input = UI.get_input_to_probe_field();
            if (!user_input) return;
            else { 
                var probe_magnitude = document.getElementById("probeMagnitude");
                var probe_angle = document.getElementById("probeAngle");
                var probe_result = probe_location(user_input["x"], user_input["y"]);
                probe_magnitude.innerHTML = "STRENGTH: " + probe_result["strength"].toFixed(3);
                probe_angle.innerHTML = "ANGLE: " + probe_result["angle"].toFixed(3);
            }
        }
        else UI.hide_probe_container();
    }

    function probe_location(x_probe, y_probe) {
        var d_probe;
        var s_probe = 0;
        var x_result = 0;
        var y_result = 0;
        for (var i = 0; i < charge_array.length; i++){
            if (charge_array[i].point_or_line == 1){
                d_probe = (charge_array[i].x_pos - x_probe) * (charge_array[i].x_pos - x_probe) + (charge_array[i].y_pos - y_probe) * (charge_array[i].y_pos - y_probe);
                d_probe = d_probe / 1000000;
                if (x_probe - charge_array[i].x_pos > -0.01 && x_probe - charge_array[i].x_pos < 0.01){
                    s_probe = Math.PI/2;
                    if (y_probe - charge_array[i].y_pos < 0){
                        s_probe = -s_probe;
                    }
                }
                else {
                    s_probe = (y_probe - charge_array[i].y_pos)/(x_probe - charge_array[i].x_pos);
                    s_probe = slope_to_radians(s_probe);
                    if ((y_probe - charge_array[i].y_pos > 0 && s_probe < 0) || (y_probe - charge_array[i].y_pos < 0 && s_probe > 0)) {
                        s_probe = Math.PI + s_probe;
                    }
                }
                if (charge_array[i].polarity == -1) s_probe = s_probe + Math.PI;
                if (s_probe > 2 * Math.PI) s_probe = s_probe - 2 * Math.PI;
                x_result += (Math.cos(s_probe) * charge_array[i].charge_strength/d_probe);
                y_result += (Math.sin(s_probe) * charge_array[i].charge_strength/d_probe);
            }
            else {
                var current_pc_array = charge_array[i].point_charge_array;
                for (var j = 0; j < current_pc_array.length; j++){
                    d_probe = (current_pc_array[j].x_pos - x_probe) * (current_pc_array[j].x_pos - x_probe) + (current_pc_array[j].y_pos - y_probe) * (current_pc_array[j].y_pos - y_probe);
                    d_probe = d_probe / 1000000;
                    if (x_probe - current_pc_array[j].x_pos > -0.01 && x_probe - current_pc_array[i].x_pos < 0.01){
                        s_probe = Math.PI/2;
                        if (y_probe - current_pc_array[j].y_pos < 0){
                            s_probe = -s_probe;
                        }
                    }
                    else {
                        s_probe = (y_probe - current_pc_array[j].y_pos)/(x_probe - current_pc_array[j].x_pos);
                        s_probe = slope_to_radians(s_probe);
                        if ((y_probe - current_pc_array[j].y_pos > 0 && s_probe < 0) || (y_probe - current_pc_array[j].y_pos < 0 && s_probe > 0)) {
                            s_probe = Math.PI + s_probe;
                        }
                    }
                    if (charge_array[i].polarity == -1) s_probe = s_probe + Math.PI;
                    if (s_probe > 2 * Math.PI) s_probe = s_probe - 2 * Math.PI;
                    x_result += (Math.cos(s_probe) * current_pc_array[j].charge_strength/d_probe);
                    y_result += (Math.sin(s_probe) * current_pc_array[j].charge_strength/d_probe);
                }
            }
        }
        y_result = -y_result;
        if (x_result > -0.01 && x_result < 0.01) {
            s_probe = Math.PI/2;
            if (y_result < 0) s_probe = -s_probe;
        }
        else {
            s_probe = y_result/x_result;
            s_probe = slope_to_radians(s_probe);
            if ((y_result > 0 && s_probe < 0) || (y_result < 0 && s_probe > 0)) s_probe = Math.PI + s_probe;
        }
        if (s_probe > 2 * Math.PI) s_probe = s_probe - 2 * Math.PI;

        return {
            "strength" : parseFloat(Math.sqrt(x_result * x_result + y_result * y_result)),
            "angle" : parseFloat(s_probe)
        }
    }

    function options_button_for_point_charge_clicked (id) {
        select_charge_element(id, -1);

        var array_index = find_array_index_from_id(id);
        var point_charge = charge_array[array_index];
        UI.open_point_charge_options_modal(point_charge);

        canvas.onmouseup = null;
        canvas.onmousedown = null;
        canvas.onmousemove = null;
        clearInterval(interval_id);
    }

    function update_point_charge () {
        var point_charge = charge_array[charge_array.length - 1];
        var user_input = UI.get_input_to_update_point_charge(point_charge);
        if (!user_input) return;
        UI.close_options_pop_up();
        re_draw();    
    }

    function update_line_charge () {
        var line_charge = charge_array[charge_array.length - 1];
        var user_input = UI.get_input_to_update_point_charge(line_charge);
        if (!user_input) return;
        partition_line_charge(line_charge.s_x_pos, line_charge.e_x_pos, line_charge.s_y_pos, line_charge.e_y_pos);
        UI.close_options_pop_up();
        re_draw();
    }

    function find_array_index_from_id (id) {
        for (var i = 0; i < charge_array.length; i++){
            if (charge_array[i].id == id) return i;
        }
        return -1;
    }

    function get_charge_element_from_id (id) {
        return charge_array[find_array_index_from_id(id)];
    }

    return {
        initialize : function () {
            canvas = document.getElementById("canvas");
            ctx = canvas.getContext("2d");

            point_charge_gradient = ctx.createRadialGradient(charge_array[current_charge_index].x_pos,charge_array[current_charge_index].y_pos,5,charge_array[current_charge_index].x_pos,charge_array[current_charge_index].y_pos,15);
            point_charge_gradient.addColorStop(0, 'rgba(0,0,0,1)');
            point_charge_gradient.addColorStop(0.8, 'rgba(200,200,200,.9)');
            point_charge_gradient.addColorStop(1, 'rgba(255,255,255,0)');

            re_draw();

            canvas.onmouseup = mouse_up;
            canvas.onmousedown = mouse_down;
            canvas.onmousemove = mouse_moved;

            UI.add_new_point_charge_to_list(charge_array[charge_array.length - 1]);
            select_charge_element(selected_charge_id, -1);
        },

        add_point_charge : add_point_charge,

        add_line_charge : add_line_charge,

        update_point_charge : update_point_charge,

        update_line_charge : update_line_charge,

        select_charge_element : select_charge_element,

        get_charge_element_from_id : get_charge_element_from_id,

        toggle_probe_mode_and_probe_location : toggle_probe_mode_and_probe_location,

        options_button_for_point_charge_clicked : options_button_for_point_charge_clicked
    }
})();