
// Device

// Make beep: dev["beeper/Beep"] = "<count> <vol> <tone>" 

defineVirtualDevice("beeper", {
  title: "Beeper",
  cells: {
    Beep: {
      type: "pushbutton"
    },
    Alarm: {
      type: "switch",
      value: false
    }
  }
});

defineRule("make-beep", {
  whenChanged: "beeper/Beep",
  then: function(val) {
    var p = String(val).split(" ", 3);
	beep((!isNaN(p) && p.length >= 1) ? Number(p[0]) : 1,
         (!isNaN(p) && p.length >= 2) ? Number(p[1]) : 15,
         (!isNaN(p) && p.length >= 3) ? Number(p[2]) : 0);
  }
});

defineRule("alarm", {
  whenChanged: "beeper/Alarm",
  then: function(value) {
    if (value) {
      alarm_on();
    }
  }
});

// Control

// params: count [1..n] volume [0..100] tone [0..10]
function beep(count, volume, tone) {
  var freq = tone * 500 + 3000;
  var period = parseInt(1.0 / freq * 1E9);
  var duty_cycle = parseInt(volume * 1.0 / 100 * period * 0.5);
  runShellCommand("/root/beep.sh "+period+" "+duty_cycle+" "+count);
};

var alarm_timer = null;

// turns off automatically when dev.beeper.Alarm == 0
function alarm_on() {
  if (alarm_timer) return;
  var alarm_beep = function() {
    beep(5, 50, 3);
  }
  alarm_beep();
  alarm_timer = setInterval(function() {
    if (dev.beeper.Alarm) {
      alarm_beep();
    } else {
      clearInterval(alarm_timer);
      alarm_timer = null;
    }
  }, 2000);
}
