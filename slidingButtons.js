$(function() {     
    $(".expContainer").hide();
     
    $(".expandable").toggle(function() {         
        $(this).prevAll(".expContainer").slideDown();         
    }, function() {                      
        $(this).prevAll(".expContainer").slideUp();        
    }); 
});

$(function() {     
    $(".probeExpContainer").hide();
     
    $("#probeExp").toggle(function() {         
        $(this).prevAll(".probeExpContainer").slideDown();         
    }, function() {                      
        $(this).prevAll(".probeExpContainer").slideUp();
    }); 
}); 