$(function() {     
    $(".pcExpContainer").hide();
     
    $("#pointChargeExp").toggle(function() {         
        $(this).prevAll(".pcExpContainer").slideDown();         
    }, function() {                      
        $(this).prevAll(".pcExpContainer").slideUp();        
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