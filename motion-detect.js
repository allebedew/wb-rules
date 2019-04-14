
// Setup

var detectors = {};

detectors["hall"] = {
  sensor: "EXT1_DR3",
  timeout: 5,
  on_enter: function() {
    log("Entered to hall. tiem={} TOD={}", new Date(), timeOfDay());
    if (timeOfDay() == 2 && 
        dev["fl1_rel1/K1"] == 0 && // floorlamp
        dev["fl1_rel1/K2"] == 0 && // mini
        dev["fl1_rel1/K4"] == 0 && // ceil 1
        dev["fl1_rel1/K5"] == 0) { // ceil 2
	    	dev["fl1_rel2/K1"] = 1;
    }
  },
  on_leave: function() {
    dev["fl1_rel2/K1"] = 0;
  }
};

detectors["living"] = {
  sensor: "EXT1_DR4",
  timeout: 30,
  on_enter: function() {
  	if (timeOfDay() == 2) {
      if (dev["fl1_rel1/K1"] == 0 && // floorlamp
          dev["fl1_rel1/K2"] == 0 && // mini
          dev["fl1_rel1/K4"] == 0 && // ceil 1
          dev["fl1_rel1/K5"] == 0) { // ceil 2
		      dev["fl1_rel1/K1"] = 1;
      }
    }
  },
  on_leave: function() {
    dev["fl1_rel1/K1"] = 0;
	dev["fl1_rel1/K2"] = 0;
    dev["fl1_rel1/K4"] = 0;
    dev["fl1_rel1/K5"] = 0;
  }
};

detectors["boiler"] = {
  sensor: "EXT1_DR2",
  timeout: 5,
  on_enter: function() { 
    dev["fl1_rel2/K3"] = 1;
  },
  on_leave: function() {
    dev["fl1_rel2/K3"] = 0;
  }
};

detectors["shower"] = {
  sensor: "EXT1_DR1",
  timeout: 15,
  on_enter: function() {
    if (dev["dimmer-bridge/Shower"] == 0) {
      if (timeOfDay() <= 2) {
	    dev["dimmer-bridge/Shower"] = 100;
        if (timeOfDay() == 1) {
          dev["fl1_rel2/K5"] = 1;
        }
      } else {
        dev["dimmer-bridge/Shower"] = 10;
      }
    }
  },
  on_leave: function() {
    dev["dimmer-bridge/Shower"] = 0;
    dev["fl1_rel2/K5"] = 0;
  }
};
/*
detectors["upper_hall"] = {
  sensor: "EXT1_DR8",
  timeout: 5,
  on_enter: function() {
    if (timeOfDay() == 2) {
	    dev["fl2_rel1/K1"] = 1;
    }
  },
  on_leave: function() {
    dev["fl2_rel1/K1"] = 0;
  }
};
*/
detectors["bathroom"] = {
  sensor: "EXT1_DR9",
  timeout: 15,
  on_enter: function() { 
    if (dev["dimmer-bridge/Bathroom"] == 0) {
      if (timeOfDay() < 3) {
        dev["dimmer-bridge/Bathroom"] = 100;
      } else {
        dev["dimmer-bridge/Bathroom"] = 10;
      }
    }
  },
  on_leave: function() {
    dev["dimmer-bridge/Bathroom"] = 0;
    dev["fl2_rel1//K2"] = 0;
  }
};
/*
detectors["kids"] = {
  sensor: "EXT1_DR10",
  timeout: 30,
  on_enter: function() { 
    if (dev["fl2_rel2/K1"] == 0 && 
        dev["fl2_rel2/K2"] == 0 && 
        dev["fl2_rel2/K3"] == 0 &&
        timeOfDay() == 2) {
	  dev["fl2_rel2/K3"] = 1;
    }
  },
  on_leave: function() {
	dev["fl2_rel2/K1"] = 0;
    dev["fl2_rel2/K2"] = 0;
    dev["fl2_rel2/K3"] = 0;
  }
};
*/
detectors["bedroom"] = {
  sensor: "EXT1_DR11",
  timeout: 30,
  on_enter: function() { 
    if (dev["fl2_rel1/K3"] == 0 && 
        dev["fl2_rel1/K4"] == 0 && // dots
        dev["fl2_rel1/K5"] == 0 && 
        dev["fl2_rel1/K6"] == 0 && // led
        timeOfDay() == 2) {
	  dev["fl2_rel1/K6"] = 1;
    }
  },
  on_leave: function() {
	dev["fl2_rel1/K3"] = 0;
    dev["fl2_rel1/K4"] = 0;
    dev["fl2_rel1/K5"] = 0;
    dev["fl2_rel1/K6"] = 0;
  }
};

detectors["cabinet"] = {
  sensor: "EXT1_DR12",
  timeout: 30,
  on_enter: function() { 
    if (dev["fl2_rel2/K4"] == 0 && 
        dev["fl2_rel2/K5"] == 0 && // led
        dev["fl2_rel2/K6"] == 0 && // floorlamp
        timeOfDay() == 2) {
	  dev["fl2_rel2/K5"] = 1;
    }
  },
  on_leave: function() {
	dev["fl2_rel2/K4"] = 0;
    dev["fl2_rel2/K5"] = 0;
    dev["fl2_rel2/K6"] = 0;
  }
};

// Rules

var last_motion = {}; // key = cell
var sensors = [];
for (var name in detectors) {
  sensors.push("wb-gpio/" + detectors[name].sensor);
}

defineRule("motion-detection-trigger", {
  whenChanged: sensors,
  then: function(value, device, cell) {
    if (value == 0) { return; }
	for (var name in detectors) {
      var detector = detectors[name];
      if (cell == detector.sensor) {
        if (!(cell in last_motion)) {
          log.debug("Entered {}", name);
          detector.on_enter();
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
      if (ts - last_motion[detector.sensor] > detector.timeout * 60 * 1000) {
        log.debug("Left {}", name);
        detector.on_leave();
        delete last_motion[detector.sensor];
      }
    }
  }
});

// 1 - day (bright), 2 - evening (dark), 3 - late night
function timeOfDay() {
  var date = new Date();
  var day_start = new Date(date);
  day_start.setHours(6);
  day_start.setMinutes(0);
  var evening_start = new Date(date);
  evening_start.setHours(19);
  evening_start.setMinutes(0);
  var night_start = new Date(date);
  night_start.setHours(23);
  night_start.setMinutes(00);
  
  if (date < day_start) {
    return 3;
  } else if (date < evening_start) {
    return 1;
  } else if (date < night_start) {
    return 2;
  } else {
    return 3;
  }
}
