/* ==========================
   global helper functions... */

function determine_center (first, second) {
    var center;
    if (second > first) center = Math.round((second - first)/2) + parseFloat(first);
    else center = Math.round((first - second)/2) + parseFloat(second);
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
            UI.change_cursor_to_pointer();
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
            if ( mouse_check_and_return_index(e.pageX, e.pageY) >= 0 ) UI.change_cursor_to_pointer();
            else UI.change_cursor_to_default();
        }
        if (probe_mode == 1 && is_mouse_down == false){
            var x_probe = e.pageX - canvas.offsetLeft;
            var y_probe = e.pageY - canvas.offsetTop;
            var probe_result = probe_location(x_probe, y_probe);
            UI.update_probe_information_for_strength_and_angle(probe_result["strength"].toFixed(3), probe_result["angle"].toFixed(3));
            UI.update_probe_information_for_x_and_y(x_probe, y_probe);
        }
        else if (probe_mode == 1 && is_mouse_down) {
            UI.update_probe_information_for_strength_and_angle("", "");
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
        if (charge_array.length == 1) enable_mouse_actions();
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
        if (charge_array.length == 1) enable_mouse_actions();
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
                var probe_result = probe_location(user_input["x"], user_input["y"]);
                UI.update_probe_information_for_strength_and_angle(probe_result["strength"].toFixed(3), probe_result["angle"].toFixed(3));
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

        disable_mouse_actions_and_stop_drawing_interval();
    }

    function options_button_for_line_charge_clicked (id) {
        select_charge_element(id, -1);

        var array_index = find_array_index_from_id(id);
        var line_charge = charge_array[array_index];
        UI.open_line_charge_options_modal(line_charge);

        disable_mouse_actions_and_stop_drawing_interval();
    }

    function update_point_charge () {
        var point_charge = charge_array[charge_array.length - 1];
        var user_input = UI.get_input_to_update_point_charge(point_charge);
        if (!user_input) return;
        UI.close_options_pop_up();

        enable_mouse_actions();

        re_draw();    
    }

    function update_line_charge () {
        var line_charge = charge_array[charge_array.length - 1];
        var user_input = UI.get_input_to_update_line_charge(line_charge);
        if (!user_input) return;
        partition_line_charge(line_charge.s_x_pos, line_charge.e_x_pos, line_charge.s_y_pos, line_charge.e_y_pos);
        UI.close_options_pop_up();

        enable_mouse_actions();

        re_draw();
    }

    function delete_charge_element (id) {
        charge_array.pop();

        if (charge_array.length == 0){
            UI.remove_from_charge_list(id);
            canvas.width = canvas.width;

            disable_mouse_actions_and_stop_drawing_interval();
        }
        else {
            if (id != highest_active_id) selected_charge_id = UI.higher_active_id(id);
            else {
                selected_charge_id = UI.lower_active_id(id);
                highest_active_id = selected_charge_id;
            }
            select_charge_element(selected_charge_id, -1);

            // if (highest_active_id == id) highest_active_id -= 1;

            // var testString = "";
            // for (var i = 0; i < charge_array.length; i++) {
            //  testString += charge_array[i].id;
            //  testString += ", ";
            // }
            // alert(testString);
            // alert("Highest ID: " + highest_active_id);

            UI.remove_from_charge_list(id);

            enable_mouse_actions();
        }

        UI.close_options_pop_up();

        // when no elements in charge_array -> functions to deal with
        // changed draw
        // mouse moved (probe)
        // cursor over circle
    }

    function enable_mouse_actions() {
        canvas.onmouseup = mouse_up;
        canvas.onmousedown = mouse_down;
        canvas.onmousemove = mouse_moved;        
    }

    function disable_mouse_actions_and_stop_drawing_interval() {
        canvas.onmouseup = null;
        canvas.onmousedown = null;
        canvas.onmousemove = null;
        clearInterval(interval_id);        
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

            enable_mouse_actions();

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

        options_button_for_point_charge_clicked : options_button_for_point_charge_clicked,

        options_button_for_line_charge_clicked : options_button_for_line_charge_clicked,

        delete_charge_element : delete_charge_element,

        enable_mouse_actions : enable_mouse_actions
    }
})();