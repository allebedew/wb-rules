
log("Disabling 5Vout");
dev["wb-gpio/5V_OUT"] = 0;

defineVirtualDevice("sensors-bridge", {
  title: "Sensors Bridge",
  cells: {
    "Living Room": {
      type: "temperature",
      value: 0
    },
    "Kids Room": {
      type: "temperature",
      value: 0
    },
    "Bedroom": {
      type: "temperature",
      value: 0
    },
    "Cabinet": {
      type: "temperature",
      value: 0
    }
  }
});

defineRule("temperature-bridging", {
  whenChanged: [
    "wb-w1/28-8af48d116461", 
    "wb-w1/28-3f7882116461", 
    "wb-w1/28-020192454549", 
    "wb-w1/28-021292452ecc"],
  then: function(value, device, cell) {
    
    if (!value) {
      log("Sensor value is empty - {} on {}", value, cell);
      value = "";  
    } else if (value <= 1 || value >= 30) {
      log("Abnormal temperature sensor value - {} on {}", value, cell);
      return
    }
    
    if (cell == "28-8af48d116461") {
      dev["sensors-bridge/Living Room"] = value;
      
    } else if (cell == "28-3f7882116461") {
      dev["sensors-bridge/Kids Room"] = value;
      
    } else if (cell == "28-020192454549") {
      dev["sensors-bridge/Cabinet"] = value;
      
    } else if (cell == "28-021292452ecc") {
      dev["sensors-bridge/Bedroom"] = value;
    }
  }    
});
