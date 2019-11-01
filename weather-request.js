
defineVirtualDevice("weather", {
  title: "Weather",
  cells: {
    Conditions: {
      type: "text",
      value: ""
    },
    Temperature: {
      type: "temperature",
      value: 0
    },
    "Temperature Min": {
      type: "temperature",
      value: 0
    },
    "Temperature Max": {
      type: "temperature",
      value: 0
    },
    Humidity: {
      type: "rel_humidity",
      value: 0
    },
    Pressure: {
      type: "atmospheric_pressure",
      value: 0
    },
    Wind: {
      type: "wind_speed",
      value: 0
    },
    Refreshed: {
      type: "text",
      value: "Never"
    }
  }
});

defineRule("weather-refresh", {
  when: cron("0 */15 * * *"),
  then: function() {
    runShellCommand("curl \"http://api.openweathermap.org/data/2.5/weather?q=Kiev,UA&appid=e3f3f0e149c736248b95119d5cb66a61&units=metric\"", {
      captureOutput: true,
      exitCallback: function (code, output) {
        if (code != 0) {
          log.error("Error fetching weather: "+output);
          return;
        }
        var json = JSON.parse(output);
        dev["weather/Conditions"] = json["weather"][0]["main"];
        dev["weather/Temperature"] = json["main"]["temp"];
        dev["weather/Temperature Min"] = json["main"]["temp_min"];
        dev["weather/Temperature Max"] = json["main"]["temp_max"];
        dev["weather/Humidity"] = json["main"]["humidity"];
        dev["weather/Pressure"] = json["main"]["pressure"]; // hPa
        dev["weather/Wind"] = json["wind"]["speed"];
        var d = new Date(json["dt"] * 1000);
        dev["weather/Refreshed"] = d.getMonth() + "/" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes();
      }
    });
  }
});
