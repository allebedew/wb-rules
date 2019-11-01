
// Controls water valve
// Ignores state setter in already in target state

function makeCurtainsControl(name, full_open_duration, open_relay, close_relay, button) {
  var lowcase_name = name.toLowerCase();
  var device_name = "curtains_" + lowcase_name;
  
  log.debug("Creating curtais control {}", name);
  
  // Device
  
  defineVirtualDevice(device_name, {
    title: "Curtains " + name,
    cells: {
      Position: { // 0-closed 100-opened
        type: "range",
        max: 100,
        value: 0,
        readonly: true
      },
      TargetPosition: {
        type: "range",
        max: 100,
        value: 0
      },
      State: { // -1 closing, 1 - opening, 0 - stopped
        type: "value",
        value: 0,
        readonly: true
      }
    }
  });
  
  // Rules
  
  var completion_timer;
  var update_timer;
  
  var started_time;
  var started_target;
  var started_position;
  
  var stop_flag;

  defineRule("curtains_" + lowcase_name + "_target_change", {
    whenChanged: device_name + "/TargetPosition",
    then: function(value) {
      value = Math.min(100, Math.max(0, value));
      var working = null;
      var position = dev[device_name + "/Position"];
      if (started_time) { // means working now
        working = new Date() - started_time;
        if (working < full_open_duration) {
	        var started_duration = (Math.abs(started_target - started_position) / 100) * full_open_duration;
    	    position = started_position + ((started_target - started_position) * (working / started_duration))
        }
      }
      var diff = value - position;
      log.debug("Curtains {} target = {}, working = {}s, pos = {}, diff = {}", lowcase_name, value, working, position, diff);
      if (diff == 0) { return; }

      // cancel current action
      if (completion_timer) {
          clearTimeout(completion_timer);
          completion_timer = null;
      }
      dev[open_relay] = false;
      dev[close_relay] = false;
      dev[device_name + "/State"] = 0;
      dev[device_name + "/Position"] = Math.round(position);
      
      if (started_time) {
        for (i=0;i<100000;i++) {}
      }

      // start new action
      started_time = new Date();
      started_position = position;
      started_target = value;
      var duration = (Math.abs(diff) / 100.0) * full_open_duration;
      var real_duration = (value == 0 || value == 100) ? duration + 10 : duration;
      log.debug("Duration = {}", duration);
      
      if (update_timer) {
        clearInterval(update_timer);
        update_timer = null;
      }
      update_timer = setInterval(function() {  
		var completion = Math.min(1, (new Date() - started_time) / duration);
        var position_update = started_position + (diff * completion);
        dev[device_name + "/Position"] = Math.round(position_update);
      }, 500);
      
      if (diff > 0) {
        dev[open_relay] = true;
        dev[device_name + "/State"] = 1;
      } else {
        dev[close_relay] = true;
        dev[device_name + "/State"] = -1;
      }
     
      // action finished
      completion_timer = setTimeout(function() {
        log.debug("Curtains {} finished", lowcase_name);
        
        clearInterval(update_timer);
        update_timer = null;
        
        dev[open_relay] = false;
        dev[close_relay] = false;
        dev[device_name + "/State"] = 0;
        dev[device_name + "/Position"] = value;
        completion_timer = null;
        started_time = null;
        started_position = null;
        started_target = null;

      }, real_duration);

    }
  });
  
  defineRule("curtains_" + lowcase_name + "_button", {
    whenChanged: button,
    then: function(value) {
      if (value != true) return;
      log.debug("Button pressed "+value+" "+device_name);

      if (dev[device_name + "/State"] == 0) {
        if (dev[device_name + "/Position"] == 100) {
          dev[device_name + "/TargetPosition"] = 0;
        } else {
          dev[device_name + "/TargetPosition"] = 100;
        }
      } else {
        stop_flag = true;
        dev[device_name + "/TargetPosition"] = dev[device_name + "/Position"];
      }
    }
  });
}

// debug with light
// makeCurtainsControl("Kidsroom", 35000, "fl2_rel2/K1", "fl2_rel2/K2");

makeCurtainsControl("Kidsroom", 35000, "fl2_rel3/K7", "fl2_rel3/K8", "wb-gpio/EXT1_DR13");
makeCurtainsControl("Bedroom", 13000, "fl2_rel3/K11", "fl2_rel3/K12", "wb-gpio/EXT1_DR14");
makeCurtainsControl("Livingroom1", 36000, "fl1_rel3/K10", "fl1_rel3/K9", "wb-gpio/W2_IN");
makeCurtainsControl("Livingroom2", 8000, "fl1_rel3/K7", "fl1_rel3/K8", "wb-gpio/W1_IN");
