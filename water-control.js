
// Controls water valves based on
// 1. Flood alert sensor
// 2. Virt device controls (water_control.boilerOn & water_control.CloseAll)
// TODO: 3. Turn valves onece per month

// Device
/*
defineVirtualDevice("water_control", {
	title: "Water Control",
	cells: {
      	FloodAlert: {
        	type: "switch",
			value: false,
        	readonly: true
        },
      	ResetFloodAlert: {
        	type: "pushbutton"
        },
        TestFloodInput: {
        	type: "switch",
        	value: false
        },
    	BoilerOn: {
        	type: "switch",
        	value: false
        },
    	CloseAll: {
        	type: "switch",
        	value: false
        },
    }
});

defineRule("update_valves", {
 	whenChanged: ["water_control/BoilerOn", "water_control/CloseAll"],
	then: updateValves
});

function updateValves() {
	var boiler_on = dev.water_control.BoilerOn;
    var close_all = dev.water_control.CloseAll;
  	var flood_alert = dev.water_control.FloodAlert;

//	log("Updating valves, boiler = {}, close all = {}, flood = {}", boiler_on, close_all, flood_alert);
  
	if (close_all || flood_alert) {
    	dev.valve_cold.TargetOpen = false
        dev.valve_hot.TargetOpen = false
        dev.valve_boiler.TargetOpen = false
    } else {
    	dev.valve_cold.TargetOpen = true
      	if (boiler_on) {
            dev.valve_hot.TargetOpen = false
            dev.valve_boiler.TargetOpen = true
        } else {
            dev.valve_hot.TargetOpen = true
            dev.valve_boiler.TargetOpen = false
        }
    }
}

// Flood

var flood_input = "wb-gpio/A1_IN";
var flood_input_test = "water_control/TestFloodInput";

defineRule("flood_alert", {
	whenChanged: [flood_input, flood_input_test],
  	then: function(value) {
      	if (value == true && dev.water_control.FloodAlert == false) {
            log("OMG! Flood alert! Closing valves.");
            dev.water_control.FloodAlert = true;
            updateValves();
            notify_user("Water flood detected! Valves are closed.");
        }
    }
});

defineRule("reset_flood_alert", {
	whenChanged: "water_control/ResetFloodAlert",
  	then: function() {
      	if (dev.water_control.FloodAlert == false) {
            log("Nothing to reset.");
            return;
        }
    	if (dev[flood_input] == true || dev[flood_input_test] == true) {
        	log("Can't reset flood alert. Input still active.");
          	return;
        }
        log("Flood Alert Dismissed. Restoring valves.");
        dev.water_control.FloodAlert = false;
        updateValves();
    }
});
*/