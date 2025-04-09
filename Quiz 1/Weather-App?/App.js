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
} from 'react-native';
import { Card } from 'react-native-paper';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';
const AIR_QUALITY_URL = 'https://api.openweathermap.org/data/2.5/air_pollution';
const API_KEY = '48c210d00d6b27b4fc091bbb8f3aff29';

const { width, height } = Dimensions.get('window');

const WeatherApp = () => {
  const [location, setLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [unit, setUnit] = useState('C');
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  const [weatherData, setWeatherData] = useState(null);
  const [rawWeatherData, setRawWeatherData] = useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedCities, setSavedCities] = useState([]);
  const [showCitiesModal, setShowCitiesModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.8))[0];

  useEffect(() => {
    const loadData = async () => {
      try {
        const cities = await AsyncStorage.getItem('savedCities');
        const savedTheme = await AsyncStorage.getItem('theme');
        const savedLanguage = await AsyncStorage.getItem('language');
        if (cities) setSavedCities(JSON.parse(cities));
        if (savedTheme) setTheme(savedTheme);
        if (savedLanguage) setLanguage(savedLanguage);
      } catch (e) {
        console.error('Error loading data:', e);
      }
      fetchCurrentLocationWeather();
    };
    loadData();
  }, []);

  const toFahrenheit = (celsius) => Math.round((celsius * 9) / 5 + 32);

  const processWeatherData = (weatherJson, forecastJson) => {
    const convertTemp = (temp) => (unit === 'F' ? toFahrenheit(temp) : Math.round(temp));

    const rawData = {
      current: {
        temp: weatherJson.main.temp,
        condition: weatherJson.weather[0].main,
        humidity: weatherJson.main.humidity,
        windSpeed: weatherJson.wind.speed * 3.6,
        visibility: weatherJson.visibility / 1000,
        feelsLike: weatherJson.main.feels_like,
        pressure: weatherJson.main.pressure,
        sunrise: new Date(weatherJson.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sunset: new Date(weatherJson.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      forecast: forecastJson.list.slice(0, 6).map((item) => ({
        time: new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        temp: item.main.temp,
        icon: getWeatherIcon(item.weather[0].main),
      })),
      weekly: forecastJson.list
        .filter((_, i) => i % 8 === 0)
        .slice(0, 7)
        .map((item) => ({
          day: new Date(item.dt * 1000).toLocaleDateString([], { weekday: 'long' }),
          high: item.main.temp_max,
          low: item.main.temp_min,
          icon: getWeatherIcon(item.weather[0].main),
        })),
    };

    console.log('Current Weather Condition:', rawData.current.condition);

    setRawWeatherData(rawData);

    setWeatherData({
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
    });
  };

  useEffect(() => {
    if (rawWeatherData) {
      const convertTemp = (temp) => (unit === 'F' ? toFahrenheit(temp) : Math.round(temp));
      setWeatherData({
        current: {
          ...rawWeatherData.current,
          temp: convertTemp(rawWeatherData.current.temp),
          windSpeed: Math.round(rawWeatherData.current.windSpeed),
          feelsLike: convertTemp(rawWeatherData.current.feelsLike),
        },
        forecast: rawWeatherData.forecast.map((item) => ({
          ...item,
          temp: convertTemp(item.temp),
        })),
        weekly: rawWeatherData.weekly.map((item) => ({  // Fixed: Changed 'rawData' to 'rawWeatherData'
          ...item,
          high: convertTemp(item.high),
          low: convertTemp(item.low),
        })),
      });
    }
  }, [unit, rawWeatherData]);

  const fetchCurrentLocationWeather = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied. Please enable it in settings.');
        return;
      }

      let position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = position.coords;

      let locationData = await Location.reverseGeocodeAsync({ latitude, longitude });
      let city = locationData[0]?.city;
      let country = locationData[0]?.country;

      if (!city || !country) {
        const weatherUrl = `${WEATHER_URL}?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
        const response = await fetch(weatherUrl);
        if (response.ok) {
          const weatherJson = await response.json();
          city = weatherJson.name || 'My City';
          country = weatherJson.sys.country || '';
        }
      }

      const fullLocation = `${city}, ${country}`;
      setLocation(fullLocation);

      await fetchWeatherData(latitude, longitude, fullLocation);
    } catch (err) {
      setError(err.message || 'Unable to fetch current location weather');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWeatherByCity = async (city) => {
    try {
      setLoading(true);
      setError(null);

      const weatherUrl = `${WEATHER_URL}?q=${city}&appid=${API_KEY}&units=metric`;
      const response = await fetch(weatherUrl);
      if (!response.ok) throw new Error('City not found');
      const weatherJson = await response.json();

      const { lat, lon } = weatherJson.coord;
      const fullLocation = `${weatherJson.name}, ${weatherJson.sys.country}`;
      setLocation(fullLocation);

      await fetchWeatherData(lat, lon, fullLocation);
    } catch (err) {
      setError(err.message || 'Unable to fetch weather data for this city');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherData = async (lat, lon, loc) => {
    const weatherUrl = `${WEATHER_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    const forecastUrl = `${FORECAST_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    const airQualityUrl = `${AIR_QUALITY_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    const [weatherResponse, forecastResponse, airQualityResponse] = await Promise.all([
      fetch(weatherUrl),
      fetch(forecastUrl),
      fetch(airQualityUrl),
    ]);

    if (!weatherResponse.ok || !forecastResponse.ok) throw new Error('Weather data not found');
    const weatherJson = await weatherResponse.json();
    const forecastJson = await forecastResponse.json();
    const airQualityJson = await airQualityResponse.json();

    processWeatherData(weatherJson, forecastJson);
    setAirQuality({
      aqi: airQualityJson.list[0].main.aqi,
      pm25: airQualityJson.list[0].components.pm2_5,
    });
    checkWeatherAlerts(weatherJson);
  };

  const checkWeatherAlerts = (weatherJson) => {
    if (weatherJson.weather[0].main === 'Thunderstorm' || weatherJson.main.temp > 35) {
      setAlerts([...alerts, `Alert: Severe ${weatherJson.weather[0].main} in ${weatherJson.name}!`]);
    }
  };

  useEffect(() => {
    if (weatherData) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
      ]).start();
    }
  }, [weatherData]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      fetchWeatherByCity(searchQuery.trim());
      setSearchQuery('');
    }
  };

  const saveCity = async () => {
    if (location && !savedCities.includes(location)) {
      const newCities = [...savedCities, location];
      setSavedCities(newCities);
      await AsyncStorage.setItem('savedCities', JSON.stringify(newCities));
    }
  };

  const removeCity = async (city) => {
    const newCities = savedCities.filter((c) => c !== city);
    setSavedCities(newCities);
    await AsyncStorage.setItem('savedCities', JSON.stringify(newCities));
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    await AsyncStorage.setItem('theme', newTheme);
  };

  const shareWeather = async () => {
    if (!weatherData) {
      setError('No weather data available to share.');
      return;
    }
    try {
      const message = `${translations[language].currentWeather} ${location}: ${weatherData.current.temp}°${unit}, ${weatherData.current.condition}`;
      const result = await Share.share({
        message,
        title: 'Current Weather',
      });
      if (result.action === Share.sharedAction) {
        console.log('Weather shared successfully');
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (err) {
      setError('Failed to share weather: ' + err.message);
    }
  };

  const getWeatherIcon = (condition) => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return 'sun';
      case 'clouds':
        return 'cloud';
      case 'rain':
        return 'cloud-rain';
      case 'thunderstorm':
        return 'bolt';
      case 'snow':
        return 'snowflake';
      case 'drizzle':
        return 'cloud-drizzle';
      case 'mist':
      case 'fog':
        return 'cloud-drizzle';
      default:
        return 'cloud';
    }
  };

  const getWeatherImage = (condition) => {
    const weatherCondition = condition ? condition.toLowerCase() : 'default';
    console.log('Applying Background for Condition:', weatherCondition);

    switch (weatherCondition) {
      case 'clear': // Sunny
        return { uri: 'https://gazettengr.com/wp-content/uploads/sunny-weather.jpg' };
      case 'clouds': // Cloudy
        return { uri: 'https://images.theconversation.com/files/228393/original/file-20180719-142423-4065mr.jpg' };
      case 'rain':
        return { uri: 'https://images.unsplash.com/photo-1534278932256-1f58bf9ba745?q=80&w=2070&auto=format&fit=crop' };
      case 'thunderstorm':
        return { uri: 'https://images.unsplash.com/photo-1605727216801-0262d6c5589b?q=80&w=2070&auto=format&fit=crop' };
      case 'snow': // Snowy
        return { uri: 'https://wem.wi.gov/wp-content/uploads/2024-Winter-Weather-Week.png' };
      case 'drizzle':
        return { uri: 'https://images.unsplash.com/photo-1558401386-9259e9fb26f5?q=80&w=2070&auto=format&fit=crop' };
      case 'mist':
      case 'fog':
        return { uri: 'https://images.unsplash.com/photo-1542273917-e526df677c43?q=80&w=2070&auto=format&fit=crop' };
      default:
        return { uri: 'https://images.unsplash.com/photo-1531147646552-1f58bf9ba745?q=80&w=2070&auto=format&fit=crop' };
    }
  };

  const translations = {
    en: { currentWeather: 'Current Weather in', settings: 'Settings', savedCities: 'Saved Cities', map: 'Weather Map', share: 'Share Weather' },
    es: { currentWeather: 'Clima actual en', settings: 'Configuración', savedCities: 'Ciudades guardadas', map: 'Mapa del clima', share: 'Compartir clima' },
    fr: { currentWeather: 'Météo actuelle à', settings: 'Paramètres', savedCities: 'Villes enregistrées', map: 'Carte météo', share: 'Partager la météo' },
  };

  if (loading) {
    return (
      <LinearGradient colors={theme === 'light' ? ['#1E3A8A', '#3B82F6'] : ['#0F172A', '#1E293B']} style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading Weather...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={theme === 'light' ? ['#1E3A8A', '#3B82F6', '#93C5FD'] : ['#0F172A', '#1E293B', '#475569']} style={styles.container}>
      <ImageBackground
        source={weatherData ? getWeatherImage(weatherData.current.condition) : getWeatherImage('default')}
        style={styles.backgroundClouds}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TextInput
              style={[styles.searchInput, { backgroundColor: theme === 'light' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)' }]}
              placeholder="Search City"
              placeholderTextColor={theme === 'light' ? 'rgba(255,255,255,0.7)' : '#D1D5DB'}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity style={styles.iconButton} onPress={handleSearch}>
              <Feather name="search" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => setShowCitiesModal(true)}>
              <Feather name="list" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => setShowSettingsModal(true)}>
              <Feather name="settings" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => setShowMapModal(true)}>
              <Feather name="map" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}
          {alerts.length > 0 && (
            <View style={styles.alertContainer}>
              <Text style={styles.alertText}>{alerts[alerts.length - 1]}</Text>
            </View>
          )}

          {weatherData && (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              <Animated.View style={[styles.animationContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                <ImageBackground source={getWeatherImage(weatherData.current.condition)} style={styles.currentWeatherBackground}>
                  <View style={styles.currentWeather}>
                    <Text style={styles.locationText}>{location}</Text>
                    <Text style={styles.temperatureText}>{weatherData.current.temp}°{unit}</Text>
                    <Text style={styles.conditionText}>{weatherData.current.condition}</Text>
                    <Text style={styles.feelsLikeText}>Feels like {weatherData.current.feelsLike}°{unit}</Text>
                    <TouchableOpacity style={styles.saveButton} onPress={saveCity}>
                      <Text style={styles.saveButtonText}>Save City</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.shareButton} onPress={shareWeather}>
                      <Text style={styles.saveButtonText}>{translations[language].share}</Text>
                    </TouchableOpacity>
                  </View>
                </ImageBackground>
              </Animated.View>

              <ImageBackground source={getWeatherImage(weatherData.current.condition)} style={styles.highlightsGridBackground}>
                <View style={styles.highlightsGrid}>
                  <View style={styles.gridRow}>
                    <Card style={styles.gridCard}>
                      <Feather name="wind" size={normalize(30)} color="white" />
                      <Text style={styles.gridValue}>{weatherData.current.windSpeed} km/h</Text>
                      <Text style={styles.gridLabel}>Wind Speed</Text>
                    </Card>
                    <Card style={styles.gridCard}>
                      <FontAwesome5 name="temperature-high" size={normalize(26)} color="white" />
                      <Text style={styles.gridValue}>{weatherData.current.pressure} hPa</Text>
                      <Text style={styles.gridLabel}>Pressure</Text>
                    </Card>
                  </View>
                  <View style={styles.gridRow}>
                    <Card style={styles.gridCard}>
                      <Feather name="droplet" size={normalize(26)} color="white" />
                      <Text style={styles.gridValue}>{weatherData.current.humidity}%</Text>
                      <Text style={styles.gridLabel}>Humidity</Text>
                    </Card>
                    <Card style={styles.gridCard}>
                      <Feather name="eye" size={normalize(26)} color="white" />
                      <Text style={styles.gridValue}>{weatherData.current.visibility} km</Text>
                      <Text style={styles.gridLabel}>Visibility</Text>
                    </Card>
                  </View>
                  {airQuality && (
                    <View style={styles.gridRow}>
                      <Card style={styles.gridCard}>
                        <Feather name="cloud" size={normalize(26)} color="white" />
                        <Text style={styles.gridValue}>AQI {airQuality.aqi}</Text>
                        <Text style={styles.gridLabel}>Air Quality</Text>
                      </Card>
                      <Card style={styles.gridCard}>
                        <Feather name="sun" size={normalize(26)} color="white" />
                        <Text style={styles.gridValue}>{airQuality.pm25} µg/m³</Text>
                        <Text style={styles.gridLabel}>PM2.5</Text>
                      </Card>
                    </View>
                  )}
                </View>
              </ImageBackground>

              <ImageBackground source={getWeatherImage(weatherData.current.condition)} style={styles.specialCardBackground}>
                <Card style={styles.specialCard}>
                  <View style={styles.sunTimings}>
                    <View style={styles.sunItem}>
                      <Feather name="sunrise" size={normalize(34)} color="white" />
                      <Text style={styles.sunTime}>{weatherData.current.sunrise}</Text>
                      <Text style={styles.sunLabel}>Sunrise</Text>
                    </View>
                    <View style={styles.sunItem}>
                      <Feather name="sunset" size={normalize(34)} color="white" />
                      <Text style={styles.sunTime}>{weatherData.current.sunset}</Text>
                      <Text style={styles.sunLabel}>Sunset</Text>
                    </View>
                  </View>
                </Card>
              </ImageBackground>

              <ImageBackground source={getWeatherImage(weatherData.current.condition)} style={styles.sectionBackground}>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Hourly Forecast</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {weatherData.forecast.map((item, index) => (
                      <Card key={index} style={styles.hourlyCard}>
                        <Text style={styles.hourlyTime}>{item.time}</Text>
                        <Feather name={item.icon} size={normalize(34)} color="white" />
                        <Text style={styles.hourlyTemp}>{item.temp}°{unit}</Text>
                      </Card>
                    ))}
                  </ScrollView>
                </View>
              </ImageBackground>

              <ImageBackground source={getWeatherImage(weatherData.current.condition)} style={styles.sectionBackground}>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>7-Day Forecast</Text>
                  {weatherData.weekly.map((day, index) => (
                    <View key={index} style={styles.weeklyItem}>
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

          <Modal visible={showCitiesModal} transparent animationType="slide">
            <View style={styles.modalContainer}>
              <View style={[styles.modalContent, { backgroundColor: theme === 'light' ? '#1E3A8A' : '#1E293B' }]}>
                <Text style={styles.modalTitle}>{translations[language].savedCities}</Text>
                <FlatList
                  data={savedCities}
                  renderItem={({ item }) => (
                    <View style={styles.cityItem}>
                      <TouchableOpacity
                        onPress={() => {
                          fetchWeatherByCity(item);
                          setShowCitiesModal(false);
                        }}
                      >
                        <Text style={styles.cityText}>{item}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => removeCity(item)}>
                        <Feather name="trash-2" size={normalize(20)} color="white" />
                      </TouchableOpacity>
                    </View>
                  )}
                  keyExtractor={(item) => item}
                  ListEmptyComponent={<Text style={styles.emptyText}>No saved cities</Text>}
                />
                <TouchableOpacity style={styles.closeButton} onPress={() => setShowCitiesModal(false)}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <Modal visible={showSettingsModal} transparent animationType="slide">
            <View style={styles.modalContainer}>
              <View style={[styles.modalContent, { backgroundColor: theme === 'light' ? '#1E3A8A' : '#1E293B' }]}>
                <Text style={styles.modalTitle}>{translations[language].settings}</Text>
                <View style={styles.settingsItem}>
                  <Text style={styles.settingsText}>Temperature Unit</Text>
                  <TouchableOpacity style={styles.unitToggle} onPress={() => setUnit(unit === 'C' ? 'F' : 'C')}>
                    <Text style={styles.unitToggleText}>{unit === 'C' ? '°C' : '°F'}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.settingsItem}>
                  <Text style={styles.settingsText}>Theme</Text>
                  <TouchableOpacity style={styles.unitToggle} onPress={toggleTheme}>
                    <Text style={styles.unitToggleText}>{theme === 'light' ? 'Light' : 'Dark'}</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.closeButton} onPress={() => setShowSettingsModal(false)}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <Modal visible={showMapModal} transparent animationType="slide">
            <View style={styles.modalContainer}>
              <View style={[styles.modalContent, { backgroundColor: theme === 'light' ? '#1E3A8A' : '#1E293B' }]}>
                <Text style={styles.modalTitle}>{translations[language].map}</Text>
                <Image source={{ uri: 'https://www.weather.gov/images/crh/wxmaps/wxmap.png' }} style={styles.mapImage} />
                <TouchableOpacity style={styles.closeButton} onPress={() => setShowMapModal(false)}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      </ImageBackground>
    </LinearGradient>
  );
};

const normalize = (size) => {
  const scale = width / 360;
  const newSize = size * scale;
  return Math.round(newSize);
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, width: '100%', paddingTop: Platform.OS === 'android' ? 25 : 0 },
  backgroundClouds: { flex: 1, width: '100%', opacity: 0.85 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: '5%', paddingVertical: '2%' },
  searchInput: { flex: 1, color: '#fff', fontSize: normalize(18), padding: normalize(10), borderRadius: normalize(25), marginRight: normalize(10) },
  iconButton: { padding: normalize(10), backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: normalize(25), marginLeft: normalize(5) },
  scrollContent: { paddingBottom: normalize(20) },
  animationContainer: { alignItems: 'center', marginVertical: normalize(20) },
  currentWeatherBackground: { width: '90%', padding: normalize(20), borderRadius: normalize(25), overflow: 'hidden' },
  currentWeather: { alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', padding: normalize(15), borderRadius: normalize(20) },
  locationText: { color: '#fff', fontSize: normalize(34), fontWeight: '300', textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 5 },
  temperatureText: { color: '#fff', fontSize: normalize(90), fontWeight: '200', marginVertical: normalize(10), textShadowColor: '#000', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 8 },
  conditionText: { color: '#fff', fontSize: normalize(26), fontWeight: '400', textTransform: 'capitalize' },
  feelsLikeText: { color: 'rgba(255,255,255,0.9)', fontSize: normalize(18), marginTop: normalize(5) },
  saveButton: { marginTop: normalize(10), padding: normalize(10), backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: normalize(20) },
  shareButton: { marginTop: normalize(10), padding: normalize(10), backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: normalize(20) },
  saveButtonText: { color: '#fff', fontSize: normalize(16), fontWeight: 'bold' },
  highlightsGridBackground: { padding: normalize(20), marginHorizontal: '5%', borderRadius: normalize(20), overflow: 'hidden' },
  highlightsGrid: { padding: normalize(10), backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: normalize(15) },
  gridRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: normalize(15) },
  gridCard: { width: '48%', alignItems: 'center', padding: normalize(20), backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: normalize(15), shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 5 },
  gridValue: { color: '#fff', fontSize: normalize(26), marginVertical: normalize(8), fontWeight: '500' },
  gridLabel: { color: 'rgba(255,255,255,0.9)', fontSize: normalize(16) },
  specialCardBackground: { marginHorizontal: '5%', marginVertical: normalize(20), borderRadius: normalize(20), overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10 },
  specialCard: { backgroundColor: 'rgba(255,255,255,0.2)', padding: normalize(20) },
  sunTimings: { flexDirection: 'row', justifyContent: 'space-around' },
  sunItem: { alignItems: 'center' },
  sunTime: { color: '#fff', fontSize: normalize(22), marginVertical: normalize(8), fontWeight: '500' },
  sunLabel: { color: 'rgba(255,255,255,0.9)', fontSize: normalize(16) },
  sectionBackground: { marginHorizontal: '5%', marginBottom: normalize(25), padding: normalize(15), borderRadius: normalize(20), overflow: 'hidden' },
  section: { backgroundColor: 'rgba(0,0,0,0.2)', padding: normalize(15), borderRadius: normalize(15) },
  sectionTitle: { color: '#fff', fontSize: normalize(24), marginBottom: normalize(15), fontWeight: '600', textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  hourlyCard: { alignItems: 'center', padding: normalize(15), marginRight: normalize(12), backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: normalize(15), shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 5 },
  hourlyTime: { color: '#fff', fontSize: normalize(16), marginBottom: normalize(8) },
  hourlyTemp: { color: '#fff', fontSize: normalize(20), marginTop: normalize(8), fontWeight: '500' },
  weeklyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: normalize(15), borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)' },
  weeklyDay: { color: '#fff', fontSize: normalize(18), width: '40%', fontWeight: '500' },
  tempRange: { flexDirection: 'row', width: '30%', justifyContent: 'space-between' },
  tempHigh: { color: '#fff', fontSize: normalize(18), fontWeight: '600' },
  tempLow: { color: 'rgba(255,255,255,0.7)', fontSize: normalize(18) },
  loadingText: { color: '#fff', fontSize: normalize(20), marginTop: normalize(20), textAlign: 'center' },
  errorText: { color: '#fff', fontSize: normalize(18), textAlign: 'center', padding: normalize(20) },
  alertContainer: { backgroundColor: 'rgba(255,0,0,0.8)', padding: normalize(10), margin: normalize(20), borderRadius: normalize(10) },
  alertText: { color: '#fff', fontSize: normalize(16), textAlign: 'center' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '80%', padding: normalize(20), borderRadius: normalize(15), maxHeight: height * 0.7 },
  modalTitle: { color: '#fff', fontSize: normalize(24), fontWeight: 'bold', marginBottom: normalize(15) },
  cityItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: normalize(15), backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: normalize(10), borderRadius: normalize(10) },
  cityText: { color: '#fff', fontSize: normalize(18) },
  emptyText: { color: '#fff', fontSize: normalize(16), textAlign: 'center' },
  closeButton: { marginTop: normalize(20), padding: normalize(10), backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: normalize(25), alignItems: 'center' },
  closeButtonText: { color: '#fff', fontSize: normalize(16), fontWeight: 'bold' },
  settingsItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: normalize(20) },
  settingsText: { color: '#fff', fontSize: normalize(18) },
  unitToggle: { padding: normalize(10), backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: normalize(20) },
  unitToggleText: { color: '#fff', fontSize: normalize(16), fontWeight: 'bold' },
  mapImage: { width: '100%', height: height * 0.4, resizeMode: 'contain', marginVertical: normalize(20) },
});

export default WeatherApp;