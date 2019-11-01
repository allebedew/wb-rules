
defineVirtualDevice("ir", {
  title: "IR",
  cells: {
    "AC": {
      type: "switch",
      value: false
    },
  }
});

defineRule("ir-switch", {
  whenChanged: "ir/AC",
  then: function(val) {
    if (val == 1) {
      dev["sensor_living/Play from ROM1"] = 1;
    } else {
      dev["sensor_living/Play from ROM2"] = 1;
    }
  }
});
