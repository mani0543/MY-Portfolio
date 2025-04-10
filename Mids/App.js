import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Linking,
  Alert,
  ScrollView,
  Modal,
  Image,
  Switch,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const Stack = createStackNavigator();
const BASE_URL = 'http://192.168.43.205:3000';

// Login Screen
function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 800 });
    translateY.value = withSpring(0, { stiffness: 120 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const handleGoogleSignIn = async () => {
    try {
      const mockGoogleUser = {
        email: 'itxmemani0543@gmail.com',
        givenName: 'Mani',
      };

      const { email, givenName } = mockGoogleUser;
      await AsyncStorage.setItem('username', givenName);
      await AsyncStorage.setItem('email', email);

      const existingUsers = await AsyncStorage.getItem('users');
      let users = existingUsers ? JSON.parse(existingUsers) : [];

      if (!users.some(u => u.email === email)) {
        const newUser = {
          username: givenName,
          email: email,
          password: '',
          googleSignIn: true,
        };
        users.push(newUser);
        await AsyncStorage.setItem('users', JSON.stringify(users));
      }

      Alert.alert('Success', `Signing in as ${givenName}`);
      navigation.navigate('JobListings');
    } catch (error) {
      console.error('Mock Google Sign-In error:', error);
      Alert.alert('Error', 'Sign-In failed');
    }
  };

  const handleAuth = async () => {
    if (isSignup) {
      try {
        const existingUsers = await AsyncStorage.getItem('users');
        let users = existingUsers ? JSON.parse(existingUsers) : [];
        if (users.some(user => user.username === username)) {
          Alert.alert('Error', 'Username already exists');
          return;
        }
        const newUser = { username, password, email };
        users.push(newUser);
        await AsyncStorage.setItem('users', JSON.stringify(users));
        await AsyncStorage.setItem('username', username);
        await AsyncStorage.setItem('email', email);
        Alert.alert('Success', 'Account created');
        navigation.navigate('JobListings');
      } catch (error) {
        Alert.alert('Error', 'Signup failed');
      }
    } else {
      try {
        const existingUsers = await AsyncStorage.getItem('users');
        const users = existingUsers ? JSON.parse(existingUsers) : [];
        const user = users.find(u => u.username === username && u.password === password);
        if (!user) {
          Alert.alert('Error', 'Invalid credentials');
          return;
        }
        await AsyncStorage.setItem('username', username);
        await AsyncStorage.setItem('email', user.email);
        Alert.alert('Success', 'Logged in');
        navigation.navigate('JobListings');
      } catch (error) {
        Alert.alert('Error', 'Login failed');
      }
    }
  };

  return (
    <LinearGradient colors={['#1E1E2F', '#2A2A40']} style={styles.container}>
      <Animated.View style={[styles.loginContainer, animatedStyle]}>
        <Text style={styles.loginTitle}>{isSignup ? 'Register' : 'Login'}</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#A0A0C0"
            value={username}
            onChangeText={setUsername}
          />
          {isSignup && (
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#A0A0C0"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
          )}
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#A0A0C0"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        <TouchableOpacity style={styles.authButton} onPress={handleAuth}>
          <LinearGradient colors={['#5E5CE6', '#7B68EE']} style={styles.gradientButton}>
            <Text style={styles.buttonText}>{isSignup ? 'Sign Up' : 'Sign In'}</Text>
          </LinearGradient>
        </TouchableOpacity>

        {!isSignup && (
          <TouchableOpacity
            style={[styles.authButton, { marginTop: 10 }]}
            onPress={handleGoogleSignIn}
          >
            <LinearGradient
              colors={['#4285F4', '#34A853']}
              style={[styles.gradientButton, styles.googleButton]}
            >
              <Feather name="mail" size={20} color="#FFF" style={{ marginRight: 10 }} />
              <Text style={styles.buttonText}>Sign in with Google</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => setIsSignup(!isSignup)}>
          <Text style={styles.switchText}>
            {isSignup ? 'Already have an account?' : 'Need an account?'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
}

// JobCard Component
function JobCard({ item, navigation, savedJobs, saveJob, useAlternateColors }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 400 });
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => (scale.value = withTiming(0.98, { duration: 100 }));
  const handlePressOut = () => (scale.value = withTiming(1, { duration: 100 }));

  return (
    <Animated.View style={[styles.jobCard, { borderColor: useAlternateColors ? '#34C759' : '#5E5CE6' }, cardStyle]}>
      <TouchableOpacity onPress={() => navigation.navigate('JobDetails', { job: item })} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Text style={styles.jobTitle}>{item.title}</Text>
        <Text style={styles.jobSubtitle}>{item.company} • {item.location}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.saveButton} onPress={() => saveJob(item)}>
        <Feather name={savedJobs.some((saved) => saved.id === item.id) ? 'bookmark' : 'bookmark'} size={20} color={savedJobs.some((saved) => saved.id === item.id) ? '#5E5CE6' : '#A0A0C0'} />
      </TouchableOpacity>
    </Animated.View>
  );
}

// Job Listings Screen
function JobListingsScreen({ navigation }) {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);
  const [savedJobs, setSavedJobs] = useState([]);
  const [useAlternateColors, setUseAlternateColors] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState({ remote: false, fullTime: false, salaryMin: 0 });
  const [alertsEnabled, setAlertsEnabled] = useState(false);

  const opacity = useSharedValue(0);
  const searchScale = useSharedValue(0.9);

  useEffect(() => {
    fetchJobs();
    loadSavedJobs();
    checkJobAlerts();
    opacity.value = withTiming(1, { duration: 600 });
  }, []);

  useEffect(() => {
    searchScale.value = searchVisible ? withSpring(1, { stiffness: 100 }) : withTiming(0.9, { duration: 200 });
  }, [searchVisible]);

  const containerStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const searchStyle = useAnimatedStyle(() => ({ transform: [{ scale: searchScale.value }] }));

  const fetchJobs = async () => {
    try {
      const response = await fetch('https://jsonfakery.com/jobs/simple-paginate', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const text = await response.text();
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = JSON.parse(text);
      if (!data || !Array.isArray(data.data)) throw new Error('Invalid data format');
      const mappedJobs = data.data.map((job, index) => ({
        id: job.id || index.toString(), // Fixed syntax here
        title: job.job_title || 'Untitled Job',
        company: job.company || 'Unknown Company',
        location: job.location || 'Unknown Location',
        description: job.description || 'No description available',
        requirements: job.requirements || 'No requirements listed',
        apply_url: job.apply_url || 'https://example.com/apply',
      }));
      setJobs(mappedJobs);
      setFilteredJobs(mappedJobs);
      await AsyncStorage.setItem('jobs', JSON.stringify(mappedJobs));
    } catch (error) {
      console.error('Error fetching jobs:', error);
      const cachedJobs = await AsyncStorage.getItem('jobs');
      if (cachedJobs) {
        const parsedCachedJobs = JSON.parse(cachedJobs);
        setJobs(parsedCachedJobs);
        setFilteredJobs(parsedCachedJobs);
        Alert.alert('Info', 'Loaded cached jobs');
      } else {
        Alert.alert('Error', 'Failed to fetch jobs');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadSavedJobs = async () => {
    const saved = await AsyncStorage.getItem('savedJobs');
    if (saved) setSavedJobs(JSON.parse(saved));
  };

  const saveJob = async (job) => {
    const updatedSavedJobs = savedJobs.some((saved) => saved.id === job.id) ? savedJobs.filter((saved) => saved.id !== job.id) : [...savedJobs, job];
    setSavedJobs(updatedSavedJobs);
    await AsyncStorage.setItem('savedJobs', JSON.stringify(updatedSavedJobs));
    Alert.alert('Saved', `${job.title} ${savedJobs.some((saved) => saved.id === job.id) ? 'removed' : 'saved'}`);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(text.toLowerCase()) ||
        job.company.toLowerCase().includes(text.toLowerCase()) ||
        job.location.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredJobs(filtered);
  };

  const applyFilters = () => {
    let result = [...jobs];
    if (filters.remote) result = result.filter((job) => job.location.toLowerCase().includes('remote'));
    if (filters.fullTime) result = result.filter((job) => job.description.toLowerCase().includes('full-time'));
    if (filters.salaryMin > 0)
      result = result.filter((job) => {
        const salary = parseInt(job.description.match(/\d+k/i)?.[0] || '0');
        return salary >= filters.salaryMin;
      });
    setFilteredJobs(result);
  };

  const setupJobAlerts = async () => {
    if (alertsEnabled) {
      await AsyncStorage.setItem('jobAlerts', JSON.stringify({ keywords: searchQuery, filters }));
      Alert.alert('Alerts', 'Notifications enabled');
    } else {
      await AsyncStorage.removeItem('jobAlerts');
    }
  };

  const checkJobAlerts = async () => {
    const alerts = await AsyncStorage.getItem('jobAlerts');
    if (alerts) {
      setAlertsEnabled(true);
      const { keywords, filters: storedFilters } = JSON.parse(alerts);
      setSearchQuery(keywords);
      setFilters(storedFilters);
      applyFilters();
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Confirm logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          await AsyncStorage.removeItem('username');
          navigation.replace('Login');
        },
      },
    ]);
  };

  const toggleColors = () => setUseAlternateColors(!useAlternateColors);

  if (loading)
    return (
      <LinearGradient colors={['#1E1E2F', '#2A2A40']} style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#34C759" />
        <Text style={styles.loadingText}>Loading Opportunities...</Text>
      </LinearGradient>
    );

  return (
    <LinearGradient colors={['#1E1E2F', '#2A2A40']} style={styles.listContainer}>
      <Animated.View style={[styles.listHeader, containerStyle]}>
        <Text style={styles.header}>Opportunities</Text>
        <View style={styles.controlBar}>
          <TouchableOpacity onPress={() => setSearchVisible(!searchVisible)}>
            <Feather name="search" size={22} color="#34C759" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setFilterModalVisible(true)}>
            <Feather name="filter" size={22} color="#34C759" />
          </TouchableOpacity>
          <Switch
            value={alertsEnabled}
            onValueChange={(val) => {
              setAlertsEnabled(val);
              setupJobAlerts();
            }}
            trackColor={{ false: '#5E5CE6', true: '#34C759' }}
            thumbColor={alertsEnabled ? '#FFF' : '#A0A0C0'}
          />
          <TouchableOpacity onPress={toggleColors}>
            <Feather name="refresh-cw" size={22} color="#34C759" />
          </TouchableOpacity>
        </View>
      </Animated.View>
      {searchVisible && (
        <Animated.View style={[styles.searchContainer, searchStyle]}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search jobs..."
            placeholderTextColor="#A0A0C0"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </Animated.View>
      )}
      <FlatList
        data={filteredJobs}
        renderItem={({ item }) => (
          <JobCard item={item} navigation={navigation} savedJobs={savedJobs} saveJob={saveJob} useAlternateColors={useAlternateColors} />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.gridList}
      />
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.navigate('SavedJobs')}>
          <Feather name="bookmark" size={26} color="#5E5CE6" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Feather name="user" size={26} color="#5E5CE6" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LinearGradient colors={['#FF3B30', '#FF5733']} style={styles.gradientButton}>
            <Text style={styles.buttonText}>Logout</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      <Modal visible={filterModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Options</Text>
            <View style={styles.filterOption}>
              <Text style={styles.infoText}>Remote</Text>
              <Switch value={filters.remote} onValueChange={(val) => setFilters({ ...filters, remote: val })} />
            </View>
            <View style={styles.filterOption}>
              <Text style={styles.infoText}>Full-Time</Text>
              <Switch value={filters.fullTime} onValueChange={(val) => setFilters({ ...filters, fullTime: val })} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Min Salary (k)"
              placeholderTextColor="#A0A0C0"
              value={filters.salaryMin.toString()}
              onChangeText={(text) => setFilters({ ...filters, salaryMin: parseInt(text) || 0 })}
              keyboardType="numeric"
            />
            <TouchableOpacity
              onPress={() => {
                applyFilters();
                setFilterModalVisible(false);
              }}
            >
              <LinearGradient colors={['#5E5CE6', '#7B68EE']} style={styles.gradientButton}>
                <Text style={styles.buttonText}>Apply</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
              <Text style={styles.switchText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

// Job Details Screen
function JobDetailsScreen({ route, navigation }) {
  const { job } = route.params;
  const [savedJobs, setSavedJobs] = useState([]);
  const [useAlternateColors, setUseAlternateColors] = useState(false);

  const opacity = useSharedValue(0);

  useEffect(() => {
    loadSavedJobs();
    opacity.value = withTiming(1, { duration: 600 });
  }, []);

  const cardStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const loadSavedJobs = async () => {
    const saved = await AsyncStorage.getItem('savedJobs');
    if (saved) setSavedJobs(JSON.parse(saved));
  };

  const saveJob = async () => {
    const updatedSavedJobs = savedJobs.some((saved) => saved.id === job.id) ? savedJobs.filter((saved) => saved.id !== job.id) : [...savedJobs, job];
    setSavedJobs(updatedSavedJobs);
    await AsyncStorage.setItem('savedJobs', JSON.stringify(updatedSavedJobs));
    Alert.alert('Saved', `${job.title} ${savedJobs.some((saved) => saved.id === job.id) ? 'removed' : 'saved'}`);
  };

  const toggleColors = () => setUseAlternateColors(!useAlternateColors);

  return (
    <LinearGradient colors={['#1E1E2F', '#2A2A40']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.detailContent}>
        <Animated.View style={[styles.detailCard, { borderColor: useAlternateColors ? '#34C759' : '#5E5CE6' }, cardStyle]}>
          <Text style={styles.detailTitle}>{job.title}</Text>
          <Text style={styles.detailSubtitle}>{job.company} • {job.location}</Text>
          <TouchableOpacity style={styles.saveButtonDetails} onPress={saveJob}>
            <Feather name={savedJobs.some((saved) => saved.id === job.id) ? 'bookmark' : 'bookmark'} size={24} color={savedJobs.some((saved) => saved.id === job.id) ? '#5E5CE6' : '#A0A0C0'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.toggleButtonDetails} onPress={toggleColors}>
            <Feather name="refresh-cw" size={24} color="#34C759" />
          </TouchableOpacity>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.detailText}>{job.description}</Text>
          <Text style={styles.sectionTitle}>Requirements</Text>
          <Text style={styles.detailText}>{job.requirements}</Text>
          <TouchableOpacity style={styles.applyButton} onPress={() => Linking.openURL(job.apply_url || 'https://example.com')}>
            <LinearGradient colors={['#5E5CE6', '#7B68EE']} style={styles.gradientButton}>
              <Text style={styles.buttonText}>Apply Now</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

// SavedJobCard Component
function SavedJobCard({ item, navigation }) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 400 });
  }, []);

  const cardStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[styles.jobCard, { borderColor: '#34C759' }, cardStyle]}>
      <TouchableOpacity onPress={() => navigation.navigate('JobDetails', { job: item })}>
        <Text style={styles.jobTitle}>{item.title}</Text>
        <Text style={styles.jobSubtitle}>{item.company} • {item.location}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Saved Jobs Screen
function SavedJobsScreen({ navigation }) {
  const [savedJobs, setSavedJobs] = useState([]);

  const opacity = useSharedValue(0);

  useEffect(() => {
    loadSavedJobs();
    opacity.value = withTiming(1, { duration: 600 });
  }, []);

  const headerStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const loadSavedJobs = async () => {
    const saved = await AsyncStorage.getItem('savedJobs');
    if (saved) setSavedJobs(JSON.parse(saved));
  };

  return (
    <LinearGradient colors={['#1E1E2F', '#2A2A40']} style={styles.listContainer}>
      <Animated.Text style={[styles.header, headerStyle]}>Saved Jobs</Animated.Text>
      {savedJobs.length === 0 ? (
        <Text style={styles.noJobsText}>No saved jobs yet.</Text>
      ) : (
        <FlatList
          data={savedJobs}
          renderItem={({ item }) => <SavedJobCard item={item} navigation={navigation} />}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.gridList}
        />
      )}
    </LinearGradient>
  );
}

// Profile Screen
function ProfileScreen({ navigation }) {
  const [username, setUsername] = useState('User');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [dob, setDob] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);

  const opacity = useSharedValue(0);
  const photoScale = useSharedValue(0.9);

  useEffect(() => {
    loadProfile();
    opacity.value = withTiming(1, { duration: 600 });
    photoScale.value = withSpring(1, { stiffness: 100 });
  }, []);

  const profileStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const photoStyle = useAnimatedStyle(() => ({ transform: [{ scale: photoScale.value }] }));

  const loadProfile = async () => {
    const storedUsername = await AsyncStorage.getItem('username');
    const storedEmail = await AsyncStorage.getItem('email');
    const storedPhone = await AsyncStorage.getItem('phone');
    const storedStatus = await AsyncStorage.getItem('status');
    const storedBio = await AsyncStorage.getItem('bio');
    const storedLocation = await AsyncStorage.getItem('location');
    const storedDob = await AsyncStorage.getItem('dob');
    const storedPhoto = await AsyncStorage.getItem('profilePhoto');
    if (storedUsername) setUsername(storedUsername);
    if (storedEmail) setEmail(storedEmail);
    if (storedPhone) setPhone(storedPhone);
    if (storedStatus) setStatus(storedStatus);
    if (storedBio) setBio(storedBio);
    if (storedLocation) setLocation(storedLocation);
    if (storedDob) setDob(storedDob);
    if (storedPhoto) setProfilePhoto(storedPhoto);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Photo access required.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      const photoUri = result.assets[0].uri;
      setProfilePhoto(photoUri);
      await AsyncStorage.setItem('profilePhoto', photoUri);
      Alert.alert('Success', 'Photo updated');
    }
  };

  const openSocialLink = (platform) => {
    const links = {
      gmail: `mailto:${email || 'itxmemani0543@gmail.com'}`,
      github: 'https://github.com/mani0543/Mad-Mids.git',
      facebook: 'https://facebook.com/yourusername',
      whatsapp: `https://wa.me/${phone || '03155296456'}`,
    };
    Linking.openURL(links[platform]);
  };

  return (
    <LinearGradient colors={['#1E1E2F', '#2A2A40']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.profileContainer}>
        <Animated.View style={[styles.profileContent, profileStyle]}>
          <TouchableOpacity onPress={pickImage}>
            <Animated.View style={[styles.profilePhotoContainer, photoStyle]}>
              {profilePhoto ? <Image source={{ uri: profilePhoto }} style={styles.profilePhoto} /> : <Feather name="user" size={70} color="#34C759" />}
            </Animated.View>
          </TouchableOpacity>
          <Text style={styles.profileTitle}>{username}</Text>
          <Text style={styles.profileSubtitle}>{status || 'Professional'}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ProfileDetail')}>
            <View style={styles.profileInfo}>
              <Text style={styles.infoText}>Email: {email || 'Not set'}</Text>
              <Text style={styles.infoText}>Phone: {phone || 'Not set'}</Text>
              <Text style={styles.infoText}>Bio: {bio || 'Not set'}</Text>
              <Text style={styles.infoText}>Location: {location || 'Not set'}</Text>
              <Text style={styles.infoText}>DOB: {dob || 'Not set'}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('ResumeBuilder')}>
            <LinearGradient colors={['#34C759', '#40C4FF']} style={styles.gradientButton}>
              <Text style={styles.buttonText}>Resume Builder</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('ApplicationTracker')}>
            <LinearGradient colors={['#5E5CE6', '#7B68EE']} style={styles.gradientButton}>
              <Text style={styles.buttonText}>Track Applications</Text>
            </LinearGradient>
          </TouchableOpacity>
          <View style={styles.socialContainer}>
            <TouchableOpacity onPress={() => openSocialLink('gmail')}>
              <Feather name="mail" size={28} color="#5E5CE6" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openSocialLink('github')}>
              <Feather name="github" size={28} color="#34C759" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openSocialLink('facebook')}>
              <Feather name="facebook" size={28} color="#5E5CE6" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openSocialLink('whatsapp')}>
              <Feather name="phone" size={28} color="#34C759" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

// Profile Detail Screen
function ProfileDetailScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [dob, setDob] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const storedUsername = await AsyncStorage.getItem('username');
    const storedEmail = await AsyncStorage.getItem('email');
    const storedPhone = await AsyncStorage.getItem('phone');
    const storedStatus = await AsyncStorage.getItem('status');
    const storedBio = await AsyncStorage.getItem('bio');
    const storedLocation = await AsyncStorage.getItem('location');
    const storedDob = await AsyncStorage.getItem('dob');
    setUsername(storedUsername || 'User');
    setEmail(storedEmail || '');
    setPhone(storedPhone || '');
    setStatus(storedStatus || '');
    setBio(storedBio || '');
    setLocation(storedLocation || '');
    setDob(storedDob || '');
  };

  const saveProfile = async () => {
    if (username.trim() === '') {
      Alert.alert('Error', 'Username cannot be empty');
      return;
    }
    try {
      const existingUsers = await AsyncStorage.getItem('users');
      let users = existingUsers ? JSON.parse(existingUsers) : [];
      const currentUsername = await AsyncStorage.getItem('username');
      const userIndex = users.findIndex((u) => u.username === currentUsername);
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], username, email };
      }
      await AsyncStorage.setItem('users', JSON.stringify(users));
      await AsyncStorage.setItem('username', username);
      await AsyncStorage.setItem('email', email);
      await AsyncStorage.setItem('phone', phone);
      await AsyncStorage.setItem('status', status);
      await AsyncStorage.setItem('bio', bio);
      await AsyncStorage.setItem('location', location);
      await AsyncStorage.setItem('dob', dob);
      Alert.alert('Success', 'Profile updated');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Update failed');
    }
  };

  return (
    <LinearGradient colors={['#1E1E2F', '#2A2A40']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.profileContainer}>
        <Text style={styles.header}>Edit Profile</Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#A0A0C0"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#A0A0C0"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Phone"
          placeholderTextColor="#A0A0C0"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="Status"
          placeholderTextColor="#A0A0C0"
          value={status}
          onChangeText={setStatus}
        />
        <TextInput
          style={styles.input}
          placeholder="Bio"
          placeholderTextColor="#A0A0C0"
          value={bio}
          onChangeText={setBio}
          multiline
        />
        <TextInput
          style={styles.input}
          placeholder="Location"
          placeholderTextColor="#A0A0C0"
          value={location}
          onChangeText={setLocation}
        />
        <TextInput
          style={styles.input}
          placeholder="DOB (YYYY-MM-DD)"
          placeholderTextColor="#A0A0C0"
          value={dob}
          onChangeText={setDob}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.editButton} onPress={saveProfile}>
          <LinearGradient colors={['#5E5CE6', '#7B68EE']} style={styles.gradientButton}>
            <Text style={styles.buttonText}>Save Profile</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

// Resume Builder Screen
function ResumeBuilderScreen() {
  const [resumeData, setResumeData] = useState({
    name: '',
    education: '',
    experience: '',
    skills: '',
    certifications: '',
  });

  const saveResume = async () => {
    await AsyncStorage.setItem('resume', JSON.stringify(resumeData));
    Alert.alert('Success', 'Resume saved');
  };

  return (
    <LinearGradient colors={['#1E1E2F', '#2A2A40']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.profileContainer}>
        <Text style={styles.header}>Resume Builder</Text>
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#A0A0C0"
          value={resumeData.name}
          onChangeText={(text) => setResumeData({ ...resumeData, name: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Education"
          placeholderTextColor="#A0A0C0"
          multiline
          value={resumeData.education}
          onChangeText={(text) => setResumeData({ ...resumeData, education: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Experience"
          placeholderTextColor="#A0A0C0"
          multiline
          value={resumeData.experience}
          onChangeText={(text) => setResumeData({ ...resumeData, experience: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Skills"
          placeholderTextColor="#A0A0C0"
          multiline
          value={resumeData.skills}
          onChangeText={(text) => setResumeData({ ...resumeData, skills: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Certifications"
          placeholderTextColor="#A0A0C0"
          multiline
          value={resumeData.certifications}
          onChangeText={(text) => setResumeData({ ...resumeData, certifications: text })}
        />
        <TouchableOpacity onPress={saveResume}>
          <LinearGradient colors={['#34C759', '#40C4FF']} style={styles.gradientButton}>
            <Text style={styles.buttonText}>Save Resume</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

// Application Tracker Screen
function ApplicationTrackerScreen({ navigation }) {
  const [applications, setApplications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newApp, setNewApp] = useState({ company: '', position: '', date: new Date(), status: 'Applied' });

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const apps = await AsyncStorage.getItem('applications');
      if (apps) setApplications(JSON.parse(apps));
    } catch (error) {
      console.error('Error loading applications:', error);
      Alert.alert('Error', 'Failed to load applications');
    }
  };

  const addApplication = async () => {
    if (!newApp.company || !newApp.position) {
      Alert.alert('Error', 'Company and Position are required');
      return;
    }
    try {
      const updatedApps = [...applications, { ...newApp, id: Date.now().toString() }];
      setApplications(updatedApps);
      await AsyncStorage.setItem('applications', JSON.stringify(updatedApps));
      setShowForm(false);
      setNewApp({ company: '', position: '', date: new Date(), status: 'Applied' });
      Alert.alert('Success', 'Application added');
    } catch (error) {
      console.error('Error saving application:', error);
      Alert.alert('Error', 'Failed to save application');
    }
  };

  return (
    <LinearGradient colors={['#1E1E2F', '#2A2A40']} style={styles.listContainer}>
      <Text style={styles.header}>Application Tracker</Text>
      {applications.length === 0 ? (
        <Text style={styles.noJobsText}>No applications yet.</Text>
      ) : (
        <FlatList
          data={applications}
          renderItem={({ item }) => (
            <View style={styles.jobCard}>
              <Text style={styles.jobTitle}>
                {item.company} - {item.position}
              </Text>
              <Text style={styles.jobSubtitle}>
                {item.status} • {new Date(item.date).toLocaleDateString()}
              </Text>
            </View>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.gridList}
        />
      )}
      <TouchableOpacity style={styles.editButton} onPress={() => setShowForm(true)}>
        <LinearGradient colors={['#5E5CE6', '#7B68EE']} style={styles.gradientButton}>
          <Text style={styles.buttonText}>Add Application</Text>
        </LinearGradient>
      </TouchableOpacity>
      <Modal visible={showForm} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Application</Text>
            <TextInput
              style={styles.input}
              placeholder="Company"
              placeholderTextColor="#A0A0C0"
              value={newApp.company}
              onChangeText={(text) => setNewApp({ ...newApp, company: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Position"
              placeholderTextColor="#A0A0C0"
              value={newApp.position}
              onChangeText={(text) => setNewApp({ ...newApp, position: text })}
            />
            <DateTimePicker
              value={newApp.date}
              mode="date"
              display="default"
              onChange={(event, date) => setNewApp({ ...newApp, date: date || new Date() })}
            />
            <TextInput
              style={styles.input}
              placeholder="Status"
              placeholderTextColor="#A0A0C0"
              value={newApp.status}
              onChangeText={(text) => setNewApp({ ...newApp, status: text })}
            />
            <TouchableOpacity style={styles.modalButton} onPress={addApplication}>
              <LinearGradient colors={['#5E5CE6', '#7B68EE']} style={styles.gradientButton}>
                <Text style={styles.buttonText}>Save</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={() => setShowForm(false)}>
              <LinearGradient colors={['#FF3B30', '#FF5733']} style={styles.gradientButton}>
                <Text style={styles.buttonText}>Cancel</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

// Main App Component
function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: { backgroundColor: '#1E1E2F', elevation: 0, shadowOpacity: 0 },
          headerTintColor: '#FFF',
          headerTitleStyle: { fontWeight: '600', fontSize: 20 },
          headerTitleAlign: 'center',
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Welcome' }} />
        <Stack.Screen name="JobListings" component={JobListingsScreen} options={{ headerLeft: null, title: 'Jobs' }} />
        <Stack.Screen name="JobDetails" component={JobDetailsScreen} options={{ title: 'Job Details' }} />
        <Stack.Screen name="SavedJobs" component={SavedJobsScreen} options={{ title: 'Saved' }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
        <Stack.Screen name="ProfileDetail" component={ProfileDetailScreen} options={{ title: 'Edit Profile' }} />
        <Stack.Screen name="ResumeBuilder" component={ResumeBuilderScreen} options={{ title: 'Resume' }} />
        <Stack.Screen name="ApplicationTracker" component={ApplicationTrackerScreen} options={{ title: 'Tracker' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#34C759', fontSize: 16, marginTop: 10, fontWeight: '500' },

  // Login Screen
  loginContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  loginTitle: { fontSize: 32, color: '#FFF', fontWeight: '700', marginBottom: 40 },
  inputContainer: { width: '100%', marginBottom: 20 },
  input: {
    backgroundColor: '#2F2F4A',
    color: '#FFF',
    padding: 15,
    marginVertical: 10,
    borderRadius: 12,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  authButton: { width: '70%', marginVertical: 20 },
  gradientButton: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#5E5CE6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  switchText: { color: '#34C759', fontSize: 16, marginTop: 10 },

  // Job Listings Screen
  listContainer: { flex: 1, paddingTop: 20 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 },
  header: { fontSize: 28, color: '#FFF', fontWeight: '700' },
  controlBar: { flexDirection: 'row', gap: 20, alignItems: 'center' },
  searchContainer: { paddingHorizontal: 20, marginVertical: 10 },
  searchInput: {
    backgroundColor: '#2F2F4A',
    color: '#FFF',
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  gridList: { paddingHorizontal: 20, paddingBottom: 80 },
  jobCard: {
    backgroundColor: '#2F2F4A',
    padding: 20,
    marginVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  jobTitle: { fontSize: 18, color: '#FFF', fontWeight: '600' },
  jobSubtitle: { fontSize: 14, color: '#A0A0C0', marginTop: 5 },
  saveButton: { padding: 5 },
  navBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: '#2F2F4A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  logoutButton: { width: '35%' },

  // Job Details Screen
  detailContent: { flexGrow: 1, padding: 20 },
  detailCard: {
    backgroundColor: '#2F2F4A',
    padding: 25,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  detailTitle: { fontSize: 26, color: '#FFF', fontWeight: '700', marginBottom: 10 },
  detailSubtitle: { fontSize: 16, color: '#A0A0C0', marginBottom: 20 },
  sectionTitle: { fontSize: 20, color: '#FFF', fontWeight: '600', marginTop: 20 },
  detailText: { fontSize: 16, color: '#D0D0E0', marginVertical: 10, lineHeight: 24 },
  applyButton: { marginTop: 30, width: '60%', alignSelf: 'center' },
  saveButtonDetails: { position: 'absolute', top: 15, right: 15 },
  toggleButtonDetails: { position: 'absolute', top: 15, left: 15 },

  // Saved Jobs Screen
  noJobsText: { fontSize: 18, color: '#A0A0C0', textAlign: 'center', marginTop: 30 },

  // Profile Screen
  profileContainer: { flexGrow: 1, alignItems: 'center', padding: 30 },
  profileContent: { alignItems: 'center', width: '100%' },
  profilePhotoContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#2F2F4A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#34C759',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  profilePhoto: { width: '100%', height: '100%', borderRadius: 70 },
  profileTitle: { fontSize: 32, color: '#FFF', fontWeight: '700', marginBottom: 10 },
  profileSubtitle: { fontSize: 18, color: '#A0A0C0', marginBottom: 20 },
  profileInfo: { width: '100%', marginBottom: 30 },
  infoText: { fontSize: 16, color: '#D0D0E0', marginVertical: 8, textAlign: 'center' },
  editButton: { width: '70%', marginVertical: 10 },
  socialContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '80%', marginTop: 20 },

  // Modal Styles
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)' },
  modalContent: {
    backgroundColor: '#2F2F4A',
    padding: 25,
    borderRadius: 12,
    width: '85%',
    alignItems: 'center',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modalScroll: { width: '100%', marginBottom: 20 },
  modalTitle: { fontSize: 24, color: '#FFF', fontWeight: '700', marginBottom: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  modalButton: { width: '45%', marginVertical: 5 },
  filterOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 15, width: '100%' },
});

export default App;
