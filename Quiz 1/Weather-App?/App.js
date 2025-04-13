import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ImageBackground,
  ActivityIndicator,
  Animated,
  Text,
  FlatList,
  Modal,
  Image,
  Share,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { Card } from 'react-native-paper';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
const WEATHER_API = {
  BASE_URL: 'https://api.openweathermap.org/data/2.5',
  KEY: '48c210d00d6b27b4fc091bbb8f3aff29', // TODO: Move to .env in production
  ENDPOINTS: {
    WEATHER: '/weather',
    FORECAST: '/forecast',
    AIR_QUALITY: '/air_pollution',
  },
};

const { width, height } = Dimensions.get('window');

// Utility Functions
const normalize = (size) => {
  const scale = width / 360;
  return Math.round(size * scale);
};

/**
 * @typedef {Object} WeatherData
 * @property {Object} current
 * @property {number} current.temp
 * @property {string} current.condition
 * @property {number} current.humidity
 * @property {number} current.windSpeed
 * @property {number} current.visibility
 * @property {number} current.feelsLike
 * @property {number} current.pressure
 * @property {string} current.sunrise
 * @property {string} current.sunset
 * @property {Array} forecast
 * @property {Array} weekly
 */

/**
 * @typedef {Object} AppState
 * @property {string} location
 * @property {string} searchQuery
 * @property {'C' | 'F'} unit
 * @property {'light' | 'dark'} theme
 * @property {'en' | 'es' | 'fr'} language
 * @property {WeatherData | null} weatherData
 * @property {WeatherData | null} rawWeatherData
 * @property {Object | null} airQuality
 * @property {boolean} loading
 * @property {string | null} error
 * @property {string[]} savedCities
 * @property {boolean} showCitiesModal
 * @property {boolean} showSettingsModal
 * @property {boolean} showMapModal
 * @property {string[]} alerts
 * @property {boolean} showSplash
 */

const translations = {
  en: {
    currentWeather: 'Current Weather in',
    settings: 'Settings',
    savedCities: 'Saved Cities',
    map: 'Weather Map',
    share: 'Share Weather',
    loading: 'Loading Weather...',
    error: 'Unable to fetch weather data',
  },
  es: {
    currentWeather: 'Clima actual en',
    settings: 'Configuración',
    savedCities: 'Ciudades guardadas',
    map: 'Mapa del clima',
    share: 'Compartir clima',
    loading: 'Cargando clima...',
    error: 'No se pudo obtener datos del clima',
  },
  fr: {
    currentWeather: 'Météo actuelle à',
    settings: 'Paramètres',
    savedCities: 'Villes enregistrées',
    map: 'Carte météo',
    share: 'Partager la météo',
    loading: 'Chargement de la météo...',
    error: 'Impossible de récupérer les données météo',
  },
};

const WeatherApp = () => {
  // State Management
  const [appState, setAppState] = useState/** @type {AppState} */ ({
    location: '',
    searchQuery: '',
    unit: 'C',
    theme: 'light',
    language: 'en',
    weatherData: null,
    rawWeatherData: null,
    airQuality: null,
    loading: false,
    error: null,
    savedCities: [],
    showCitiesModal: false,
    showSettingsModal: false,
    showMapModal: false,
    alerts: [],
    showSplash: true,
  });

  // Animation States
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.8))[0];
  const splashAnim = useState(new Animated.Value(0))[0];
  const splashTextAnim = useState(new Animated.Value(0))[0];

  // Utility Functions
  const toFahrenheit = (celsius) => Math.round((celsius * 9) / 5 + 32);

  const getWeatherIcon = useCallback((condition) => {
    const icons = {
      clear: 'sun',
      clouds: 'cloud',
      rain: 'cloud-rain',
      thunderstorm: 'bolt',
      snow: 'snowflake',
      drizzle: 'cloud-drizzle',
      mist: 'cloud-drizzle',
      fog: 'cloud-drizzle',
    };
    return icons[condition.toLowerCase()] || 'cloud';
  }, []);

  const getWeatherImage = useCallback((condition) => {
    const images = {
      clear: 'https://gazettengr.com/wp-content/uploads/sunny-weather.jpg',
      clouds: 'https://images.theconversation.com/files/228393/original/file-20180719-142423-4065mr.jpg',
      rain: 'https://media.istockphoto.com/id/503284599/photo/rainy-weather.jpg?s=612x612&w=0&k=20&c=pV38CVp0CLArYEZ6OUWnaqo6J5mo4JpbEZd61Vxr_I4=',
      thunderstorm: 'https://images.unsplash.com/photo-1605727216801-0262d6c5589b?q=80&w=2070&auto=format&fit=crop',
      snow: 'https://wem.wi.gov/wp-content/uploads/2024-Winter-Weather-Week.png',
      drizzle: 'https://images.unsplash.com/photo-1558401386-9259e9fb26f5?q=80&w=2070&auto=format&fit=crop',
      mist: 'https://images.unsplash.com/photo-1542273917-e526df677c43?q=80&w=2070&auto=format&fit=crop',
      fog: 'https://images.unsplash.com/photo-1542273917-e526df677c43?q=80&w=2070&auto=format&fit=crop',
      default: 'https://images.unsplash.com/photo-1531147646552-1f58bf9ba745?q=80&w=2070&auto=format&fit=crop',
    };
    return { uri: images[condition?.toLowerCase()] || images.default };
  }, []);

  // Data Processing
  const processWeatherData = useCallback(
    (weatherJson, forecastJson) => {
      const convertTemp = (temp) =>
        appState.unit === 'F' ? toFahrenheit(temp) : Math.round(temp);

      const rawData = {
        current: {
          temp: weatherJson.main.temp,
          condition: weatherJson.weather[0].main,
          humidity: weatherJson.main.humidity,
          windSpeed: weatherJson.wind.speed * 3.6,
          visibility: weatherJson.visibility / 1000,
          feelsLike: weatherJson.main.feels_like,
          pressure: weatherJson.main.pressure,
          sunrise: new Date(weatherJson.sys.sunrise * 1000).toLocaleTimeString(
            [],
            { hour: '2-digit', minute: '2-digit' }
          ),
          sunset: new Date(weatherJson.sys.sunset * 1000).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
        forecast: forecastJson.list.slice(0, 6).map((item) => ({
          time: new Date(item.dt * 1000).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          temp: item.main.temp,
          icon: getWeatherIcon(item.weather[0].main),
        })),
        weekly: forecastJson.list
          .filter((_, i) => i % 8 === 0)
          .slice(0, 7)
          .map((item) => ({
            day: new Date(item.dt * 1000).toLocaleDateString([], {
              weekday: 'long',
            }),
            high: item.main.temp_max,
            low: item.main.temp_min,
            icon: getWeatherIcon(item.weather[0].main),
          })),
      };

      setAppState((prev) => ({
        ...prev,
        rawWeatherData: rawData,
        weatherData: {
          current: {
            ...rawData.current,
            temp: convertTemp(rawData.current.temp),
            windSpeed: Math.round(rawData.current.windSpeed),
            feelsLike: convertTemp(rawData.current.feelsLike),
          },
          forecast: rawData.forecast.map((item) => ({
            ...item,
            temp: convertTemp(item.temp),
          })),
          weekly: rawData.weekly.map((item) => ({
            ...item,
            high: convertTemp(item.high),
            low: convertTemp(item.low),
          })),
        },
      }));
    },
    [appState.unit, getWeatherIcon]
  );

  // API Calls
  const fetchCurrentLocationWeather = useCallback(async () => {
    try {
      setAppState((prev) => ({ ...prev, loading: true, error: null }));

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error(translations[appState.language].error);
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = position.coords;

      let locationData = await Location.reverseGeocodeAsync({ latitude, longitude });
      let city = locationData[0]?.city || 'My City';
      let country = locationData[0]?.country || '';

      const fullLocation = `${city}, ${country}`;
      setAppState((prev) => ({ ...prev, location: fullLocation }));

      await fetchWeatherData(latitude, longitude, fullLocation);
    } catch (err) {
      setAppState((prev) => ({
        ...prev,
        error: err.message || translations[appState.language].error,
      }));
    } finally {
      setAppState((prev) => ({ ...prev, loading: false }));
    }
  }, [appState.language, fetchWeatherData]);

  const fetchWeatherByCity = useCallback(
    async (city) => {
      try {
        setAppState((prev) => ({ ...prev, loading: true, error: null }));

        const response = await fetch(
          `${WEATHER_API.BASE_URL}${WEATHER_API.ENDPOINTS.WEATHER}?q=${city}&appid=${WEATHER_API.KEY}&units=metric`
        );
        if (!response.ok) throw new Error('City not found');
        const weatherJson = await response.json();

        const { lat, lon } = weatherJson.coord;
        const fullLocation = `${weatherJson.name}, ${weatherJson.sys.country}`;
        setAppState((prev) => ({ ...prev, location: fullLocation }));

        await fetchWeatherData(lat, lon, fullLocation);
      } catch (err) {
        setAppState((prev) => ({
          ...prev,
          error: err.message || translations[appState.language].error,
        }));
      } finally {
        setAppState((prev) => ({ ...prev, loading: false }));
      }
    },
    [appState.language, fetchWeatherData]
  );

  const fetchWeatherData = useCallback(
    async (lat, lon, loc) => {
      try {
        const [weatherResponse, forecastResponse, airQualityResponse] =
          await Promise.all([
            fetch(
              `${WEATHER_API.BASE_URL}${WEATHER_API.ENDPOINTS.WEATHER}?lat=${lat}&lon=${lon}&appid=${WEATHER_API.KEY}&units=metric`
            ),
            fetch(
              `${WEATHER_API.BASE_URL}${WEATHER_API.ENDPOINTS.FORECAST}?lat=${lat}&lon=${lon}&appid=${WEATHER_API.KEY}&units=metric`
            ),
            fetch(
              `${WEATHER_API.BASE_URL}${WEATHER_API.ENDPOINTS.AIR_QUALITY}?lat=${lat}&lon=${lon}&appid=${WEATHER_API.KEY}`
            ),
          ]);

        if (!weatherResponse.ok || !forecastResponse.ok) {
          throw new Error(translations[appState.language].error);
        }

        const [weatherJson, forecastJson, airQualityJson] = await Promise.all([
          weatherResponse.json(),
          forecastResponse.json(),
          airQualityResponse.json(),
        ]);

        processWeatherData(weatherJson, forecastJson);
        setAppState((prev) => ({
          ...prev,
          airQuality: {
            aqi: airQualityJson.list[0].main.aqi,
            pm25: airQualityJson.list[0].components.pm2_5,
          },
        }));
        checkWeatherAlerts(weatherJson);
      } catch (err) {
        setAppState((prev) => ({
          ...prev,
          error: err.message || translations[appState.language].error,
        }));
      }
    },
    [appState.language, processWeatherData, checkWeatherAlerts]
  );

  // Handlers
  const checkWeatherAlerts = useCallback(
    (weatherJson) => {
      const condition = weatherJson.weather[0].main;
      const temp = weatherJson.main.temp;
      if (condition === 'Thunderstorm' || temp > 35 || temp < -10) {
        setAppState((prev) => ({
          ...prev,
          alerts: [
            ...prev.alerts,
            `Alert: Severe ${condition} in ${weatherJson.name}!`,
          ],
        }));
      }
    },
    []
  );

  const handleSearch = useCallback(() => {
    if (appState.searchQuery.trim()) {
      fetchWeatherByCity(appState.searchQuery.trim());
      setAppState((prev) => ({ ...prev, searchQuery: '' }));
    }
  }, [appState.searchQuery, fetchWeatherByCity]);

  const saveCity = useCallback(async () => {
    if (appState.location && !appState.savedCities.includes(appState.location)) {
      const newCities = [...appState.savedCities, appState.location];
      setAppState((prev) => ({ ...prev, savedCities: newCities }));
      try {
        await AsyncStorage.setItem('savedCities', JSON.stringify(newCities));
      } catch (e) {
        console.error('Error saving cities:', e);
      }
    }
  }, [appState.location, appState.savedCities]);

  const removeCity = useCallback(
    async (city) => {
      const newCities = appState.savedCities.filter((c) => c !== city);
      setAppState((prev) => ({ ...prev, savedCities: newCities }));
      try {
        await AsyncStorage.setItem('savedCities', JSON.stringify(newCities));
      } catch (e) {
        console.error('Error removing city:', e);
      }
    },
    [appState.savedCities]
  );

  const toggleTheme = useCallback(async () => {
    const newTheme = appState.theme === 'light' ? 'dark' : 'light';
    setAppState((prev) => ({ ...prev, theme: newTheme }));
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (e) {
      console.error('Error saving theme:', e);
    }
  }, [appState.theme]);

  const shareWeather = useCallback(async () => {
    if (!appState.weatherData) {
      setAppState((prev) => ({
        ...prev,
        error: 'No weather data available to share',
      }));
      return;
    }
    try {
      const message = `${translations[appState.language].currentWeather} ${
        appState.location
      }: ${appState.weatherData.current.temp}°${appState.unit}, ${
        appState.weatherData.current.condition
      }`;
      await Share.share({
        message,
        title: 'Current Weather',
      });
    } catch (err) {
      setAppState((prev) => ({
        ...prev,
        error: `Failed to share weather: ${err.message}`,
      }));
    }
  }, [
    appState.weatherData,
    appState.location,
    appState.unit,
    appState.language,
  ]);

  // Effects
  useEffect(() => {
    const loadData = async () => {
      try {
        const [cities, savedTheme, savedLanguage] = await Promise.all([
          AsyncStorage.getItem('savedCities'),
          AsyncStorage.getItem('theme'),
          AsyncStorage.getItem('language'),
        ]);
        setAppState((prev) => ({
          ...prev,
          savedCities: cities ? JSON.parse(cities) : [],
          theme: savedTheme || 'light',
          language: savedLanguage || 'en',
        }));
        fetchCurrentLocationWeather();
      } catch (e) {
        console.error('Error loading data:', e);
        setAppState((prev) => ({
          ...prev,
          error: translations[appState.language].error,
        }));
      }
    };

    // Splash Animation
    Animated.parallel([
      Animated.timing(splashAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(splashTextAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.parallel([
        Animated.timing(splashAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(splashTextAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setAppState((prev) => ({ ...prev, showSplash: false }));
        loadData();
      });
    });
  }, [appState.language, fetchCurrentLocationWeather]);

  useEffect(() => {
    if (appState.weatherData) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appState.weatherData]);

  useEffect(() => {
    if (appState.rawWeatherData) {
      const convertTemp = (temp) =>
        appState.unit === 'F' ? toFahrenheit(temp) : Math.round(temp);
      setAppState((prev) => ({
        ...prev,
        weatherData: {
          current: {
            ...prev.rawWeatherData.current,
            temp: convertTemp(prev.rawWeatherData.current.temp),
            windSpeed: Math.round(prev.rawWeatherData.current.windSpeed),
            feelsLike: convertTemp(prev.rawWeatherData.current.feelsLike),
          },
          forecast: prev.rawWeatherData.forecast.map((item) => ({
            ...item,
            temp: convertTemp(item.temp),
          })),
          weekly: prev.rawWeatherData.weekly.map((item) => ({
            ...item,
            high: convertTemp(item.high),
            low: convertTemp(item.low),
          })),
        },
      }));
    }
  }, [appState.unit, appState.rawWeatherData]);

  // Render Components
  const renderSplashScreen = () => (
    <LinearGradient
      colors={['#1E3A8A', '#3B82F6']}
      style={styles.splashContainer}
    >
      <Animated.View
        style={[styles.splashContent, { opacity: splashAnim }]}
        accessible
        accessibilityLabel="Weather App Splash Screen"
      >
        <Animated.Text
          style={[styles.splashText, { transform: [{ scale: splashTextAnim }] }]}
        >
          Weather App
        </Animated.Text>
      </Animated.View>
    </LinearGradient>
  );

  const renderMainContent = () => (
    <LinearGradient
      colors={
        appState.theme === 'light'
          ? ['#1E3A8A', '#3B82F6', '#93C5FD']
          : ['#0F172A', '#1E293B', '#475569']
      }
      style={styles.container}
    >
      <ImageBackground
        source={
          appState.weatherData
            ? getWeatherImage(appState.weatherData.current.condition)
            : getWeatherImage('default')
        }
        style={styles.backgroundClouds}
        accessibilityLabel="Weather background image"
      >
        <SafeAreaView style={styles.safeArea}>
          <StatusBar
            barStyle={appState.theme === 'light' ? 'light-content' : 'dark-content'}
            backgroundColor="transparent"
            translucent
          />
          <View style={styles.header}>
            <TextInput
              style={[
                styles.searchInput,
                {
                  backgroundColor:
                    appState.theme === 'light'
                      ? 'rgba(255,255,255,0.2)'
                      : 'rgba(255,255,255,0.1)',
                },
              ]}
              placeholder="Search City"
              placeholderTextColor={
                appState.theme === 'light' ? 'rgba(255,255,255,0.7)' : '#D1D5DB'
              }
              value={appState.searchQuery}
              onChangeText={(text) =>
                setAppState((prev) => ({ ...prev, searchQuery: text }))
              }
              onSubmitEditing={handleSearch}
              accessibilityLabel="Search city input"
            />
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleSearch}
              accessibilityLabel="Search button"
            >
              <Feather name="search" size={normalize(24)} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() =>
                setAppState((prev) => ({ ...prev, showCitiesModal: true }))
              }
              accessibilityLabel="Saved cities"
            >
              <Feather name="list" size={normalize(24)} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() =>
                setAppState((prev) => ({ ...prev, showSettingsModal: true }))
              }
              accessibilityLabel="Settings"
            >
              <Feather name="settings" size={normalize(24)} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() =>
                setAppState((prev) => ({ ...prev, showMapModal: true }))
              }
              accessibilityLabel="Weather map"
            >
              <Feather name="map" size={normalize(24)} color="white" />
            </TouchableOpacity>
          </View>

          {appState.error && (
            <TouchableOpacity
              onPress={fetchCurrentLocationWeather}
              style={styles.errorContainer}
              accessibilityLabel="Retry fetching weather"
            >
              <Text style={styles.errorText}>{appState.error}</Text>
              <Text style={styles.retryText}>Tap to retry</Text>
            </TouchableOpacity>
          )}
          {appState.alerts.length > 0 && (
            <View style={styles.alertContainer}>
              <Text style={styles.alertText}>
                {appState.alerts[appState.alerts.length - 1]}
              </Text>
            </View>
          )}

          {appState.weatherData && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <Animated.View
                style={[
                  styles.animationContainer,
                  { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
                ]}
              >
                <ImageBackground
                  source={getWeatherImage(appState.weatherData.current.condition)}
                  style={styles.currentWeatherBackground}
                >
                  <View style={styles.currentWeather}>
                    <Text style={styles.locationText}>{appState.location}</Text>
                    <Text style={styles.temperatureText}>
                      {appState.weatherData.current.temp}°{appState.unit}
                    </Text>
                    <Text style={styles.conditionText}>
                      {appState.weatherData.current.condition}
                    </Text>
                    <Text style={styles.feelsLikeText}>
                      Feels like {appState.weatherData.current.feelsLike}°
                      {appState.unit}
                    </Text>
                    <View style={styles.buttonContainer}>
                      <TouchableOpacity
                        style={styles.saveButton}
                        onPress={saveCity}
                        accessibilityLabel="Save current city"
                      >
                        <Text style={styles.saveButtonText}>Save City</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.shareButton}
                        onPress={shareWeather}
                        accessibilityLabel="Share weather"
                      >
                        <Text style={styles.saveButtonText}>
                          {translations[appState.language].share}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ImageBackground>
              </Animated.View>

              <ImageBackground
                source={getWeatherImage(appState.weatherData.current.condition)}
                style={styles.highlightsGridBackground}
              >
                <View style={styles.highlightsGrid}>
                  <View style={styles.gridRow}>
                    <Card
                      style={styles.gridCard}
                      accessible
                      accessibilityLabel={`Wind speed: ${appState.weatherData.current.windSpeed} kilometers per hour`}
                    >
                      <Feather name="wind" size={normalize(30)} color="white" />
                      <Text style={styles.gridValue}>
                        {appState.weatherData.current.windSpeed} km/h
                      </Text>
                      <Text style={styles.gridLabel}>Wind Speed</Text>
                    </Card>
                    <Card
                      style={styles.gridCard}
                      accessible
                      accessibilityLabel={`Pressure: ${appState.weatherData.current.pressure} hectopascals`}
                    >
                      <FontAwesome5
                        name="temperature-high"
                        size={normalize(26)}
                        color="white"
                      />
                      <Text style={styles.gridValue}>
                        {appState.weatherData.current.pressure} hPa
                      </Text>
                      <Text style={styles.gridLabel}>Pressure</Text>
                    </Card>
                  </View>
                  <View style={styles.gridRow}>
                    <Card
                      style={styles.gridCard}
                      accessible
                      accessibilityLabel={`Humidity: ${appState.weatherData.current.humidity} percent`}
                    >
                      <Feather name="droplet" size={normalize(26)} color="white" />
                      <Text style={styles.gridValue}>
                        {appState.weatherData.current.humidity}%
                      </Text>
                      <Text style={styles.gridLabel}>Humidity</Text>
                    </Card>
                    <Card
                      style={styles.gridCard}
                      accessible
                      accessibilityLabel={`Visibility: ${appState.weatherData.current.visibility} kilometers`}
                    >
                      <Feather name="eye" size={normalize(26)} color="white" />
                      <Text style={styles.gridValue}>
                        {appState.weatherData.current.visibility} km
                      </Text>
                      <Text style={styles.gridLabel}>Visibility</Text>
                    </Card>
                  </View>
                  {appState.airQuality && (
                    <View style={styles.gridRow}>
                      <Card
                        style={styles.gridCard}
                        accessible
                        accessibilityLabel={`Air Quality Index: ${appState.airQuality.aqi}`}
                      >
                        <Feather name="cloud" size={normalize(26)} color="white" />
                        <Text style={styles.gridValue}>
                          AQI {appState.airQuality.aqi}
                        </Text>
                        <Text style={styles.gridLabel}>Air Quality</Text>
                      </Card>
                      <Card
                        style={styles.gridCard}
                        accessible
                        accessibilityLabel={`PM2.5: ${appState.airQuality.pm25} micrograms per cubic meter`}
                      >
                        <Feather name="sun" size={normalize(26)} color="white" />
                        <Text style={styles.gridValue}>
                          {appState.airQuality.pm25} µg/m³
                        </Text>
                        <Text style={styles.gridLabel}>PM2.5</Text>
                      </Card>
                    </View>
                  )}
                </View>
              </ImageBackground>

              <ImageBackground
                source={getWeatherImage(appState.weatherData.current.condition)}
                style={styles.specialCardBackground}
              >
                <Card style={styles.specialCard}>
                  <View style={styles.sunTimings}>
                    <View
                      style={styles.sunItem}
                      accessible
                      accessibilityLabel={`Sunrise at ${appState.weatherData.current.sunrise}`}
                    >
                      <Feather
                        name="sunrise"
                        size={normalize(34)}
                        color="white"
                      />
                      <Text style={styles.sunTime}>
                        {appState.weatherData.current.sunrise}
                      </Text>
                      <Text style={styles.sunLabel}>Sunrise</Text>
                    </View>
                    <View
                      style={styles.sunItem}
                      accessible
                      accessibilityLabel={`Sunset at ${appState.weatherData.current.sunset}`}
                    >
                      <Feather name="sunset" size={normalize(34)} color="white" />
                      <Text style={styles.sunTime}>
                        {appState.weatherData.current.sunset}
                      </Text>
                      <Text style={styles.sunLabel}>Sunset</Text>
                    </View>
                  </View>
                </Card>
              </ImageBackground>

              <ImageBackground
                source={getWeatherImage(appState.weatherData.current.condition)}
                style={styles.sectionBackground}
              >
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Hourly Forecast</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {appState.weatherData.forecast.map((item, index) => (
                      <Card
                        key={index}
                        style={styles.hourlyCard}
                        accessible
                        accessibilityLabel={`Hourly forecast at ${item.time}: ${item.temp} degrees ${appState.unit}`}
                      >
                        <Text style={styles.hourlyTime}>{item.time}</Text>
                        <Feather name={item.icon} size={normalize(34)} color="white" />
                        <Text style={styles.hourlyTemp}>
                          {item.temp}°{appState.unit}
                        </Text>
                      </Card>
                    ))}
                  </ScrollView>
                </View>
              </ImageBackground>

              <ImageBackground
                source={getWeatherImage(appState.weatherData.current.condition)}
                style={styles.sectionBackground}
              >
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>7-Day Forecast</Text>
                  {appState.weatherData.weekly.map((day, index) => (
                    <View
                      key={index}
                      style={styles.weeklyItem}
                      accessible
                      accessibilityLabel={`Forecast for ${day.day}: High ${day.high} degrees, Low ${day.low} degrees`}
                    >
                      <Text style={styles.weeklyDay}>{day.day}</Text>
                      <Feather name={day.icon} size={normalize(26)} color="white" />
                      <View style={styles.tempRange}>
                        <Text style={styles.tempHigh}>{day.high}°</Text>
                        <Text style={styles.tempLow}>{day.low}°</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </ImageBackground>
            </ScrollView>
          )}

          <Modal
            visible={appState.showCitiesModal}
            transparent
            animationType="slide"
            accessibilityViewIsModal
          >
            <View style={styles.modalContainer}>
              <View
                style={[
                  styles.modalContent,
                  {
                    backgroundColor:
                      appState.theme === 'light' ? '#1E3A8A' : '#1E293B',
                  },
                ]}
              >
                <Text style={styles.modalTitle}>
                  {translations[appState.language].savedCities}
                </Text>
                <FlatList
                  data={appState.savedCities}
                  renderItem={({ item }) => (
                    <View style={styles.cityItem}>
                      <TouchableOpacity
                        onPress={() => {
                          fetchWeatherByCity(item);
                          setAppState((prev) => ({
                            ...prev,
                            showCitiesModal: false,
                          }));
                        }}
                        accessibilityLabel={`Select city ${item}`}
                      >
                        <Text style={styles.cityText}>{item}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => removeCity(item)}
                        accessibilityLabel={`Remove city ${item}`}
                      >
                        <Feather
                          name="trash-2"
                          size={normalize(20)}
                          color="white"
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                  keyExtractor={(item) => item}
                  ListEmptyComponent={
                    <Text style={styles.emptyText}>No saved cities</Text>
                  }
                />
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() =>
                    setAppState((prev) => ({ ...prev, showCitiesModal: false }))
                  }
                  accessibilityLabel="Close saved cities modal"
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <Modal
            visible={appState.showSettingsModal}
            transparent
            animationType="slide"
            accessibilityViewIsModal
          >
            <View style={styles.modalContainer}>
              <View
                style={[
                  styles.modalContent,
                  {
                    backgroundColor:
                      appState.theme === 'light' ? '#1E3A8A' : '#1E293B',
                  },
                ]}
              >
                <Text style={styles.modalTitle}>
                  {translations[appState.language].settings}
                </Text>
                <View style={styles.settingsItem}>
                  <Text style={styles.settingsText}>Temperature Unit</Text>
                  <TouchableOpacity
                    style={styles.unitToggle}
                    onPress={() =>
                      setAppState((prev) => ({
                        ...prev,
                        unit: prev.unit === 'C' ? 'F' : 'C',
                      }))
                    }
                    accessibilityLabel={`Toggle temperature unit to ${
                      appState.unit === 'C' ? 'Fahrenheit' : 'Celsius'
                    }`}
                  >
                    <Text style={styles.unitToggleText}>
                      {appState.unit === 'C' ? '°C' : '°F'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.settingsItem}>
                  <Text style={styles.settingsText}>Theme</Text>
                  <TouchableOpacity
                    style={styles.unitToggle}
                    onPress={toggleTheme}
                    accessibilityLabel={`Toggle theme to ${
                      appState.theme === 'light' ? 'dark' : 'light'
                    }`}
                  >
                    <Text style={styles.unitToggleText}>
                      {appState.theme === 'light' ? 'Light' : 'Dark'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() =>
                    setAppState((prev) => ({ ...prev, showSettingsModal: false }))
                  }
                  accessibilityLabel="Close settings modal"
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <Modal
            visible={appState.showMapModal}
            transparent
            animationType="slide"
            accessibilityViewIsModal
          >
            <View style={styles.modalContainer}>
              <View
                style={[
                  styles.modalContent,
                  {
                    backgroundColor:
                      appState.theme === 'light' ? '#1E3A8A' : '#1E293B',
                  },
                ]}
              >
                <Text style={styles.modalTitle}>
                  {translations[appState.language].map}
                </Text>
                <Image
                  source={{
                    uri: 'https://www.weather.gov/images/crh/wxmaps/wxmap.png',
                  }}
                  style={styles.mapImage}
                  accessibilityLabel="Weather map"
                />
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() =>
                    setAppState((prev) => ({ ...prev, showMapModal: false }))
                  }
                  accessibilityLabel="Close weather map modal"
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      </ImageBackground>
    </LinearGradient>
  );

  // Main Render
  if (appState.showSplash) {
    return renderSplashScreen();
  }

  if (appState.loading) {
    return (
      <LinearGradient
        colors={
          appState.theme === 'light'
            ? ['#1E3A8A', '#3B82F6']
            : ['#0F172A', '#1E293B']
        }
        style={styles.container}
      >
        <ActivityIndicator
          size="large"
          color="#fff"
          accessibilityLabel="Loading weather data"
        />
        <Text style={styles.loadingText}>
          {translations[appState.language].loading}
        </Text>
      </LinearGradient>
    );
  }

  return renderMainContent();
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  splashContent: {
    alignItems: 'center'
  },
  splashText: {
    color: '#fff',
    fontSize: normalize(48),
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5
  },
  safeArea: {
    flex: 1,
    width: '100%',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  backgroundClouds: {
    flex: 1,
    width: '100%',
    opacity: 0.9
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '5%',
    paddingVertical: '2%'
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: normalize(18),
    padding: normalize(12),
    borderRadius: normalize(25),
    marginRight: normalize(10)
  },
  iconButton: {
    padding: normalize(10),
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: normalize(25),
    marginLeft: normalize(5)
  },
  scrollContent: {
    paddingBottom: normalize(30)
  },
  animationContainer: {
    alignItems: 'center',
    marginVertical: normalize(20)
  },
  currentWeatherBackground: {
    width: '90%',
    padding: normalize(20),
    borderRadius: normalize(25),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5
  },
  currentWeather: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: normalize(20),
    borderRadius: normalize(20)
  },
  locationText: {
    color: '#fff',
    fontSize: normalize(34),
    fontWeight: '300',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5
  },
  temperatureText: {
    color: '#fff',
    fontSize: normalize(90),
    fontWeight: '200',
    marginVertical: normalize(10),
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 8
  },
  conditionText: {
    color: '#fff',
    fontSize: normalize(26),
    fontWeight: '400',
    textTransform: 'capitalize'
  },
  feelsLikeText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: normalize(18),
    marginTop: normalize(5)
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: normalize(15)
  },
  saveButton: {
    flex: 1,
    padding: normalize(12),
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: normalize(20),
    marginRight: normalize(10),
    alignItems: 'center'
  },
  shareButton: {
    flex: 1,
    padding: normalize(12),
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: normalize(20),
    alignItems: 'center'
  },
  saveButtonText: {
    color: '#fff',
    fontSize: normalize(16),
    fontWeight: '600'
  },
  highlightsGridBackground: {
    padding: normalize(20),
    marginHorizontal: '5%',
    borderRadius: normalize(20),
    overflow: 'hidden'
  },
  highlightsGrid: {
    padding: normalize(10),
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: normalize(15)
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: normalize(15)
  },
  gridCard: {
    width: '48%',
    alignItems: 'center',
    padding: normalize(20),
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: normalize(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3
  },
  gridValue: {
    color: '#fff',
    fontSize: normalize(26),
    marginVertical: normalize(8),
    fontWeight: '500'
  },
  gridLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: normalize(16)
  },
  specialCardBackground: {
    marginHorizontal: '5%',
    marginVertical: normalize(20),
    borderRadius: normalize(20),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5
  },
  specialCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: normalize(20)
  },
  sunTimings: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  sunItem: {
    alignItems: 'center'
  },
  sunTime: {
    color: '#fff',
    fontSize: normalize(22),
    marginVertical: normalize(8),
    fontWeight: '500'
  },
  sunLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: normalize(16)
  },
  sectionBackground: {
    marginHorizontal: '5%',
    marginBottom: normalize(25),
    padding: normalize(15),
    borderRadius: normalize(20),
    overflow: 'hidden'
  },
  section: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: normalize(15),
    borderRadius: normalize(15)
  },
  sectionTitle: {
    color: '#fff',
    fontSize: normalize(24),
    marginBottom: normalize(15),
    fontWeight: '600',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3
  },
  hourlyCard: {
    alignItems: 'center',
    padding: normalize(15),
    marginRight: normalize(12),
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: normalize(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3
  },
  hourlyTime: {
    color: '#fff',
    fontSize: normalize(16),
    marginBottom: normalize(8)
  },
  hourlyTemp: {
    color: '#fff',
    fontSize: normalize(20),
    marginTop: normalize(8),
    fontWeight: '500'
  },
  weeklyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: normalize(15),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)'
  },
  weeklyDay: {
    color: '#fff',
    fontSize: normalize(18),
    width: '40%',
    fontWeight: '500'
  },
  tempRange: {
    flexDirection: 'row',
    width: '30%',
    justifyContent: 'space-between'
  },
  tempHigh: {
    color: '#fff',
    fontSize: normalize(18),
    fontWeight: '600'
  },
  tempLow: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: normalize(18)
  },
  loadingText: {
    color: '#fff',
    fontSize: normalize(20),
    marginTop: normalize(20),
    textAlign: 'center'
  },
  errorContainer: {
    margin: normalize(20),
    padding: normalize(15),
    backgroundColor: 'rgba(255,0,0,0.8)',
    borderRadius: normalize(10),
    alignItems: 'center'
  },
  errorText: {
    color: '#fff',
    fontSize: normalize(18),
    textAlign: 'center'
  },
  retryText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: normalize(14),
    marginTop: normalize(5)
  },
  alertContainer: {
    backgroundColor: 'rgba(255,0,0,0.8)',
    padding: normalize(10),
    margin: normalize(20),
    borderRadius: normalize(10)
  },
  alertText: {
    color: '#fff',
    fontSize: normalize(16),
    textAlign: 'center'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    width: '80%',
    padding: normalize(20),
    borderRadius: normalize(15),
    maxHeight: height * 0.7
  },
  modalTitle: {
    color: '#fff',
    fontSize: normalize(24),
    fontWeight: 'bold',
    marginBottom: normalize(15)
  },
  cityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: normalize(15),
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: normalize(10),
    borderRadius: normalize(10)
  },
  cityText: {
    color: '#fff',
    fontSize: normalize(18)
  },
  emptyText: {
    color: '#fff',
    fontSize: normalize(16),
    textAlign: 'center'
  },
  closeButton: {
    marginTop: normalize(20),
    padding: normalize(10),
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: normalize(25),
    alignItems: 'center'
  },
  closeButtonText: {
    color: '#fff',
    fontSize: normalize(16),
    fontWeight: 'bold'
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(20)
  },
  settingsText: {
    color: '#fff',
    fontSize: normalize(18)
  },
  unitToggle: {
    padding: normalize(10),
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: normalize(20) 
  },
  unitToggleText: {
    color: '#fff',
    fontSize: normalize(16),
    fontWeight: 'bold'
  },
  mapImage: {
    width: '100%',
    height: height * 0.4,
    resizeMode: 'contain',
    marginVertical: normalize(20)
  }
});

export default WeatherApp;
