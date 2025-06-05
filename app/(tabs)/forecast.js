import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Animated,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { loadWeatherData } from '../../utils/storage';

const { width, height } = Dimensions.get('window');

export default function ForecastScreen() {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (weatherData) {
      generateForecastData();
      animateContent();
    }
  }, [weatherData]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await loadWeatherData();
      setWeatherData(data);
    } catch (error) {
      console.error('Error loading weather data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const animateContent = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const generateForecastData = () => {
    if (!weatherData) return;

    const forecast = [];
    const today = new Date();
    const weatherConditions = [
      { condition: 'Sunny', icon: 'weather-sunny' },
      { condition: 'Partly Cloudy', icon: 'weather-partly-cloudy' },
      { condition: 'Cloudy', icon: 'weather-cloudy' },
      { condition: 'Light Rain', icon: 'weather-rainy' },
      { condition: 'Clear', icon: 'weather-night' },
    ];

    for (let i = 1; i <= 5; i++) {
      const forecastDate = new Date(today);
      forecastDate.setDate(today.getDate() + i);
      
      const randomCondition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
      
      
      let baseTemp = weatherData.main.temp;
      if (baseTemp > 100) {
        baseTemp = baseTemp - 273.15;
      }
  
      const tempVariation = Math.random() * 6 - 3;
      const tempHigh = Math.round(baseTemp + Math.abs(tempVariation) + Math.random() * 3);
      const tempLow = Math.round(baseTemp - Math.abs(tempVariation) - Math.random() * 5);
      
      forecast.push({
        date: forecastDate,
        day: forecastDate.toLocaleDateString('en', { weekday: 'short' }),
        condition: randomCondition.condition,
        icon: randomCondition.icon,
        tempHigh: tempHigh,
        tempLow: tempLow,
        humidity: Math.round(Math.max(30, Math.min(95, weatherData.main.humidity + Math.random() * 20 - 10))),
        windSpeed: Math.round(weatherData.wind?.speed * 3.6 + Math.random() * 5) || Math.round(Math.random() * 15 + 5),
      });
    }

    setForecastData(forecast);
  };

  const getBackgroundColors = (weatherId) => {
    if (!weatherId) return ['#4c669f', '#3b5998', '#192f6a'];

    if (weatherId >= 200 && weatherId < 300) {
      return ['#414345', '#232526', '#000000'];
    } else if (weatherId >= 300 && weatherId < 400) {
      return ['#3a7bd5', '#3a6073', '#16222A'];
    } else if (weatherId >= 500 && weatherId < 600) {
      return ['#373B44', '#4286f4', '#373B44'];
    } else if (weatherId >= 600 && weatherId < 700) {
      return ['#E6DADA', '#274046', '#E6DADA'];
    } else if (weatherId >= 700 && weatherId < 800) {
      return ['#BA8B02', '#8E0E00', '#BA8B02'];
    } else if (weatherId === 800) {
      return ['#2980B9', '#6DD5FA', '#2980B9'];
    } else if (weatherId > 800 && weatherId < 900) {
      return ['#bdc3c7', '#2c3e50', '#bdc3c7'];
    } else {
      return ['#4c669f', '#3b5998', '#192f6a'];
    }
  };

  const formatDate = (date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    return date.toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#4c669f', '#3b5998', '#192f6a']}
          style={styles.gradient}
        >
          <View style={styles.loadingContainer}>
            <MaterialCommunityIcons
              name="weather-cloudy"
              size={60}
              color="rgba(255, 255, 255, 0.7)"
            />
            <Text style={styles.loadingText}>Loading forecast...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!weatherData) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#4c669f', '#3b5998', '#192f6a']}
          style={styles.gradient}
        >
          <View style={styles.noDataContainer}>
            <MaterialCommunityIcons
              name="weather-cloudy"
              size={80}
              color="rgba(255, 255, 255, 0.7)"
            />
            <Text style={styles.noDataTitle}>No Forecast Available</Text>
            <Text style={styles.noDataText}>
              Search for a city in the Home tab to view the 5-day weather forecast.
            </Text>
            <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={weatherData ? getBackgroundColors(weatherData.weather[0].id) : ['#4c669f', '#3b5998', '#192f6a']}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#fff"
              colors={['#fff']}
            />
          }
        >
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={20} color="#fff" />
              <Text style={styles.locationText}>
                {weatherData.name}, {weatherData.sys.country}
              </Text>
            </View>
            <Text style={styles.title}>5-Day Forecast</Text>
            <View style={styles.currentWeatherContainer}>
              <Text style={styles.currentTemp}>
                {(() => {
                  let temp = weatherData.main.temp;
                  if (temp > 100) {
                    temp = temp - 273.15;
                  }
                  return Math.round(temp);
                })()}°C
              </Text>
              <Text style={styles.currentCondition}>
                {weatherData.weather[0].description}
              </Text>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.forecastContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {forecastData.map((item, index) => (
              <BlurView
                key={index}
                intensity={20}
                style={styles.forecastItem}
                tint="dark"
              >
                <View style={styles.forecastContent}>
                  <View style={styles.dateSection}>
                    <Text style={styles.dayText}>{item.day}</Text>
                    <Text style={styles.dateText}>
                      {formatDate(item.date)}
                    </Text>
                  </View>

                  <View style={styles.weatherSection}>
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={32}
                      color="#fff"
                    />
                    <Text style={styles.conditionText}>{item.condition}</Text>
                  </View>

                  <View style={styles.tempSection}>
                    <View style={styles.tempRow}>
                      <Text style={styles.tempLabel}>High</Text>
                      <Text style={styles.tempHigh}>{item.tempHigh}°</Text>
                    </View>
                    <View style={styles.tempRow}>
                      <Text style={styles.tempLabel}>Low</Text>
                      <Text style={styles.tempLow}>{item.tempLow}°</Text>
                    </View>
                  </View>

                  <View style={styles.detailsSection}>
                    <View style={styles.detailItem}>
                      <MaterialCommunityIcons
                        name="water-percent"
                        size={16}
                        color="rgba(255, 255, 255, 0.7)"
                      />
                      <Text style={styles.detailText}>{item.humidity}%</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <MaterialCommunityIcons
                        name="weather-windy"
                        size={16}
                        color="rgba(255, 255, 255, 0.7)"
                      />
                      <Text style={styles.detailText}>{item.windSpeed} km/h</Text>
                    </View>
                  </View>
                </View>
              </BlurView>
            ))}
          </Animated.View>

          <Animated.View
            style={[
              styles.summaryContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <BlurView intensity={20} style={styles.summaryCard} tint="dark">
              <Text style={styles.summaryTitle}>Weekly Overview</Text>
              <View style={styles.summaryStats}>
                <View style={styles.statItem}>
                  <MaterialCommunityIcons
                    name="thermometer-high"
                    size={24}
                    color="#FF6B6B"
                  />
                  <Text style={styles.statLabel}>Avg High</Text>
                  <Text style={styles.statValue}>
                    {Math.round(
                      forecastData.reduce((sum, item) => sum + item.tempHigh, 0) /
                        forecastData.length || 0
                    )}°C
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <MaterialCommunityIcons
                    name="thermometer-low"
                    size={24}
                    color="#4ECDC4"
                  />
                  <Text style={styles.statLabel}>Avg Low</Text>
                  <Text style={styles.statValue}>
                    {Math.round(
                      forecastData.reduce((sum, item) => sum + item.tempLow, 0) /
                        forecastData.length || 0
                    )}°C
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <MaterialCommunityIcons
                    name="water-percent"
                    size={24}
                    color="#45B7D1"
                  />
                  <Text style={styles.statLabel}>Avg Humidity</Text>
                  <Text style={styles.statValue}>
                    {Math.round(
                      forecastData.reduce((sum, item) => sum + item.humidity, 0) /
                        forecastData.length || 0
                    )}%
                  </Text>
                </View>
              </View>
            </BlurView>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 18,
    marginTop: 15,
    fontWeight: '500',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noDataTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  noDataText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  refreshButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginBottom: 15,
  },
  currentWeatherContainer: {
    alignItems: 'center',
  },
  currentTemp: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  currentCondition: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'capitalize',
    marginTop: 5,
  },
  forecastContainer: {
    marginBottom: 20,
  },
  forecastItem: {
    borderRadius: 20,
    marginBottom: 15,
    overflow: 'hidden',
  },
  forecastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  dateSection: {
    flex: 1,
  },
  dayText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dateText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginTop: 2,
  },
  weatherSection: {
    flex: 1.5,
    alignItems: 'center',
  },
  conditionText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
  tempSection: {
    flex: 1,
    alignItems: 'center',
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  tempLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    width: 30,
  },
  tempHigh: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  tempLow: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  detailsSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  detailText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginLeft: 5,
  },
  summaryContainer: {
    marginTop: 10,
  },
  summaryCard: {
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
    marginBottom: 70
  },
  summaryTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
});