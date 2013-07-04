$(function() {
    $(".expContainer").css("display", "none");

    $(".expandable").toggle(function() {         
        $(this).prevAll(".expContainer").slideDown();         
    }, function() {                      
        $(this).prevAll(".expContainer").slideUp();        
    });
    
    $("#addLineChargeStartEnd").toggle(function() { 
        $("#addLineChargeLengthAngle").attr("disabled", true);
        $(this).prevAll(".startEnd").slideDown();         
    }, function() {
        $('#addLineChargeLengthAngle').attr("disabled", false);          
        $(this).prevAll(".startEnd").slideUp();        
    });

    $("#addLineChargeLengthAngle").toggle(function() {
        $("#addLineChargeStartEnd").attr("disabled", true);
        $(this).prevAll(".lengthAngle").slideDown();         
    }, function() {  
        $("#addLineChargeStartEnd").attr("disabled", false);                    
        $(this).prevAll(".lengthAngle").slideUp();        
    });
});