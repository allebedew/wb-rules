

/*
var timer1 = null;

defineRule("longpress_test", {
 	whenChanged: "wb-mr6c_0x44/Input 6",
  	then: function(newValue) {
    	if (newValue == true) {
//            dev["wb-mr6c_0x44/K5"] = !dev["wb-mr6c_0x44/K5"];  
      		timer1 = setTimeout(function() {
//     			dev["wb-mr6c_0x44/K4"] = !dev["wb-mr6c_0x44/K4"];  
//            	beep_onece();
	     	}, 2000);
	    } else {
			clearTimeout(timer1);
		}
	}
});
*/
/*
defineRule("test_beep", {
	whenChanged: ["wb-gpio/EXT1_DR1", 
                  "wb-gpio/EXT1_DR2", 
                  "wb-gpio/EXT1_DR3", 
                  "wb-gpio/EXT1_DR4", 
                  "wb-gpio/EXT1_DR5", 
                  "wb-gpio/EXT1_DR6", 
                  "wb-gpio/EXT1_DR7", 
                  "wb-gpio/EXT1_DR8", 
                  "wb-gpio/EXT1_DR9", 
                  "wb-gpio/EXT1_DR10", 
                  "wb-gpio/EXT1_DR11", 
                  "wb-gpio/EXT1_DR12", 
                  "wb-gpio/EXT1_DR13", 
                  "wb-gpio/EXT1_DR14"],
  	then: function(val) {
      	if (val == true) {
	    	dev["beeper/Beep"] = 1;
        }
    }
});
*/

