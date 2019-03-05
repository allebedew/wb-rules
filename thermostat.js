/*
// Device

defineVirtualDevice("thermostat", {
	title: "Thermostat",
	cells: {
	    CurrentState: {
          	type: "switch",
            value: false,
          	readonly: true
        },
        TargetState: {
          	type: "switch",
            value: false
        },
      	CurrentTemp: {
      		type: "temperature",
      		value: 22,
        	readonly: true
    	},
      	TargetTemp: {
            type: "range",
          	max: 30,
          	value: 24
        }
    }
});

// Rules

var sensor = "wb-w1/28-041702dcb3ff";
var relay = "wb-mr6c_0x44/K1";

defineRule("update_temperature", {
	whenChanged: sensor,
  	then: function(value) {
    	dev["thermostat/CurrentTemp"] = value
    }
});

defineRule("update_relay", {
	whenChanged: "thermostat/CurrentState",
	then: function(value) {
    	dev[relay] = value
    }
});

defineRule("update_state", {
	whenChanged: ["thermostat/CurrentTemp", "thermostat/TargetState", "thermostat/TargetTemp"],
  	then: function() {
        if (dev["thermostat/TargetState"]) {
            var on = dev["thermostat/CurrentState"]
            var diff = dev["thermostat/CurrentTemp"] - dev["thermostat/TargetTemp"]
            var hysteresis = 1.0

            log("upd temp on = {} diff = {}", on, diff);

            if (on && diff > hysteresis) {
                dev["thermostat/CurrentState"] = false
            } else if (!on && diff < -hysteresis) {
                dev["thermostat/CurrentState"] = true
            }
        } else {
            dev["thermostat/CurrentState"] = false
        }
    }
});
*/