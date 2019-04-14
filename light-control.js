
var relays = [
  "fl1_rel1/K1",			// living sockets
  "fl1_rel1/K2",			// hall fl1
  "fl1_rel1/K4",			// living ceiling light 1
  "fl1_rel1/K5",			// living ceiling light 2
  
  "fl1_rel2/K1", 			// living dots
  "fl1_rel2/K2",			// balcony
  "fl1_rel2/K3", 			// boiler room
  "fl1_rel2/K4",			// stairs
  "fl1_rel2/K5",			// bathroom fl1
  
  "fl2_rel1/K1",			// hall fl2
  "fl2_rel1/K2",			// bathroom fl2
  "fl2_rel1/K3",			// bedroom sockets
  "fl2_rel1/K4",			// bedroom dots
  "fl2_rel1/K5",			// bedroom bed
  "fl2_rel1/K6",			// badroom led

  "fl2_rel2/K1",			// kid socket + bed
  "fl2_rel2/K2",			// kid dots + ceil
  "fl2_rel2/K3",			// kid led
  "fl2_rel2/K4",			// cabinet ceil
  "fl2_rel2/K5",			// cabinet led
  "fl2_rel2/K6",			// cabinet sockets
  
  "fl1_ktch_rel/Relay 1",	// kitchen ceiling
  "fl1_ktch_rel/Relay 2"	// kitchen exhaust light
];

var dimmers = [
  "dimmer-bridge/Kitchen",
  "dimmer-bridge/Shower",
  "dimmer-bridge/Bathroom"
];

function allLightOff() {
  log.info("Switching all light off");
  
  var on = 0;
  
  relays.forEach(function(relay) {
    if (dev[relay] != 0) {
      dev[relay] = 0;
	  on++;
  	}
  });
  
  dimmers.forEach(function(dimmer) {
    if (dev[dimmer] > 0) {
	  dev[dimmer] = 0;
	  on++;
    }
  });
  
  if (on > 0) {
    dev["beeper/Beep"] = String(on);
  }
}

// Device

defineVirtualDevice("light_control", {
  title: "Light Control",
  cells: {
    "All Off": {
      type: "pushbutton",
      value: 1
    }
  }
});

// Rules

var timer;
  
defineRule("all_off_button", {
  whenChanged: "wb-gpio/EXT1_DR7",
  then: function(val) {
    if (val == 1) {
      timer = setTimeout(function() {
        allLightOff();
        timer = null;
      }, 2000);  
    } else {
      if (timer) {
        clearTimeout(timer);
      }
    }
  }
});

defineRule("all_off", {
  whenChanged: "light_control/All Off",
  then: allLightOff
});

// Lighht Sync

defineRule("kitchen-light-sync", {
  whenChanged: "fl1_ktch_rel/Relay 1",
  then: function(val) {
	dev["fl1_ktch_rel/Relay 2"] = val;
  }
});
