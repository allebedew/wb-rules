// Device

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

defineRule("beep_onece", {
 	whenChanged: "beeper/Beep",
  	then: beep_onece
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

var alarm_timer = null;

function beep_onece() {
  	if (alarm_timer) return;
  	beeper_on(3000, 2);
  	setTimeout(beeper_off, 100);
}; 

function alarm_on() {
	if (alarm_timer) return;
  	var alarm_beep = function() {
      	beeper_on(400, 5);
        setTimeout(beeper_off, 500);
    }
    alarm_beep();
 	alarm_timer = setInterval(function() {
		if (dev.beeper.Alarm) {
        	alarm_beep();
        } else {
            clearInterval(alarm_timer);
            alarm_timer = null;
            beeper_off();
        }
    }, 2000);
}

// Beeper

function beeper_on(freq, vol) {
	var period = parseInt(1.0 / freq * 1E9);
    var duty_cycle = parseInt(vol * 1.0  / 100 * period * 0.5);
    runShellCommand("echo " + period + " > /sys/class/pwm/pwmchip0/pwm0/period");
    runShellCommand("echo " + duty_cycle + " > /sys/class/pwm/pwmchip0/pwm0/duty_cycle");
    runShellCommand("echo 1 > /sys/class/pwm/pwmchip0/pwm0/enable");
}

function beeper_off() {
	runShellCommand("echo 0 > /sys/class/pwm/pwmchip0/pwm0/enable");
}