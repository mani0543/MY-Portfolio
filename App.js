import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants'; // Added for .env support

const Stack = createStackNavigator();
const API_KEY = process.env.REACT_APP_TMDB_API_KEY || 'deba99a9beecd2f1dd392d688eee4ef3';
const BASE_URL = 'https://api.themoviedb.org/3';
// Use expo-constants to read SERVER_URL from .env, fallback to your machine's IP
const SERVER_URL = Constants.expoConfig?.extra?.REACT_APP_SERVER_URL || 'https:// http://223.123.98.197:3000/api'; // Replace with your IP
const FALLBACK_IMAGE = 'https://via.placeholder.com/342x513.png?text=No+Image';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const DESIGN_WIDTH = 375;
const scale = SCREEN_WIDTH / DESIGN_WIDTH;

const mockMovies = [
  { id: 1, title: 'The Lion King', poster_path: '/sKCr78OXqOEqrHOZckjiSpmPBDg.jpg', backdrop_path: '/sKCr78OXqOEqrHOZckjiSpmPBDg.jpg', overview: 'A young lion prince...', vote_average: 8.3, release_date: '1994-06-23' },
  { id: 2, title: 'Frozen', poster_path: '/kgwjIb2JDHRhNk13lmSxiClFjVk.jpg', backdrop_path: '/kgwjIb2JDHRhNk13lmSxiClFjVk.jpg', overview: 'A fearless princess...', vote_average: 7.3, release_date: '2013-11-27' },
];

export default function App() {
  const [favorites, setFavorites] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchFavorites();
    }
  }, [userId]);

  const fetchFavorites = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/favorites/${userId}`);
      setFavorites(response.data.favorites || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      Alert.alert('Error', 'Failed to load favorites');
    }
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyleInterpolator: ({ current, layouts }) => ({
            cardStyle: {
              opacity: current.progress,
              transform: [
                { translateY: current.progress.interpolate({ inputRange: [0, 1], outputRange: [layouts.screen.height, 0] }) },
                { scale: current.progress.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) },
              ],
            },
          }),
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home">
          {props => <HomeScreen {...props} favorites={favorites} setFavorites={setFavorites} userId={userId} />}
        </Stack.Screen>
        <Stack.Screen name="MovieDetail">
          {props => <MovieDetailScreen {...props} favorites={favorites} setFavorites={setFavorites} userId={userId} />}
        </Stack.Screen>
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Favorites">
          {props => <FavoritesScreen {...props} favorites={favorites} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const LoginScreen = ({ navigation }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 40, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const handleLogin = async () => {
    try {
      console.log('Attempting login to:', `${SERVER_URL}/login`);
      const response = await axios.post(`${SERVER_URL}/login`, { email, password });
      navigation.navigate('Home', { userId: response.data.userId });
    } catch (error) {
      console.error('Login error:', error.message, error.config);
      if (error.code === 'ECONNABORTED') {
        Alert.alert('Network Error', 'Request timed out. Check your internet connection.');
      } else if (error.response) {
        Alert.alert('Login Failed', error.response.data.message || 'Invalid email or password');
      } else if (error.request) {
        Alert.alert('Network Error', 'Unable to connect to the server. Check SERVER_URL.');
      } else {
        Alert.alert('Login Failed', 'An unexpected error occurred.');
      }
    }
  };

  return (
    <LinearGradient colors={['#1E1E3F', '#3F2B96', '#A8C0FF']} style={styles.container}>
      <Animated.View style={[styles.loginContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.title}>✨ CineVerse ✨</Text>
        <TextInput
          style={styles.inputShiny}
          placeholder="Email"
          placeholderTextColor="#A8C0FF"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.inputShiny}
          placeholder="Password"
          secureTextEntry
          placeholderTextColor="#A8C0FF"
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.buttonShiny} onPress={handleLogin}>
          <LinearGradient colors={['#FF6B6B', '#FF8E53', '#FFD700']} style={styles.buttonGradientShiny}>
            <Text style={styles.buttonTextShiny}>Enter Cinematic Paradise</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
};

// [Rest of the components (HomeScreen, MovieDetailScreen, etc.) remain unchanged]
const HomeScreen = ({ navigation, favorites, setFavorites, userId }) => {
  const [movies, setMovies] = useState([]);
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [error, setError] = useState(null);
  const [scrollX] = useState(new Animated.Value(0));
  const [glowAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    fetchDisneyMovies();
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const fetchDisneyMovies = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_companies=2&page=1`);
      const data = response.data.results;
      setMovies(data);
      setFeaturedMovies(data.slice(0, 5));
      setError(null);
    } catch (error) {
      console.error('Error fetching movies:', error);
      setError('Failed to fetch movies. Using mock data.');
      setMovies(mockMovies);
      setFeaturedMovies(mockMovies);
    }
  };

  const renderFeaturedMovie = ({ item, index }) => {
    const inputRange = [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH];
    const scale = scrollX.interpolate({ inputRange, outputRange: [0.8, 1.3, 0.8], extrapolate: 'clamp' });
    return (
      <TouchableOpacity onPress={() => navigation.navigate('MovieDetail', { movie: item })}>
        <Animated.View style={[styles.featuredCardShiny, { transform: [{ scale }] }]}>
          <Image source={{ uri: item.backdrop_path ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}` : FALLBACK_IMAGE }} style={styles.featuredImageShiny} />
          <LinearGradient colors={['transparent', '#3F2B96', '#A8C0FF']} style={styles.featuredOverlayShiny}>
            <Text style={styles.featuredTitleShiny}>{item.title || 'Untitled'}</Text>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderMovie = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('MovieDetail', { movie: item })}>
      <Animated.View style={[styles.movieCardShiny, { shadowOpacity: glowAnim }]}>
        <Image source={{ uri: item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : FALLBACK_IMAGE }} style={styles.movieImageShiny} />
        <LinearGradient colors={['transparent', 'rgba(63,43,150,0.8)']} style={styles.movieOverlay}>
          <Text style={styles.movieTitleShiny}>{item.title || 'Untitled'}</Text>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );

  const HeaderComponent = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerShiny}>
        <Text style={styles.headerTitleShiny}>🌟 CineVerse 🌟</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => navigation.navigate('Search')}>
            <Ionicons name="search" size={SCREEN_WIDTH * 0.08} color="#FFD700" style={styles.searchIconShiny} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Favorites')}>
            <Ionicons name="heart" size={SCREEN_WIDTH * 0.08} color="#FFD700" style={styles.searchIconShiny} />
          </TouchableOpacity>
        </View>
      </View>
      <Animated.FlatList
        data={featuredMovies}
        renderItem={renderFeaturedMovie}
        keyExtractor={(item) => `featured-${item.id}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: true })}
        style={styles.featuredListShiny}
      />
      {error && <Text style={styles.errorTextShiny}>{error}</Text>}
      <Text style={styles.sectionTitleShiny}>🎬 All Movies 🎬</Text>
    </View>
  );

  return (
    <LinearGradient colors={['#1E1E3F', '#3F2B96']} style={styles.container}>
      <FlatList
        data={movies}
        renderItem={renderMovie}
        keyExtractor={(item) => `movie-${item.id}`}
        numColumns={Math.floor(SCREEN_WIDTH / (SCREEN_WIDTH * 0.46))}
        columnWrapperStyle={styles.movieRowShiny}
        contentContainerStyle={styles.movieListShiny}
        ListHeaderComponent={HeaderComponent}
      />
    </LinearGradient>
  );
};

// [Other screens (MovieDetailScreen, SearchScreen, ProfileScreen, FavoritesScreen) remain unchanged]
const MovieDetailScreen = ({ route, navigation, favorites, setFavorites, userId }) => {
  const { movie } = route.params;
  const [fadeAnim] = useState(new Animated.Value(0));
  const [imageScale] = useState(new Animated.Value(0.8));
  const [textTranslateY] = useState(new Animated.Value(20));
  const [buttonGlow] = useState(new Animated.Value(0));
  const [downloadProgress, setDownloadProgress] = useState(0);
  const isFavorite = favorites.some(fav => fav.id === movie.id);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(imageScale, { toValue: 1, friction: 5, tension: 40, useNativeDriver: true }),
      Animated.timing(textTranslateY, { toValue: 0, duration: 800, delay: 200, useNativeDriver: true }),
      Animated.loop(Animated.sequence([
        Animated.timing(buttonGlow, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(buttonGlow, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])),
    ]).start();
    console.log('Backdrop URL:', movie.backdrop_path ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}` : FALLBACK_IMAGE);
  }, [fadeAnim, imageScale, textTranslateY, buttonGlow, movie.backdrop_path]);

  const toggleFavorite = async () => {
    if (!userId) return Alert.alert('Error', 'Please log in first');

    try {
      if (isFavorite) {
        await axios.delete(`${SERVER_URL}/favorites/${userId}/${movie.id}`);
        setFavorites(favorites.filter(fav => fav.id !== movie.id));
      } else {
        await axios.post(`${SERVER_URL}/favorites/${userId}`, movie);
        setFavorites([...favorites, movie]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          { title: 'Storage Permission', message: 'CineVerse needs access to storage to download movies.', buttonNeutral: 'Ask Me Later', buttonNegative: 'Cancel', buttonPositive: 'OK' }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else {
      const { status } = await Permissions.askAsync(Permissions.MEDIA_LIBRARY);
      return status === 'granted';
    }
  };

  const handleDownload = async () => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Storage permission is required to download movies.');
      return;
    }
    const downloadUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';
    const fileUri = `${FileSystem.documentDirectory}${movie.title.replace(/\s+/g, '_')}.mp4`;
    try {
      const downloadResumable = FileSystem.createDownloadResumable(downloadUrl, fileUri, {}, (progress) => {
        const prog = progress.totalBytesWritten / progress.totalBytesExpectedToWrite;
        setDownloadProgress(prog);
      });
      const { uri } = await downloadResumable.downloadAsync();
      Alert.alert('Download Complete', `Movie saved to: ${uri}`);
      setDownloadProgress(0);
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Download Failed', 'An error occurred while downloading the movie.');
      setDownloadProgress(0);
    }
  };

  const buttonGlowEffect = buttonGlow.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });

  return (
    <LinearGradient colors={['#1E1E3F', '#3F2B96', '#A8C0FF']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.detailContainerShiny}>
        <Animated.View style={[styles.imageContainerShiny, { opacity: fadeAnim, transform: [{ scale: imageScale }] }]}>
          <Image
            source={{ uri: movie.backdrop_path ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}` : FALLBACK_IMAGE }}
            style={styles.detailImageShiny}
            resizeMode="cover"
            onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
          />
          <LinearGradient colors={['rgba(30,30,63,0.6)', 'rgba(63,43,150,0.9)']} style={styles.imageOverlayShiny} />
        </Animated.View>
        <Animated.View style={[styles.contentShiny, { opacity: fadeAnim, transform: [{ translateY: textTranslateY }] }]}>
          <Text style={styles.detailTitleShiny}>{movie.title || 'Untitled'}</Text>
          <Text style={styles.detailOverviewShiny}>{movie.overview || 'No description available'}</Text>
          <View style={styles.infoRowShiny}>
            <Text style={styles.detailInfoShiny}>Rating: {movie.vote_average || 'N/A'}/10 ★</Text>
            <Text style={styles.detailInfoShiny}>Release: {movie.release_date || 'Unknown'}</Text>
          </View>
          
          <Animated.View style={[styles.buttonShiny, { opacity: buttonGlowEffect }]}>
            <TouchableOpacity onPress={toggleFavorite}>
              <LinearGradient colors={isFavorite ? ['#FF6B6B', '#FF8E53'] : ['#FFD700', '#FF8E53']} style={styles.buttonGradientShiny}>
                <Text style={styles.buttonTextShiny}>{isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={[styles.buttonShiny, { opacity: buttonGlowEffect }]}>
            <TouchableOpacity onPress={() => Alert.alert('Trailer', 'Trailer playback not implemented yet!')}>
              <LinearGradient colors={['#FF4500', '#FF8C00', '#FFD700']} style={styles.buttonGradientShiny}>
                <Text style={styles.buttonTextShiny}>Play Trailer</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={[styles.buttonShiny, { opacity: buttonGlowEffect }]}>
            <TouchableOpacity onPress={handleDownload}>
              <LinearGradient colors={['#00CED1', '#20B2AA', '#FFD700']} style={styles.buttonGradientShiny}>
                <Text style={styles.buttonTextShiny}>
                  {downloadProgress > 0 ? `Downloading (${Math.round(downloadProgress * 100)}%)` : 'Download Movie'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={[styles.buttonShiny, { opacity: buttonGlowEffect }]}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <LinearGradient colors={['#FF6B6B', '#FF8E53', '#FFD700']} style={styles.buttonGradientShiny}>
                <Text style={styles.buttonTextShiny}>Back to Galaxy</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
};

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const searchMovies = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${searchQuery}&with_companies=2`);
      setSearchResults(response.data.results);
      setError(null);
    } catch (error) {
      console.error('Error searching movies:', error);
      setError('Failed to search movies.');
      setSearchResults(mockMovies);
    }
  };

  const renderResult = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('MovieDetail', { movie: item })}>
      <Animated.View style={[styles.searchResultShiny, { transform: [{ scale: scaleAnim }] }]}>
        <Image source={{ uri: item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : FALLBACK_IMAGE }} style={styles.searchImageShiny} />
        <Text style={styles.searchTitleShiny}>{item.title || 'Untitled'}</Text>
      </Animated.View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#1E1E3F', '#3F2B96']} style={styles.container}>
      <Animated.View style={[styles.searchHeaderShiny, { opacity: fadeAnim }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonShiny}>
          <LinearGradient colors={['#FF6B6B', '#FFD700']} style={styles.backButtonGradientShiny}>
            <Text style={styles.backButtonTextShiny}>←</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TextInput
          style={styles.searchInputShiny}
          placeholder="Search Cosmic Films..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={searchMovies}
          placeholderTextColor="#A8C0FF"
        />
        <TouchableOpacity onPress={searchMovies}>
          <Ionicons name="search" size={SCREEN_WIDTH * 0.08} color="#FFD700" style={styles.searchIconShiny} />
        </TouchableOpacity>
      </Animated.View>
      {error && <Text style={styles.errorTextShiny}>{error}</Text>}
      <FlatList
        data={searchResults}
        renderItem={renderResult}
        keyExtractor={(item) => `search-${item.id}`}
        contentContainerStyle={styles.searchListShiny}
      />
    </LinearGradient>
  );
};

const ProfileScreen = ({ navigation }) => {
  const [rotateAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.loop(Animated.timing(rotateAnim, { toValue: 1, duration: 5000, useNativeDriver: true })).start();
  }, [rotateAnim]);

  const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <LinearGradient colors={['#1E1E3F', '#3F2B96', '#A8C0FF']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.profileContainerShiny}>
        <Animated.Image source={{ uri: 'https://picsum.photos/200' }} style={[styles.profileImageShiny, { transform: [{ rotate }] }]} />
        <Text style={styles.profileNameShiny}>🌟 CineVerse Star 🌟</Text>
        <Text style={styles.profileBioShiny}>Dancing through the cinematic universe ✨</Text>
        <TouchableOpacity style={styles.buttonShiny} onPress={() => navigation.navigate('Favorites')}>
          <LinearGradient colors={['#FF6B6B', '#FF8E53', '#FFD700']} style={styles.buttonGradientShiny}>
            <Text style={styles.buttonTextShiny}>View Favorites</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonShiny} onPress={() => navigation.navigate('Home')}>
          <LinearGradient colors={['#FF6B6B', '#FF8E53', '#FFD700']} style={styles.buttonGradientShiny}>
            <Text style={styles.buttonTextShiny}>Return to Stardom</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const FavoritesScreen = ({ navigation, favorites }) => {
  const renderFavorite = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('MovieDetail', { movie: item })}>
      <View style={styles.movieCardShiny}>
        <Image source={{ uri: item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : FALLBACK_IMAGE }} style={styles.movieImageShiny} />
        <LinearGradient colors={['transparent', 'rgba(63,43,150,0.8)']} style={styles.movieOverlay}>
          <Text style={styles.movieTitleShiny}>{item.title || 'Untitled'}</Text>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#1E1E3F', '#3F2B96']} style={styles.container}>
      <View style={styles.headerShiny}>
        <Text style={styles.headerTitleShiny}>❤️ Favorites ❤️</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={SCREEN_WIDTH * 0.08} color="#FFD700" style={styles.searchIconShiny} />
        </TouchableOpacity>
      </View>
      {favorites.length === 0 ? (
        <Text style={styles.noFavoritesText}>No favorites yet! Add some movies to your collection.</Text>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderFavorite}
          keyExtractor={(item) => `favorite-${item.id}`}
          numColumns={Math.floor(SCREEN_WIDTH / (SCREEN_WIDTH * 0.46))}
          columnWrapperStyle={styles.movieRowShiny}
          contentContainerStyle={styles.movieListShiny}
        />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', height: '100%' },
  loginContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: SCREEN_WIDTH * 0.06 },
  title: { fontSize: SCREEN_WIDTH * 0.1, color: '#FFD700', marginBottom: SCREEN_HEIGHT * 0.05, fontWeight: 'bold', textShadowColor: '#A8C0FF', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: SCREEN_WIDTH * 0.04 },
  inputShiny: { width: '100%', backgroundColor: 'rgba(168,192,255,0.2)', padding: SCREEN_WIDTH * 0.04, marginBottom: SCREEN_HEIGHT * 0.03, borderRadius: SCREEN_WIDTH * 0.05, color: '#FFFFFF', borderWidth: SCREEN_WIDTH * 0.004, borderColor: '#FFD700', fontSize: SCREEN_WIDTH * 0.04, shadowColor: '#FFD700', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: SCREEN_WIDTH * 0.02 },
  buttonShiny: { width: '90%', marginBottom: SCREEN_HEIGHT * 0.025, shadowColor: '#FFD700', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.8, shadowRadius: SCREEN_WIDTH * 0.03 },
  buttonGradientShiny: { padding: SCREEN_WIDTH * 0.045, borderRadius: SCREEN_WIDTH * 0.08, alignItems: 'center', borderWidth: SCREEN_WIDTH * 0.005, borderColor: '#FFFFFF' },
  buttonTextShiny: { color: '#FFFFFF', fontSize: SCREEN_WIDTH * 0.045, fontWeight: 'bold', textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: SCREEN_WIDTH * 0.015 },
  headerContainer: { width: '100%' },
  headerShiny: { paddingTop: SCREEN_HEIGHT * 0.06, paddingHorizontal: SCREEN_WIDTH * 0.05, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(63,43,150,0.3)' },
  headerIcons: { flexDirection: 'row', gap: SCREEN_WIDTH * 0.04 },
  headerTitleShiny: { fontSize: SCREEN_WIDTH * 0.09, color: '#FFD700', fontWeight: 'bold', textShadowColor: '#A8C0FF', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: SCREEN_WIDTH * 0.03 },
  searchIconShiny: { shadowColor: '#FFD700', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: SCREEN_WIDTH * 0.02 },
  featuredListShiny: { height: SCREEN_HEIGHT * 0.38, marginTop: SCREEN_HEIGHT * 0.02 },
  featuredCardShiny: { width: SCREEN_WIDTH, height: '100%', borderRadius: SCREEN_WIDTH * 0.04, overflow: 'hidden', shadowColor: '#A8C0FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: SCREEN_WIDTH * 0.04 },
  featuredImageShiny: { width: '100%', height: '100%', resizeMode: 'cover', borderRadius: SCREEN_WIDTH * 0.04 },
  featuredOverlayShiny: { position: 'absolute', bottom: 0, width: '100%', padding: SCREEN_WIDTH * 0.05 },
  featuredTitleShiny: { color: '#FFD700', fontSize: SCREEN_WIDTH * 0.07, fontWeight: 'bold', textShadowColor: '#A8C0FF', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: SCREEN_WIDTH * 0.03 },
  sectionTitleShiny: { fontSize: SCREEN_WIDTH * 0.06, color: '#FFD700', fontWeight: 'bold', paddingHorizontal: SCREEN_WIDTH * 0.05, marginTop: SCREEN_HEIGHT * 0.03, marginBottom: SCREEN_HEIGHT * 0.015, textShadowColor: '#A8C0FF', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: SCREEN_WIDTH * 0.02 },
  movieListShiny: { paddingHorizontal: SCREEN_WIDTH * 0.03, paddingBottom: SCREEN_HEIGHT * 0.05 },
  movieRowShiny: { justifyContent: 'space-between' },
  movieCardShiny: { width: SCREEN_WIDTH * 0.46, marginBottom: SCREEN_HEIGHT * 0.02, borderRadius: SCREEN_WIDTH * 0.04, backgroundColor: 'rgba(168,192,255,0.1)', overflow: 'hidden', shadowColor: '#FFD700', shadowOffset: { width: 0, height: 0 }, shadowRadius: SCREEN_WIDTH * 0.03 },
  movieImageShiny: { width: '100%', height: SCREEN_HEIGHT * 0.35, borderRadius: SCREEN_WIDTH * 0.04 },
  movieOverlay: { position: 'absolute', bottom: 0, width: '100%', padding: SCREEN_WIDTH * 0.03 },
  movieTitleShiny: { color: '#FFD700', fontSize: SCREEN_WIDTH * 0.04, fontWeight: 'bold', textAlign: 'center', textShadowColor: '#A8C0FF', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: SCREEN_WIDTH * 0.015 },
  detailContainerShiny: { paddingBottom: SCREEN_HEIGHT * 0.05, width: '100%', alignItems: 'center' },
  imageContainerShiny: { width: '100%', height: SCREEN_HEIGHT * 0.5, borderRadius: SCREEN_WIDTH * 0.05, overflow: 'hidden', elevation: 10, shadowColor: '#FFD700', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.6, shadowRadius: SCREEN_WIDTH * 0.06 },
  detailImageShiny: { width: '100%', height: '100%', borderRadius: SCREEN_WIDTH * 0.05 },
  imageOverlayShiny: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: SCREEN_WIDTH * 0.05 },
  contentShiny: { width: '90%', backgroundColor: 'rgba(30,30,63,0.8)', borderRadius: SCREEN_WIDTH * 0.05, padding: SCREEN_WIDTH * 0.05, marginTop: -SCREEN_HEIGHT * 0.1, elevation: 5, shadowColor: '#A8C0FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: SCREEN_WIDTH * 0.04 },
  detailTitleShiny: { color: '#FFD700', fontSize: SCREEN_WIDTH * 0.09, fontWeight: '900', marginBottom: SCREEN_HEIGHT * 0.02, textShadowColor: '#A8C0FF', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: SCREEN_WIDTH * 0.05, textAlign: 'center' },
  detailOverviewShiny: { color: '#FFFFFF', fontSize: SCREEN_WIDTH * 0.04, marginBottom: SCREEN_HEIGHT * 0.03, textShadowColor: '#A8C0FF', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: SCREEN_WIDTH * 0.01, textAlign: 'center', lineHeight: SCREEN_WIDTH * 0.06 },
  infoRowShiny: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: SCREEN_HEIGHT * 0.03 },
  detailInfoShiny: { color: '#A8C0FF', fontSize: SCREEN_WIDTH * 0.04, textShadowColor: '#FFD700', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: SCREEN_WIDTH * 0.015 },
  searchHeaderShiny: { paddingTop: SCREEN_HEIGHT * 0.06, paddingHorizontal: SCREEN_WIDTH * 0.05, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(63,43,150,0.4)', borderBottomWidth: SCREEN_WIDTH * 0.005, borderBottomColor: '#FFD700' },
  backButtonShiny: { marginRight: SCREEN_WIDTH * 0.04 },
  backButtonGradientShiny: { width: SCREEN_WIDTH * 0.12, height: SCREEN_WIDTH * 0.12, borderRadius: SCREEN_WIDTH * 0.06, justifyContent: 'center', alignItems: 'center', shadowColor: '#FFD700', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: SCREEN_WIDTH * 0.02 },
  backButtonTextShiny: { color: '#FFFFFF', fontSize: SCREEN_WIDTH * 0.07, fontWeight: 'bold' },
  searchInputShiny: { flex: 1, backgroundColor: 'rgba(168,192,255,0.2)', padding: SCREEN_WIDTH * 0.04, borderRadius: SCREEN_WIDTH * 0.06, color: '#FFFFFF', marginRight: SCREEN_WIDTH * 0.04, fontSize: SCREEN_WIDTH * 0.04, borderWidth: SCREEN_WIDTH * 0.004, borderColor: '#FFD700', shadowColor: '#FFD700', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: SCREEN_WIDTH * 0.02 },
  searchListShiny: { padding: SCREEN_WIDTH * 0.05, paddingBottom: SCREEN_HEIGHT * 0.05 },
  searchResultShiny: { flexDirection: 'row', alignItems: 'center', padding: SCREEN_WIDTH * 0.03, backgroundColor: 'rgba(168,192,255,0.15)', borderRadius: SCREEN_WIDTH * 0.04, marginBottom: SCREEN_HEIGHT * 0.015, shadowColor: '#FFD700', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: SCREEN_WIDTH * 0.02 },
  searchImageShiny: { width: SCREEN_WIDTH * 0.17, height: SCREEN_WIDTH * 0.255, borderRadius: SCREEN_WIDTH * 0.03, marginRight: SCREEN_WIDTH * 0.04 },
  searchTitleShiny: { color: '#FFD700', fontSize: SCREEN_WIDTH * 0.04, flex: 1, textShadowColor: '#A8C0FF', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: SCREEN_WIDTH * 0.01 },
  profileContainerShiny: { flexGrow: 1, alignItems: 'center', paddingTop: SCREEN_HEIGHT * 0.08, paddingBottom: SCREEN_HEIGHT * 0.05 },
  profileImageShiny: { width: SCREEN_WIDTH * 0.4, height: SCREEN_WIDTH * 0.4, borderRadius: SCREEN_WIDTH * 0.2, marginBottom: SCREEN_HEIGHT * 0.03, borderWidth: SCREEN_WIDTH * 0.008, borderColor: '#FFD700', shadowColor: '#A8C0FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: SCREEN_WIDTH * 0.04 },
  profileNameShiny: { color: '#FFD700', fontSize: SCREEN_WIDTH * 0.075, fontWeight: 'bold', marginBottom: SCREEN_HEIGHT * 0.015, textShadowColor: '#A8C0FF', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: SCREEN_WIDTH * 0.03, textAlign: 'center' },
  profileBioShiny: { color: '#FFFFFF', fontSize: SCREEN_WIDTH * 0.045, marginBottom: SCREEN_HEIGHT * 0.03, textShadowColor: '#FFD700', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: SCREEN_WIDTH * 0.015, textAlign: 'center' },
  errorTextShiny: { color: '#FF6B6B', fontSize: SCREEN_WIDTH * 0.035, textAlign: 'center', marginVertical: SCREEN_HEIGHT * 0.015, textShadowColor: '#FFFFFF', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: SCREEN_WIDTH * 0.01 },
  noFavoritesText: { color: '#A8C0FF', fontSize: SCREEN_WIDTH * 0.045, textAlign: 'center', marginTop: SCREEN_HEIGHT * 0.05, textShadowColor: '#FFD700', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: SCREEN_WIDTH * 0.01 },
});