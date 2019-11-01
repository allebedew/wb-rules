  
// Using motion detection sensors to update PIR virtual device
// Updates "time of day" cell with cron
// Updates "light in living" cell with sensor

// Devices

defineVirtualDevice("pir", {
  title: "PIR",
  cells: {
    "Living": {
      type: "switch",
      readonly: true,
      value: false,
      forceDefault: true
    },
    "Hall": {
      type: "switch",
      readonly: true,
      value: false,
      forceDefault: true
    },
    "Upper Hall": {
      type: "switch",
      readonly: true,
      value: false,
      forceDefault: true
    },
    "Boiler": {
      type: "switch",
      readonly: true,
      value: false,
      forceDefault: true
    },
    "Shower": {
      type: "switch",
      readonly: true,
      value: false,
      forceDefault: true
    },
    "Bathroom": {
      type: "switch",
      readonly: true,
      value: false,
      forceDefault: true
    },
    "Kids": {
      type: "switch",
      readonly: true,
      value: false,
      forceDefault: true
    },
    "Bedroom": {
      type: "switch",
      readonly: true,
      value: false,
      forceDefault: true
    },
    "Cabinet": {
      type: "switch",
      readonly: true,
      value: false,
      forceDefault: true
    },
    "Any": {
      type: "switch",
      readonly: true,
      value: false,
      forceDefault: true
    }
  }
}); 

defineVirtualDevice("pir_params", {
  title: "PIR Params",
  cells: {
    "Time of Day": { // Day, Night, Evening
      type: "text",
      readonly: true,
      value: "Day",
      forceDefault: true
    },
    "Light in Living": { // No, Low, High
      type: "text",
      readonly: true,
      value: "No",
      forceDefault: true
    },
    "Stairs Disabled": {
      type: "switch",
      value: false
    }
  }
});

// Setup

var detectors = {};

detectors["living"] = {
  sensor: "EXT1_DR4",
  pir: "Living",
  timeout: 30
};

detectors["hall"] = {
  sensor: "EXT1_DR3",
  pir: "Hall",
  timeout: 5
};

detectors["upper_hall"] = {
  sensor: "EXT1_DR8",
  pir: "Upper Hall",
  timeout: 5
};

detectors["boiler"] = {
  sensor: "EXT1_DR2",
  pir: "Boiler",
  timeout: 5
};

detectors["shower"] = {
  sensor: "EXT1_DR1",
  pir: "Shower",
  timeout: 15
};

detectors["bathroom"] = {
  sensor: "EXT1_DR9",
  pir: "Bathroom",
  timeout: 15
};

detectors["kids"] = {
  sensor: "EXT1_DR10",
  pir: "Kids",
  timeout: 30
};

detectors["bedroom"] = {
  sensor: "EXT1_DR11",
  pir: "Bedroom",
  timeout: 30
};

detectors["cabinet"] = {
  sensor: "EXT1_DR12",
  pir: "Cabinet",
  timeout: 30
};

var sensors = [];
var pirs = [];
for (var name in detectors) {
  sensors.push("wb-gpio/" + detectors[name].sensor);
  pirs.push("pir/" + detectors[name].pir);
}

// State

var last_motion = {}; // key = sensor id
var pirs_to_reset = pirs.length;

// Functions

function update_any_pir() {
  var any_pir = pirs.some(function(val) { return dev[val] == 1 });
  if (dev["pir/Any"] != any_pir) {
    dev["pir/Any"] = any_pir;
  }
}

function time_of_day() {
  var date = new Date();
  var day_start = new Date(date);
  day_start.setHours(6);
  day_start.setMinutes(0);
  var evening_start = new Date(date);
  evening_start.setHours(19);
  evening_start.setMinutes(0);
  var night_start = new Date(date);
  night_start.setHours(22);
  night_start.setMinutes(00);
  
  // night |6 day_start| day |19 evening_start| evening |22 night_start| night
  
  if (date < day_start) {
    return "Night";
  } else if (date < evening_start) {
    return "Day";
  } else if (date < night_start) {
    return "Evening";
  } else {
    return "Night";
  }
}

function light_in_living(val) {
  if (val <= 1) {
    return "No";
  } else if (val < 50) {
    return "Low";
  } else {
    return "High";
  }
}

// Rules

defineRule("motion-detection-trigger", {
  whenChanged: sensors,
  then: function(value, device, cell) {
    if (value == 0) { return; }
    
	for (var name in detectors) {
      var detector = detectors[name];
      
      if (cell == detector.sensor) {
        
        if (!(cell in last_motion)) {
          dev["pir"][detector.pir] = 1;
          update_any_pir();
        }
        
        var date = new Date();
        last_motion[cell] = date.getTime();
      }
    }
  }
});

defineRule("motion-detection-cron", {
  when: cron("@every 1m"),
  then: function(val) {
    var date = new Date();
    var ts = date.getTime();
    
    for (var name in detectors) {
      var detector = detectors[name];
      
      // reseting pir device to zero
      if (pirs_to_reset > 0) {
        debug("Reseting PIRs "+pirs_to_reset);
        dev["pir"][detector.pir] = last_motion[detector.sensor] == undefined ? 0 : 1;
        pirs_to_reset--;
        update_any_pir();
      }

      // updating PIR device
      if (ts - last_motion[detector.sensor] > detector.timeout * 60 * 1000) {
        dev["pir"][detector.pir] = 0;
        update_any_pir();
        delete last_motion[detector.sensor];
      }
    }
    
    // updating time of day
    var tod = time_of_day();
    if (dev["pir_params"]["Time of Day"] != tod) {
      dev["pir_params"]["Time of Day"] = tod;
    }
    
  }
});

defineRule("light-in-living-update", {
  whenChanged: "sensor_living/Illuminance",
  then: function(val) {

    var text_value = light_in_living(val);
    if (dev["pir_params"]["Light in Living"] != text_value) {
      dev["pir_params"]["Light in Living"] = text_value;
    }
  }
});
