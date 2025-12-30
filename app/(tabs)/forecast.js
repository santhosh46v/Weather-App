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
import { fetchForecastByCoords } from '../../services/weatherService';

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
    if (weatherData && forecastData.length) {
      animateContent();
    }
  }, [weatherData, forecastData]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await loadWeatherData();
      setWeatherData(data);

      if (data) {
        await loadForecast(data);
      } else {
        setForecastData([]);
      }
    } catch (error) {
      console.error('Error loading weather data:', error);
      setForecastData([]);
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

  const loadForecast = async (data) => {
    try {
      if (!data?.coord?.lat || !data?.coord?.lon) {
        setForecastData([]);
        return;
      }

      const apiForecast = await fetchForecastByCoords(data.coord.lat, data.coord.lon);
      const parsedForecast = buildDailyForecast(apiForecast);
      setForecastData(parsedForecast);
    } catch (error) {
      console.error('Error fetching forecast data:', error);
      setForecastData([]);
    }
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

  const mapWeatherIdToIcon = (weatherId) => {
    if (weatherId >= 200 && weatherId < 300) return 'weather-lightning';
    if (weatherId >= 300 && weatherId < 400) return 'weather-rainy';
    if (weatherId >= 500 && weatherId < 600) return 'weather-pouring';
    if (weatherId >= 600 && weatherId < 700) return 'weather-snowy';
    if (weatherId >= 700 && weatherId < 800) return 'weather-fog';
    if (weatherId === 800) return 'weather-sunny';
    if (weatherId > 800 && weatherId < 900) return 'weather-cloudy';
    return 'weather-cloudy';
  };

  const buildDailyForecast = (apiForecast) => {
    if (!apiForecast?.list) return [];

    const todayStr = new Date().toISOString().split('T')[0];
    const groupedByDate = {};

    apiForecast.list.forEach((entry) => {
      const dateStr = entry.dt_txt.split(' ')[0];
      if (dateStr === todayStr) return; // skip today

      if (!groupedByDate[dateStr]) {
        groupedByDate[dateStr] = [];
      }
      groupedByDate[dateStr].push(entry);
    });

    const sortedDates = Object.keys(groupedByDate).sort().slice(0, 5);

    return sortedDates.map((dateStr) => {
      const entries = groupedByDate[dateStr];
      const temps = entries.map((e) => e.main.temp);
      const humidityValues = entries.map((e) => e.main.humidity);
      const windValues = entries.map((e) => e.wind?.speed ?? 0);

      const targetHour = 12;
      const representative = entries.reduce((closest, current) => {
        const currentHour = new Date(current.dt_txt.replace(' ', 'T')).getHours();
        const closestHour = new Date(closest.dt_txt.replace(' ', 'T')).getHours();
        return Math.abs(currentHour - targetHour) < Math.abs(closestHour - targetHour)
          ? current
          : closest;
      }, entries[0]);

      const dateObj = new Date(`${dateStr}T00:00:00`);

      return {
        date: dateObj,
        day: dateObj.toLocaleDateString('en', { weekday: 'short' }),
        condition: representative.weather[0]?.description ?? 'N/A',
        icon: mapWeatherIdToIcon(representative.weather[0]?.id),
        tempHigh: Math.round(Math.max(...temps)),
        tempLow: Math.round(Math.min(...temps)),
        humidity: Math.round(
          humidityValues.reduce((sum, value) => sum + value, 0) / humidityValues.length
        ),
        windSpeed: Math.round(
          (windValues.reduce((sum, value) => sum + value, 0) / windValues.length) * 3.6
        ), // m/s to km/h
      };
    });
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
                    <Text style={styles.dayText} numberOfLines={1} ellipsizeMode="tail">
                      {item.day}
                    </Text>
                    <Text style={styles.dateText} numberOfLines={1} ellipsizeMode="tail">
                      {formatDate(item.date)}
                    </Text>
                  </View>

                  <View style={styles.weatherSection}>
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={30}
                      color="#fff"
                    />
                    <Text style={styles.conditionText} numberOfLines={1} ellipsizeMode="tail">
                      {item.condition}
                    </Text>
                  </View>

                  <View style={styles.tempSection}>
                    <View style={styles.tempRow}>
                      <Text style={styles.tempLabel} numberOfLines={1}>High</Text>
                      <Text style={styles.tempHigh} numberOfLines={1}>{item.tempHigh}°</Text>
                    </View>
                    <View style={styles.tempRow}>
                      <Text style={styles.tempLabel} numberOfLines={1}>Low</Text>
                      <Text style={styles.tempLow} numberOfLines={1}>{item.tempLow}°</Text>
                    </View>
                  </View>

                  <View style={styles.detailsSection}>
                    <View style={styles.detailItem}>
                      <MaterialCommunityIcons
                        name="water-percent"
                        size={16}
                        color="rgba(255, 255, 255, 0.7)"
                      />
                      <Text style={styles.detailText} numberOfLines={1}>{item.humidity}%</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <MaterialCommunityIcons
                        name="weather-windy"
                        size={16}
                        color="rgba(255, 255, 255, 0.7)"
                      />
                      <Text style={styles.detailText} numberOfLines={1}>{item.windSpeed} km/h</Text>
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
    marginTop: 40,
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
    minHeight: 78,
  },
  dateSection: {
    flex: 1,
    paddingRight: 8,
  },
  dayText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    marginTop: 2,
  },
  weatherSection: {
    flex: 1.2,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  conditionText: {
    color: '#fff',
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  tempSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  tempLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
    width: 34,
  },
  tempHigh: {
    color: '#FF6B6B',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  tempLow: {
    color: '#4ECDC4',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  detailsSection: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: 6,
    gap: 6,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginVertical: 1,
  },
  detailText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
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