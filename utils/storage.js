import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@weather_app_last_search';

export const saveWeatherData = async (data) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error("Failed to save weather data", e);
    return false;
  }
};

export const loadWeatherData = async () => {
  try {
    const savedData = await AsyncStorage.getItem(STORAGE_KEY);
    if (savedData) {
      return JSON.parse(savedData);
    }
    return null;
  } catch (e) {
    console.error("Failed to load weather data", e);
    return null;
  }
};