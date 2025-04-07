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
  Modal,
  FlatList,
} from 'react-native';
import { Card } from 'react-native-paper';
import { MaterialIcons, Feather, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';

const WeatherApp = () => {
  const [location, setLocation] = useState('Fetching Location...');
  const [unit, setUnit] = useState('C');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cities, setCities] = useState([]);
  const [showCityModal, setShowCityModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.8))[0];

  const WEATHERAPI_KEY = 'f67c1ee7e52f4449a4f111031250704'; // Your WeatherAPI.com key

  const fetchLocationAndWeather = useCallback(async (lat, lon, cityName = null) => {
    try {
      setLoading(true);
      setError(null);

      let latitude = lat;
      let longitude = lon;
      let fullLocation = cityName;

      if (!lat || !lon) {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          throw new Error('Location permission denied. Please enable it in settings.');
        }

        let position;
        try {
          position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.BestForNavigation });
        } catch (e) {
          position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
          console.warn('BestForNavigation failed, using High accuracy:', e);
        }
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;

        let locationData = await Location.reverseGeocodeAsync({ latitude, longitude });
        const city = locationData[0]?.city || 
                     locationData[0]?.district || 
                     locationData[0]?.subregion || 
                     locationData[0]?.name || 
                     'Unknown City';
        const country = locationData[0]?.country || 
                        locationData[0]?.isoCountryCode || 
                        'Unknown Country';
        fullLocation = `${city}, ${country}`;
        setLocation(fullLocation);
      } else {
        setLocation(fullLocation);
      }

      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,pressure_msl&hourly=temperature_2m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto&temperature_unit=${unit === 'C' ? 'celsius' : 'fahrenheit'}`;
      const response = await fetch(weatherUrl);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch weather data. Status: ${response.status}, Response: ${errorText}`);
      }
      const data = await response.json();

      const currentTime = new Date();
      setWeatherData({
        current: {
          temp: Math.round(data.current.temperature_2m),
          condition: getConditionFromCode(data.current.weather_code),
          humidity: data.current.relative_humidity_2m,
          windSpeed: Math.round(data.current.wind_speed_10m),
          visibility: 10,
          feelsLike: Math.round(data.current.temperature_2m),
          pressure: Math.round(data.current.pressure_msl),
          sunrise: new Date(data.daily.sunrise[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sunset: new Date(data.daily.sunset[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        forecast: Array(6).fill().map((_, i) => ({
          time: new Date(currentTime.getTime() + i * 2 * 60 * 60 * 1000).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          temp: Math.round(data.hourly.temperature_2m[i * 2]),
          icon: getWeatherIcon(getConditionFromCode(data.current.weather_code)),
        })),
        weekly: Array(7).fill().map((_, i) => ({
          day: new Date(currentTime.getTime() + i * 24 * 60 * 60 * 1000).toLocaleDateString([], { weekday: 'long' }),
          high: Math.round(data.daily.temperature_2m_max[i]),
          low: Math.round(data.daily.temperature_2m_min[i]),
          icon: getWeatherIcon(getConditionFromCode(data.current.weather_code)),
        })),
      });

      if (!lat && !cities.some(city => city.name === fullLocation)) {
        setCities([...cities, { name: fullLocation, latitude, longitude }]);
      }
    } catch (err) {
      console.error('Fetch Error:', err);
      setError(err.message || 'Unable to fetch weather data.');
    } finally {
      setLoading(false);
    }
  }, [unit, cities]);

  const searchCities = async (query) => {
    if (!query || query.length < 3) { // Require at least 3 characters to reduce unnecessary API calls
      setSearchResults([]);
      return;
    }

    try {
      const url = `http://api.weatherapi.com/v1/search.json?key=${WEATHERAPI_KEY}&q=${encodeURIComponent(query)}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch city data');
      }
      const data = await response.json();
      const results = data.map(city => ({
        name: `${city.name}, ${city.region}, ${city.country}`,
        latitude: city.lat,
        longitude: city.lon,
      }));
      setSearchResults(results);
    } catch (err) {
      console.error('Search Error:', err);
      setSearchResults([]);
    }
  };

  useEffect(() => {
    fetchLocationAndWeather();
  }, [fetchLocationAndWeather]);

  useEffect(() => {
    if (weatherData) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
      ]).start();
    }
  }, [weatherData, fadeAnim, scaleAnim]);

  const getConditionFromCode = (code) => {
    if (code === 0) return 'Sunny';
    if (code >= 1 && code <= 3) return 'Cloudy';
    if (code >= 51 && code <= 67) return 'Rainy';
    if (code >= 80 && code <= 82) return 'Thunderstorm';
    if (code >= 71 && code <= 77) return 'Snow';
    return 'Cloudy';
  };

  const getWeatherIcon = (condition) => {
    switch (condition.toLowerCase()) {
      case 'sunny': return 'sun';
      case 'cloudy': return 'cloud';
      case 'rainy': return 'cloud-rain';
      case 'thunderstorm': return 'bolt';
      case 'snow': return 'snowflake';
      default: return 'cloud';
    }
  };

  const getWeatherImage = (condition) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
        return { uri: 'https://www.photowall.fr/media/catalog/product/cache/1/thumbnail/9df78eab33525d08d6e5fb8d27136e95/p/o/poster-sunny-day-9448.jpg' };
      case 'cloudy':
        return { uri: 'https://plus.unsplash.com/premium_photo-1667689956673-8737a299aa8c?fm=jpg&q=60&w=3000' };
      case 'rainy':
        return { uri: 'https://sites.psu.edu/siowfa16/files/2016/10/rain-02-1ac722l.jpg' };
      case 'thunderstorm':
        return { uri: 'https://living.geico.com/wp-content/uploads/geico-more-Thunderstorms-post-2016.jpg' };
      default:
        return { uri: 'https://plus.unsplash.com/premium_photo-1667689956673-8737a299aa8c?fm=jpg&q=60&w=3000' };
    }
  };

  const handleCitySelect = (city) => {
    fetchLocationAndWeather(city.latitude, city.longitude, city.name);
    setShowCityModal(false);
  };

  const addCity = (city) => {
    if (!cities.some(c => c.name === city.name)) {
      setCities([...cities, city]);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeCity = (cityName) => {
    setCities(cities.filter(city => city.name !== cityName));
  };

  if (loading) {
    return (
      <LinearGradient colors={['#1E3A8A', '#3B82F6']} style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Fetching Your Weather...</Text>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient colors={['#1E3A8A', '#3B82F6']} style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => fetchLocationAndWeather()} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  if (!weatherData) return null;

  return (
    <LinearGradient colors={['#1E3A8A', '#3B82F6', '#93C5FD']} style={styles.container}>
      <ImageBackground source={getWeatherImage(weatherData.current.condition)} style={styles.backgroundClouds}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <ImageBackground source={getWeatherImage(weatherData.current.condition)} style={styles.headerBackground}>
              <View style={styles.header}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Your Location"
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  value={location}
                  editable={false}
                />
                <TouchableOpacity style={styles.unitButton} onPress={() => setUnit(unit === 'C' ? 'F' : 'C')}>
                  <MaterialIcons name="thermostat" size={30} color="white" />
                  <Text style={styles.unitText}>°{unit}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.actionButton} onPress={() => setShowCityModal(true)}>
                  <Text style={styles.actionButtonText}>Manage Cities</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => alert('Weather Widget Coming Soon!')}>
                  <Text style={styles.actionButtonText}>Weather Widget</Text>
                </TouchableOpacity>
              </View>
            </ImageBackground>

            <Animated.View style={[styles.animationContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
              <ImageBackground source={getWeatherImage(weatherData.current.condition)} style={styles.currentWeatherBackground}>
                <View style={styles.currentWeather}>
                  <Text style={styles.locationText}>{location}</Text>
                  <Text style={styles.temperatureText}>{weatherData.current.temp}°{unit}</Text>
                  <Text style={styles.conditionText}>{weatherData.current.condition}</Text>
                  <Text style={styles.feelsLikeText}>Feels like {weatherData.current.feelsLike}°{unit}</Text>
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

          <Modal visible={showCityModal} animationType="slide" transparent>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Manage Cities</Text>
                <TextInput
                  style={styles.searchInputModal}
                  placeholder="Search for a city..."
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={(text) => {
                    setSearchQuery(text);
                    searchCities(text);
                  }}
                />
                {searchResults.length > 0 && (
                  <FlatList
                    data={searchResults}
                    keyExtractor={(item) => item.name}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.searchResultItem}
                        onPress={() => addCity(item)}
                      >
                        <Text style={styles.cityText}>{item.name}</Text>
                        <MaterialIcons name="add" size={24} color="green" />
                      </TouchableOpacity>
                    )}
                    style={styles.searchResultsList}
                  />
                )}
                <FlatList
                  data={cities}
                  keyExtractor={(item) => item.name}
                  renderItem={({ item }) => (
                    <View style={styles.cityItem}>
                      <TouchableOpacity onPress={() => handleCitySelect(item)}>
                        <Text style={styles.cityText}>{item.name}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => removeCity(item.name)}>
                        <MaterialIcons name="delete" size={24} color="red" />
                      </TouchableOpacity>
                    </View>
                  )}
                />
                <TouchableOpacity style={styles.closeButton} onPress={() => setShowCityModal(false)}>
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
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    width: '100%',
    marginTop: 40,
  },
  backgroundClouds: {
    flex: 1,
    width: '100%',
    opacity: 0.85,
  },
  headerBackground: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 20,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255,255,255,0.5)',
  },
  unitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    marginLeft: 15,
  },
  unitText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 5,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    padding: 10,
    borderRadius: 20,
    width: '48%',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  animationContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  currentWeatherBackground: {
    padding: 20,
    borderRadius: 25,
    overflow: 'hidden',
  },
  currentWeather: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 15,
    borderRadius: 20,
  },
  locationText: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '300',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  temperatureText: {
    color: '#fff',
    fontSize: 90,
    fontWeight: '200',
    marginVertical: 10,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 8,
  },
  conditionText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '400',
    textTransform: 'capitalize',
  },
  feelsLikeText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 18,
    marginTop: 5,
  },
  highlightsGridBackground: {
    padding: 20,
    marginHorizontal: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  highlightsGrid: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 15,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  gridCard: {
    width: '48%',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  gridValue: {
    color: '#fff',
    fontSize: 26,
    marginVertical: 8,
    fontWeight: '500',
  },
  gridLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
  },
  specialCardBackground: {
    marginHorizontal: 15,
    marginVertical: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  specialCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 20,
  },
  sunTimings: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  sunItem: {
    alignItems: 'center',
  },
  sunTime: {
    color: '#fff',
    fontSize: 22,
    marginVertical: 8,
    fontWeight: '500',
  },
  sunLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
  },
  sectionBackground: {
    marginHorizontal: 15,
    marginBottom: 25,
    padding: 15,
    borderRadius: 20,
    overflow: 'hidden',
  },
  section: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 15,
    borderRadius: 15,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 15,
    fontWeight: '600',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  hourlyCard: {
    alignItems: 'center',
    padding: 15,
    marginRight: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  hourlyTime: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  hourlyTemp: {
    color: '#fff',
    fontSize: 20,
    marginTop: 8,
    fontWeight: '500',
  },
  weeklyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  weeklyDay: {
    color: '#fff',
    fontSize: 18,
    width: 100,
    fontWeight: '500',
  },
  tempRange: {
    flexDirection: 'row',
    width: 90,
    justifyContent: 'space-between',
  },
  tempHigh: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  tempLow: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 18,
  },
  loadingText: {
    color: '#fff',
    fontSize: 20,
    marginTop: 20,
    textAlign: 'center',
  },
  errorText: {
    color: '#fff',
    fontSize: 20,
    textAlign: 'center',
    padding: 20,
  },
  retryButton: {
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 25,
    marginHorizontal: 50,
  },
  retryText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  searchInputModal: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  searchResultsList: {
    maxHeight: 150,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 10,
  },
  searchResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  cityText: {
    fontSize: 18,
    color: '#333',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#3B82F6',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WeatherApp;