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
} from 'react-native';
import { Card } from 'react-native-paper';
import { MaterialIcons, Feather, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';
const API_KEY = '48c210d00d6b27b4fc091bbb8f3aff29';

const WeatherApp = () => {
  const [location, setLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [unit, setUnit] = useState('C');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedCities, setSavedCities] = useState([]);
  const [showCitiesModal, setShowCitiesModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.8))[0];

  useEffect(() => {
    const loadSavedCities = async () => {
      try {
        const cities = await AsyncStorage.getItem('savedCities');
        if (cities) setSavedCities(JSON.parse(cities));
      } catch (e) {
        console.error('Error loading cities:', e);
      }
    };
    loadSavedCities();
    fetchCurrentLocationWeather();
  }, []);

  useEffect(() => {
    if (location) {
      if (location.includes(',')) {
        fetchWeatherByCity(location.split(',')[0].trim());
      } else {
        fetchCurrentLocationWeather();
      }
    }
  }, [unit]);

  const fetchWeatherByCity = async (city) => {
    try {
      setLoading(true);
      setError(null);

      const weatherUrl = `${WEATHER_URL}?q=${city}&appid=${API_KEY}&units=${unit === 'C' ? 'metric' : 'imperial'}`;
      const weatherResponse = await fetch(weatherUrl);
      if (!weatherResponse.ok) throw new Error('City not found');
      const weatherJson = await weatherResponse.json();

      const forecastUrl = `${FORECAST_URL}?q=${city}&appid=${API_KEY}&units=${unit === 'C' ? 'metric' : 'imperial'}`;
      const forecastResponse = await fetch(forecastUrl);
      if (!forecastResponse.ok) throw new Error('Forecast not available');
      const forecastJson = await forecastResponse.json();

      setLocation(`${weatherJson.name}, ${weatherJson.sys.country}`);
      processWeatherData(weatherJson, forecastJson);
    } catch (err) {
      setError(err.message || 'Unable to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentLocationWeather = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission denied');
      }

      let position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = position.coords;

      let locationData = await Location.reverseGeocodeAsync({ latitude, longitude });
      const city = locationData[0]?.city || 'Unknown City';
      const country = locationData[0]?.country || 'Unknown Country';
      const fullLocation = `${city}, ${country}`;
      setLocation(fullLocation);

      const weatherUrl = `${WEATHER_URL}?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=${unit === 'C' ? 'metric' : 'imperial'}`;
      const weatherResponse = await fetch(weatherUrl);
      const weatherJson = await weatherResponse.json();

      const forecastUrl = `${FORECAST_URL}?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=${unit === 'C' ? 'metric' : 'imperial'}`;
      const forecastResponse = await fetch(forecastUrl);
      const forecastJson = await forecastResponse.json();

      processWeatherData(weatherJson, forecastJson);
    } catch (err) {
      setError(err.message || 'Unable to fetch weather data');
    } finally {
      setLoading(false);
    }
  }, [unit]);

  const processWeatherData = (weatherJson, forecastJson) => {
    setWeatherData({
      current: {
        temp: Math.round(weatherJson.main.temp),
        condition: weatherJson.weather[0].main,
        humidity: weatherJson.main.humidity,
        windSpeed: Math.round(weatherJson.wind.speed * 3.6),
        visibility: weatherJson.visibility / 1000,
        feelsLike: Math.round(weatherJson.main.feels_like),
        pressure: weatherJson.main.pressure,
        sunrise: new Date(weatherJson.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sunset: new Date(weatherJson.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      forecast: forecastJson.list.slice(0, 6).map((item) => ({
        time: new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        temp: Math.round(item.main.temp),
        icon: getWeatherIcon(item.weather[0].main),
      })),
      weekly: forecastJson.list
        .filter((_, i) => i % 8 === 0)
        .slice(0, 7)
        .map((item) => ({
          day: new Date(item.dt * 1000).toLocaleDateString([], { weekday: 'long' }),
          high: Math.round(item.main.temp_max),
          low: Math.round(item.main.temp_min),
          icon: getWeatherIcon(item.weather[0].main),
        })),
    });
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
    const newCities = savedCities.filter(c => c !== city);
    setSavedCities(newCities);
    await AsyncStorage.setItem('savedCities', JSON.stringify(newCities));
  };

  const getWeatherIcon = (condition) => {
    switch (condition.toLowerCase()) {
      case 'clear': return 'sun';
      case 'clouds': return 'cloud';
      case 'rain': return 'cloud-rain';
      case 'thunderstorm': return 'bolt';
      case 'snow': return 'snowflake';
      case 'drizzle': return 'cloud-drizzle';
      default: return 'cloud';
    }
  };

  const getWeatherImage = (condition) => {
    switch (condition.toLowerCase()) {
      case 'clear': return { uri: 'https://www.photowall.fr/media/catalog/product/cache/1/thumbnail/9df78eab33525d08d6e5fb8d27136e95/p/o/poster-sunny-day-9448.jpg' };
      case 'clouds': return { uri: 'https://plus.unsplash.com/premium_photo-1667689956673-8737a299aa8c?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y2xvdWR5JTIwc2t5fGVufDB8fDB8fHww' };
      case 'rain': case 'drizzle': return { uri: 'https://sites.psu.edu/siowfa16/files/2016/10/rain-02-1ac722l.jpg' };
      case 'thunderstorm': return { uri: 'https://living.geico.com/wp-content/uploads/geico-more-Thunderstorms-post-2016.jpg' };
      default: return { uri: 'https://plus.unsplash.com/premium_photo-1667689956673-8737a299aa8c?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y2xvdWR5JTIwc2t5fGVufDB8fDB8fHww' };
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#1E3A8A', '#3B82F6']} style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Fetching Your Weather...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#1E3A8A', '#3B82F6', '#93C5FD']} style={styles.container}>
      <ImageBackground source={weatherData ? getWeatherImage(weatherData.current.condition) : null} style={styles.backgroundClouds}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search City"
              placeholderTextColor="rgba(255,255,255,0.7)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity style={styles.iconButton} onPress={() => setShowCitiesModal(true)}>
              <Feather name="list" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => setShowSettingsModal(true)}>
              <Feather name="settings" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          {weatherData && (
            <ScrollView showsVerticalScrollIndicator={false}>
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
                  </View>
                </ImageBackground>
              </Animated.View>

              <ImageBackground source={getWeatherImage(weatherData.current.condition)} style={styles.highlightsGridBackground}>
                <View style={styles.highlightsGrid}>
                  <View style={styles.gridRow}>
                    <Card style={styles.gridCard}>
                      <Feather name="wind" size={30} color="white" />
                      <Text style={styles.gridValue}>{weatherData.current.windSpeed} km/h</Text>
                      <Text style={styles.gridLabel}>Wind Speed</Text>
                    </Card>
                    <Card style={styles.gridCard}>
                      <FontAwesome5 name="temperature-high" size={26} color="white" />
                      <Text style={styles.gridValue}>{weatherData.current.pressure} hPa</Text>
                      <Text style={styles.gridLabel}>Pressure</Text>
                    </Card>
                  </View>
                  <View style={styles.gridRow}>
                    <Card style={styles.gridCard}>
                      <Feather name="droplet" size={26} color="white" />
                      <Text style={styles.gridValue}>{weatherData.current.humidity}%</Text>
                      <Text style={styles.gridLabel}>Humidity</Text>
                    </Card>
                    <Card style={styles.gridCard}>
                      <Feather name="eye" size={26} color="white" />
                      <Text style={styles.gridValue}>{weatherData.current.visibility} km</Text>
                      <Text style={styles.gridLabel}>Visibility</Text>
                    </Card>
                  </View>
                </View>
              </ImageBackground>

              <ImageBackground source={getWeatherImage(weatherData.current.condition)} style={styles.specialCardBackground}>
                <Card style={styles.specialCard}>
                  <View style={styles.sunTimings}>
                    <View style={styles.sunItem}>
                      <Feather name="sunrise" size={34} color="white" />
                      <Text style={styles.sunTime}>{weatherData.current.sunrise}</Text>
                      <Text style={styles.sunLabel}>Sunrise</Text>
                    </View>
                    <View style={styles.sunItem}>
                      <Feather name="sunset" size={34} color="white" />
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
                        <Feather name={item.icon} size={34} color="white" />
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
                      <Feather name={day.icon} size={26} color="white" />
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
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Saved Cities</Text>
                <FlatList
                  data={savedCities}
                  renderItem={({ item }) => (
                    <View style={styles.cityItem}>
                      <TouchableOpacity onPress={() => { fetchWeatherByCity(item); setShowCitiesModal(false); }}>
                        <Text style={styles.cityText}>{item}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => removeCity(item)}>
                        <Feather name="trash-2" size={20} color="white" />
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
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Settings</Text>
                <View style={styles.settingsItem}>
                  <Text style={styles.settingsText}>Temperature Unit</Text>
                  <TouchableOpacity
                    style={styles.unitToggle}
                    onPress={() => {
                      const newUnit = unit === 'C' ? 'F' : 'C';
                      setUnit(newUnit);
                      setShowSettingsModal(false);
                    }}
                  >
                    <Text style={styles.unitToggleText}>{unit === 'C' ? '°C' : '°F'}</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.closeButton} onPress={() => setShowSettingsModal(false)}>
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, width: '100%', marginTop: 40 },
  backgroundClouds: { flex: 1, width: '100%', opacity: 0.85 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    marginRight: 10,
  },
  iconButton: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    marginLeft: 5,
  },
  animationContainer: { alignItems: 'center', marginVertical: 20 },
  currentWeatherBackground: { padding: 20, borderRadius: 25, overflow: 'hidden' },
  currentWeather: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 15,
    borderRadius: 20,
  },
  locationText: { color: '#fff', fontSize: 34, fontWeight: '300', textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 5 },
  temperatureText: { color: '#fff', fontSize: 90, fontWeight: '200', marginVertical: 10, textShadowColor: '#000', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 8 },
  conditionText: { color: '#fff', fontSize: 26, fontWeight: '400', textTransform: 'capitalize' },
  feelsLikeText: { color: 'rgba(255,255,255,0.9)', fontSize: 18, marginTop: 5 },
  saveButton: { marginTop: 10, padding: 10, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 20 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  highlightsGridBackground: { padding: 20, marginHorizontal: 10, borderRadius: 20, overflow: 'hidden' },
  highlightsGrid: { padding: 10, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 15 },
  gridRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  gridCard: { width: '48%', alignItems: 'center', padding: 20, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 5 },
  gridValue: { color: '#fff', fontSize: 26, marginVertical: 8, fontWeight: '500' },
  gridLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 16 },
  specialCardBackground: { marginHorizontal: 15, marginVertical: 20, borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10 },
  specialCard: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 20 },
  sunTimings: { flexDirection: 'row', justifyContent: 'space-around' },
  sunItem: { alignItems: 'center' },
  sunTime: { color: '#fff', fontSize: 22, marginVertical: 8, fontWeight: '500' },
  sunLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 16 },
  sectionBackground: { marginHorizontal: 15, marginBottom: 25, padding: 15, borderRadius: 20, overflow: 'hidden' },
  section: { backgroundColor: 'rgba(0,0,0,0.2)', padding: 15, borderRadius: 15 },
  sectionTitle: { color: '#fff', fontSize: 24, marginBottom: 15, fontWeight: '600', textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  hourlyCard: { alignItems: 'center', padding: 15, marginRight: 12, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 5 },
  hourlyTime: { color: '#fff', fontSize: 16, marginBottom: 8 },
  hourlyTemp: { color: '#fff', fontSize: 20, marginTop: 8, fontWeight: '500' },
  weeklyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)' },
  weeklyDay: { color: '#fff', fontSize: 18, width: 100, fontWeight: '500' },
  tempRange: { flexDirection: 'row', width: 90, justifyContent: 'space-between' },
  tempHigh: { color: '#fff', fontSize: 18, fontWeight: '600' },
  tempLow: { color: 'rgba(255,255,255,0.7)', fontSize: 18 },
  loadingText: { color: '#fff', fontSize: 20, marginTop: 20, textAlign: 'center' },
  errorText: { color: '#fff', fontSize: 18, textAlign: 'center', padding: 20 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '80%', backgroundColor: '#1E3A8A', padding: 20, borderRadius: 15 },
  modalTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
  cityItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 10, borderRadius: 10 },
  cityText: { color: '#fff', fontSize: 18 },
  emptyText: { color: '#fff', fontSize: 16, textAlign: 'center' },
  closeButton: { marginTop: 20, padding: 10, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 25, alignItems: 'center' },
  closeButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  settingsItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  settingsText: { color: '#fff', fontSize: 18 },
  unitToggle: { padding: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20 },
  unitToggleText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default WeatherApp;
