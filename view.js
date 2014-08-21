var UI = (function () {
    var default_text_box_border_colour;
    var error_text_box_border_colour = "#FF1414";

    // main ui elements
    var canvas_container;
    var charge_list;
    var fullscreen_div;

    // probe ui elements
    var probe_button;
    var probe_magnitude;
    var probe_angle;
    var probe_x_element;
    var probe_y_element;

    // add point charge ui elements
    var charge_strength_element;
    var x_pos_element;
    var y_pos_element;

    // add line charge ui elements
    var linear_charge_density_element;
    var length_per_point_element;
    var s_x_pos_element_for_start_end;
    var s_y_pos_element_for_start_end;
    var e_x_pos_element;
    var e_y_pos_element;
    var angle_element;
    var length_element;
    var s_x_pos_element_for_strength_angle;
    var s_y_pos_element_for_strength_angle;
    var add_line_charge_by_start_end_button;
    var add_line_charge_by_length_and_angle_button;

    // update point charge modal
    var polarity_div_image_point_charge_modal;
    var options_delete_button_point_charge_modal;
    var options_x_pos_element;
    var options_y_pos_element;

    // update line charge modal
    var polarity_div_image_line_charge_modal;
    var options_delete_button_line_charge_modal;
    var options_linear_charge_density_element;
    var options_length_per_point_element;
    var options_s_x_pos_element;
    var options_s_y_pos_element;
    var options_e_x_pos_element;
    var options_e_y_pos_element;

    function build_coordinates_span(parent_span, x_span, y_span) {
        parent_span.innerHTML += "(";
        parent_span.appendChild(x_span);
        parent_span.innerHTML += ", ";
        parent_span.appendChild(y_span);
        parent_span.innerHTML += ")";
        return parent_span;
    }

    function add_new_point_charge_to_list (point_charge) {
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
        charge_list.appendChild(list_element);
        list_element.appendChild(color_code_element);
        list_element.appendChild(right_block);
        list_element.setAttribute("onClick", "CanvasField.select_charge_element(" + line_charge.id + ", -1)");
        expand_button.setAttribute("onClick", "UI.expand_list_element(" + line_charge.id + ")");
        
        // stops the click action to propagating to the overall li element and cause currentSelectClick() to run
        $(expand_button).click(function(event) {event.stopPropagation()});
        options_button.setAttribute("onClick", "CanvasField.options_button_for_line_charge_clicked(" +line_charge.id + ")");
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

    function update_probe_information_for_strength_and_angle (strength, angle) {
        probe_magnitude.innerHTML = "STRENGTH: " + strength;
        probe_angle.innerHTML = "ANGLE: " + angle;
    }

    function update_probe_information_for_x_and_y (x, y) {
        probe_x_element.value = x;
        probe_y_element.value = y;        
    }

    function update_element_list_shading (new_charge_id, previous_charge_id) {
        var previous_shaded_list_element = document.getElementById("li" + previous_charge_id);

        if (previous_shaded_list_element) previous_shaded_list_element.className = "liClassNoShade";
        document.getElementById("li" + new_charge_id).className = "liClassShade";
    }

    function get_input_to_add_point_charge (polarity) {
        var strength = Number(charge_strength_element.value);
        var x_pos = Number(x_pos_element.value);
        var y_pos = Number(y_pos_element.value);
        if (charge_strength_element.value == "") strength = 1;
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
        var by_start_end_points = !add_line_charge_by_start_end_button.disabled;
        var by_angle_and_length = !add_line_charge_by_length_and_angle_button.disabled;

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
            linear_charge_density = linear_charge_density_element.value;
            length_per_point = length_per_point_element.value;
            s_x_pos = s_x_pos_element_for_start_end.value;
            s_y_pos = s_y_pos_element_for_start_end.value;
            e_x_pos = e_x_pos_element.value;
            e_y_pos = e_y_pos_element.value;

            s_x_pos = parseFloat(s_x_pos);
            s_y_pos = parseFloat(s_y_pos);
            e_x_pos = parseFloat(e_x_pos);
            e_y_pos = parseFloat(e_y_pos);
        }
        else {
            if (!validate_add_line_charge_form("angle_and_length")) return false;
            linear_charge_density = linear_charge_density_element.value;
            length_per_point = length_per_point_element.value;
            angle = angle_element.value;
            length = length_element.value;
            s_x_pos = s_x_pos_element_for_strength_angle.value;
            s_y_pos = s_y_pos_element_for_strength_angle.value;

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
        if (isNaN(linear_charge_density_element.value) || isNaN(length_per_point_element.value)){
            return false;
        }
        else if (linear_charge_density_element.value <= 0 || length_per_point_element.value < 1) {
            return false;
        }

        if (method == "start_end_points") {
            if (isNaN(s_x_pos_element_for_start_end.value) || isNaN(s_y_pos_element_for_start_end.value) || isNaN(e_x_pos_element.value) || isNaN(e_y_pos_element.value)){
                return false;
            }
            else if (s_x_pos_element_for_start_end.value < 0 || s_y_pos_element_for_start_end.value < 0 || e_x_pos_element.value < 0 || e_y_pos_element.value < 0) {
                return false;
            }
            else if (s_x_pos_element_for_start_end.value > 600 || s_y_pos_element_for_start_end.value > 600 || e_x_pos_element.value > 600 || e_y_pos_element.value > 600) {
                return false;
            }
            else if ((s_x_pos_element_for_start_end.value + s_y_pos_element_for_start_end.value + e_x_pos_element.value + e_y_pos_element.value) == 0) {
                return false;
            }
            else return true;
        }
        else if (method == "angle_and_length") {
            if (isNaN(angle_element.value) || isNaN(length_element.value) || isNaN(s_x_pos_element_for_strength_angle.value) || isNaN(s_y_pos_element_for_strength_angle.value)){
                return false;
            }
            else if (length_element.value <= 0 || s_x_pos_element_for_strength_angle.value < 0 || s_y_pos_element_for_strength_angle.value < 0){
                return false;
            }
            else if (s_x_pos_element_for_strength_angle.value > 600 || s_y_pos_element_for_strength_angle.value > 600) {
                return false;
            }
            else return true;
        } else {
            return false;
        }
    }

    function show_probe_container () {
        $(".probeInfoContainer").show();
        probe_button.style.backgroundPosition="65px 70px";
    }

    function hide_probe_container () {
        $(".probeInfoContainer").hide();
        probe_magnitude.innerHTML = "";
        probe_angle.innerHTML = "";
        probe_button.style.backgroundPosition="0px 70px";
    }

    function get_input_to_probe_field () {
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
        if (point_charge.polarity == 1) {
            polarity_div_image_point_charge_modal.src = "images/posCharge.png";
            polarity_div_image_point_charge_modal.alt = "1";
        }
        else {
            polarity_div_image_point_charge_modal.src = "images/negCharge.png";
            polarity_div_image_point_charge_modal.alt = "-1";
        }

        options_x_pos_element.value = point_charge.x_pos;
        options_y_pos_element.value = point_charge.y_pos;
     
        fullscreen_div.style.display = "block";
        options_delete_button_point_charge_modal.setAttribute("onClick", "CanvasField.delete_charge_element("+ point_charge.id +")");

        // $("#fullScreenDiv").hover(
        //  function () {
        //      $(".fullScreenDivFade").fadeTo(500, 0.3);
        //  },
        //  function () {
        //      $(".fullScreenDivFade").fadeTo(500, 1.0);
        //  }
        // );
        $(".optionsPointChargePopUp").show();
        default_text_box_border_colour = document.getElementById("optionsXPOS").style.borderColor;
    }

    function open_line_charge_options_modal (line_charge) {
        if (line_charge.polarity == 1) {
            polarity_div_image_line_charge_modal.src = "images/posCharge.png";
            polarity_div_image_line_charge_modal.alt = "1";
        }
        else {
            polarity_div_image_line_charge_modal.src = "images/negCharge.png";
            polarity_div_image_line_charge_modal.alt = "-1";
        }

        options_linear_charge_density_element.value = line_charge.linear_charge_density;
        options_length_per_point_element.value = line_charge.length_per_point;
        options_s_x_pos_element.value = line_charge.s_x_pos;
        options_s_y_pos_element.value = line_charge.s_y_pos;
        options_e_x_pos_element.value = line_charge.e_x_pos;
        options_e_y_pos_element.value = line_charge.e_y_pos;
     
        fullscreen_div.style.display = "block";
        options_delete_button_line_charge_modal.setAttribute("onClick", "CanvasField.delete_charge_element("+ line_charge.id +")");

        // $("#fullScreenDiv").hover(
        //  function () {
        //      $(".fullScreenDivFade").fadeTo(500, 0.3);
        //  },
        //  function () {
        //      $(".fullScreenDivFade").fadeTo(500, 1.0);
        //  }
        // );
        $(".optionsLineChargePopUp").show();
        default_text_box_border_colour = document.getElementById("optionsChargeDensity").style.borderColor;   
    }

    function get_input_to_update_point_charge (point_charge) {
        var x_pos = options_x_pos_element.value;
        var y_pos = options_y_pos_element.value;
        var polarity = polarity_div_image_point_charge_modal.alt;

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
                options_x_pos_element.style.borderColor = error_text_box_border_colour;
            }
            else {
                options_x_pos_element.style.borderColor = default_text_box_border_colour;
            }

            if (y_pos_has_error) {
                options_y_pos_element.style.borderColor = error_text_box_border_colour;
            }
            else {
                options_y_pos_element.style.borderColor = default_text_box_border_colour;
            }
            return false;
        }   
    }

    function get_input_to_update_line_charge (line_charge) {
        var charge_density = options_linear_charge_density_element.value;
        var length_per_point = options_length_per_point_element.value;
        var s_x_pos = options_s_x_pos_element.value;
        var s_y_pos = options_s_y_pos_element.value;
        var e_x_pos = options_e_x_pos_element.value;
        var e_y_pos = options_e_y_pos_element.value;
        var polarity = polarity_div_image_line_charge_modal.alt;

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

                line_charge.point_charge_array.length = 0;

                line_charge.length_per_point = parseFloat(length_per_point);
                line_charge.s_x_pos = parseFloat(s_x_pos);
                line_charge.s_y_pos = parseFloat(s_y_pos);
                line_charge.e_x_pos = parseFloat(e_x_pos);
                line_charge.e_y_pos = parseFloat(e_y_pos);
                line_charge.c_x_pos = parseFloat(new_c_x_pos);
                line_charge.c_y_pos = parseFloat(new_c_y_pos);
                line_charge.length = find_length (line_charge.s_x_pos, line_charge.e_x_pos, line_charge.s_y_pos, line_charge.e_y_pos);
                line_charge.angle = find_angle (line_charge.s_x_pos, line_charge.e_x_pos, line_charge.s_y_pos, line_charge.e_y_pos);
                line_charge.polarity = polarity;

                document.getElementById("length" + line_charge.id).innerHTML = line_charge.length.toFixed(4);
                document.getElementById("lengthPerPoint" + line_charge.id).innerHTML = length_per_point;
                document.getElementById("startCoordsX" + line_charge.id).innerHTML = s_x_pos;
                document.getElementById("startCoordsY" + line_charge.id).innerHTML = s_y_pos;
                document.getElementById("endCoordsX" + line_charge.id).innerHTML = e_x_pos;
                document.getElementById("endCoordsY" + line_charge.id).innerHTML = e_y_pos;

                if (polarity == "1") {
                    document.getElementById("lcChargeDensity" + line_charge.id).innerHTML = line_charge.linear_charge_density +" C/unit </br>Line Charge</br>";
                    document.getElementById("colorCodeBar" + line_charge.id).src = "images/posChargeColorCode.png";
                }
                else {
                    document.getElementById("lcChargeDensity" + line_charge.id).innerHTML = "-" + line_charge.linear_charge_density +" C/unit </br>Line Charge </br>";
                    document.getElementById("colorCodeBar" + line_charge.id).src = "images/negChargeColorCode.png";
                }

                return true;
            }
        }

        if (charge_density_has_error) {
            options_linear_charge_density_element.style.borderColor = error_text_box_border_colour;
        }
        else {
            options_linear_charge_density_element.style.borderColor = default_text_box_border_colour;
        }

        if (length_per_point_has_error) {
            options_length_per_point_element.style.borderColor = error_text_box_border_colour;
        }
        else {
            options_length_per_point_element.style.borderColor = default_text_box_border_colour;
        }

        if (s_x_pos_has_error || center_has_error) {
            options_s_x_pos_element.style.borderColor = error_text_box_border_colour;
        }
        else {
            options_s_x_pos_element.style.borderColor = default_text_box_border_colour;
        }

        if (s_y_pos_has_error || center_has_error) {
            options_s_y_pos_element.style.borderColor = error_text_box_border_colour;
        }
        else {
            options_s_y_pos_element.style.borderColor = default_text_box_border_colour;
        }

        if (e_x_pos_has_error || center_has_error) {
            options_e_x_pos_element.style.borderColor = error_text_box_border_colour;
        }
        else {
            options_e_x_pos_element.style.borderColor = default_text_box_border_colour;
        }

        if (e_y_pos_has_error || center_has_error) {
            options_e_y_pos_element.style.borderColor = error_text_box_border_colour;
        }
        else {
            options_e_y_pos_element.style.borderColor = default_text_box_border_colour;
        }

        return false;
    }

    function change_charge_polarity_image_in_point_charge_modal () {
        polarity_div_image_point_charge_modal.alt = -polarity_div_image_point_charge_modal.alt;
        if (polarity_div_image_point_charge_modal.alt == "-1") polarity_div_image_point_charge_modal.src = "images/negCharge.png";
        else polarity_div_image_point_charge_modal.src = "images/posCharge.png";
    }

    function change_charge_polarity_image_in_line_charge_modal () {
        polarity_div_image_line_charge_modal.alt = -polarity_div_image_line_charge_modal.alt;
        if (polarity_div_image_line_charge_modal.alt == "-1") polarity_div_image_line_charge_modal.src = "images/negCharge.png";
        else polarity_div_image_line_charge_modal.src = "images/posCharge.png";
    }

    function close_options_pop_up () {
        fullscreen_div.style.display = "none";
        $(".popUp").hide();
        options_x_pos_element.style.borderColor = default_text_box_border_colour;
        options_y_pos_element.style.borderColor = default_text_box_border_colour;
        options_linear_charge_density_element.style.borderColor = default_text_box_border_colour;
        options_length_per_point_element.style.borderColor = default_text_box_border_colour;
        options_s_x_pos_element.style.borderColor = default_text_box_border_colour;
        options_s_y_pos_element.style.borderColor = default_text_box_border_colour;
        options_e_x_pos_element.style.borderColor = default_text_box_border_colour;
        options_e_y_pos_element.style.borderColor = default_text_box_border_colour;
    }

    function create_new_element (type, id, className, text){
        var temp = document.createElement(type);
        temp.id = id;
        temp.className = className;
        temp.innerHTML = text;
        return temp;
    }

    function change_cursor_to_pointer () {
        document.body.style.cursor = 'pointer';
    }

    function change_cursor_to_default () {
        document.body.style.cursor = 'default';
    }

    function remove_from_charge_list (id) {
        var list_element_to_delete = document.getElementById("li" + id);
        charge_list.removeChild(list_element_to_delete);
    }

    function higher_active_id(id){
        var next_element_full_id = $("#li" + id).next().attr("id");
        var next_element_number_id = next_element_full_id.substr(2);
        return Number(next_element_number_id);
    }

    function lower_active_id(id){
        var next_element_full_id = $("#li" + id).prev().attr("id");
        var next_element_number_id = next_element_full_id.substr(2);
        return Number(next_element_number_id);
    }

    return {
        initialize : function () {
            $(".probeInfoContainer").hide();

            canvas_container = document.getElementById("canvasContainer");
            charge_list = document.getElementById ("chargeList");
            fullscreen_div = document.getElementById("fullScreenDiv");
            probe_button = document.getElementById("probeButton");
            probe_magnitude = document.getElementById("probeMagnitude");
            probe_angle = document.getElementById("probeAngle");
            probe_x_element = document.getElementById("probeXText");
            probe_y_element = document.getElementById("probeYText");
            charge_strength_element = document.getElementById("strengthText");
            x_pos_element = document.getElementById("xPosText");
            y_pos_element = document.getElementById("yPosText");
            linear_charge_density_element = document.getElementById("chargeDensityText");
            length_per_point_element = document.getElementById("lengthPerPointText");
            s_x_pos_element_for_start_end = document.getElementById("startXTextStartEnd");
            s_y_pos_element_for_start_end = document.getElementById("startYTextStartEnd");
            e_x_pos_element = document.getElementById("endXText");
            e_y_pos_element = document.getElementById("endYText");
            angle_element = document.getElementById("angleText");
            length_element = document.getElementById("lengthText");
            s_x_pos_element_for_strength_angle = document.getElementById("startXTextLengthAngle");
            s_y_pos_element_for_strength_angle = document.getElementById("startYTextLengthAngle");
            add_line_charge_by_start_end_button = document.getElementById("addLineChargeStartEnd");
            add_line_charge_by_length_and_angle_button = document.getElementById("addLineChargeLengthAngle");
            polarity_div_image_point_charge_modal = document.getElementById("polarityDivPicPointChargeModal");
            options_delete_button_point_charge_modal = document.getElementById("optionsUpdateDeleteButtonPointCharge");
            options_x_pos_element = document.getElementById("optionsXPOS");
            options_y_pos_element = document.getElementById("optionsYPOS");
            polarity_div_image_line_charge_modal = document.getElementById("polarityDivPicLineChargeModal");
            options_delete_button_line_charge_modal = document.getElementById("optionsUpdateDeleteButtonLineCharge");
            options_linear_charge_density_element = document.getElementById("optionsChargeDensity");
            options_length_per_point_element = document.getElementById("optionsLengthPerPoint");
            options_s_x_pos_element = document.getElementById("optionsStartXPos");
            options_s_y_pos_element = document.getElementById("optionsStartYPos");
            options_e_x_pos_element = document.getElementById("optionsEndXPos");
            options_e_y_pos_element = document.getElementById("optionsEndYPos");
        },

        add_new_point_charge_to_list : add_new_point_charge_to_list,

        add_new_line_charge_to_list : add_new_line_charge_to_list,

        get_input_to_add_point_charge : get_input_to_add_point_charge,

        get_input_to_add_line_charge : get_input_to_add_line_charge,

        get_input_to_update_point_charge : get_input_to_update_point_charge,

        get_input_to_update_line_charge : get_input_to_update_line_charge,

        update_element_list_shading : update_element_list_shading,

        update_point_charge_information : update_point_charge_information,

        update_line_charge_information : update_line_charge_information,

        expand_list_element : expand_list_element,

        show_probe_container : show_probe_container,

        hide_probe_container : hide_probe_container,

        get_input_to_probe_field : get_input_to_probe_field,

        open_point_charge_options_modal : open_point_charge_options_modal,

        open_line_charge_options_modal : open_line_charge_options_modal,

        close_options_pop_up : close_options_pop_up,

        change_charge_polarity_image_in_point_charge_modal : change_charge_polarity_image_in_point_charge_modal,

        change_charge_polarity_image_in_line_charge_modal : change_charge_polarity_image_in_line_charge_modal,

        update_probe_information_for_strength_and_angle : update_probe_information_for_strength_and_angle,

        update_probe_information_for_x_and_y : update_probe_information_for_x_and_y,

        change_cursor_to_pointer : change_cursor_to_pointer,

        change_cursor_to_default : change_cursor_to_default,

        remove_from_charge_list : remove_from_charge_list,

        higher_active_id : higher_active_id,

        lower_active_id : lower_active_id
    }
})();