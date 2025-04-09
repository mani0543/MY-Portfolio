import React, { useState, useEffect, useRef } from 'react';
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
  Linking,
  StatusBar,
} from 'react-native';
import { NavigationContainer, useTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const Stack = createStackNavigator();
const API_KEY = 'deba99a9beecd2f1dd392d688eee4ef3'; // TMDB API Key
const YOUTUBE_API_KEY = 'YOUR_YOUTUBE_API_KEY'; // Replace with your YouTube API key
const BASE_URL = 'https://api.themoviedb.org/3';
const FALLBACK_IMAGE = 'https://via.placeholder.com/342x513.png?text=No+Image';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const DESIGN_WIDTH = 375;
const scale = SCREEN_WIDTH / DESIGN_WIDTH;

const mockMovies = [
  { id: 1, title: 'The Lion King', poster_path: '/sKCr78OXqOEqrHOZckjiSpmPBDg.jpg', backdrop_path: '/sKCr78OXqOEqrHOZckjiSpmPBDg.jpg', overview: 'A young lion prince...', vote_average: 8.3, release_date: '1994-06-23' },
  { id: 2, title: 'Frozen', poster_path: '/kgwjIb2JDHRhNk13lmSxiClFjVk.jpg', backdrop_path: '/kgwjIb2JDHRhNk13lmSxiClFjVk.jpg', overview: 'A fearless princess...', vote_average: 7.3, release_date: '2013-11-27' },
];

const App = () => {
  const [favorites, setFavorites] = useState([]);
  const [userId, setUserId] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [downloads, setDownloads] = useState([]);
  const [watchHistory, setWatchHistory] = useState([]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        const storedFavorites = await AsyncStorage.getItem('favorites');
        const storedTheme = await AsyncStorage.getItem('theme');
        const storedDownloads = await AsyncStorage.getItem('downloads');
        const storedWatchHistory = await AsyncStorage.getItem('watchHistory');
        if (storedUserId) setUserId(storedUserId);
        if (storedFavorites) setFavorites(JSON.parse(storedFavorites));
        if (storedTheme) setTheme(storedTheme);
        if (storedDownloads) setDownloads(JSON.parse(storedDownloads));
        if (storedWatchHistory) setWatchHistory(JSON.parse(storedWatchHistory));
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    loadUserData();
  }, []);

  const saveFavorites = async (newFavorites) => {
    try {
      setFavorites(newFavorites);
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  const saveDownloads = async (newDownloads) => {
    try {
      setDownloads(newDownloads);
      await AsyncStorage.setItem('downloads', JSON.stringify(newDownloads));
    } catch (error) {
      console.error('Error saving downloads:', error);
    }
  };

  const saveWatchHistory = async (newHistory) => {
    try {
      setWatchHistory(newHistory);
      await AsyncStorage.setItem('watchHistory', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Error saving watch history:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    await AsyncStorage.setItem('theme', newTheme);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const themeStyles = theme === 'dark' ? darkTheme : lightTheme;

  return (
    <NavigationContainer theme={themeStyles}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={themeStyles.colors.background} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login">
          {(props) => <LoginScreen {...props} setUserId={setUserId} theme={theme} />}
        </Stack.Screen>
        <Stack.Screen name="Home">
          {(props) => <HomeScreen {...props} favorites={favorites} setFavorites={saveFavorites} userId={userId} theme={theme} toggleTheme={toggleTheme} watchHistory={watchHistory} setWatchHistory={saveWatchHistory} />}
        </Stack.Screen>
        <Stack.Screen name="MovieDetail">
          {(props) => <MovieDetailScreen {...props} favorites={favorites} setFavorites={saveFavorites} downloads={downloads} setDownloads={saveDownloads} userId={userId} theme={theme} watchHistory={watchHistory} setWatchHistory={saveWatchHistory} />}
        </Stack.Screen>
        <Stack.Screen name="Search">
          {(props) => <SearchScreen {...props} favorites={favorites} setFavorites={saveFavorites} userId={userId} theme={theme} />}
        </Stack.Screen>
        <Stack.Screen name="Profile">
          {(props) => <ProfileScreen {...props} favorites={favorites} setUserId={setUserId} theme={theme} toggleTheme={toggleTheme} />}
        </Stack.Screen>
        <Stack.Screen name="Favorites">
          {(props) => <FavoritesScreen {...props} favorites={favorites} setFavorites={saveFavorites} theme={theme} />}
        </Stack.Screen>
        <Stack.Screen name="EditProfile">
          {(props) => <EditProfileScreen {...props} userId={userId} theme={theme} />}
        </Stack.Screen>
        <Stack.Screen name="Downloads">
          {(props) => <DownloadsScreen {...props} downloads={downloads} setDownloads={saveDownloads} theme={theme} />}
        </Stack.Screen>
        <Stack.Screen name="DownloadHistory">
          {(props) => <DownloadHistoryScreen {...props} downloads={downloads} theme={theme} />}
        </Stack.Screen>
        <Stack.Screen name="WatchHistory">
          {(props) => <WatchHistoryScreen {...props} watchHistory={watchHistory} setWatchHistory={saveWatchHistory} theme={theme} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const LoginScreen = ({ navigation, setUserId, theme }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    try {
      const storedUsers = await AsyncStorage.getItem('users');
      let users = storedUsers ? JSON.parse(storedUsers) : {};
      if (isSignUp) {
        if (users[email]) {
          Alert.alert('Error', 'User already exists');
          return;
        }
        users[email] = { password, userId: email };
        await AsyncStorage.setItem('users', JSON.stringify(users));
        Alert.alert('Success', 'Sign up successful!');
      } else {
        if (!users[email] || users[email].password !== password) {
          Alert.alert('Error', 'Invalid email or password');
          return;
        }
      }
      const userId = email;
      await AsyncStorage.setItem('userId', userId);
      setUserId(userId);
      navigation.navigate('Home');
    } catch (error) {
      console.error('Auth error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  return (
    <LinearGradient colors={theme === 'dark' ? ['#1E1E3F', '#3F2B96'] : ['#E0E7FF', '#A3BFFA']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animated.View style={[styles.loginContainer, { opacity: fadeAnim }]}>
          <Text style={[styles.title, { color: colors.text }]}>✨ CineVerse ✨</Text>
          <TextInput
            style={[styles.inputShiny, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="Email"
            placeholderTextColor={colors.placeholder}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <TextInput
            style={[styles.inputShiny, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="Password"
            secureTextEntry
            placeholderTextColor={colors.placeholder}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity style={styles.buttonShiny} onPress={handleAuth}>
            <LinearGradient colors={['#FF6B6B', '#FF8E53']} style={styles.buttonGradientShiny}>
              <Text style={styles.buttonTextShiny}>{isSignUp ? 'Sign Up' : 'Login'}</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
            <Text style={[styles.toggleText, { color: colors.primary }]}>
              {isSignUp ? 'Already have an account? Login' : 'New here? Sign Up'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
};

const HomeScreen = ({ navigation, favorites, setFavorites, userId, theme, toggleTheme, watchHistory, setWatchHistory }) => {
  const [movies, setMovies] = useState([]);
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [error, setError] = useState(null);
  const [scrollX] = useState(new Animated.Value(0));
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const { colors } = useTheme();

  useEffect(() => {
    fetchDisneyMovies();
    const interval = setInterval(() => {
      if (featuredMovies.length > 0 && flatListRef.current) {
        const nextIndex = (currentIndex + 1) % featuredMovies.length;
        setCurrentIndex(nextIndex);
        flatListRef.current.scrollToIndex({ index: nextIndex, animated: true });
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [currentIndex, featuredMovies]);

  const fetchDisneyMovies = async () => {
    try {
      const response = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_companies=2&page=1`);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        setMovies(data.results);
        setFeaturedMovies(data.results.slice(0, 5));
        setError(null);
      } else {
        throw new Error('No movies found');
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
      setError('Failed to fetch movies. Using mock data.');
      setMovies(mockMovies);
      setFeaturedMovies(mockMovies);
    }
  };

  const renderFeaturedMovie = ({ item, index }) => {
    const inputRange = [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH];
    const scale = scrollX.interpolate({ inputRange, outputRange: [0.85, 1.2, 0.85], extrapolate: 'clamp' });

    return (
      <TouchableOpacity onPress={() => navigation.navigate('MovieDetail', { movie: item })}>
        <Animated.View style={[styles.featuredCardShiny, { transform: [{ scale }], backgroundColor: colors.card }]}>
          <Image
            source={{ uri: item.backdrop_path ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}` : FALLBACK_IMAGE }}
            style={styles.featuredImageShiny}
          />
          <LinearGradient colors={['transparent', colors.background]} style={styles.featuredOverlayShiny}>
            <Text style={[styles.featuredTitleShiny, { color: colors.text }]}>{item.title}</Text>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderMovie = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('MovieDetail', { movie: item })}>
      <View style={[styles.movieCardShiny, { backgroundColor: colors.card }]}>
        <Image
          source={{ uri: item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : FALLBACK_IMAGE }}
          style={styles.movieImageShiny}
        />
        <Text style={[styles.movieTitleShiny, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={theme === 'dark' ? ['#1E1E3F', '#3F2B96'] : ['#E0E7FF', '#A3BFFA']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={[styles.headerShiny, { backgroundColor: colors.header }]}>
          <Text style={[styles.headerTitleShiny, { color: colors.text }]}>🌟 CineVerse</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={toggleTheme} style={styles.iconButton}>
              <Ionicons name={theme === 'dark' ? 'moon' : 'sunny'} size={24} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Search')} style={styles.iconButton}>
              <Ionicons name="search" size={24} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Favorites')} style={styles.iconButton}>
              <Ionicons name="heart" size={24} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.iconButton}>
              <Ionicons name="person" size={24} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('WatchHistory')} style={styles.iconButton}>
              <Ionicons name="time" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
        {error && <Text style={[styles.errorTextShiny, { color: colors.error }]}>{error}</Text>}
        <Animated.FlatList
          ref={flatListRef}
          data={featuredMovies}
          renderItem={renderFeaturedMovie}
          keyExtractor={(item) => `featured-${item.id}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: true })}
          style={styles.featuredListShiny}
        />
        <Text style={[styles.sectionTitleShiny, { color: colors.text }]}>🎬 Explore Movies</Text>
        <FlatList
          data={movies}
          renderItem={renderMovie}
          keyExtractor={(item) => `movie-${item.id}`}
          numColumns={2}
          columnWrapperStyle={styles.movieGrid}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </ScrollView>
    </LinearGradient>
  );
};

const MovieDetailScreen = ({ route, navigation, favorites, setFavorites, downloads, setDownloads, userId, theme, watchHistory, setWatchHistory }) => {
  const { movie } = route.params;
  const [trailerKey, setTrailerKey] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const isFavorite = favorites.some((fav) => fav.id === movie.id);
  const isDownloaded = downloads.some((dl) => dl.id === movie.id);
  const { colors } = useTheme();

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    fetchTrailer();
    addToWatchHistory();
  }, [fadeAnim]);

  const fetchTrailer = async () => {
    try {
      const response = await fetch(`${BASE_URL}/movie/${movie.id}/videos?api_key=${API_KEY}`);
      const data = await response.json();
      const trailer = data.results.find((video) => video.type === 'Trailer' && video.site === 'YouTube');
      if (trailer) setTrailerKey(trailer.key);
    } catch (error) {
      console.error('Error fetching trailer:', error);
    }
  };

  const addToWatchHistory = () => {
    if (!watchHistory.some((item) => item.id === movie.id)) {
      const newHistory = [...watchHistory, { ...movie, watchedAt: new Date().toISOString() }];
      setWatchHistory(newHistory);
    }
  };

  const toggleFavorite = () => {
    if (!userId) {
      Alert.alert('Error', 'Please log in first');
      navigation.navigate('Login');
      return;
    }
    if (isFavorite) {
      setFavorites(favorites.filter((fav) => fav.id !== movie.id));
    } else {
      setFavorites([...favorites, movie]);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleDownload = () => {
    if (!userId) {
      Alert.alert('Error', 'Please log in first');
      navigation.navigate('Login');
      return;
    }
    if (isDownloaded) {
      Alert.alert('Info', 'Movie already downloaded');
    } else {
      const newDownloads = [...downloads, { ...movie, downloadedAt: new Date().toISOString() }];
      setDownloads(newDownloads);
      navigation.navigate('Downloads', { movie });
    }
  };

  const openTrailer = () => {
    if (trailerKey) {
      Linking.openURL(`https://www.youtube.com/watch?v=${trailerKey}`);
    } else {
      Alert.alert('No Trailer', 'Sorry, no trailer is available for this movie.');
    }
  };

  const rateMovie = (rating) => {
    setUserRating(rating);
    Haptics.selectionAsync();
  };

  return (
    <LinearGradient colors={theme === 'dark' ? ['#1E1E3F', '#3F2B96'] : ['#E0E7FF', '#A3BFFA']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.detailContainerShiny}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonShiny}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Animated.View style={[styles.imageContainerShiny, { opacity: fadeAnim }]}>
          <Image
            source={{ uri: movie.backdrop_path ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}` : FALLBACK_IMAGE }}
            style={styles.detailImageShiny}
          />
          <LinearGradient colors={['transparent', colors.background]} style={styles.imageOverlayShiny} />
        </Animated.View>
        <View style={[styles.contentShiny, { backgroundColor: colors.card }]}>
          <Text style={[styles.detailTitleShiny, { color: colors.text }]}>{movie.title}</Text>
          <Text style={[styles.detailOverviewShiny, { color: colors.text }]}>{movie.overview}</Text>
          <View style={styles.infoRowShiny}>
            <Text style={[styles.detailInfoShiny, { color: colors.primary }]}>Rating: {movie.vote_average}/10</Text>
            <Text style={[styles.detailInfoShiny, { color: colors.primary }]}>Release: {movie.release_date}</Text>
          </View>
          <View style={styles.ratingContainer}>
            <Text style={[styles.detailInfoShiny, { color: colors.text }]}>Your Rating:</Text>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => rateMovie(star)}>
                <Ionicons
                  name={star <= userRating ? 'star' : 'star-outline'}
                  size={24}
                  color={star <= userRating ? '#FFD700' : colors.border}
                />
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.buttonShiny} onPress={toggleFavorite}>
            <LinearGradient colors={isFavorite ? ['#FF6B6B', '#FF8E53'] : ['#34D399', '#10B981']} style={styles.buttonGradientShiny}>
              <Text style={styles.buttonTextShiny}>{isFavorite ? 'Remove Favorite' : 'Add Favorite'}</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonShiny} onPress={openTrailer}>
            <LinearGradient colors={['#EC4899', '#F472B6']} style={styles.buttonGradientShiny}>
              <Text style={styles.buttonTextShiny}>Watch Trailer</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonShiny} onPress={handleDownload}>
            <LinearGradient colors={['#F59E0B', '#FCD34D']} style={styles.buttonGradientShiny}>
              <Text style={styles.buttonTextShiny}>{isDownloaded ? 'Downloaded' : 'Download'}</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonShiny} onPress={() => navigation.navigate('Favorites')}>
            <LinearGradient colors={['#3B82F6', '#60A5FA']} style={styles.buttonGradientShiny}>
              <Text style={styles.buttonTextShiny}>Go to Favorites</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const SearchScreen = ({ navigation, favorites, setFavorites, userId, theme }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  const { colors } = useTheme();

  const searchMovies = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a search term');
      return;
    }
    try {
      const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setSearchResults(data.results || []);
      setError(null);
    } catch (error) {
      console.error('Error searching movies:', error);
      setError('Failed to search movies.');
      setSearchResults(mockMovies);
    }
  };

  const renderResult = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('MovieDetail', { movie: item })}>
      <View style={[styles.searchResultShiny, { backgroundColor: colors.card }]}>
        <Image
          source={{ uri: item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : FALLBACK_IMAGE }}
          style={styles.searchImageShiny}
        />
        <Text style={[styles.searchTitleShiny, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={theme === 'dark' ? ['#1E1E3F', '#3F2B96'] : ['#E0E7FF', '#A3BFFA']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={[styles.searchHeaderShiny, { backgroundColor: colors.header }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonShiny}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TextInput
            style={[styles.searchInputShiny, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="Search Movies..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={searchMovies}
            placeholderTextColor={colors.placeholder}
          />
          <TouchableOpacity onPress={searchMovies}>
            <Ionicons name="search" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
        {error && <Text style={[styles.errorTextShiny, { color: colors.error }]}>{error}</Text>}
        <FlatList
          data={searchResults}
          renderItem={renderResult}
          keyExtractor={(item) => `search-${item.id}`}
          contentContainerStyle={styles.searchListShiny}
        />
      </ScrollView>
    </LinearGradient>
  );
};

const ProfileScreen = ({ navigation, favorites, setUserId, theme, toggleTheme }) => {
  const [userEmail, setUserEmail] = useState('');
  const { colors } = useTheme();

  useEffect(() => {
    const fetchUserEmail = async () => {
      const email = await AsyncStorage.getItem('userId');
      setUserEmail(email || 'Guest');
    };
    fetchUserEmail();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userId');
    setUserId(null);
    navigation.navigate('Login');
  };

  return (
    <LinearGradient colors={theme === 'dark' ? ['#1E1E3F', '#3F2B96'] : ['#E0E7FF', '#A3BFFA']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.profileContainerShiny}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonShiny}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Image source={{ uri: 'https://picsum.photos/200' }} style={styles.profileImageShiny} />
        <Text style={[styles.profileNameShiny, { color: colors.text }]}>{userEmail}</Text>
        <Text style={[styles.profileBioShiny, { color: colors.text }]}>Movie Enthusiast | {favorites.length} Favorites</Text>
        <TouchableOpacity style={styles.buttonShiny} onPress={() => navigation.navigate('EditProfile')}>
          <LinearGradient colors={['#10B981', '#34D399']} style={styles.buttonGradientShiny}>
            <Text style={styles.buttonTextShiny}>Edit Profile</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonShiny} onPress={toggleTheme}>
          <LinearGradient colors={['#8B5CF6', '#A78BFA']} style={styles.buttonGradientShiny}>
            <Text style={styles.buttonTextShiny}>Toggle {theme === 'dark' ? 'Light' : 'Dark'} Mode</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonShiny} onPress={() => navigation.navigate('Favorites')}>
          <LinearGradient colors={['#3B82F6', '#60A5FA']} style={styles.buttonGradientShiny}>
            <Text style={styles.buttonTextShiny}>View Favorites</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonShiny} onPress={() => navigation.navigate('DownloadHistory')}>
          <LinearGradient colors={['#F59E0B', '#FCD34D']} style={styles.buttonGradientShiny}>
            <Text style={styles.buttonTextShiny}>Download History</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonShiny} onPress={() => navigation.navigate('WatchHistory')}>
          <LinearGradient colors={['#EC4899', '#F472B6']} style={styles.buttonGradientShiny}>
            <Text style={styles.buttonTextShiny}>Watch History</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonShiny} onPress={handleLogout}>
          <LinearGradient colors={['#EF4444', '#F87171']} style={styles.buttonGradientShiny}>
            <Text style={styles.buttonTextShiny}>Logout</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const EditProfileScreen = ({ navigation, userId, theme }) => {
  const [email, setEmail] = useState(userId || '');
  const [password, setPassword] = useState('');
  const { colors } = useTheme();

  const handleSave = async () => {
    try {
      const storedUsers = await AsyncStorage.getItem('users');
      let users = storedUsers ? JSON.parse(storedUsers) : {};
      if (users[userId]) {
        users[userId] = { ...users[userId], password: password || users[userId].password, userId: email };
        await AsyncStorage.setItem('users', JSON.stringify(users));
        await AsyncStorage.setItem('userId', email);
        Alert.alert('Success', 'Profile updated!');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  return (
    <LinearGradient colors={theme === 'dark' ? ['#1E1E3F', '#3F2B96'] : ['#E0E7FF', '#A3BFFA']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonShiny}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Edit Profile</Text>
        <TextInput
          style={[styles.inputShiny, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput
          style={[styles.inputShiny, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          placeholder="New Password (optional)"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.buttonShiny} onPress={handleSave}>
          <LinearGradient colors={['#10B981', '#34D399']} style={styles.buttonGradientShiny}>
            <Text style={styles.buttonTextShiny}>Save Changes</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const FavoritesScreen = ({ navigation, favorites, setFavorites, theme }) => {
  const { colors } = useTheme();

  const renderFavorite = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('MovieDetail', { movie: item })}>
      <View style={[styles.movieCardShiny, { backgroundColor: colors.card }]}>
        <Image
          source={{ uri: item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : FALLBACK_IMAGE }}
          style={styles.movieImageShiny}
        />
        <Text style={[styles.movieTitleShiny, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={theme === 'dark' ? ['#1E1E3F', '#3F2B96'] : ['#E0E7FF', '#A3BFFA']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={[styles.headerShiny, { backgroundColor: colors.header }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonShiny}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitleShiny, { color: colors.text }]}>❤️ Favorites ({favorites.length})</Text>
        </View>
        {favorites.length === 0 ? (
          <Text style={[styles.noFavoritesText, { color: colors.text }]}>No favorites yet!</Text>
        ) : (
          <FlatList
            data={favorites}
            renderItem={renderFavorite}
            keyExtractor={(item) => `favorite-${item.id}`}
            numColumns={2}
            columnWrapperStyle={styles.movieGrid}
          />
        )}
      </ScrollView>
    </LinearGradient>
  );
};

const DownloadsScreen = ({ route, navigation, downloads, setDownloads, theme }) => {
  const { movie } = route.params || {};
  const { colors } = useTheme();

  const renderDownload = ({ item }) => (
    <View style={[styles.movieCardShiny, { backgroundColor: colors.card }]}>
      <Image
        source={{ uri: item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : FALLBACK_IMAGE }}
        style={styles.movieImageShiny}
      />
      <Text style={[styles.movieTitleShiny, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
    </View>
  );

  return (
    <LinearGradient colors={theme === 'dark' ? ['#1E1E3F', '#3F2B96'] : ['#E0E7FF', '#A3BFFA']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={[styles.headerShiny, { backgroundColor: colors.header }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonShiny}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitleShiny, { color: colors.text }]}>⬇️ Downloads ({downloads.length})</Text>
        </View>
        {movie && (
          <Text style={[styles.downloadMessage, { color: colors.text }]}>
            Downloading "{movie.title}"... (Simulated)
          </Text>
        )}
        {downloads.length === 0 ? (
          <Text style={[styles.noFavoritesText, { color: colors.text }]}>No downloads yet!</Text>
        ) : (
          <FlatList
            data={downloads}
            renderItem={renderDownload}
            keyExtractor={(item) => `download-${item.id}`}
            numColumns={2}
            columnWrapperStyle={styles.movieGrid}
          />
        )}
      </ScrollView>
    </LinearGradient>
  );
};

const DownloadHistoryScreen = ({ navigation, downloads, theme }) => {
  const { colors } = useTheme();

  const renderDownload = ({ item }) => (
    <View style={[styles.movieCardShiny, { backgroundColor: colors.card }]}>
      <Image
        source={{ uri: item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : FALLBACK_IMAGE }}
        style={styles.movieImageShiny}
      />
      <Text style={[styles.movieTitleShiny, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
      <Text style={[styles.detailInfoShiny, { color: colors.primary }]}>{new Date(item.downloadedAt).toLocaleString()}</Text>
    </View>
  );

  return (
    <LinearGradient colors={theme === 'dark' ? ['#1E1E3F', '#3F2B96'] : ['#E0E7FF', '#A3BFFA']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={[styles.headerShiny, { backgroundColor: colors.header }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonShiny}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitleShiny, { color: colors.text }]}>📜 Download History ({downloads.length})</Text>
        </View>
        {downloads.length === 0 ? (
          <Text style={[styles.noFavoritesText, { color: colors.text }]}>No download history yet!</Text>
        ) : (
          <FlatList
            data={downloads}
            renderItem={renderDownload}
            keyExtractor={(item) => `download-history-${item.id}`}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </ScrollView>
    </LinearGradient>
  );
};

const WatchHistoryScreen = ({ navigation, watchHistory, setWatchHistory, theme }) => {
  const { colors } = useTheme();

  const renderHistoryItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('MovieDetail', { movie: item })}>
      <View style={[styles.movieCardShiny, { backgroundColor: colors.card }]}>
        <Image
          source={{ uri: item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : FALLBACK_IMAGE }}
          style={styles.movieImageShiny}
        />
        <Text style={[styles.movieTitleShiny, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
        <Text style={[styles.detailInfoShiny, { color: colors.primary }]}>{new Date(item.watchedAt).toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
  );

  const clearHistory = () => {
    setWatchHistory([]);
    Alert.alert('Success', 'Watch history cleared!');
  };

  return (
    <LinearGradient colors={theme === 'dark' ? ['#1E1E3F', '#3F2B96'] : ['#E0E7FF', '#A3BFFA']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={[styles.headerShiny, { backgroundColor: colors.header }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonShiny}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitleShiny, { color: colors.text }]}>⏳ Watch History ({watchHistory.length})</Text>
        </View>
        {watchHistory.length === 0 ? (
          <Text style={[styles.noFavoritesText, { color: colors.text }]}>No watch history yet!</Text>
        ) : (
          <>
            <TouchableOpacity style={styles.buttonShiny} onPress={clearHistory}>
              <LinearGradient colors={['#EF4444', '#F87171']} style={styles.buttonGradientShiny}>
                <Text style={styles.buttonTextShiny}>Clear History</Text>
              </LinearGradient>
            </TouchableOpacity>
            <FlatList
              data={watchHistory}
              renderItem={renderHistoryItem}
              keyExtractor={(item) => `watch-${item.id}`}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          </>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

const darkTheme = {
  dark: true,
  colors: {
    primary: '#FFD700',
    background: '#1E1E3F',
    card: 'rgba(63,43,150,0.5)',
    text: '#FFFFFF',
    border: '#A8C0FF',
    placeholder: '#A8C0FF',
    header: 'rgba(63,43,150,0.8)',
    error: '#FF6B6B',
  },
};

const lightTheme = {
  dark: false,
  colors: {
    primary: '#3B82F6',
    background: '#E0E7FF',
    card: 'rgba(255,255,255,0.8)',
    text: '#1F2937',
    border: '#A3BFFA',
    placeholder: '#9CA3AF',
    header: 'rgba(255,255,255,0.9)',
    error: '#EF4444',
  },
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { paddingBottom: 20, flexGrow: 1 },
  loginContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 36, fontWeight: 'bold', marginBottom: 40, textAlign: 'center' },
  inputShiny: { width: '100%', padding: 15, borderRadius: 12, marginBottom: 20, fontSize: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  buttonShiny: { width: '100%', marginVertical: 10 },
  buttonGradientShiny: { padding: 15, borderRadius: 12, alignItems: 'center' },
  buttonTextShiny: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  toggleText: { fontSize: 14, marginTop: 20 },
  headerShiny: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  headerTitleShiny: { fontSize: 24, fontWeight: 'bold' },
  headerIcons: { flexDirection: 'row', gap: 15 },
  iconButton: { padding: 5 },
  featuredListShiny: { height: SCREEN_HEIGHT * 0.35 },
  featuredCardShiny: { width: SCREEN_WIDTH, height: '100%', borderRadius: 16, overflow: 'hidden', elevation: 5 },
  featuredImageShiny: { width: '100%', height: '100%', resizeMode: 'cover' },
  featuredOverlayShiny: { position: 'absolute', bottom: 0, width: '100%', padding: 15 },
  featuredTitleShiny: { fontSize: 20, fontWeight: 'bold' },
  sectionTitleShiny: { fontSize: 20, fontWeight: '600', padding: 15 },
  movieGrid: { justifyContent: 'space-between', paddingHorizontal: 10 },
  movieCardShiny: { width: SCREEN_WIDTH * 0.45, margin: 5, borderRadius: 12, padding: 10, elevation: 3 },
  movieImageShiny: { width: '100%', height: SCREEN_HEIGHT * 0.25, borderRadius: 8, marginBottom: 5 },
  movieTitleShiny: { fontSize: 14, fontWeight: '500', textAlign: 'center' },
  detailContainerShiny: { alignItems: 'center', paddingBottom: 20 },
  imageContainerShiny: { width: '100%', height: SCREEN_HEIGHT * 0.4, borderRadius: 16, overflow: 'hidden', marginBottom: 20 },
  detailImageShiny: { width: '100%', height: '100%', resizeMode: 'cover' },
  imageOverlayShiny: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  contentShiny: { width: '90%', borderRadius: 16, padding: 20, elevation: 5 },
  detailTitleShiny: { fontSize: 28, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  detailOverviewShiny: { fontSize: 16, lineHeight: 24, marginBottom: 20 },
  infoRowShiny: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  detailInfoShiny: { fontSize: 14 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 5 },
  searchHeaderShiny: { flexDirection: 'row', alignItems: 'center', padding: 15 },
  backButtonShiny: { padding: 10, position: 'absolute', top: 10, left: 10, zIndex: 1 },
  searchInputShiny: { flex: 1, padding: 12, borderRadius: 12, marginRight: 10, fontSize: 16 },
  searchListShiny: { padding: 15 },
  searchResultShiny: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 12, marginBottom: 10, elevation: 2 },
  searchImageShiny: { width: 60, height: 90, borderRadius: 8, marginRight: 10 },
  searchTitleShiny: { fontSize: 16, flex: 1 },
  profileContainerShiny: { alignItems: 'center', padding: 20 },
  profileImageShiny: { width: 120, height: 120, borderRadius: 60, marginBottom: 20, borderWidth: 2, borderColor: '#FFD700' },
  profileNameShiny: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  profileBioShiny: { fontSize: 16, marginBottom: 20 },
  errorTextShiny: { fontSize: 14, textAlign: 'center', margin: 10 },
  noFavoritesText: { fontSize: 16, textAlign: 'center', marginTop: 20 },
  downloadMessage: { fontSize: 16, textAlign: 'center', margin: 20 },
});

export default App;