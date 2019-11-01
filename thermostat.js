
function makeCurtainsControl(name, sensor, relay) {
  var lowcase_name = name.toLowerCase();
  var dev_name = "radiator_" + lowcase_name;

  // Device

  defineVirtualDevice(dev_name, {
    title: "Radiator "+name,
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
        max: 38,
        value: 22
      }
    }
  });

  // Rules

  defineRule("thermo_upd_"+dev_name, {
    whenChanged: sensor,
    then: function(value) {
      dev[dev_name]["CurrentTemp"] = value
    }
  });

  defineRule("thermo_state_"+dev_name, {
    whenChanged: [dev_name+"/CurrentTemp", 
                  dev_name+"/TargetState", 
                  dev_name+"/TargetTemp"],
    then: function() {
      var on = dev[dev_name]["CurrentState"]
      if (dev[dev_name]["TargetState"]) {
        var diff = dev[dev_name]["CurrentTemp"] - dev[dev_name]["TargetTemp"]
        var hysteresis = 0.2
        if (on && diff > hysteresis) {
          on = false
        } else if (!on && diff < -hysteresis) {
          on = true
        }
      } else {
        on = false
      }

      if (dev[dev_name]["CurrentState"] != on) {
        dev[dev_name]["CurrentState"] = on;
      }
      if (dev[relay] != on) {
        dev[relay] = on;
      }
    }
  });
}

makeCurtainsControl("Living", "sensor_living/Temperature", "fl1_rel3/K15");
makeCurtainsControl("Bedroom", "fl2_w1_1/External Sensor 1", "fl2_rel3/K1");
makeCurtainsControl("Kids", "fl2_w1_2/External Sensor 2", "fl2_rel3/K3");
makeCurtainsControl("Cabinet", "fl2_w1_2/External Sensor 1", "fl2_rel3/K2");
