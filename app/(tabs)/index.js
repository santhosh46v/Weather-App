import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StatusBar,
  SafeAreaView,
  Dimensions,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  Vibration,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { fetchWeatherByCity, fetchWeatherByCoords } from '../../services/weatherService';
import { saveWeatherData, loadWeatherData } from '../../utils/storage';
import WeatherInfo from '../../components/WeatherInfo';
import ErrorMessage from '../../components/ErrorMessage';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_SEARCHES_KEY = '@weather_app_recent_searches';

export default function HomeScreen() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showRecentSearches, setShowRecentSearches] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const headerFadeAnim = useRef(new Animated.Value(1)).current;
  const recentSearchesAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    loadSavedWeather();
    loadSavedRecentSearches();
    checkLocationPermission();
    animateHeader();
  }, []);

  useEffect(() => {
    if (weatherData) {
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

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [weatherData]);

  useEffect(() => {
    Animated.timing(recentSearchesAnim, {
      toValue: showRecentSearches ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showRecentSearches]);

  const animateHeader = () => {
    Animated.sequence([
      Animated.timing(headerFadeAnim, {
        toValue: 0.7,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(headerFadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start(() => animateHeader());
  };

  const loadSavedWeather = async () => {
    try {
      const data = await loadWeatherData();
      if (data) {
        setWeatherData(data);
        resetAnimation();
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  };

  const loadSavedRecentSearches = async () => {
    try {
      const savedSearches = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (savedSearches) {
        setRecentSearches(JSON.parse(savedSearches));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  const saveRecentSearches = async (searches) => {
    try {
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
    } catch (error) {
      console.error('Error saving recent searches:', error);
    }
  };

  const addToRecentSearches = async (cityName) => {
    try {
      const normalizedCity = cityName.trim().toLowerCase();
      const updatedSearches = [
        normalizedCity,
        ...recentSearches.filter(search => search.toLowerCase() !== normalizedCity)
      ].slice(0, 5); 
      
      setRecentSearches(updatedSearches);
      await saveRecentSearches(updatedSearches);
    } catch (error) {
      console.error('Error saving recent searches:', error);
    }
  };

  const clearRecentSearches = async () => {
    try {
      setRecentSearches([]);
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
      setShowRecentSearches(false);
    } catch (error) {
      console.error('Error clearing recent searches:', error);
    }
  };

  const resetAnimation = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
  };

  const checkLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted' && !weatherData) {
      getLocationWeather();
    }
  };

  const getLocationWeather = async () => {
    setLoading(true);
    setError(null);
    setShowRecentSearches(false);
    Keyboard.dismiss();

    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      Vibration.vibrate(100);
    }

    try {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const data = await fetchWeatherByCoords(latitude, longitude);
      setWeatherData(data);
      saveWeatherData(data);
      resetAnimation();
    } catch (err) {
      setError('Could not fetch location weather. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherByCity = async (cityName = city) => {
    if (!cityName.trim()) {
      setError('Please enter a city name');
      shakeInput();
      return;
    }

    setLoading(true);
    setError(null);
    setShowRecentSearches(false);
    Keyboard.dismiss();

    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      Vibration.vibrate(100);
    }

    try {
      const data = await fetchWeatherByCity(cityName);
      setWeatherData(data);
      saveWeatherData(data);
      await addToRecentSearches(data.name); 
      resetAnimation();
      setCity('');
    } catch (err) {
      if (err.message === 'City not found') {
        setError('City not found. Please check the spelling and try again.');
      } else {
        setError('Failed to fetch weather data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRecentSearchPress = (searchCity) => {
    setCity(searchCity);
    setShowRecentSearches(false);
    getWeatherByCity(searchCity);
  };

  const handleInputFocus = () => {
    if (recentSearches.length > 0) {
      setShowRecentSearches(true);
    }
  };

  const handleInputChange = (text) => {
    setCity(text);
    if (text.length === 0 && recentSearches.length > 0) {
      setShowRecentSearches(true);
    } else {
      setShowRecentSearches(false);
    }
  };

  const shakeInput = () => {
    const shakeAnimation = new Animated.Value(0);
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Vibration.vibrate([0, 50, 50, 50]);
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

  const getTimeOfDay = () => {
    const hours = new Date().getHours();
    if (hours >= 6 && hours < 12) return 'morning';
    if (hours >= 12 && hours < 18) return 'afternoon';
    if (hours >= 18 && hours < 22) return 'evening';
    return 'night';
  };

  const timeOfDay = getTimeOfDay();
  const greeting = `Good ${timeOfDay}`;

  const renderRecentSearchItem = ({ item }) => (
    <TouchableOpacity
      style={styles.recentSearchItem}
      onPress={() => handleRecentSearchPress(item)}
      activeOpacity={0.7}
    >
      <Ionicons name="time-outline" size={16} color="rgba(255, 255, 255, 0.6)" />
      <Text style={styles.recentSearchText}>{item}</Text>
      <Ionicons name="arrow-forward" size={16} color="rgba(255, 255, 255, 0.4)" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundImageContainer}>
        <LinearGradient
          colors={
            weatherData
              ? [...getBackgroundColors(weatherData.weather[0].id), 'transparent']
              : [
                  'rgba(76, 102, 159, 0.8)',
                  'rgba(59, 89, 152, 0.8)',
                  'rgba(25, 47, 106, 0.8)',
                ]
          }
          style={styles.gradientOverlay}
        />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={true}
          alwaysBounceVertical={true}
        >
          <Animated.View style={[styles.header, { opacity: headerFadeAnim }]}>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.title}>Weather Forecast</Text>
            {weatherData && (
              <View style={styles.lastUpdatedContainer}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={14}
                  color="rgba(255, 255, 255, 0.8)"
                />
                <Text style={styles.subtitle}>
                  Updated{' '}
                  {new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            )}
          </Animated.View>

          <BlurView intensity={20} style={styles.searchContainer} tint="dark">
            <View style={styles.inputWrapper}>
              <Ionicons
                name="search"
                size={20}
                color="rgba(255, 255, 255, 0.7)"
                style={styles.searchIcon}
              />
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder="Search for a city..."
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={city}
                onChangeText={handleInputChange}
                onSubmitEditing={() => getWeatherByCity()}
                onFocus={handleInputFocus}
              />
              {city.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => {
                    setCity('');
                    setShowRecentSearches(recentSearches.length > 0);
                  }}
                >
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color="rgba(255, 255, 255, 0.5)"
                  />
                </TouchableOpacity>
              )}
            </View>

            {showRecentSearches && recentSearches.length > 0 && (
              <Animated.View
                style={[
                  styles.recentSearchesContainer,
                  {
                    opacity: recentSearchesAnim,
                    transform: [
                      {
                        translateY: recentSearchesAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-10, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.recentSearchesHeader}>
                  <Text style={styles.recentSearchesTitle}>Recent Searches</Text>
                  <TouchableOpacity onPress={clearRecentSearches}>
                    <Text style={styles.clearAllText}>Clear All</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={recentSearches}
                  keyExtractor={(item, index) => `${item}-${index}`}
                  renderItem={renderRecentSearchItem}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                />
              </Animated.View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.searchButton}
                onPress={() => getWeatherByCity()}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonText}>Search</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.locationButton}
                onPress={getLocationWeather}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Ionicons name="location" size={18} color="#fff" />
                <Text style={styles.locationButtonText}>Current Location</Text>
              </TouchableOpacity>
            </View>
          </BlurView>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>
                Getting latest weather data...
              </Text>
            </View>
          )}

          <ErrorMessage message={error} />

          {weatherData && !loading && (
            <Animated.View
              style={[
                styles.weatherInfoContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <WeatherInfo weatherData={weatherData} />
            </Animated.View>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#192f6a',
  },
  backgroundImageContainer: {
    ...StyleSheet.absoluteFillObject,
    height: height,
    width: width,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.85,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 40,
    minHeight: height - (Platform.OS === 'android' ? StatusBar.currentHeight : 0),
  },
  header: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 25,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
  },
  lastUpdatedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 5,
  },
  searchContainer: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 15,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#fff',
  },
  clearButton: {
    padding: 5,
  },
  // Recent Searches Styles
  recentSearchesContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  recentSearchesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  recentSearchesTitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '600',
  },
  clearAllText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontWeight: '500',
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 8,
    marginBottom: 2,
  },
  recentSearchText: {
    flex: 1,
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginLeft: 10,
    textTransform: 'capitalize',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  searchButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    marginRight: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  locationButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  locationButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
    fontWeight: '500',
  },
  weatherInfoContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    width: '100%',
  },
  bottomPadding: {
    height: 10,
  },
});