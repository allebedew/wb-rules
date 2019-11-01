
defineVirtualDevice("system2", {
  title: "System2",
  cells: {
    "On Battery": {
      type: "switch",
      value: false,
      readonly: true
    }
  }
});

defineRule("source-power-check", {
  whenChanged: "wb-adc/Vin",
  then: function(val) {
    if (val < 11 && dev["system2"]["On Battery"] == false) {
      dev["system2"]["On Battery"] = true;
      var msg = "Switched to battery power. Vin = " + val + " Vnet=" + dev["energy_meter"]["Urms"];
      log(msg);
	  runShellCommand("/usr/local/bin/telegram-send '" + msg + "'");
    } else if (val > 11 && dev["system2"]["On Battery"] == true) {
      dev["system2"]["On Battery"] = false;
  	  var msg = "Switched to normal power. Vin = " + val + " Vnet=" + dev["energy_meter"]["Urms"];
      log(msg);
      runShellCommand("/usr/local/bin/telegram-send '" + msg + "'");
    }
  }
});
