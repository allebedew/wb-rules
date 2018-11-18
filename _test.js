
// Devices:
// valve, boiler, thermostat, shutter



var timer1 = null;

defineRule("longpress_test", {
 	whenChanged: "wb-mr6c_0x44/Input 6",
  	then: function(newValue) {
    	if (newValue == true) {
            dev["wb-mr6c_0x44/K5"] = !dev["wb-mr6c_0x44/K5"];  
      		timer1 = setTimeout(function() {
      			dev["wb-mr6c_0x44/K4"] = !dev["wb-mr6c_0x44/K4"];  
            	beep_onece();
	     	}, 2000);
	    } else {
			clearTimeout(timer1);
		}
	}
});


