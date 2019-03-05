
// Setup

var detectors = {};

detectors["hall"] = {
  sensor: "EXT1_DR3",
  timeout: 3,
  on_enter: function() { 
    log("HALL -> ENTER {}", new Date());
  },
  on_leave: function() {
    log("HALL -> LEAVE {}", new Date());    
  }
};

detectors["shower"] = {
  sensor: "EXT1_DR1",
  timeout: 3,
  on_enter: function() { 
    log("SHOWER -> ENTER {}", new Date());
  },
  on_leave: function() {
    log("SHOWER -> LEAVE {}", new Date());    
  }
};

detectors["living"] = {
  sensor: "EXT1_DR4",
  timeout: 3,
  on_enter: function() { 
    log("LIVING -> ENTER {}", new Date());
  },
  on_leave: function() {
    log("LIVING -> LEAVE {}", new Date());    
  }
};

log(JSON.stringify(detectors));

// Rules

var last_motion = {}; // key = cell

defineRule("motion-detection-trigger", {
  whenChanged: "wb-gpio/+",
  then: function(value, device, cell) {
    if (value == 0) { return; }
    
    log("{} triggered");
    
	for (var name in detectors) {
      var detector = detectors[name];
      
      if (cell == detecor.sensor) {
        
        if (!(cell in last_motion)) {
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
    
    log("1 MIN CRON {}", ts);
    
    for (var name in detectors) {
      var detector = detectors[name];
      if (ts - last_motion[detector.sensor] > detector.timeout * 60 * 1000) {
        detector.on_leave();
        delete last_motion[detector.sensor];
      }
    }
    
    // Lagacy
    
    var now = new Date();
    if (now - shower_last_motion > shower_timeout) {
      if (dev[shower_dimmer] > 0) {
        dev[shower_dimmer] = 0;
      } 
    } 
    if (now - bathroom_last_motion > bathroom_timeout) {
      if (dev[bathroom_dimmer] > 0) {
        dev[bathroom_dimmer] = 0;
      } 
    } 
    if (now - boiler_last_motion > boiler_timeout) {
      if (dev[boiler_relay] == 1) {
        dev[boiler_relay] = 0;
      } 
    }
  }
});

function isNight() {
  var now = new Date();
  var evening = new Date(now);
  evening.setHours(23);
  evening.setMinutes(0);
  var sunrise = new Date(now);
  sunrise.setHours(6);
  sunrise.setMinutes(0);

  return (now < sunrise || now > evening);
}

// Hall

var hall_sensor = "wb-gpio/EXT1_DR3";
var hall_last_motion = new Date();

defineRule("motion-on-hall", {
  whenChanged: hall_sensor,
  then: function(val) {
    if (val == 0) {
      return;
    }
    
    var now = new Date();
    if (now - hall_last_motion > 10 * 60 * 1000) {
      runShellCommand("/usr/local/bin/telegram-send 'Motion in Hall detected'");
    }

    hall_last_motion = new Date();
  }
});

// Boiler Room

var boiler_sensor = "wb-gpio/EXT1_DR2";
var boiler_relay = "fl1_rel2/K3";
var boiler_timeout = 1 * 60 * 1000;
var boiler_last_motion = new Date();

defineRule("motion-on-boiler", {
  whenChanged: boiler_sensor,
  then: function(val) {
    if (val == 0) {
      return;
    }
        
    boiler_last_motion = new Date();
    
    if (dev[boiler_relay] == 0) {
      dev["beeper/Beep"] = 1;
      dev[boiler_relay] = 1;
    }
  }
});

// Shower

var shower_sensor = "wb-gpio/EXT1_DR1";
var shower_dimmer = "dimmer-bridge/Shower";
var shower_timeout = 10 * 60 * 1000;
var shower_last_motion = new Date();

defineRule("motion-on-shower", {
  whenChanged: shower_sensor,
  then: function(val) {
    if (val == 0) {
      return;
    }    
    shower_last_motion = new Date();
    
    if (dev[shower_dimmer] == 0) {
      dev["beeper/Beep"] = 1;
      
      if (isNight()) {
        dev[shower_dimmer] = 30;
      } else {
        dev[shower_dimmer] = 100;
      }
    }
  }
});

// Bathroom

var bathroom_sensor = "wb-gpio/EXT1_DR9";
var bathroom_dimmer = "dimmer-bridge/Bathroom";
var bathroom_timeout = 10 * 60 * 1000;
var bathroom_last_motion = new Date();

defineRule("motion-on-bathroom", {
  whenChanged: bathroom_sensor,
  then: function(val) {
    if (val == 0) {
      return;
    }    
    bathroom_last_motion = new Date();
    
    if (dev[bathroom_dimmer] == 0) {
      dev["beeper/Beep"] = 1;
      
      if (isNight()) {
        dev[bathroom_dimmer] = 10;
      } else {
        dev[bathroom_dimmer] = 100;
      }
    }
  }
});
