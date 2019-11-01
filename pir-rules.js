 
// Updates lights using PIRs

defineRule("light-stairs", {
  whenChanged: ["pir/Any", 
                "pir_params/Light in Living", 
                //"sensor_living/Illuminance",
                "pir_params/Time of Day", 
                "pir_params/Stairs Disabled"],
  then: function() {
    var dim = 0;
    var tod = dev["pir_params/Time of Day"];
    var light = dev["pir_params/Light in Living"];
//      var i = dev["sensor_living/Illuminance"];
    
    if (dev["pir/Any"] == 1 && dev["pir_params/Stairs Disabled"] == 0 && light != "High") {
      if (light == "No" || tod == "Night") {
        dim = 5;
      } else {
        dim = 100;
      }
    }
    
    if (dev["dimmer-bridge/Stairs"] != dim) {
      dev["dimmer-bridge/Stairs"] = dim;
    }
  }
});

defineRule("light-hall", {
  whenChanged: ["pir/Hall"],
  then: function(value) {
    if (value) {
      var light = dev["pir_params/Light in Living"];    
      if (dev["pir/Living"] == 0 && light != "High") {
        dev["fl1_rel2/K1"] = 1;
      } 
    } else {
      dev["fl1_rel2/K1"] = 0;
    }
  }
});

defineRule("light-upper-hall", {
  whenChanged: ["pir/Upper Hall"],
  then: function(value) {
    if (value) {
      var light = dev["pir_params/Light in Living"];    
      if (light != "High") {
        dev["fl2_rel2/K6"] = 1;
      } 
    } else {
      dev["fl3_rel2/K6"] = 0;
      dev["fl3_rel2/K6"] = 0;
      dev["fl3_rel2/K6"] = 0;
    }
  }
});

defineRule("light-cabinet", {
  whenChanged: ["pir/Cabinet"],
  then: function(value) {
    if (value) {
      var light = dev["pir_params/Light in Living"];    
      if (light != "High") {
        dev["fl2_rel2/K6"] = 1;
      } 
      dev["fl2_rel3/K4"] = 1;
    } else {
      dev["fl2_rel2/K4"] = 0; // ceil
      dev["fl2_rel2/K5"] = 0; // led
      dev["fl2_rel2/K6"] = 0; // lamp
      dev["fl2_rel3/K4"] = 0; // exhaust
    }
  }
});

defineRule("light-living", {
  whenChanged: "pir/Living",
  then: function(val) {
    if (val) {
      var light = dev["pir_params/Light in Living"];
      if (light == "No") {
        dev["dimmer-bridge/Kitchen"] = 10;
      } else if (light == "Low") {
        dev["dimmer-bridge/Kitchen"] = 100;
      }
    } else {
      dev["dimmer-bridge/Kitchen"] = 0;
      dev["fl1_ktch_rel/Relay 1"] = 0;
      dev["fl1_rel1/K1"] = 0; // lamp
      dev["fl1_rel1/K2"] = 0; // mini
      dev["fl1_rel1/K4"] = 0; // ceil
      dev["fl1_rel1/K5"] = 0; // table
    }
  }
});

defineRule("light-boiler", {
  whenChanged: "pir/Boiler",
  then: function(val) {
    if (val) {
      dev["fl1_rel2/K3"] = 1;
    } else {
      dev["fl1_rel2/K3"] = 0;
    }
  }
});

defineRule("light-shower", {
  whenChanged: "pir/Shower",
  then: function(val) {
    if (val) {
      if (dev["dimmer-bridge/Shower"] == 0 &&
          dev["fl1_rel2/K5"] == 0) {
        
        var light = dev["pir_params/Light in Living"];
        if (light == "No") {
          dev["dimmer-bridge/Shower"] = 20;
        } else if (light == "Low") {
          dev["dimmer-bridge/Shower"] = 100;
        } else {
          dev["fl1_rel2/K5"] = 1;
          dev["dimmer-bridge/Shower"] = 100;
        }
      }
    } else {
      
	  dev["dimmer-bridge/Shower"] = 0;
  	  dev["fl1_rel2/K5"] = 0;
    }
  }
});

defineRule("light-bathroom", {
  whenChanged: "pir/Bathroom",
  then: function(val) {
    if (val) {
      if (dev["dimmer-bridge/Bathroom"] == 0 && 
        dev["dimmer-bridge/BathroomLow"] == 0 && 
        dev["fl2_rel1/K2"] == 0) {
        
        var light = dev["pir_params/Light in Living"];
        if (light == "High") {
          dev["dimmer-bridge/Bathroom"] = 100;
          dev["dimmer-bridge/BathroomLow"] = 100;
        } else if (light == "Low") {  
          dev["dimmer-bridge/Bathroom"] = 50;
          dev["dimmer-bridge/BathroomLow"] = 50;
        } else {
          dev["dimmer-bridge/Bathroom"] = 5;
          dev["dimmer-bridge/BathroomLow"] = 20;
        }
      }
    } else {
      dev["dimmer-bridge/Bathroom"] = 0;
      dev["dimmer-bridge/BathroomLow"] = 0;
      dev["fl2_rel1/K2"] = 0;
    }
  }
});

/* 
Kids
if (dev["fl2_rel2/K1"] == 0 && 
dev["fl2_rel2/K2"] == 0 && 
dev["fl2_rel2/K3"] == 0 &&

Bedroom
if (dev["fl2_rel1/K3"] == 0 && 
dev["fl2_rel1/K4"] == 0 && // dots
dev["fl2_rel1/K5"] == 0 && 
dev["fl2_rel1/K6"] == 0 // led

Cab
if (dev["fl2_rel2/K4"] == 0 && 
dev["fl2_rel2/K5"] == 0 && // led
dev["fl2_rel2/K6"] == 0  // floorlamp
*/
