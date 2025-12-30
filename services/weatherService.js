const API_KEY = 'f04d46bd6ff6e750322a8267b03fc33e';

export const fetchWeatherByCity = async (city) => {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
  );
  
  if (response.status === 404) {
    throw new Error('City not found');
  }
  
  if (!response.ok) {
    throw new Error('Weather data not available');
  }
  
  return await response.json();
};

export const fetchWeatherByCoords = async (latitude, longitude) => {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
  );
  
  if (!response.ok) {
    throw new Error('Weather data not available');
  }
  
  return await response.json();
};

export const fetchForecastByCoords = async (latitude, longitude) => {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
  );

  if (!response.ok) {
    throw new Error('Forecast data not available');
  }

  return await response.json();
};