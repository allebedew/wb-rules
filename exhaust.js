
var hum_hist = [];

var exhaust_on_time = null;
var exhaust_timeout = 20 * 60 * 1000;

var hum_sensor = "towel_heater_fl1/Humidity";
var towel_heat = "towel_heater_fl1/Heat";
var exhaust = "fl1_rel2/K6";

defineRule("shower-hum", {
  when: cron("0 * * * *"), // every minute
  then: function() {
    if (hum_hist.length >= 5) {
      hum_hist.shift();
    }
    hum_hist.push(dev[hum_sensor]);
    
    var min = Math.min.apply(null, hum_hist),
	    max = Math.max.apply(null, hum_hist),
        spread = max - min;
    
  	if (spread >= 10) {
      log("Somebody in shower! Spread="+spread);      
      
      dev[towel_heat] = 1;
      dev[exhaust] = 1;
    }
    
    var now = new Date()
    if (exhaust_on_time && now - exhaust_on_time > exhaust_timeout) {
      log("Turning off exhaust by timeout");
      dev[exhaust] = 0;
    }
  }
});

defineRule("shower-exhaust", {
  whenChanged: exhaust,
  then: function(val) {
    if (val == 1) {
      log("Exhaust on");
      exhaust_on_time = new Date();
    } else {
      log("Exhaust off");
      exhaust_on_time = null;
    }
  }
});
