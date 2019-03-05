 
defineVirtualDevice("sensors-bridge", {
  title: "Sensors Bridge",
  cells: {
    "Living Room": {
      type: "temperature",
      value: 0
    }
  }
});

var last = {};

defineRule("temperature-bridging", {
  whenChanged: "wb-w1/28-041702dcb3ff",
  then: function(value, device, cell) {
    
    if (last[cell] == undefined || Math.abs(last[cell] - value) < 20) {
      last[cell] = value;
      
      if (cell == "28-041702dcb3ff") {
      	dev["sensors-bridge/Living Room"] = value;
      }

    } else {
      log("Ignoring W1 sensor value ({} = {})", cell, value);
    }
    
  }    
});
