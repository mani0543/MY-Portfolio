import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet, Linking, Alert, ScrollView, Modal, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Animated, { Easing, useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';

const Stack = createStackNavigator();
const BASE_URL = 'http://192.168.43.205:3000';

// Login Screen
function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(100);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 600 });
    translateY.value = withSpring(0, { stiffness: 100 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const handleAuth = async () => {
    const endpoint = isSignup ? '/api/signup' : '/api/login';
    const body = isSignup ? { username, password, email } : { username, password };

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const text = await response.text();
      console.log(`Raw ${endpoint} response:`, text);
      const data = JSON.parse(text);
      if (!response.ok) throw new Error(data.error || 'Authentication failed');
      await AsyncStorage.setItem('username', username);
      Alert.alert('Success', data.message);
      if (!isSignup) navigation.navigate('JobListings');
    } catch (error) {
      console.error('Auth error:', error);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <LinearGradient colors={['#0D001A', '#1A0033']} style={styles.container}>
      <View style={styles.neonOverlay} />
      <Animated.View style={[styles.loginContainer, animatedStyle]}>
        <Text style={styles.loginTitle}>{isSignup ? 'Access Granted' : 'Enter System'}</Text>
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} placeholder="ID" placeholderTextColor="#8A4AF5" value={username} onChangeText={setUsername} />
          {isSignup && <TextInput style={styles.input} placeholder="Comm Link" placeholderTextColor="#8A4AF5" value={email} onChangeText={setEmail} keyboardType="email-address" />}
          <TextInput style={styles.input} placeholder="Code" placeholderTextColor="#8A4AF5" value={password} onChangeText={setPassword} secureTextEntry />
        </View>
        <TouchableOpacity style={styles.authButton} onPress={handleAuth}>
          <LinearGradient colors={['#FF007A', '#FF4D00']} style={styles.gradientButton}>
            <Text style={styles.buttonText}>{isSignup ? 'Initiate' : 'Connect'}</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsSignup(!isSignup)}>
          <Text style={styles.switchText}>{isSignup ? 'Existing User?' : 'New User?'}</Text>
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

  const handlePressIn = () => scale.value = withTiming(0.98, { duration: 100 });
  const handlePressOut = () => scale.value = withTiming(1, { duration: 100 });

  return (
    <Animated.View style={[styles.jobCard, { borderColor: useAlternateColors ? '#00FFCC' : '#FF007A' }, cardStyle]}>
      <TouchableOpacity onPress={() => navigation.navigate('JobDetails', { job: item })} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Text style={styles.jobTitle}>{item.title}</Text>
        <Text style={styles.jobSubtitle}>{item.company} - {item.location}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.saveButton} onPress={() => saveJob(item)}>
        <Feather name={savedJobs.some(saved => saved.id === item.id) ? "bookmark" : "bookmark"} size={18} color={savedJobs.some(saved => saved.id === item.id) ? "#FF007A" : "#8A4AF5"} />
      </TouchableOpacity>
    </Animated.View>
  );
}

// Job Listings Screen (Updated with proper response handling)
function JobListingsScreen({ navigation }) {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);
  const [savedJobs, setSavedJobs] = useState([]);
  const [useAlternateColors, setUseAlternateColors] = useState(false);

  const opacity = useSharedValue(0);
  const searchScale = useSharedValue(0.8);
  const searchGlow = useSharedValue(0);

  useEffect(() => {
    fetchJobs();
    loadSavedJobs();
    opacity.value = withTiming(1, { duration: 500 });
  }, []);

  useEffect(() => {
    searchScale.value = searchVisible ? withSpring(1, { stiffness: 120 }) : withTiming(0.8, { duration: 200 });
    searchGlow.value = searchVisible ? withTiming(1, { duration: 300 }) : withTiming(0, { duration: 200 });
  }, [searchVisible]);

  const containerStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const searchStyle = useAnimatedStyle(() => ({
    transform: [{ scale: searchScale.value }],
    opacity: searchGlow.value,
  }));

  const fetchJobs = async () => {
    try {
      const response = await fetch('https://jsonfakery.com/jobs/simple-paginate', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const text = await response.text();
      console.log('Raw response from jsonfakery:', text);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}, Response: ${text}`);
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        throw new Error(`Failed to parse JSON: ${parseError.message}, Raw response: ${text}`);
      }

      // Check if data is an object with a 'data' property that is an array
      if (!data || !Array.isArray(data.data)) {
        throw new Error(`Expected an object with a 'data' array, but got: ${JSON.stringify(data)}`);
      }

      // Map the jobs from the 'data' array
      const mappedJobs = data.data.map((job, index) => ({
        id: job.id || index.toString(),
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
      console.error('Error fetching jobs from jsonfakery:', error);
      const cachedJobs = await AsyncStorage.getItem('jobs');
      if (cachedJobs) {
        const parsedCachedJobs = JSON.parse(cachedJobs);
        setJobs(parsedCachedJobs);
        setFilteredJobs(parsedCachedJobs);
        Alert.alert('Info', 'Loaded cached jobs due to fetch error');
      } else {
        Alert.alert('Error', `Failed to fetch jobs: ${error.message}`);
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
    const updatedSavedJobs = savedJobs.some(saved => saved.id === job.id)
      ? savedJobs.filter(saved => saved.id !== job.id)
      : [...savedJobs, job];
    setSavedJobs(updatedSavedJobs);
    await AsyncStorage.setItem('savedJobs', JSON.stringify(updatedSavedJobs));
    Alert.alert('Job Saved', `Job ${job.title} has been ${savedJobs.some(saved => saved.id === job.id) ? 'removed from' : 'added to'} your saved list!`);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = jobs.filter(job =>
      job.title.toLowerCase().includes(text.toLowerCase()) ||
      job.company.toLowerCase().includes(text.toLowerCase()) ||
      job.location.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredJobs(filtered);
  };

  const handleLogout = () => {
    Alert.alert('Disconnect', 'Confirm disconnection?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Yes', onPress: () => navigation.replace('Login') },
    ]);
  };

  const toggleColors = () => setUseAlternateColors(!useAlternateColors);

  if (loading) return (
    <LinearGradient colors={['#0D001A', '#1A0033']} style={styles.loaderContainer}>
      <ActivityIndicator size="large" color="#00FFCC" />
      <Text style={styles.loadingText}>Syncing Data...</Text>
    </LinearGradient>
  );

  return (
    <LinearGradient colors={['#0D001A', '#1A0033']} style={styles.listContainer}>
      <View style={styles.neonOverlay} />
      <Animated.View style={[styles.listHeader, containerStyle]}>
        <Text style={styles.header}>Job Grid</Text>
        <View style={styles.controlBar}>
          <TouchableOpacity onPress={() => setSearchVisible(!searchVisible)}>
            <Feather name="search" size={20} color="#00FFCC" />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleColors}>
            <Feather name="refresh-ccw" size={20} color="#00FFCC" />
          </TouchableOpacity>
        </View>
      </Animated.View>
      <Animated.View style={[styles.searchContainer, searchStyle]}>
        <LinearGradient colors={['#FF007A', '#FF4D00']} style={styles.searchGradient}>
          <View style={styles.searchInputWrapper}>
            <Feather name="search" size={18} color="#FFF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Query Grid"
              placeholderTextColor="rgba(255, 255, 255, 0.7)"
              value={searchQuery}
              onChangeText={handleSearch}
              autoFocus={searchVisible}
            />
          </View>
        </LinearGradient>
      </Animated.View>
      <FlatList
        data={filteredJobs}
        renderItem={({ item }) => (
          <JobCard item={item} navigation={navigation} savedJobs={savedJobs} saveJob={saveJob} useAlternateColors={useAlternateColors} />
        )}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.gridList}
      />
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.navigate('SavedJobs')}>
          <Feather name="bookmark" size={24} color="#FF007A" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Feather name="user" size={24} color="#FF007A" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LinearGradient colors={['#FF007A', '#FF4D00']} style={styles.gradientButton}>
            <Text style={styles.buttonText}>Disconnect</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
    opacity.value = withTiming(1, { duration: 500 });
  }, []);

  const cardStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const loadSavedJobs = async () => {
    const saved = await AsyncStorage.getItem('savedJobs');
    if (saved) setSavedJobs(JSON.parse(saved));
  };

  const saveJob = async () => {
    const updatedSavedJobs = savedJobs.some(saved => saved.id === job.id)
      ? savedJobs.filter(saved => saved.id !== job.id)
      : [...savedJobs, job];
    setSavedJobs(updatedSavedJobs);
    await AsyncStorage.setItem('savedJobs', JSON.stringify(updatedSavedJobs));
    Alert.alert('Job Saved', `Job ${job.title} has been ${savedJobs.some(saved => saved.id === job.id) ? 'removed from' : 'added to'} your saved list!`);
  };

  const toggleColors = () => setUseAlternateColors(!useAlternateColors);

  return (
    <LinearGradient colors={['#0D001A', '#1A0033']} style={styles.container}>
      <View style={styles.neonOverlay} />
      <ScrollView contentContainerStyle={styles.detailContent}>
        <Animated.View style={[styles.detailCard, { borderColor: useAlternateColors ? '#00FFCC' : '#FF007A' }, cardStyle]}>
          <Text style={styles.detailTitle}>{job.title}</Text>
          <Text style={styles.detailSubtitle}>{job.company} - {job.location}</Text>
          <TouchableOpacity style={styles.saveButtonDetails} onPress={saveJob}>
            <Feather name={savedJobs.some(saved => saved.id === job.id) ? "bookmark" : "bookmark"} size={20} color={savedJobs.some(saved => saved.id === job.id) ? "#FF007A" : "#8A4AF5"} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.toggleButtonDetails} onPress={toggleColors}>
            <Feather name="refresh-ccw" size={20} color="#00FFCC" />
          </TouchableOpacity>
          <Text style={styles.sectionTitle}>Data:</Text>
          <Text style={styles.detailText}>{job.description}</Text>
          <Text style={styles.sectionTitle}>Specs:</Text>
          <Text style={styles.detailText}>{job.requirements}</Text>
          <TouchableOpacity style={styles.applyButton} onPress={() => Linking.openURL(job.apply_url || 'https://example.com')}>
            <LinearGradient colors={['#FF007A', '#FF4D00']} style={styles.gradientButton}>
              <Text style={styles.buttonText}>Execute</Text>
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
    <Animated.View style={[styles.jobCard, { borderColor: '#00FFCC' }, cardStyle]}>
      <TouchableOpacity onPress={() => navigation.navigate('JobDetails', { job: item })}>
        <Text style={styles.jobTitle}>{item.title}</Text>
        <Text style={styles.jobSubtitle}>{item.company} - {item.location}</Text>
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
    opacity.value = withTiming(1, { duration: 500 });
  }, []);

  const headerStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const loadSavedJobs = async () => {
    const saved = await AsyncStorage.getItem('savedJobs');
    if (saved) setSavedJobs(JSON.parse(saved));
  };

  return (
    <LinearGradient colors={['#0D001A', '#1A0033']} style={styles.listContainer}>
      <View style={styles.neonOverlay} />
      <Animated.Text style={[styles.header, headerStyle]}>Saved Nodes</Animated.Text>
      {savedJobs.length === 0 ? (
        <Text style={styles.noJobsText}>No nodes detected.</Text>
      ) : (
        <FlatList
          data={savedJobs}
          renderItem={({ item }) => <SavedJobCard item={item} navigation={navigation} />}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.gridList}
        />
      )}
    </LinearGradient>
  );
}

// Profile Screen
function ProfileScreen() {
  const [username, setUsername] = useState('User');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [dob, setDob] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [useAlternateColors, setUseAlternateColors] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [newBio, setNewBio] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newDob, setNewDob] = useState('');

  const opacity = useSharedValue(0);
  const photoScale = useSharedValue(0.8);

  useEffect(() => {
    loadProfile();
    opacity.value = withTiming(1, { duration: 500 });
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
      Alert.alert('Permission Denied', 'We need permission to access your photos.');
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
      Alert.alert('Success', 'Profile photo updated');
    }
  };

  const saveProfile = async () => {
    if (newUsername.trim() === '') {
      Alert.alert('Error', 'ID cannot be null');
      return;
    }
    try {
      const response = await fetch(`${BASE_URL}/api/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          newUsername,
          email: newEmail,
          phone: newPhone,
          status: newStatus,
          bio: newBio,
          location: newLocation,
          dob: newDob,
        }),
      });
      const text = await response.text();
      console.log('Raw profile update response:', text);
      const data = JSON.parse(text);
      if (!response.ok) throw new Error(data.error || 'Profile update failed');

      await AsyncStorage.setItem('username', newUsername);
      await AsyncStorage.setItem('email', newEmail);
      await AsyncStorage.setItem('phone', newPhone);
      await AsyncStorage.setItem('status', newStatus);
      await AsyncStorage.setItem('bio', newBio);
      await AsyncStorage.setItem('location', newLocation);
      await AsyncStorage.setItem('dob', newDob);
      setUsername(newUsername);
      setEmail(newEmail);
      setPhone(newPhone);
      setStatus(newStatus);
      setBio(newBio);
      setLocation(newLocation);
      setDob(newDob);
      setModalVisible(false);
      Alert.alert('Success', 'Profile updated');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', error.message);
    }
  };

  const toggleColors = () => setUseAlternateColors(!useAlternateColors);

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
    <LinearGradient colors={['#0D001A', '#1A0033']} style={styles.container}>
      <View style={styles.neonOverlay} />
      <ScrollView contentContainerStyle={styles.profileContainer}>
        <Animated.View style={[styles.profileContent, profileStyle]}>
          <TouchableOpacity onPress={pickImage}>
            <Animated.View style={[styles.profilePhotoContainer, photoStyle]}>
              {profilePhoto ? (
                <Image source={{ uri: profilePhoto }} style={styles.profilePhoto} />
              ) : (
                <Feather name="user" size={60} color="#00FFCC" />
              )}
            </Animated.View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.changePhotoButton} onPress={pickImage}>
            <LinearGradient colors={['#00FFCC', '#8A4AF5']} style={styles.gradientButton}>
              <Text style={styles.buttonText}>Change Photo</Text>
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.profileTitle}>{username}</Text>
          <Text style={styles.profileSubtitle}>System Operator</Text>
          <View style={styles.profileInfo}>
            <Text style={styles.infoText}>Comm: {email || 'Not set'}</Text>
            <Text style={styles.infoText}>Signal: {phone || 'Not set'}</Text>
            <Text style={styles.infoText}>Status: {status || 'Not set'}</Text>
            <Text style={styles.infoText}>Bio: {bio || 'Not set'}</Text>
            <Text style={styles.infoText}>Location: {location || 'Not set'}</Text>
            <Text style={styles.infoText}>DOB: {dob || 'Not set'}</Text>
          </View>
          <TouchableOpacity style={styles.toggleButtonProfile} onPress={toggleColors}>
            <Feather name="refresh-ccw" size={20} color="#00FFCC" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.editButton} onPress={() => {
            setNewUsername(username);
            setNewEmail(email);
            setNewPhone(phone);
            setNewStatus(status);
            setNewBio(bio);
            setNewLocation(location);
            setNewDob(dob);
            setModalVisible(true);
          }}>
            <LinearGradient colors={['#FF007A', '#FF4D00']} style={styles.gradientButton}>
              <Text style={styles.buttonText}>Reconfigure</Text>
            </LinearGradient>
          </TouchableOpacity>
          <View style={styles.socialContainer}>
            <TouchableOpacity onPress={() => openSocialLink('gmail')}>
              <Feather name="mail" size={24} color="#FF007A" style={styles.socialIcon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openSocialLink('github')}>
              <Feather name="github" size={24} color="#00FFCC" style={styles.socialIcon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openSocialLink('facebook')}>
              <Feather name="facebook" size={24} color="#FF007A" style={styles.socialIcon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openSocialLink('whatsapp')}>
              <Feather name="phone" size={24} color="#00FFCC" style={styles.socialIcon} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Profile</Text>
            <ScrollView style={styles.modalScroll}>
              <TextInput
                style={styles.input}
                placeholder="New ID"
                placeholderTextColor="#8A4AF5"
                value={newUsername}
                onChangeText={setNewUsername}
              />
              <TextInput
                style={styles.input}
                placeholder="New Comm Link"
                placeholderTextColor="#8A4AF5"
                value={newEmail}
                onChangeText={setNewEmail}
                keyboardType="email-address"
              />
              <TextInput
                style={styles.input}
                placeholder="New Signal"
                placeholderTextColor="#8A4AF5"
                value={newPhone}
                onChangeText={setNewPhone}
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.input}
                placeholder="New Status"
                placeholderTextColor="#8A4AF5"
                value={newStatus}
                onChangeText={setNewStatus}
              />
              <TextInput
                style={styles.input}
                placeholder="New Bio"
                placeholderTextColor="#8A4AF5"
                value={newBio}
                onChangeText={setNewBio}
                multiline
              />
              <TextInput
                style={styles.input}
                placeholder="New Location"
                placeholderTextColor="#8A4AF5"
                value={newLocation}
                onChangeText={setNewLocation}
              />
              <TextInput
                style={styles.input}
                placeholder="New DOB (YYYY-MM-DD)"
                placeholderTextColor="#8A4AF5"
                value={newDob}
                onChangeText={setNewDob}
                keyboardType="numeric"
              />
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={saveProfile}>
                <LinearGradient colors={['#FF007A', '#FF4D00']} style={styles.gradientButton}>
                  <Text style={styles.buttonText}>Save</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
                <LinearGradient colors={['#00FFCC', '#8A4AF5']} style={styles.gradientButton}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
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
          headerStyle: { backgroundColor: '#0D001A', borderBottomColor: '#FF007A', borderBottomWidth: 1 },
          headerTintColor: '#00FFCC',
          headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
          headerTitleAlign: 'center',
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'CyberHub' }} />
        <Stack.Screen name="JobListings" component={JobListingsScreen} options={{ headerLeft: null, title: 'Grid' }} />
        <Stack.Screen name="JobDetails" component={JobDetailsScreen} options={{ title: 'Node' }} />
        <Stack.Screen name="SavedJobs" component={SavedJobsScreen} options={{ title: 'Saved' }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'User' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#00FFCC', fontSize: 16, marginTop: 10 },

  neonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 0, 122, 0.05)',
  },

  // Login Screen
  loginContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loginTitle: { fontSize: 32, color: '#00FFCC', fontWeight: 'bold', marginBottom: 30, textTransform: 'uppercase' },
  inputContainer: { width: '100%', marginBottom: 20 },
  input: { 
    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
    color: '#FFF', 
    padding: 12, 
    marginVertical: 8, 
    borderRadius: 4, 
    borderWidth: 1, 
    borderColor: '#8A4AF5',
    width: '100%', 
    textAlign: 'center',
  },
  authButton: { width: '60%', marginVertical: 10 },
  gradientButton: { padding: 12, borderRadius: 4, alignItems: 'center' },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  switchText: { color: '#00FFCC', fontSize: 14, marginTop: 10 },

  // Job Listings Screen
  listContainer: { flex: 1, paddingTop: 10 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 },
  header: { fontSize: 24, color: '#00FFCC', fontWeight: 'bold', textTransform: 'uppercase' },
  controlBar: { flexDirection: 'row', gap: 20 },
  searchContainer: { paddingHorizontal: 20, marginBottom: 10, alignItems: 'center' },
  searchGradient: {
    borderRadius: 8,
    padding: 2,
    width: '100%',
    shadowColor: '#FF007A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 6,
    paddingHorizontal: 10,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    color: '#FFF',
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  gridList: { paddingHorizontal: 20, paddingBottom: 60 },
  jobCard: { backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: 15, marginVertical: 5, borderRadius: 4, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  jobTitle: { fontSize: 16, color: '#FFF', fontWeight: 'bold' },
  jobSubtitle: { fontSize: 12, color: '#8A4AF5' },
  saveButton: { padding: 5 },
  navBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 10, backgroundColor: 'rgba(0, 0, 0, 0.8)', borderTopWidth: 1, borderTopColor: '#FF007A' },
  logoutButton: { width: '30%' },

  // Job Details Screen
  detailContent: { flexGrow: 1, padding: 20 },
  detailCard: { backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: 20, borderRadius: 4, borderWidth: 1 },
  detailTitle: { fontSize: 24, color: '#00FFCC', fontWeight: 'bold', marginBottom: 10 },
  detailSubtitle: { fontSize: 14, color: '#8A4AF5', marginBottom: 20 },
  sectionTitle: { fontSize: 18, color: '#FFF', fontWeight: 'bold', marginTop: 15 },
  detailText: { fontSize: 14, color: '#FFF', marginVertical: 5 },
  applyButton: { marginTop: 20, width: '50%', alignSelf: 'center' },
  saveButtonDetails: { position: 'absolute', top: 10, right: 10 },
  toggleButtonDetails: { position: 'absolute', top: 10, left: 10 },

  // Saved Jobs Screen
  noJobsText: { fontSize: 16, color: '#8A4AF5', textAlign: 'center', marginTop: 20 },

  // Profile Screen
  profileContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  profileContent: { alignItems: 'center', width: '100%' },
  profilePhotoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00FFCC',
    marginBottom: 10,
    overflow: 'hidden',
  },
  profilePhoto: { width: '100%', height: '100%' },
  changePhotoButton: { width: '60%', marginBottom: 20 },
  profileTitle: { fontSize: 32, color: '#00FFCC', fontWeight: 'bold', marginBottom: 10, textTransform: 'uppercase' },
  profileSubtitle: { fontSize: 16, color: '#8A4AF5', marginBottom: 20 },
  profileInfo: { width: '100%', marginBottom: 20 },
  infoText: { fontSize: 14, color: '#FFF', marginVertical: 5, textAlign: 'center' },
  toggleButtonProfile: { position: 'absolute', top: 20, right: 20 },
  editButton: { width: '60%', marginVertical: 10 },
  socialContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '80%', marginTop: 20 },
  socialIcon: { padding: 10, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 50, borderWidth: 1, borderColor: '#FF007A' },

  // Modal Styles
  modalOverlay: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  modalContent: { 
    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
    padding: 20, 
    borderRadius: 4, 
    borderWidth: 1, 
    borderColor: '#FF007A', 
    width: '80%', 
    alignItems: 'center',
    maxHeight: '80%',
  },
  modalScroll: {
    width: '100%',
    marginBottom: 10,
  },
  modalTitle: { 
    fontSize: 20, 
    color: '#00FFCC', 
    fontWeight: 'bold', 
    marginBottom: 15, 
    textAlign: 'center', 
    textTransform: 'uppercase',
  },
  modalButtons: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    width: '100%',
  },
  modalButton: { width: '45%' },
});

export default App;