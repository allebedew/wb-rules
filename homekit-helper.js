
// 0-unkn 1-excel <450 2-good >600 3-fair >800 4-infer >1000 5-poor >1500
// voc 1->0 2->65 3->220 4->660 5->2200

defineVirtualDevice("homekit", {
  title: "Homekit",
  cells: {
    "Living CO2 Quality": {
      type: "value",
      readonly: true,
      value: 0
    },
    "Living VOC Quality": {
      type: "value",
      readonly: true,
      value: 0
    },
    "Living Total Quality": {
      type: "value",
      readonly: true,
      value: 0
    },
    "CO2 Detected": {
      type: "switch",
      readonly: true,
      value: false
    }
  }
});

function update_total_q() {
  var q = Math.max(dev["homekit/Living CO2 Quality"], dev["homekit/Living VOC Quality"]);
  if (dev["homekit/Living Total Quality"] != q) {
    dev["homekit/Living Total Quality"] = q;
  }
  var co2_detected = dev["homekit/Living CO2 Quality"] >= 4;
  if (dev["homekit/CO2 Detected"] != co2_detected) {
    dev["homekit/CO2 Detected"] = co2_detected;
  }
}

function update_sensor_led() {
  var co2_q = dev["homekit/Living CO2 Quality"]
  var voc_q = dev["homekit/Living VOC Quality"]
  dev["sensor_living/Green LED"] = voc_q >= 4 ? 1 : 0
  dev["sensor_living/Red LED"] = co2_q >= 4 ? 1 : 0
}

defineRule("co2-quality", {
  whenChanged: "sensor_living/CO2",
  then: function(val) {
    var q = 0;
    if (val > 1500) {
      q = 5;
    } else if (val > 1000) {
      q = 4;
    } else if (val > 800) {
      q = 3;
    } else if (val > 600) {
      q = 2;
    } else {
      q = 1;
    }
    if (dev["homekit/Living CO2 Quality"] != q) {
      dev["homekit/Living CO2 Quality"] = q;
      update_total_q();
      update_sensor_led();
    }
  }
});

defineRule("voc-quality", {
  whenChanged: "sensor_living/Air Quality (VOC)",
  then: function(val) {
    var q = 0;
    if (val > 2200) {
      q = 5;
    } else if (val > 660) {
      q = 4;
    } else if (val > 220) {
      q = 3;
    } else if (val > 65) {
      q = 2;
    } else {
      q = 1;
    }
    if (dev["homekit/Living VOC Quality"] != q) {
      dev["homekit/Living VOC Quality"] = q;
      update_total_q();
      update_sensor_led();
    }
  }
});
