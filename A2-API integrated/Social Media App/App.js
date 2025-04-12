import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  ActivityIndicator,
  Modal,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { NavigationContainer, useNavigation, useFocusEffect } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';

// API Configurations
const UNSPLASH_API_KEY = 'iehS7oUIC_OUu4FLWG9TO2e3vSNJzU-4MQNR2X31Fco'; // Replace with your Unsplash API key
const GEMINI_API_KEY = 'AIzaSyCkz9K9HbqaGvrsX2uxWffYXl_zNmJrWrI'; // Replace with your Gemini API key
const UNSPLASH_API_URL = 'https://api.unsplash.com/photos/';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash';
const POSTS_PER_PAGE = 10;

// Global state to share posts across screens
let globalPosts = [];

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
      colors={isDark ? ['#0F2027', '#203A43', '#2C5364'] : ['#E0EAFC', '#CFDEF3']}
      style={styles.loginContainer}
    >
      <WelcomeMessage />
      <View style={styles.loginForm}>
        <TextInput
          style={[styles.input, isDark && styles.darkInput]}
          placeholder="Email"
          placeholderTextColor={isDark ? '#A9A9A9' : '#666666'}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={[styles.input, isDark && styles.darkInput]}
          placeholder="Password"
          placeholderTextColor={isDark ? '#A9A9A9' : '#666666'}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <LinearGradient colors={['#007AFF', '#00C6FF']} style={styles.gradientButton}>
            <Text style={styles.buttonText}>Login</Text>
          </LinearGradient>
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
      colors={isDark ? ['#0F2027', '#203A43', '#2C5364'] : ['#E0EAFC', '#CFDEF3']}
      style={styles.loginContainer}
    >
      <WelcomeMessage />
      <View style={styles.loginForm}>
        <TextInput
          style={[styles.input, isDark && styles.darkInput]}
          placeholder="Username"
          placeholderTextColor={isDark ? '#A9A9A9' : '#666666'}
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={[styles.input, isDark && styles.darkInput]}
          placeholder="Email"
          placeholderTextColor={isDark ? '#A9A9A9' : '#666666'}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={[styles.input, isDark && styles.darkInput]}
          placeholder="Password"
          placeholderTextColor={isDark ? '#A9A9A9' : '#666666'}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={handleSignup}>
          <LinearGradient colors={['#007AFF', '#00C6FF']} style={styles.gradientButton}>
            <Text style={styles.buttonText}>Signup</Text>
          </LinearGradient>
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
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.welcomeContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <LinearGradient colors={['#FF6B6B', '#4ECDC4']} style={styles.welcomeGradient}>
        <Text style={styles.welcomeText}>Welcome to Horizon</Text>
      </LinearGradient>
    </Animated.View>
  );
}

// Feed Screen Component
function FeedScreen() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${UNSPLASH_API_URL}?client_id=${UNSPLASH_API_KEY}&per_page=${POSTS_PER_PAGE}`);
      const fetchedPosts = response.data.map((post, index) => ({
        id: post.id,
        username: `user_${index + 1}`,
        userImage: `https://i.pravatar.cc/150?img=${index + 1}`,
        postImage: post.urls.regular,
        caption: post.description || `Photo by ${post.user.name}`,
        likes: Math.floor(Math.random() * 1000),
        liked: false,
        comments: [],
        category: ['Photography', 'Travel', 'Food', 'Technology', 'Art'][Math.floor(Math.random() * 5)],
      }));
      globalPosts = [...globalPosts, ...fetchedPosts.filter((fp) => !globalPosts.some((gp) => gp.id === fp.id))]; // Avoid duplicates
      setPosts(globalPosts);
    } catch (error) {
      Alert.alert('Error', 'Failed to load posts');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Sync with globalPosts when screen is focused
  useFocusEffect(
    useCallback(() => {
      setPosts([...globalPosts]); // Update local state with globalPosts
      if (globalPosts.length === 0) {
        fetchPosts(); // Fetch if no posts exist
      } else {
        setLoading(false);
      }
    }, [])
  );

  const handleLike = (postId) => {
    const updatedPosts = posts.map((post) =>
      post.id === postId
        ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
        : post
    );
    setPosts(updatedPosts);
    globalPosts = updatedPosts;
  };

  const handleComment = (postId) => {
    setSelectedPostId(postId);
    setModalVisible(true);
  };

  const submitComment = () => {
    if (!commentText.trim()) return;
    const updatedPosts = posts.map((post) =>
      post.id === selectedPostId
        ? { ...post, comments: [...post.comments, { id: Date.now().toString(), text: commentText, user: 'You' }] }
        : post
    );
    setPosts(updatedPosts);
    globalPosts = updatedPosts;
    setCommentText('');
    setModalVisible(false);
  };

  const handleShare = async (post) => {
    try {
      const result = await Share.share({
        message: `${post.caption} - Check out this post on Horizon!`,
        url: post.postImage,
        title: 'Share Post',
      });
      if (result.action === Share.sharedAction) {
        Alert.alert('Success', 'Post shared successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share post');
      console.error(error);
    }
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
          <TouchableOpacity onPress={() => handleLike(item.id)}>
            <Ionicons
              name={item.liked ? 'heart' : 'heart-outline'}
              size={28}
              color={item.liked ? '#FF4444' : isDark ? '#FFF' : '#000'}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleComment(item.id)}>
            <Ionicons name="chatbubble-outline" size={28} color={isDark ? '#FFF' : '#000'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleShare(item)}>
            <Ionicons name="share-social-outline" size={28} color={isDark ? '#FFF' : '#000'} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.postCaption, isDark && styles.darkText]}>{item.caption}</Text>
        <View style={styles.postStats}>
          <Text style={[styles.postStat, isDark && styles.darkText]}>{item.likes} likes</Text>
          <Text style={[styles.postStat, isDark && styles.darkText]}>{item.comments.length} comments</Text>
        </View>
        {item.comments.map((comment) => (
          <Text key={comment.id} style={[styles.commentText, isDark && styles.darkText]}>
            <Text style={styles.commentUser}>{comment.user}: </Text>{comment.text}
          </Text>
        ))}
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" color="#007AFF" style={styles.loading} />;

  return (
    <>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.feedContainer}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, isDark && styles.darkModalContainer]}>
            <TextInput
              style={[styles.input, isDark && styles.darkInput]}
              placeholder="Add a comment..."
              placeholderTextColor={isDark ? '#A9A9A9' : '#666666'}
              value={commentText}
              onChangeText={setCommentText}
            />
            <TouchableOpacity style={styles.button} onPress={submitComment}>
              <LinearGradient colors={['#007AFF', '#00C6FF']} style={styles.gradientButton}>
                <Text style={styles.buttonText}>Post Comment</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={[styles.link, isDark && styles.darkText]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

// Explore Screen Component
function ExploreScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const TRENDING_TOPICS = ['Photography', 'Travel', 'Food', 'Technology', 'Art'];

  useEffect(() => {
    fetchCategoryPosts();
  }, []);

  const fetchCategoryPosts = async () => {
    try {
      const allPosts = [];
      for (const category of TRENDING_TOPICS) {
        const response = await axios.get(
          `https://api.unsplash.com/search/photos?query=${category}&client_id=${UNSPLASH_API_KEY}&per_page=5`
        );
        const categoryPosts = response.data.results.map((post, index) => ({
          id: `${category}_${post.id}`,
          username: `user_${category}_${index + 1}`,
          userImage: `https://i.pravatar.cc/150?img=${index + 1}`,
          postImage: post.urls.regular,
          caption: post.description || `${category} photo by ${post.user.name}`,
          likes: Math.floor(Math.random() * 1000),
          comments: [],
          category,
        }));
        allPosts.push(...categoryPosts);
      }
      setPosts(allPosts);
      setFilteredPosts(allPosts);
    } catch (error) {
      Alert.alert('Error', 'Failed to load explore posts');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredPosts(posts);
      return;
    }
    const filtered = posts.filter(
      (post) =>
        post.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.caption.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredPosts(filtered);
  };

  const renderTrendingTopic = (topic) => (
    <TouchableOpacity
      key={topic}
      style={[styles.topicItem, isDark && styles.darkTopicItem]}
      activeOpacity={0.7}
      onPress={() => {
        setSearchQuery(topic);
        handleSearch();
      }}
    >
      <Text style={[styles.topicText, isDark && styles.darkText]}>{topic}</Text>
    </TouchableOpacity>
  );

  const renderPost = ({ item }) => (
    <View style={[styles.postContainer, isDark && styles.darkPostContainer]}>
      <Image source={{ uri: item.postImage }} style={styles.explorePostImage} />
      <Text style={[styles.postCaption, isDark && styles.darkText]}>{item.caption}</Text>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" color="#007AFF" style={styles.loading} />;

  return (
    <ScrollView style={[styles.container, isDark && styles.darkContainer]}>
      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchBar, isDark && styles.darkSearchBar]}
          placeholder="Search by category or caption..."
          placeholderTextColor={isDark ? '#A9A9A9' : '#666666'}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Ionicons name="search" size={24} color={isDark ? '#FFF' : '#000'} />
        </TouchableOpacity>
      </View>
      <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Trending Topics</Text>
      <View style={styles.trendingContainer}>{TRENDING_TOPICS.map(renderTrendingTopic)}</View>
      <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
        {searchQuery ? `Results for "${searchQuery}"` : 'Explore Posts'}
      </Text>
      <FlatList
        data={filteredPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.explorePostsContainer}
      />
    </ScrollView>
  );
}

// Create Post Screen Component
function CreatePostScreen({ navigation }) {
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions!');
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
      const newPost = {
        id: `user_${Date.now()}`, // Ensure unique ID
        username: 'You',
        userImage: 'https://i.pravatar.cc/150?img=3',
        postImage: image,
        caption,
        likes: 0,
        liked: false,
        comments: [],
        category: 'User Post',
      };
      globalPosts = [newPost, ...globalPosts];
      Alert.alert('Post Created', 'Your post has been shared successfully!');
      setCaption('');
      setImage(null);
      navigation.navigate('Feed');
    } else {
      Alert.alert('Error', 'Please add an image and a caption');
    }
  };

  return (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.pickedImage} />
        ) : (
          <Ionicons name="camera" size={50} color={isDark ? '#FFF' : '#000'} />
        )}
      </TouchableOpacity>
      <TextInput
        style={[styles.input, isDark && styles.darkInput, { height: 100 }]}
        placeholder="Write a caption..."
        placeholderTextColor={isDark ? '#A9A9A9' : '#666666'}
        value={caption}
        onChangeText={setCaption}
        multiline
      />
      <TouchableOpacity style={styles.button} onPress={handlePost}>
        <LinearGradient colors={['#007AFF', '#00C6FF']} style={styles.gradientButton}>
          <Text style={styles.buttonText}>Post</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

// Chat Screen Component
function ChatScreen() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    setChats([
      { id: '1', username: 'Sarah Wilson', avatar: 'https://i.pravatar.cc/150?img=1', lastMessage: 'Hey!' },
      { id: '2', username: 'Mike Johnson', avatar: 'https://i.pravatar.cc/150?img=2', lastMessage: 'What’s up?' },
    ]);
  }, []);

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    setMessages([{ id: '1', text: `Hi! I’m ${chat.username}, your virtual friend! How can I help you today?`, sender: 'friend' }]);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    setLoading(true);

    const newMessage = { id: Date.now().toString(), text: input, sender: 'me' };
    setMessages((prev) => [...prev, newMessage]);
    setInput('');

    try {
      const response = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                { text: input },
              ],
            },
          ],
        },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const geminiReply = response.data.candidates[0].content.parts[0].text;
      const aiMessage = { id: Date.now().toString(), text: geminiReply, sender: 'friend' };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Gemini API Error:', error.response?.data || error.message);
      const errorMessage = { id: Date.now().toString(), text: 'Sorry, I couldn’t respond right now!', sender: 'friend' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleChatSelect(item)}
      style={[styles.chatItem, isDark && styles.darkChatItem]}
    >
      <Image source={{ uri: item.avatar }} style={styles.chatAvatar} />
      <View style={styles.chatContent}>
        <Text style={[styles.chatUsername, isDark && styles.darkText]}>{item.username}</Text>
        <Text style={[styles.chatMessage, isDark && styles.darkText]}>{item.lastMessage}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === 'me' ? styles.myMessage : styles.friendMessage,
        isDark && item.sender === 'me' ? styles.darkMyMessage : isDark && styles.darkFriendMessage,
      ]}
    >
      <Text style={[styles.messageText, isDark && item.sender === 'me' ? styles.darkText : styles.lightText]}>
        {item.text}
      </Text>
    </View>
  );

  if (selectedChat) {
    return (
      <View style={[styles.chatDetailContainer, isDark && styles.darkContainer]}>
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setSelectedChat(null)}>
            <Ionicons name="arrow-back" size={28} color={isDark ? '#FFF' : '#000'} />
          </TouchableOpacity>
          <Text style={[styles.chatUsername, isDark && styles.darkText]}>{selectedChat.username}</Text>
        </View>
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesContainer}
        />
        {loading && <ActivityIndicator size="small" color="#007AFF" style={styles.loadingSpinner} />}
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.chatInput, isDark && styles.darkInput]}
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            placeholderTextColor={isDark ? '#A9A9A9' : '#666666'}
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
            <Ionicons name="send" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <FlatList
      data={chats}
      renderItem={renderChatItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.chatContainer}
    />
  );
}

// Profile Screen Component
function ProfileScreen({ navigation }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('Abdul Rehman');
  const [bio, setBio] = useState('📸 Photography enthusiast | 🌍 Travel lover');
  const [profileImage, setProfileImage] = useState('https://i.pravatar.cc/150?img=3');

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleEditProfile = () => {
    if (isEditing) {
      Alert.alert('Profile Updated', 'Your profile has been saved!');
    }
    setIsEditing(!isEditing);
  };

  const handleLogout = () => {
    Alert.alert('Logged Out', 'You have been logged out!');
    navigation.navigate('Login');
  };

  return (
    <ScrollView style={[styles.container, isDark && styles.darkContainer]}>
      <LinearGradient
        colors={isDark ? ['#2C5364', '#203A43'] : ['#E0EAFC', '#CFDEF3']}
        style={styles.profileHeader}
      >
        <View style={styles.profileImageContainer}>
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
          {isEditing && (
            <TouchableOpacity style={styles.editIcon} onPress={pickImage}>
              <Ionicons name="camera" size={24} color="#FFF" />
            </TouchableOpacity>
          )}
        </View>
        {isEditing ? (
          <TextInput
            style={[styles.usernameInput, isDark && styles.darkInput]}
            value={username}
            onChangeText={setUsername}
          />
        ) : (
          <Text style={[styles.username, isDark && styles.darkText]}>{username}</Text>
        )}
        {isEditing ? (
          <TextInput
            style={[styles.bioInput, isDark && styles.darkInput]}
            value={bio}
            onChangeText={setBio}
            multiline
          />
        ) : (
          <Text style={[styles.bio, isDark && styles.darkText]}>{bio}</Text>
        )}
      </LinearGradient>

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
        <LinearGradient colors={['#007AFF', '#00C6FF']} style={styles.gradientButton}>
          <Text style={styles.editButtonText}>{isEditing ? 'Save Profile' : 'Edit Profile'}</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Tab and Stack Navigator
const Tab = createBottomTabNavigator();
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
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Home">
          {() => (
            <Tab.Navigator
              screenOptions={{
                tabBarStyle: {
                  backgroundColor: isDarkMode ? '#1A1A1A' : '#FFF',
                  borderTopWidth: 0,
                  elevation: 10,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: -5 },
                  shadowOpacity: 0.1,
                  shadowRadius: 10,
                },
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: isDarkMode ? '#A9A9A9' : '#666666',
                headerStyle: { backgroundColor: isDarkMode ? '#1A1A1A' : '#FFF' },
                headerTintColor: isDarkMode ? '#FFF' : '#000',
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

// Updated Styles
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  darkContainer: { backgroundColor: '#121212' },
  loginContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loginForm: {
    width: '90%',
    backgroundColor: '#FFF',
    borderRadius: 25,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    padding: 15,
    fontSize: 18,
    marginBottom: 15,
    borderWidth: 0,
  },
  darkInput: { backgroundColor: '#2A2A2A', color: '#FFF' },
  button: { borderRadius: 15, overflow: 'hidden' },
  gradientButton: { padding: 15, alignItems: 'center' },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  link: { marginTop: 15, color: '#007AFF', textAlign: 'center', fontSize: 16 },
  welcomeContainer: { marginBottom: 40 },
  welcomeGradient: { padding: 20, borderRadius: 20 },
  welcomeText: { fontSize: 36, fontWeight: '800', color: '#FFF', textAlign: 'center' },
  feedContainer: { paddingBottom: 20 },
  postContainer: {
    backgroundColor: '#FFF',
    marginBottom: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  darkPostContainer: { backgroundColor: '#1E1E1E' },
  postHeader: { flexDirection: 'row', alignItems: 'center', padding: 15 },
  postUserImage: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  postUsername: { fontWeight: '700', fontSize: 18 },
  postImage: { width: '100%', aspectRatio: 1, borderRadius: 15 },
  postFooter: { padding: 15 },
  postActions: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  postCaption: { fontSize: 16, marginBottom: 10 },
  postStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  postStat: { fontSize: 14, color: '#666666' },
  commentText: { fontSize: 14, marginTop: 5 },
  commentUser: { fontWeight: 'bold' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContainer: {
    width: '80%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  darkModalContainer: { backgroundColor: '#1E1E1E' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  searchBar: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    padding: 15,
    fontSize: 18,
    borderWidth: 0,
  },
  darkSearchBar: { backgroundColor: '#2A2A2A', color: '#FFF' },
  searchButton: { marginLeft: 10, padding: 15, backgroundColor: '#007AFF', borderRadius: 15 },
  sectionTitle: { fontSize: 24, fontWeight: '700', marginBottom: 15, color: '#000' },
  trendingContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  topicItem: {
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 25,
    margin: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  darkTopicItem: { backgroundColor: '#1E1E1E' },
  topicText: { fontSize: 16, color: '#000' },
  explorePostsContainer: { paddingBottom: 20 },
  explorePostImage: { width: '100%', aspectRatio: 1, borderRadius: 10, marginBottom: 10 },
  imagePicker: {
    height: 200,
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  pickedImage: { width: '100%', height: '100%', borderRadius: 15 },
  chatContainer: { paddingBottom: 20 },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFF',
    marginBottom: 10,
    borderRadius: 15,
  },
  darkChatItem: { backgroundColor: '#1E1E1E' },
  chatAvatar: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  chatContent: { flex: 1 },
  chatUsername: { fontWeight: '700', fontSize: 18 },
  chatMessage: { fontSize: 16, color: '#666666' },
  chatDetailContainer: { flex: 1 },
  chatHeader: { flexDirection: 'row', alignItems: 'center', padding: 15 },
  messagesContainer: { padding: 15, flexGrow: 1 },
  messageContainer: { marginBottom: 10, padding: 10, borderRadius: 15, maxWidth: '75%' },
  myMessage: { backgroundColor: '#007AFF', alignSelf: 'flex-end' },
  friendMessage: { backgroundColor: '#E0E0E0', alignSelf: 'flex-start' },
  darkMyMessage: { backgroundColor: '#00C6FF' },
  darkFriendMessage: { backgroundColor: '#2A2A2A' },
  messageText: { fontSize: 16 },
  lightText: { color: '#000' },
  darkText: { color: '#FFF' },
  inputContainer: { flexDirection: 'row', padding: 15, alignItems: 'center' },
  chatInput: { flex: 1, backgroundColor: '#F5F5F5', borderRadius: 25, padding: 15 },
  sendButton: { marginLeft: 10 },
  profileHeader: { alignItems: 'center', padding: 30, borderRadius: 20 },
  profileImageContainer: { position: 'relative' },
  profileImage: { width: 130, height: 130, borderRadius: 65, borderWidth: 4, borderColor: '#007AFF' },
  editIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    padding: 8,
  },
  username: { fontSize: 26, fontWeight: '700', marginTop: 15 },
  usernameInput: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 15,
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 10,
  },
  bio: { fontSize: 16, textAlign: 'center', marginTop: 10, lineHeight: 24 },
  bioInput: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    padding: 15,
    backgroundColor: '#FFF',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 22, fontWeight: '700' },
  statLabel: { fontSize: 16, color: '#666666' },
  editButton: { marginHorizontal: 20, marginTop: 20, borderRadius: 15, overflow: 'hidden' },
  editButtonText: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  logoutButton: {
    marginHorizontal: 20,
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#FF4444',
    alignItems: 'center',
  },
  logoutButtonText: { color: '#FF4444', fontSize: 18, fontWeight: '600' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingSpinner: { marginVertical: 10 },
});
