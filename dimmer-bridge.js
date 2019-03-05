
defineVirtualDevice("dimmer-bridge", {
  title: "Dimmer Bridge",
  cells: {
    Kitchen: {
      type: "range",
      max: 100,
      value: 0
    },
    Shower: {
      type: "range",
      max: 100,
      value: 0
    },
    Bathroom: {
      type: "range",
      max: 100,
      value: 0
    }
  }
});

var ignore_chan_until = {};
var ignore_bridge_until = {};

function setupDimmer(name, mqtt_id) {
  var lowcase_name = name.toLowerCase();

  defineRule("dimmer-bridge-" + lowcase_name, {
	whenChanged: "dimmer-bridge/" + name,
	then: function(value) {

      var date = new Date();
      if (date.getTime() < ignore_bridge_until[name]) {
        log("Bridge changed, not updating channels");
        return;
      }
      
	  var date = new Date()
      ignore_chan_until[name] = date.getTime() + 500;

      var chanValue = Math.round((value * 255) / 100);
      dev[mqtt_id]["Channel 1"] = chanValue;
      dev[mqtt_id]["Channel 2"] = chanValue;
      dev[mqtt_id]["Channel 3"] = chanValue;
	}
  });

  defineRule("dimmer-bridge-" + lowcase_name + "-back", {
    whenChanged: [mqtt_id + "/Channel 1", 
                  mqtt_id + "/Channel 2", 
                  mqtt_id + "/Channel 3"],
    then: function(value, device, cell) {
      
      var date = new Date();
      if (date.getTime() < ignore_chan_until[name]) {
        log("Channel changed, not updating bridge");
        return;
      }
      
      var date = new Date()
      ignore_bridge_until[name] = date.getTime() + 500;
      
      var cellValue = Math.round(Math.max(dev[mqtt_id + "/Channel 1"],
                                          dev[mqtt_id + "/Channel 2"],
	    		                          dev[mqtt_id + "/Channel 3"]) / 255 * 100);
      
      dev["dimmer-bridge"][name] = cellValue;
    }
  });
}

setupDimmer("Kitchen", "fl1_ktch_dim");
setupDimmer("Shower", "fl1_bath_dim");
setupDimmer("Bathroom", "fl2_bath_dim");
