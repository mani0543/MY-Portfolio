import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
  TextInput,
  useColorScheme,
  Switch,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';

// Dummy Data
const DUMMY_POSTS = [
  {
    id: '1',
    username: 'john_doe',
    userImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
    postImage: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba',
    caption: 'Beautiful sunset at the beach! 🌅',
    likes: 234,
    comments: 18,
  },
  {
    id: '2',
    username: 'jane_smith',
    userImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    postImage: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba',
    caption: 'Adventure awaits! 🏔️',
    likes: 456,
    comments: 32,
  },
];

const DUMMY_CHATS = [
  {
    id: '1',
    username: 'Sarah Wilson',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    lastMessage: 'Hey, how are you doing?',
    time: '2m ago',
    unread: 2,
  },
  {
    id: '2',
    username: 'Mike Johnson',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
    lastMessage: 'The meeting is scheduled for tomorrow',
    time: '1h ago',
    unread: 0,
  },
];

const TRENDING_TOPICS = ['Photography', 'Travel', 'Food', 'Technology', 'Art'];

const POPULAR_IMAGES = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba',
    likes: '12.5k',
    comments: '1.2k',
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba',
    likes: '9.2k',
    comments: '800',
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba',
    likes: '15.7k',
    comments: '2.3k',
  },
  {
    id: '4',
    image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba',
    likes: '8.9k',
    comments: '1.1k',
  },
  {
    id: '5',
    image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba',
    likes: '10.3k',
    comments: '1.5k',
  },
  {
    id: '6',
    image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba',
    likes: '7.6k',
    comments: '900',
  },
];

// Login Screen Component
function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleLogin = () => {
    if (email && password) {
      Alert.alert('Welcome Back', 'You have successfully logged in!');
      navigation.navigate('Home');
    } else {
      Alert.alert('Error', 'Please fill in all fields');
    }
  };

  return (
    <LinearGradient
      colors={isDark ? ['#1a1a1a', '#000000'] : ['#ffffff', '#f0f0f0']}
      style={styles.loginContainer}
    >
      <WelcomeMessage />
      <View style={styles.loginForm}>
        <TextInput
          style={[styles.input, isDark && styles.darkInput]}
          placeholder="Email"
          placeholderTextColor={isDark ? '#888888' : '#666666'}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={[styles.input, isDark && styles.darkInput]}
          placeholder="Password"
          placeholderTextColor={isDark ? '#888888' : '#666666'}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={[styles.link, isDark && styles.darkText]}>
            Don't have an account? Sign up
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

// Signup Screen Component
function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleSignup = () => {
    if (email && password && username) {
      Alert.alert('Signup Successful', 'Welcome!');
      navigation.navigate('Home');
    } else {
      Alert.alert('Error', 'Please fill in all fields');
    }
  };

  return (
    <LinearGradient
      colors={isDark ? ['#1a1a1a', '#000000'] : ['#ffffff', '#f0f0f0']}
      style={styles.loginContainer}
    >
      <WelcomeMessage />
      <View style={styles.loginForm}>
        <TextInput
          style={[styles.input, isDark && styles.darkInput]}
          placeholder="Username"
          placeholderTextColor={isDark ? '#888888' : '#666666'}
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={[styles.input, isDark && styles.darkInput]}
          placeholder="Email"
          placeholderTextColor={isDark ? '#888888' : '#666666'}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={[styles.input, isDark && styles.darkInput]}
          placeholder="Password"
          placeholderTextColor={isDark ? '#888888' : '#666666'}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={handleSignup}>
          <Text style={styles.buttonText}>Signup</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={[styles.link, isDark && styles.darkText]}>
            Already have an account? Login
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

// Welcome Message Animation Component
function WelcomeMessage() {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.5);
  const rotateAnim = new Animated.Value(0);
  const colorAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.elastic(2),
        useNativeDriver: true,
      }),
      Animated.timing(colorAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const colorInterpolation = colorAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#FF5733', '#33FF57', '#3357FF'],
  });

  return (
    <TouchableOpacity activeOpacity={0.8}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }, { rotate: rotateInterpolation }],
          alignItems: 'center',
          marginBottom: 30,
          padding: 20,
          borderRadius: 20,
          backgroundColor: colorInterpolation,
        }}
      >
        <Text style={styles.welcomeText}>Welcome To My App</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// Feed Screen Component
function FeedScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleNavigateToProfile = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start(() => {
      navigation.navigate('Profile');
    });
  };

  const renderPost = ({ item }) => (
    <View style={[styles.postContainer, isDark && styles.darkPostContainer]}>
      <View style={styles.postHeader}>
        <Image source={{ uri: item.userImage }} style={styles.postUserImage} />
        <Text style={[styles.postUsername, isDark && styles.darkText]}>{item.username}</Text>
      </View>
      <Image source={{ uri: item.postImage }} style={styles.postImage} />
      <View style={styles.postFooter}>
        <View style={styles.postActions}>
          <TouchableOpacity>
            <Ionicons name="heart-outline" size={24} color={isDark ? '#ffffff' : '#000000'} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="chatbubble-outline" size={24} color={isDark ? '#ffffff' : '#000000'} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="share-social-outline" size={24} color={isDark ? '#ffffff' : '#000000'} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.postCaption, isDark && styles.darkText]}>{item.caption}</Text>
        <View style={styles.postStats}>
          <Text style={[styles.postStat, isDark && styles.darkText]}>{item.likes} likes</Text>
          <Text style={[styles.postStat, isDark && styles.darkText]}>{item.comments} comments</Text>
        </View>
      </View>
    </View>
  );

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <FlatList
        data={DUMMY_POSTS}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.feedContainer}
      />
      <TouchableOpacity style={styles.floatingButton} onPress={handleNavigateToProfile}>
        <Text style={styles.floatingButtonText}>Go to Profile</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Explore Screen Component
function ExploreScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, []);

  const renderTrendingTopic = (topic) => (
    <TouchableOpacity
      key={topic}
      style={[styles.topicItem, isDark && styles.darkTopicItem]}
      activeOpacity={0.7}
    >
      <Text style={[styles.topicText, isDark && styles.darkText]}>{topic}</Text>
    </TouchableOpacity>
  );

  const renderPopularImage = ({ item }) => (
    <TouchableOpacity style={styles.popularImageContainer} activeOpacity={0.7}>
      <Image source={{ uri: item.image }} style={styles.popularImage} />
      <View style={styles.imageOverlay}>
        <Text style={styles.imageLikes}>{item.likes} ❤️</Text>
        <Text style={styles.imageComments}>{item.comments} 💬</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <ScrollView style={[styles.container, isDark && styles.darkContainer]}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={[styles.searchBar, isDark && styles.darkSearchBar]}
            placeholder="Search..."
            placeholderTextColor={isDark ? '#888888' : '#666666'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.searchButton} activeOpacity={0.7}>
            <Ionicons
              name="search"
              size={24}
              color={isDark ? '#ffffff' : '#000000'}
            />
          </TouchableOpacity>
        </View>

        {/* Trending Topics Section */}
        <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
          Trending Topics
        </Text>
        <View style={styles.trendingContainer}>
          {TRENDING_TOPICS.map(renderTrendingTopic)}
        </View>

        {/* Popular Images Section */}
        <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
          Popular Images
        </Text>
        <FlatList
          data={POPULAR_IMAGES}
          renderItem={renderPopularImage}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.popularImagesGrid}
        />
      </ScrollView>
    </Animated.View>
  );
}

// Create Post Screen Component
function CreatePostScreen() {
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handlePost = () => {
    if (image && caption) {
      Alert.alert('Post Created', 'Your post has been shared successfully!');
      setCaption('');
      setImage(null);
    } else {
      Alert.alert('Error', 'Please add an image and a caption');
    }
  };

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <View style={[styles.container, isDark && styles.darkContainer]}>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.pickedImage} />
          ) : (
            <Ionicons name="camera" size={50} color={isDark ? '#ffffff' : '#000000'} />
          )}
        </TouchableOpacity>
        <TextInput
          style={[styles.input, isDark && styles.darkInput, { height: 100 }]}
          placeholder="Write a caption..."
          placeholderTextColor={isDark ? '#888888' : '#666666'}
          value={caption}
          onChangeText={setCaption}
          multiline
        />
        <TouchableOpacity style={styles.button} onPress={handlePost}>
          <Text style={styles.buttonText}>Post</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

// Chat Screen Component
function ChatScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, []);

  const renderChatItem = ({ item }) => (
    <TouchableOpacity style={[styles.chatItem, isDark && styles.darkChatItem]}>
      <Image source={{ uri: item.avatar }} style={styles.chatAvatar} />
      <View style={styles.chatContent}>
        <Text style={[styles.chatUsername, isDark && styles.darkText]}>{item.username}</Text>
        <Text style={[styles.chatMessage, isDark && styles.darkText]}>{item.lastMessage}</Text>
      </View>
      <View style={styles.chatInfo}>
        <Text style={[styles.chatTime, isDark && styles.darkText]}>{item.time}</Text>
        {item.unread > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unread}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <FlatList
        data={DUMMY_CHATS}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatContainer}
      />
    </Animated.View>
  );
}

// Profile Screen Component
function ProfileScreen({ navigation }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('Abdul Rehman');
  const [bio, setBio] = useState(
    '📸 Photography enthusiast | 🌍 Travel lover\nLiving life one adventure at a time'
  );
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleEditProfile = () => {
    if (isEditing) {
      Alert.alert('Profile Updated', 'Your profile has been updated successfully!');
    }
    setIsEditing(!isEditing);
  };

  const handleLogout = () => {
    Alert.alert('Logged Out', 'You have been logged out successfully!');
    navigation.navigate('Login');
  };

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <ScrollView style={[styles.container, isDark && styles.darkContainer]}>
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde' }}
              style={styles.profileImage}
            />
            <TouchableOpacity style={styles.editIcon}>
              <Ionicons name="camera" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.username, isDark && styles.darkText]}>{username}</Text>
          <Text style={[styles.bio, isDark && styles.darkText]}>{bio}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, isDark && styles.darkText]}>152</Text>
            <Text style={[styles.statLabel, isDark && styles.darkText]}>Posts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, isDark && styles.darkText]}>2.5k</Text>
            <Text style={[styles.statLabel, isDark && styles.darkText]}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, isDark && styles.darkText]}>1.2k</Text>
            <Text style={[styles.statLabel, isDark && styles.darkText]}>Following</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Text style={styles.editButtonText}>
            {isEditing ? 'Save Profile' : 'Edit Profile'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.gridContainer}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Image
              key={item}
              source={{ uri: `https://images.unsplash.com/photo-168268722${item}038-404670f09471` }}
              style={styles.gridImage}
            />
          ))}
        </View>
      </ScrollView>
    </Animated.View>
  );
}

// Tab Navigator
const Tab = createBottomTabNavigator();

// Stack Navigator for Login/Signup
const Stack = createStackNavigator();

// Main App Component
export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, // Smooth horizontal slide
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Home">
          {() => (
            <Tab.Navigator
              screenOptions={{
                tabBarStyle: {
                  backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
                },
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: isDarkMode ? '#888888' : '#666666',
                headerStyle: {
                  backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
                },
                headerTintColor: isDarkMode ? '#ffffff' : '#000000',
              }}
            >
              <Tab.Screen
                name="Feed"
                component={FeedScreen}
                options={{
                  tabBarIcon: ({ size, color }) => (
                    <Ionicons name="home" size={size} color={color} />
                  ),
                }}
              />
              <Tab.Screen
                name="Explore"
                component={ExploreScreen}
                options={{
                  tabBarIcon: ({ size, color }) => (
                    <Ionicons name="search" size={size} color={color} />
                  ),
                }}
              />
              <Tab.Screen
                name="Create"
                component={CreatePostScreen}
                options={{
                  tabBarIcon: ({ size, color }) => (
                    <Ionicons name="add-circle" size={size} color={color} />
                  ),
                }}
              />
              <Tab.Screen
                name="Chat"
                component={ChatScreen}
                options={{
                  tabBarIcon: ({ size, color }) => (
                    <Ionicons name="chatbubbles" size={size} color={color} />
                  ),
                }}
              />
              <Tab.Screen
                name="Profile"
                options={{
                  tabBarIcon: ({ size, color }) => (
                    <Ionicons name="person" size={size} color={color} />
                  ),
                  headerRight: () => (
                    <Switch
                      value={isDarkMode}
                      onValueChange={toggleDarkMode}
                      style={{ marginRight: 15 }}
                    />
                  ),
                }}
              >
                {({ navigation }) => <ProfileScreen navigation={navigation} />}
              </Tab.Screen>
            </Tab.Navigator>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  darkContainer: {
    backgroundColor: '#1a1a1a',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginForm: {
    width: '90%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 15,
    fontSize: 18,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#cccccc',
  },
  darkInput: {
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    borderColor: '#444444',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 15,
    color: '#007AFF',
    textAlign: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    borderRadius: 15,
    padding: 5,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  bio: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#cccccc',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 16,
    color: '#666666',
  },
  editButton: {
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#007AFF',
    alignItems: 'center',
  },
  editButtonText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    marginHorizontal: 20,
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ff4444',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#ff4444',
    fontSize: 18,
    fontWeight: 'bold',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 20,
  },
  gridImage: {
    width: '33%',
    aspectRatio: 1,
    margin: 1,
    borderRadius: 15,
  },
  feedContainer: {
    paddingBottom: 20,
  },
  postContainer: {
    backgroundColor: '#ffffff',
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  darkPostContainer: {
    backgroundColor: '#1a1a1a',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  postUserImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  postUsername: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  postImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 15,
  },
  postFooter: {
    padding: 10,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  postCaption: {
    fontSize: 16,
    marginBottom: 10,
  },
  postStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  postStat: {
    fontSize: 14,
    color: '#666666',
  },
  trendingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  topicItem: {
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 25,
    margin: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  darkTopicItem: {
    backgroundColor: '#1a1a1a',
  },
  topicText: {
    fontSize: 16,
    color: '#000000',
  },
  popularImagesGrid: {
    paddingHorizontal: 2,
  },
  popularImageContainer: {
    flex: 1,
    margin: 5,
    borderRadius: 15,
    overflow: 'hidden',
    position: 'relative',
  },
  popularImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 15,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 10,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  imageLikes: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  imageComments: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchBar: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 15,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#cccccc',
  },
  darkSearchBar: {
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    borderColor: '#444444',
  },
  searchButton: {
    marginLeft: 10,
    padding: 15,
    backgroundColor: '#007AFF',
    borderRadius: 15,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#000000',
  },
  darkText: {
    color: '#ffffff',
  },
  chatContainer: {
    paddingBottom: 20,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#ffffff',
    marginBottom: 10,
    borderRadius: 15,
  },
  darkChatItem: {
    backgroundColor: '#1a1a1a',
  },
  chatAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
  },
  chatContent: {
    flex: 1,
  },
  chatUsername: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  chatMessage: {
    fontSize: 16,
    color: '#666666',
  },
  chatInfo: {
    alignItems: 'flex-end',
  },
  chatTime: {
    fontSize: 14,
    color: '#666666',
  },
  unreadBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 5,
  },
  unreadText: {
    color: '#ffffff',
    fontSize: 14,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 30,
    elevation: 5,
  },
  floatingButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});