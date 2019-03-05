
// Controls water valve
// Ignores state setter in already in target state

function makeValve(name, open_relay, close_relay) {
  	var lowcase_name = name.toLowerCase();
    var device_name = "valve_" + lowcase_name;
  	var action_duration = 25000;
    var timer;
  
  	log.debug("Creating valve {}", name);
  
  	// Device
  
    defineVirtualDevice(device_name, {
        title: "Valve " + name,
        cells: {
            Opened: {
                type: "switch",
                value: false,
                readonly: true
            },
            Closed: {
                type: "switch",
                value: true,
                readonly: true
            },
            TargetOpen: {
                type: "switch",
                value: false
            }
        }
    });
  
  	// Rules

    defineRule("valve_" + lowcase_name + "_target_change", {
        whenChanged: device_name + "/TargetOpen",
        then: function(value) {
          
            log.debug("Valve {} target open received changed = {}", lowcase_name, value);
          
          	// check if already in target state
          	if ((value && dev[device_name + "/Opened"]) || (!value && dev[device_name + "/Closed"])) {
            	log.debug("Value {} already in target state, ignoring");
	            return;
            }

            // cancel current action
            if (timer) {
                clearTimeout(timer);
            }

            dev[open_relay] = false;
            dev[close_relay] = false;

            // start new action
            dev[device_name + "/Opened"] = false;
            dev[device_name + "/Closed"] = false;

            if (value == true) {
                dev[open_relay] = true;
            } else {
                dev[close_relay] = true;
            }

            // action finished
            timer = setTimeout(function() {

                dev[open_relay] = false;
                dev[close_relay] = false;

                if (value == true) {
                    dev[device_name + "/Opened"] = true;
                } else {
                    dev[device_name + "/Closed"] = true;
                }

              	log.debug("Valve {} finished", lowcase_name);

            }, action_duration);
        }
    });
}

makeValve("Cold", "fl1_rel3/K3", "fl1_rel3/K4");
makeValve("Hot", "fl1_rel3/K11", "fl1_rel3/K12");
makeValve("Boiler", "fl1_rel3/K1", "fl1_rel3/K2");
