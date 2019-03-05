
var last_time;

defineRule("dorbell", {
  whenChanged: ["wb-gpio/EXT1_DR14", "utils/Dorbell"],
  then: function(value) {
    if (value == 0) {
      return;
    }
    log("Dorbell button pressed");
      
    var now = new Date();  
    if (last_time == undefined || now - last_time > 5000) {

      last_time = new Date();

      dev["fl1_rel3/K16"] = 1;
      setTimeout(function() {
        dev["fl1_rel3/K16"] = 0;
      }, 400);

      runShellCommand("/usr/local/bin/telegram-send 'Dorbell!'");
    }
  }  
});
