import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";

const WeatherInfo = ({ weatherData }) => {
  if (!weatherData) return null;

  const getWeatherAnimation = (weatherId) => {
    if (!weatherId) return require("../assets/animations/sunny.json");

    if (weatherId >= 200 && weatherId < 300) {
      return require("../assets/animations/storm.json");
    } else if (weatherId >= 300 && weatherId < 600) {
      return require("../assets/animations/rain.json");
    } else if (weatherId >= 600 && weatherId < 700) {
      return require("../assets/animations/snow.json");
    } else if (weatherId >= 700 && weatherId < 800) {
      return require("../assets/animations/mist.json");
    } else if (weatherId === 800) {
      return require("../assets/animations/sunny.json");
    } else {
      return require("../assets/animations/cloudy.json");
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12;

    const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;

    return `${hours}:${formattedMinutes} ${ampm}`;
  };

  return (
    <View style={styles.weatherContainer}>
      <View style={styles.animationContainer}>
        <LottieView
          source={getWeatherAnimation(weatherData.weather[0].id)}
          autoPlay
          loop
          style={styles.weatherAnimation}
        />
      </View>

      <Text style={styles.cityName}>
        {weatherData.name}, {weatherData.sys.country}
      </Text>

      <View style={styles.tempContainer}>
        <Text style={styles.temperature}>
          {Math.round(weatherData.main.temp)}°C
        </Text>
        <View style={styles.minMaxContainer}>
          <View style={styles.minMaxItem}>
            <Ionicons name="arrow-up" size={18} color="#fff" />
            <Text style={styles.minMaxText}>
              {Math.round(weatherData.main.temp_max)}°C
            </Text>
          </View>
          <View style={styles.minMaxItem}>
            <Ionicons name="arrow-down" size={18} color="#fff" />
            <Text style={styles.minMaxText}>
              {Math.round(weatherData.main.temp_min)}°C
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.weatherDescription}>
        {weatherData.weather[0].description.charAt(0).toUpperCase() +
          weatherData.weather[0].description.slice(1)}
      </Text>

      <View style={styles.detailsContainer}>
        <Text style={styles.sectionTitle}>Atmospheric Conditions</Text>
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Ionicons name="water-outline" size={22} color="#4bcffa" />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Humidity</Text>
              <Text style={styles.detailValue}>
                {weatherData.main.humidity}%
              </Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="speedometer-outline" size={22} color="#0be881" />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Pressure</Text>
              <Text style={styles.detailValue}>
                {weatherData.main.pressure} hPa
              </Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="leaf-outline" size={22} color="#f39c12" />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Wind</Text>
              <Text style={styles.detailValue}>
                {weatherData.wind.speed} m/s
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.sunTimesContainer}>
        <Text style={styles.sectionTitle}>Sunrise & Sunset</Text>
        <View style={styles.sunTimesRow}>
          <View style={styles.sunTimeItem}>
            <Ionicons name="sunny-outline" size={22} color="#fed330" />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Sunrise</Text>
              <Text style={styles.detailValue}>
                {formatTime(weatherData.sys.sunrise)}
              </Text>
            </View>
          </View>

          <View style={styles.sunTimeItem}>
            <Ionicons name="moon-outline" size={22} color="#a55eea" />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Sunset</Text>
              <Text style={styles.detailValue}>
                {formatTime(weatherData.sys.sunset)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  weatherContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    width: "100%",
  },
  animationContainer: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  weatherAnimation: {
    width: "100%",
    height: "100%",
  },
  cityName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
  tempContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  temperature: {
    fontSize: 70,
    fontWeight: "200",
    color: "#fff",
  },
  minMaxContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 150,
  },
  minMaxItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  minMaxText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 5,
  },
  weatherDescription: {
    fontSize: 24,
    color: "#fff",
    marginBottom: 30,
    textTransform: "capitalize",
  },
  detailsContainer: {
    backgroundColor: "rgba(31, 58, 90, 0.8)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#48dbfb",
    width: "100%",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F8F9FA",
    marginBottom: 12,
    opacity: 0.9,
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  detailsGrid: {
    flexDirection: "column",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailTextContainer: {
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: "#ADB5BD",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 16,
    color: "#F8F9FA",
    fontWeight: "600",
    marginTop: 2,
  },
  sunTimesContainer: {
    backgroundColor: "rgba(20, 39, 78, 0.8)",
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#f9ca24",
    width: "100%",
    marginTop: 5,
    marginBottom: 20
  },
  sunTimesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sunTimeItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "45%",
  },
});

export default WeatherInfo;
