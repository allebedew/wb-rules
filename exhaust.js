
defineRule("shower-exhaust", {
	whenChanged: "fl1_rel2/K6",
	then: function(val) {
    	if (val == 1) {
	    	log("Exhaust ON");
        }
    }
});