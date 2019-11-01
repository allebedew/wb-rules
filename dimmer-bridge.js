
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
    },
    BathroomLow: {
      type: "range",
      max: 100,
      value: 0
    },
    Stairs: {
      type: "range",
      max: 100,
      value: 0
    }
  }
});

var ignore_chan_until = {};
var ignore_bridge_until = {};
var ch = {};

function setup_dimmer(name, mqtt_id, control_channels) {
  var lowcase_name = name.toLowerCase();
  debug(typeof control_channels);
  ch[lowcase_name] = control_channels;

  defineRule("dimmer-bridge-" + lowcase_name, {
	whenChanged: "dimmer-bridge/" + name,
	then: function(value) {
      
      var date = new Date();
      if (date.getTime() < ignore_bridge_until[name]) {
        debug("Bridge changed, not updating channels");
        return;
      }
      
	  var date = new Date()
      ignore_chan_until[name] = date.getTime() + 500;

      var chanValue = Math.round((value * 255) / 100);
	  ch[lowcase_name].forEach(function(ch) {
        dev[mqtt_id]["Channel " + ch] = chanValue;
      });
	}
  });

  
  defineRule("dimmer-bridge-" + lowcase_name + "-back", {
    whenChanged: control_channels.map(function(ch) { return mqtt_id + "/Channel " + ch }),
    then: function(value, device, cell) {
      
      var date = new Date();
      if (date.getTime() < ignore_chan_until[name]) {
        debug("Channel changed, not updating bridge");
        return;
      }
      
      var date = new Date()
      ignore_bridge_until[name] = date.getTime() + 500;
      
      var values = ch[lowcase_name].map(function(ch) { 
        return parseInt(dev[mqtt_id + "/Channel " + ch]);
	  });
      var max = Math.max.apply(Math, values);
      var cellValue = Math.round(max / 255 * 100);
      debug("Channel changed to "+value+", updating bridge to "+cellValue);
      
      dev["dimmer-bridge"][name] = cellValue;
    }
  });
}

setup_dimmer("Kitchen", "fl1_ktch_dim", [1, 2, 3]);
setup_dimmer("Shower", "fl1_bath_dim", [3]);
setup_dimmer("Stairs", "stairs_dimmer", [4]);
setup_dimmer("Bathroom", "fl2_bath_dim", [3]);
setup_dimmer("BathroomLow", "fl2_bath_dim", [4]);
