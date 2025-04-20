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
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  PixelRatio,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

const Stack = createStackNavigator();
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const fontScale = PixelRatio.getFontScale();

// Utility functions for responsive sizing
const wp = (percentage) => (SCREEN_WIDTH * percentage) / 100;
const hp = (percentage) => (SCREEN_HEIGHT * percentage) / 100;
const scaleFont = (size) => size / fontScale;

// Modern color palette
const COLORS = {
  primary: '#4A3AFF',
  secondary: '#34C759',
  background: '#F7F7FA',
  card: '#FFFFFF',
  textPrimary: '#1A1A3D',
  textSecondary: '#6B7280',
  accent: '#FF6B6B',
  gradientStart: '#4A3AFF',
  gradientEnd: '#7B68EE',
  googleBlue: '#1A73E8',
  googleGrey: '#5F6368',
  googleBorder: '#DADCE0',
  googleLightGrey: '#F1F3F4',
};

// Responsive and professional styles
const responsiveStyles = (insets) => StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    color: COLORS.secondary,
    fontSize: scaleFont(16),
    marginTop: hp(1.5),
    fontFamily: 'System',
    fontWeight: '600',
  },

  // Login Screen
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(6),
    paddingVertical: hp(2),
    paddingTop: insets.top,
    paddingBottom: insets.bottom,
  },
  loginTitle: {
    fontSize: scaleFont(28),
    color: COLORS.textPrimary,
    fontWeight: '700',
    marginBottom: hp(3),
    fontFamily: 'System',
  },
  inputContainer: {
    width: '100%',
    marginBottom: hp(2),
  },
  input: {
    backgroundColor: COLORS.card,
    color: COLORS.textPrimary,
    padding: wp(4),
    marginVertical: hp(1),
    borderRadius: 12,
    fontSize: scaleFont(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  authButton: {
    width: wp(80),
    marginVertical: hp(1.5),
  },
  gradientButton: {
    paddingVertical: wp(4),
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingVertical: wp(3.5),
    borderWidth: 1,
    borderColor: COLORS.googleBorder,
  },
  googleIcon: {
    width: wp(5),
    height: wp(5),
    marginRight: wp(2),
  },
  googleButtonText: {
    color: COLORS.googleGrey,
    fontSize: scaleFont(16),
    fontWeight: '500',
    fontFamily: 'System',
  },
  buttonText: {
    color: '#FFF',
    fontSize: scaleFont(16),
    fontWeight: '600',
    fontFamily: 'System',
  },
  switchText: {
    color: COLORS.primary,
    fontSize: scaleFont(14),
    marginTop: hp(1.5),
    fontWeight: '500',
    fontFamily: 'System',
  },

  // Google Modal Styles
  modalOverlay: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  googleModalContent: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    width: wp(90),
    maxWidth: 400,
    minHeight: hp(50),
    paddingVertical: hp(2.5),
    paddingHorizontal: wp(4),
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    ...Platform.select({
      android: {
        marginTop: hp(5),
      },
    }),
  },
  googleLogo: {
    width: wp(25),
    height: hp(4),
    marginVertical: hp(2),
    alignSelf: 'center',
  },
  googleModalTitle: {
    fontSize: scaleFont(22),
    color: COLORS.textPrimary,
    fontWeight: '500',
    marginBottom: hp(1),
    textAlign: 'center',
    fontFamily: 'System',
  },
  googleModalSubtitle: {
    fontSize: scaleFont(14),
    color: COLORS.googleGrey,
    marginBottom: hp(2),
    textAlign: 'center',
    fontFamily: 'System',
  },
  accountOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(3),
    borderWidth: 1,
    borderColor: COLORS.googleBorder,
    borderRadius: 4,
    marginVertical: hp(0.5),
    backgroundColor: COLORS.card,
  },
  accountIcon: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    marginRight: wp(3),
  },
  accountName: {
    fontSize: scaleFont(16),
    color: COLORS.textPrimary,
    fontWeight: '500',
    fontFamily: 'System',
  },
  accountEmail: {
    fontSize: scaleFont(14),
    color: COLORS.googleGrey,
    fontFamily: 'System',
  },
  createAccountButton: {
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(3),
    marginTop: hp(1),
  },
  createAccountText: {
    fontSize: scaleFont(16),
    color: COLORS.googleBlue,
    fontWeight: '500',
    fontFamily: 'System',
  },
  googleModalCancel: {
    fontSize: scaleFont(16),
    color: COLORS.googleBlue,
    fontWeight: '500',
    textAlign: 'center',
    paddingVertical: hp(2),
    fontFamily: 'System',
  },

  // Continue As Screen Styles
  continueContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    width: wp(90),
    maxWidth: 400,
    paddingVertical: hp(2.5),
    paddingHorizontal: wp(4),
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    marginTop: hp(10),
  },
  continueAccountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(3),
    borderWidth: 1,
    borderColor: COLORS.googleBorder,
    borderRadius: 8,
    backgroundColor: COLORS.card,
    marginVertical: hp(2),
  },
  continueButton: {
    backgroundColor: COLORS.googleBlue,
    paddingVertical: hp(1.5),
    borderRadius: 4,
    alignItems: 'center',
    marginVertical: hp(1),
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: scaleFont(16),
    fontWeight: '500',
    fontFamily: 'System',
  },
  policyText: {
    fontSize: scaleFont(12),
    color: COLORS.googleGrey,
    textAlign: 'center',
    marginVertical: hp(1),
    fontFamily: 'System',
  },
  policyLink: {
    color: COLORS.googleBlue,
    textDecorationLine: 'underline',
  },

  // Job Listings Screen
  listContainer: {
    flex: 1,
    paddingTop: hp(2),
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.5),
  },
  header: {
    fontSize: scaleFont(24),
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontFamily: 'System',
  },
  controlBar: {
    flexDirection: 'row',
    gap: wp(4),
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: wp(5),
    marginVertical: hp(1),
  },
  searchInput: {
    backgroundColor: COLORS.card,
    color: COLORS.textPrimary,
    padding: wp(4),
    borderRadius: 12,
    fontSize: scaleFont(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  gridList: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(12),
  },
  jobCard: {
    backgroundColor: COLORS.card,
    padding: wp(4),
    marginVertical: hp(1),
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  jobTitle: {
    fontSize: scaleFont(16),
    color: COLORS.textPrimary,
    fontWeight: '600',
    fontFamily: 'System',
  },
  jobSubtitle: {
    fontSize: scaleFont(14),
    color: COLORS.textSecondary,
    marginTop: hp(0.5),
    fontFamily: 'System',
  },
  saveButton: {
    padding: wp(2),
  },
  navBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: hp(1.5),
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  logoutButton: {
    width: wp(30),
  },

  // Job Details Screen
  detailContent: {
    flexGrow: 1,
    padding: wp(5),
    paddingBottom: hp(10),
  },
  detailCard: {
    backgroundColor: COLORS.card,
    padding: wp(5),
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailTitle: {
    fontSize: scaleFont(22),
    color: COLORS.textPrimary,
    fontWeight: '700',
    marginBottom: hp(1),
    fontFamily: 'System',
  },
  detailSubtitle: {
    fontSize: scaleFont(16),
    color: COLORS.textSecondary,
    marginBottom: hp(2),
    fontFamily: 'System',
  },
  sectionTitle: {
    fontSize: scaleFont(18),
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginTop: hp(2),
    fontFamily: 'System',
  },
  detailText: {
    fontSize: scaleFont(14),
    color: COLORS.textSecondary,
    marginVertical: hp(1),
    lineHeight: scaleFont(22),
    fontFamily: 'System',
  },
  applyButton: {
    marginTop: hp(3),
    width: wp(60),
    alignSelf: 'center',
  },
  saveButtonDetails: {
    position: 'absolute',
    top: wp(4),
    right: wp(4),
  },
  toggleButtonDetails: {
    position: 'absolute',
    top: wp(4),
    left: wp(4),
  },

  // Saved Jobs Screen
  noJobsText: {
    fontSize: scaleFont(16),
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: hp(5),
    fontFamily: 'System',
  },

  // Profile Screen
  profileContainer: {
    flexGrow: 1,
    alignItems: 'center',
    padding: wp(6),
    paddingBottom: hp(10),
  },
  profileContent: {
    alignItems: 'center',
    width: '100%',
  },
  profilePhotoContainer: {
    width: wp(30),
    height: wp(30),
    borderRadius: wp(15),
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginBottom: hp(2),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  profilePhoto: {
    width: '100%',
    height: '100%',
    borderRadius: wp(15),
  },
  profileTitle: {
    fontSize: scaleFont(24),
    color: COLORS.textPrimary,
    fontWeight: '700',
    marginBottom: hp(1),
    fontFamily: 'System',
  },
  profileSubtitle: {
    fontSize: scaleFont(16),
    color: COLORS.textSecondary,
    marginBottom: hp(2),
    fontFamily: 'System',
  },
  profileInfo: {
    width: '100%',
    marginBottom: hp(3),
  },
  infoText: {
    fontSize: scaleFont(14),
    color: COLORS.textSecondary,
    marginVertical: hp(0.8),
    textAlign: 'center',
    fontFamily: 'System',
  },
  editButton: {
    width: wp(80),
    marginVertical: hp(1),
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: wp(80),
    marginTop: hp(2),
  },

  // Modal Styles (General)
  modalContent: {
    backgroundColor: COLORS.card,
    padding: wp(5),
    borderRadius: 16,
    width: wp(90),
    alignItems: 'center',
    maxHeight: hp(80),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  modalTitle: {
    fontSize: scaleFont(20),
    color: COLORS.textPrimary,
    fontWeight: '700',
    marginBottom: hp(2),
    fontFamily: 'System',
  },
  modalButton: {
    width: wp(45),
    marginVertical: hp(1),
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: hp(1.5),
    width: '100%',
  },
});

// Login Screen
function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [accountModalVisible, setAccountModalVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const styles = responsiveStyles(insets);

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 600 });
    translateY.value = withSpring(0, { stiffness: 100 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const modalOpacity = useSharedValue(0);
  const modalTranslateY = useSharedValue(50);

  useEffect(() => {
    if (accountModalVisible) {
      modalOpacity.value = withTiming(1, { duration: 300 });
      modalTranslateY.value = withSpring(0, { stiffness: 120 });
    } else {
      modalOpacity.value = withTiming(0, { duration: 300 });
      modalTranslateY.value = withTiming(50, { duration: 300 });
    }
  }, [accountModalVisible]);

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
    transform: [{ translateY: modalTranslateY.value }],
  }));

  const handleGoogleSignIn = () => {
    setIsGoogleLoading(true);
    setTimeout(() => {
      setIsGoogleLoading(false);
      setAccountModalVisible(true);
    }, 800);
  };

  const handleAccountSelect = async (selectedEmail, givenName, profilePic) => {
    try {
      setAccountModalVisible(false);

      // Fetch existing users from AsyncStorage
      let users = [];
      const existingUsers = await AsyncStorage.getItem('users');
      if (existingUsers) {
        try {
          users = JSON.parse(existingUsers);
          if (!Array.isArray(users)) {
            console.warn('Users data is not an array, resetting to empty array');
            users = [];
          }
        } catch (parseError) {
          console.error('Error parsing users from AsyncStorage:', parseError);
          users = [];
        }
      }

      // Check if user exists
      if (!users.some(u => u.email === selectedEmail)) {
        const newUser = {
          username: givenName,
          email: selectedEmail,
          password: '',
          googleSignIn: true,
        };
        users.push(newUser);
        await AsyncStorage.setItem('users', JSON.stringify(users));
      }

      // Store user session
      await AsyncStorage.setItem('username', givenName);
      await AsyncStorage.setItem('email', selectedEmail);
      if (profilePic) await AsyncStorage.setItem('profilePic', profilePic);

      setTimeout(() => {
        navigation.navigate('ContinueAs', { email: selectedEmail, name: givenName, profilePic });
      }, 300);
    } catch (error) {
      setAccountModalVisible(false);
      console.error('Google Sign-In error:', error);
      Alert.alert('Error', 'Google Sign-In failed: ' + error.message);
    }
  };

  const handleCreateNewAccount = () => {
    setAccountModalVisible(false);
    Alert.alert('Info', 'Add another account not implemented.');
  };

  const handleAuth = async () => {
    if (isSignup) {
      try {
        // Fetch existing users from AsyncStorage
        let users = [];
        const existingUsers = await AsyncStorage.getItem('users');
        if (existingUsers) {
          try {
            users = JSON.parse(existingUsers);
            if (!Array.isArray(users)) {
              console.warn('Users data is not an array, resetting to empty array');
              users = [];
            }
          } catch (parseError) {
            console.error('Error parsing users from AsyncStorage:', parseError);
            users = [];
          }
        }

        // Validate inputs
        if (!username || !email || !password) {
          Alert.alert('Error', 'All fields are required');
          return;
        }
        if (users.some(user => user.username === username)) {
          Alert.alert('Error', 'Username already exists');
          return;
        }
        if (users.some(user => user.email === email)) {
          Alert.alert('Error', 'Email already exists');
          return;
        }

        // Add new user
        const newUser = { username, password, email, googleSignIn: false };
        users.push(newUser);
        await AsyncStorage.setItem('users', JSON.stringify(users));

        // Store user session
        await AsyncStorage.setItem('username', username);
        await AsyncStorage.setItem('email', email);

        Alert.alert('Success', 'Account created');
        navigation.navigate('JobListings');
      } catch (error) {
        console.error('Signup error:', error);
        Alert.alert('Error', 'Signup failed: ' + error.message);
      }
    } else {
      try {
        // Fetch existing users from AsyncStorage
        let users = [];
        const existingUsers = await AsyncStorage.getItem('users');
        if (existingUsers) {
          try {
            users = JSON.parse(existingUsers);
            if (!Array.isArray(users)) {
              console.warn('Users data is not an array, resetting to empty array');
              users = [];
            }
          } catch (parseError) {
            console.error('Error parsing users from AsyncStorage:', parseError);
            users = [];
          }
        }

        // Validate login
        if (!username || !password) {
          Alert.alert('Error', 'Username and password are required');
          return;
        }

        const user = users.find(u => u.username === username && u.password === password);
        if (!user) {
          Alert.alert('Error', 'Invalid credentials');
          return;
        }

        // Store user session
        await AsyncStorage.setItem('username', username);
        await AsyncStorage.setItem('email', user.email);

        Alert.alert('Success', 'Logged in');
        navigation.navigate('JobListings');
      } catch (error) {
        console.error('Login error:', error);
        Alert.alert('Error', 'Login failed: ' + error.message);
      }
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={[COLORS.background, '#E5E7EB']} style={styles.container}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <Animated.View style={[styles.loginContainer, animatedStyle]}>
              <Text style={styles.loginTitle}>{isSignup ? 'Create Account' : 'Welcome Back'}</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor={COLORS.textSecondary}
                  value={username}
                  onChangeText={setUsername}
                />
                {isSignup && (
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor={COLORS.textSecondary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                  />
                )}
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={COLORS.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
              <TouchableOpacity style={styles.authButton} onPress={handleAuth}>
                <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.gradientButton}>
                  <Text style={styles.buttonText}>{isSignup ? 'Sign Up' : 'Sign In'}</Text>
                </LinearGradient>
              </TouchableOpacity>
              {!isSignup && (
                <TouchableOpacity
                  style={[styles.authButton, { marginTop: hp(1) }]}
                  onPress={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                >
                  <View style={styles.googleButton}>
                    {isGoogleLoading ? (
                      <ActivityIndicator size="small" color={COLORS.googleBlue} style={{ marginRight: wp(2) }} />
                    ) : (
                      <Image
                        source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }}
                        style={styles.googleIcon}
                      />
                    )}
                    <Text style={styles.googleButtonText}>
                      {isGoogleLoading ? 'Signing in...' : 'Sign in with Google'}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => setIsSignup(!isSignup)}>
                <Text style={styles.switchText}>
                  {isSignup ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
            <Modal
              visible={accountModalVisible}
              animationType="fade"
              transparent={true}
              onRequestClose={() => setAccountModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <Animated.View style={[styles.googleModalContent, modalAnimatedStyle]}>
                  <Image
                    source={{ uri: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png' }}
                    style={styles.googleLogo}
                    resizeMode="contain"
                  />
                  <Text style={styles.googleModalTitle}>Sign in to your Google Account</Text>
                  <Text style={styles.googleModalSubtitle}>
                    Choose an account to continue
                  </Text>
                  <TouchableOpacity
                    style={styles.accountOption}
                    onPress={() => handleAccountSelect('itxmemani0543@gmail.com', 'Mani', 'https://lh3.googleusercontent.com/a/default-user=s96-c')}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                  >
                    <Image
                      source={{ uri: 'https://lh3.googleusercontent.com/a/default-user=s96-c' }}
                      style={styles.accountIcon}
                    />
                    <View>
                      <Text style={styles.accountName}>Mani</Text>
                      <Text style={styles.accountEmail}>itxmemani0543@gmail.com</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.createAccountButton}
                    onPress={handleCreateNewAccount}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                  >
                    <Text style={styles.createAccountText}>Add another account</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setAccountModalVisible(false)}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                  >
                    <Text style={styles.googleModalCancel}>Cancel</Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </Modal>
          </KeyboardAvoidingView>
        </LinearGradient>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// Continue As Screen
function ContinueAsScreen({ navigation, route }) {
  const { email, name, profilePic } = route.params || {};
  const insets = useSafeAreaInsets();
  const styles = responsiveStyles(insets);

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    if (!email || !name) {
      Alert.alert('Error', 'Invalid account details');
      navigation.goBack();
    }
    opacity.value = withTiming(1, { duration: 600 });
    translateY.value = withSpring(0, { stiffness: 100 });
  }, [email, name]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const handleContinue = async () => {
    try {
      // Store user session
      await AsyncStorage.setItem('username', name);
      await AsyncStorage.setItem('email', email);
      if (profilePic) await AsyncStorage.setItem('profilePic', profilePic);
      Alert.alert('Success', `Signed in as ${name}`);
      navigation.replace('JobListings');
    } catch (error) {
      console.error('Continue error:', error);
      Alert.alert('Error', 'Sign-In failed: ' + error.message);
    }
  };

  const handleCancel = () => navigation.goBack();

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={[COLORS.background, '#E5E7EB']} style={styles.container}>
          <View style={styles.modalOverlay}>
            <Animated.View style={[styles.continueContainer, animatedStyle]}>
              <Image
                source={{ uri: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png' }}
                style={styles.googleLogo}
                resizeMode="contain"
              />
              <Text style={styles.googleModalTitle}>Continue as {name}</Text>
              <View style={styles.continueAccountCard}>
                <Image
                  source={{ uri: profilePic || 'https://lh3.googleusercontent.com/a/default-user=s96-c' }}
                  style={styles.accountIcon}
                />
                <View>
                  <Text style={styles.accountName}>{name}</Text>
                  <Text style={styles.accountEmail}>{email}</Text>
                </View>
              </View>
              <Text style={styles.policyText}>
                By continuing, you agree to our{' '}
                <Text
                  style={styles.policyLink}
                  onPress={() => Linking.openURL('https://policies.google.com/terms')}
                >
                  Terms of Service
                </Text>{' '}
                and{' '}
                <Text
                  style={styles.policyLink}
                  onPress={() => Linking.openURL('https://policies.google.com/privacy')}
                >
                  Privacy Policy
                </Text>.
              </Text>
              <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCancel}>
                <Text style={styles.googleModalCancel}>Cancel</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </LinearGradient>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// JobCard Component
function JobCard({ item, navigation, savedJobs, saveJob, useAlternateColors }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const insets = useSafeAreaInsets();
  const styles = responsiveStyles(insets);

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
    <Animated.View style={[styles.jobCard, { borderColor: useAlternateColors ? COLORS.secondary : COLORS.primary }, cardStyle]}>
      <TouchableOpacity
        onPress={() => navigation.navigate('JobDetails', { job: item })}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ flex: 1 }}
      >
        <Text style={styles.jobTitle}>{item.title}</Text>
        <Text style={styles.jobSubtitle}>{item.company} • {item.location}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.saveButton} onPress={() => saveJob(item)}>
        <Feather
          name={savedJobs.some((saved) => saved.id === item.id) ? 'bookmark' : 'bookmark'}
          size={wp(5)}
          color={savedJobs.some((saved) => saved.id === item.id) ? COLORS.primary : COLORS.textSecondary}
        />
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
  const insets = useSafeAreaInsets();
  const styles = responsiveStyles(insets);

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
    try {
      const saved = await AsyncStorage.getItem('savedJobs');
      if (saved) setSavedJobs(JSON.parse(saved));
    } catch (error) {
      Alert.alert('Error', 'Failed to load saved jobs');
    }
  };

  const saveJob = async (job) => {
    try {
      const updatedSavedJobs = savedJobs.some((saved) => saved.id === job.id)
        ? savedJobs.filter((saved) => saved.id !== job.id)
        : [...savedJobs, job];
      setSavedJobs(updatedSavedJobs);
      await AsyncStorage.setItem('savedJobs', JSON.stringify(updatedSavedJobs));
      Alert.alert('Saved', `${job.title} ${savedJobs.some((saved) => saved.id === job.id) ? 'removed' : 'saved'}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to save job');
    }
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
    try {
      if (alertsEnabled) {
        await AsyncStorage.setItem('jobAlerts', JSON.stringify({ keywords: searchQuery, filters }));
        Alert.alert('Alerts', 'Notifications enabled');
      } else {
        await AsyncStorage.removeItem('jobAlerts');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to set up job alerts');
    }
  };

  const checkJobAlerts = async () => {
    try {
      const alerts = await AsyncStorage.getItem('jobAlerts');
      if (alerts) {
        setAlertsEnabled(true);
        const { keywords, filters: storedFilters } = JSON.parse(alerts);
        setSearchQuery(keywords);
        setFilters(storedFilters);
        applyFilters();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to check job alerts');
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Confirm logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('username');
            await AsyncStorage.removeItem('email');
            await AsyncStorage.removeItem('profilePic');
            navigation.replace('Login');
          } catch (error) {
            Alert.alert('Error', 'Logout failed');
          }
        },
      },
    ]);
  };

  const toggleColors = () => setUseAlternateColors(!useAlternateColors);

  if (loading)
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
          <LinearGradient colors={[COLORS.background, '#E5E7EB']} style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={COLORS.secondary} />
            <Text style={styles.loadingText}>Loading Opportunities...</Text>
          </LinearGradient>
        </SafeAreaView>
      </SafeAreaProvider>
    );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={[COLORS.background, '#E5E7EB']} style={styles.listContainer}>
          <Animated.View style={[styles.listHeader, containerStyle]}>
            <Text style={styles.header}>Opportunities</Text>
            <View style={styles.controlBar}>
              <TouchableOpacity onPress={() => setSearchVisible(!searchVisible)}>
                <Feather name="search" size={wp(5.5)} color={COLORS.secondary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setFilterModalVisible(true)}>
                <Feather name="filter" size={wp(5.5)} color={COLORS.secondary} />
              </TouchableOpacity>
              <Switch
                value={alertsEnabled}
                onValueChange={(val) => {
                  setAlertsEnabled(val);
                  setupJobAlerts();
                }}
                trackColor={{ false: COLORS.primary, true: COLORS.secondary }}
                thumbColor={alertsEnabled ? '#FFF' : COLORS.textSecondary}
              />
              <TouchableOpacity onPress={toggleColors}>
                <Feather name="refresh-cw" size={wp(5.5)} color={COLORS.secondary} />
              </TouchableOpacity>
            </View>
          </Animated.View>
          {searchVisible && (
            <Animated.View style={[styles.searchContainer, searchStyle]}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search jobs..."
                placeholderTextColor={COLORS.textSecondary}
                value={searchQuery}
                onChangeText={handleSearch}
              />
            </Animated.View>
          )}
          <FlatList
            data={filteredJobs}
            renderItem={({ item }) => (
              <JobCard
                item={item}
                navigation={navigation}
                savedJobs={savedJobs}
                saveJob={saveJob}
                useAlternateColors={useAlternateColors}
              />
            )}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.gridList}
            initialNumToRender={10}
            maxToRenderPerBatch={5}
          />
          <View style={styles.navBar}>
            <TouchableOpacity onPress={() => navigation.navigate('SavedJobs')}>
              <Feather name="bookmark" size={wp(6.5)} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <Feather name="user" size={wp(6.5)} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <LinearGradient colors={[COLORS.accent, '#FF8A65']} style={styles.gradientButton}>
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
                  <Switch
                    value={filters.remote}
                    onValueChange={(val) => setFilters({ ...filters, remote: val })}
                  />
                </View>
                <View style={styles.filterOption}>
                  <Text style={styles.infoText}>Full-Time</Text>
                  <Switch
                    value={filters.fullTime}
                    onValueChange={(val) => setFilters({ ...filters, fullTime: val })}
                  />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Min Salary (k)"
                  placeholderTextColor={COLORS.textSecondary}
                  value={filters.salaryMin.toString()}
                  onChangeText={(text) => setFilters({ ...filters, salaryMin: parseInt(text) || 0 })}
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  onPress={() => {
                    applyFilters();
                    setFilterModalVisible(false);
                  }}
                  style={styles.modalButton}
                >
                  <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.gradientButton}>
                    <Text style={styles.buttonText}>Apply</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setFilterModalVisible(false)}
                  style={styles.modalButton}
                >
                  <Text style={styles.switchText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </LinearGradient>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// Job Details Screen
function JobDetailsScreen({ route, navigation }) {
  const { job } = route.params;
  const [savedJobs, setSavedJobs] = useState([]);
  const [useAlternateColors, setUseAlternateColors] = useState(false);
  const insets = useSafeAreaInsets();
  const styles = responsiveStyles(insets);

  const opacity = useSharedValue(0);

  useEffect(() => {
    loadSavedJobs();
    opacity.value = withTiming(1, { duration: 600 });
  }, []);

  const cardStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const loadSavedJobs = async () => {
    try {
      const saved = await AsyncStorage.getItem('savedJobs');
      if (saved) setSavedJobs(JSON.parse(saved));
    } catch (error) {
      Alert.alert('Error', 'Failed to load saved jobs');
    }
  };

  const saveJob = async () => {
    try {
      const updatedSavedJobs = savedJobs.some((saved) => saved.id === job.id)
        ? savedJobs.filter((saved) => saved.id !== job.id)
        : [...savedJobs, job];
      setSavedJobs(updatedSavedJobs);
      await AsyncStorage.setItem('savedJobs', JSON.stringify(updatedSavedJobs));
      Alert.alert('Saved', `${job.title} ${savedJobs.some((saved) => saved.id === job.id) ? 'removed' : 'saved'}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to save job');
    }
  };

  const toggleColors = () => setUseAlternateColors(!useAlternateColors);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={[COLORS.background, '#E5E7EB']} style={styles.container}>
          <ScrollView contentContainerStyle={styles.detailContent}>
            <Animated.View style={[styles.detailCard, { borderColor: useAlternateColors ? COLORS.secondary : COLORS.primary }, cardStyle]}>
              <Text style={styles.detailTitle}>{job.title}</Text>
              <Text style={styles.detailSubtitle}>{job.company} • {job.location}</Text>
              <TouchableOpacity style={styles.saveButtonDetails} onPress={saveJob}>
                <Feather
                  name={savedJobs.some((saved) => saved.id === job.id) ? 'bookmark' : 'bookmark'}
                  size={wp(6)}
                  color={savedJobs.some((saved) => saved.id === job.id) ? COLORS.primary : COLORS.textSecondary}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.toggleButtonDetails} onPress={toggleColors}>
                <Feather name="refresh-cw" size={wp(6)} color={COLORS.secondary} />
              </TouchableOpacity>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.detailText}>{job.description}</Text>
              <Text style={styles.sectionTitle}>Requirements</Text>
              <Text style={styles.detailText}>{job.requirements}</Text>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => Linking.openURL(job.apply_url || 'https://example.com')}
              >
                <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.gradientButton}>
                  <Text style={styles.buttonText}>Apply Now</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// SavedJobCard Component
function SavedJobCard({ item, navigation }) {
  const opacity = useSharedValue(0);
  const insets = useSafeAreaInsets();
  const styles = responsiveStyles(insets);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 400 });
  }, []);

  const cardStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[styles.jobCard, { borderColor: COLORS.secondary }, cardStyle]}>
      <TouchableOpacity
        onPress={() => navigation.navigate('JobDetails', { job: item })}
        style={{ flex: 1 }}
      >
        <Text style={styles.jobTitle}>{item.title}</Text>
        <Text style={styles.jobSubtitle}>{item.company} • {item.location}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Saved Jobs Screen
function SavedJobsScreen({ navigation }) {
  const [savedJobs, setSavedJobs] = useState([]);
  const insets = useSafeAreaInsets();
  const styles = responsiveStyles(insets);

  const opacity = useSharedValue(0);

  useEffect(() => {
    loadSavedJobs();
    opacity.value = withTiming(1, { duration: 600 });
  }, []);

  const headerStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const loadSavedJobs = async () => {
    try {
      const saved = await AsyncStorage.getItem('savedJobs');
      if (saved) setSavedJobs(JSON.parse(saved));
    } catch (error) {
      Alert.alert('Error', 'Failed to load saved jobs');
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={[COLORS.background, '#E5E7EB']} style={styles.listContainer}>
          <Animated.Text style={[styles.header, headerStyle]}>Saved Jobs</Animated.Text>
          {savedJobs.length === 0 ? (
            <Text style={styles.noJobsText}>No saved jobs yet.</Text>
          ) : (
            <FlatList
              data={savedJobs}
              renderItem={({ item }) => <SavedJobCard item={item} navigation={navigation} />}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.gridList}
              initialNumToRender={10}
              maxToRenderPerBatch={5}
            />
          )}
        </LinearGradient>
      </SafeAreaView>
    </SafeAreaProvider>
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
  const insets = useSafeAreaInsets();
  const styles = responsiveStyles(insets);

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
    try {
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
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile');
    }
  };

  const pickImage = async () => {
    try {
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
    } catch (error) {
      Alert.alert('Error', 'Failed to update photo');
    }
  };

  const openSocialLink = (platform) => {
    const links = {
      gmail: `mailto:${email || 'itxmemani0543@gmail.com'}`,
      github: 'https://github.com/mani0543/Mad-Mids.git',
      facebook: 'https://facebook.com/yourusername',
      whatsapp: `https://wa.me/${phone || '03155296456'}`,
    };
    Linking.openURL(links[platform]).catch(() => Alert.alert('Error', `Cannot open ${platform}`));
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={[COLORS.background, '#E5E7EB']} style={styles.container}>
          <ScrollView contentContainerStyle={styles.profileContainer}>
            <Animated.View style={[styles.profileContent, profileStyle]}>
              <TouchableOpacity onPress={pickImage}>
                <Animated.View style={[styles.profilePhotoContainer, photoStyle]}>
                  {profilePhoto ? (
                    <Image source={{ uri: profilePhoto }} style={styles.profilePhoto} />
                  ) : (
                    <Feather name="user" size={wp(15)} color={COLORS.primary} />
                  )}
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
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigation.navigate('ResumeBuilder')}
              >
                <LinearGradient colors={[COLORS.secondary, '#40C4FF']} style={styles.gradientButton}>
                  <Text style={styles.buttonText}>Build Resume</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigation.navigate('ApplicationTracker')}
              >
                <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.gradientButton}>
                  <Text style={styles.buttonText}>Track Applications</Text>
                </LinearGradient>
              </TouchableOpacity>
              <View style={styles.socialContainer}>
                <TouchableOpacity onPress={() => openSocialLink('gmail')}>
                  <Feather name="mail" size={wp(6)} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openSocialLink('github')}>
                  <Feather name="github" size={wp(6)} color={COLORS.secondary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openSocialLink('facebook')}>
                  <Feather name="facebook" size={wp(6)} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openSocialLink('whatsapp')}>
                  <Feather name="phone" size={wp(6)} color={COLORS.secondary} />
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    </SafeAreaProvider>
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
  const insets = useSafeAreaInsets();
  const styles = responsiveStyles(insets);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
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
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile');
    }
  };

  const saveProfile = async () => {
    if (username.trim() === '') {
      Alert.alert('Error', 'Username cannot be empty');
      return;
    }
    try {
      let users = [];
      const existingUsers = await AsyncStorage.getItem('users');
      if (existingUsers) {
        try {
          users = JSON.parse(existingUsers);
          if (!Array.isArray(users)) {
            console.warn('Users data is not an array, resetting to empty array');
            users = [];
          }
        } catch (parseError) {
          console.error('Error parsing users from AsyncStorage:', parseError);
          users = [];
        }
      }

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
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={[COLORS.background, '#E5E7EB']} style={styles.container}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <ScrollView contentContainerStyle={styles.profileContainer}>
              <Text style={styles.header}>Edit Profile</Text>
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor={COLORS.textSecondary}
                value={username}
                onChangeText={setUsername}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={COLORS.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
              <TextInput
                style={styles.input}
                placeholder="Phone"
                placeholderTextColor={COLORS.textSecondary}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.input}
                placeholder="Status (e.g., Software Engineer)"
                placeholderTextColor={COLORS.textSecondary}
                value={status}
                onChangeText={setStatus}
              />
              <TextInput
                style={styles.input}
                placeholder="Bio"
                placeholderTextColor={COLORS.textSecondary}
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={4}
              />
              <TextInput
                style={styles.input}
                placeholder="Location"
                placeholderTextColor={COLORS.textSecondary}
                value={location}
                onChangeText={setLocation}
              />
              <TextInput
                style={styles.input}
                placeholder="DOB (YYYY-MM-DD)"
                placeholderTextColor={COLORS.textSecondary}
                value={dob}
                onChangeText={setDob}
                keyboardType="numeric"
              />
              <TouchableOpacity style={styles.editButton} onPress={saveProfile}>
                <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.gradientButton}>
                  <Text style={styles.buttonText}>Save Profile</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
      </SafeAreaView>
    </SafeAreaProvider>
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
  const insets = useSafeAreaInsets();
  const styles = responsiveStyles(insets);

  const saveResume = async () => {
    try {
      await AsyncStorage.setItem('resume', JSON.stringify(resumeData));
      Alert.alert('Success', 'Resume saved');
    } catch (error) {
      Alert.alert('Error', 'Failed to save resume');
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={[COLORS.background, '#E5E7EB']} style={styles.container}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <ScrollView contentContainerStyle={styles.profileContainer}>
              <Text style={styles.header}>Resume Builder</Text>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor={COLORS.textSecondary}
                value={resumeData.name}
                onChangeText={(text) => setResumeData({ ...resumeData, name: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Education (e.g., B.S. Computer Science)"
                placeholderTextColor={COLORS.textSecondary}
                multiline
                numberOfLines={4}
                value={resumeData.education}
                onChangeText={(text) => setResumeData({ ...resumeData, education: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Experience (e.g., Software Engineer at XYZ)"
                placeholderTextColor={COLORS.textSecondary}
                multiline
                numberOfLines={4}
                value={resumeData.experience}
                onChangeText={(text) => setResumeData({ ...resumeData, experience: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Skills (e.g., JavaScript, Python)"
                placeholderTextColor={COLORS.textSecondary}
                multiline
                numberOfLines={4}
                value={resumeData.skills}
                onChangeText={(text) => setResumeData({ ...resumeData, skills: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Certifications (e.g., AWS Certified)"
                placeholderTextColor={COLORS.textSecondary}
                multiline
                numberOfLines={4}
                value={resumeData.certifications}
                onChangeText={(text) => setResumeData({ ...resumeData, certifications: text })}
              />
              <TouchableOpacity onPress={saveResume} style={styles.editButton}>
                <LinearGradient colors={[COLORS.secondary, '#40C4FF']} style={styles.gradientButton}>
                  <Text style={styles.buttonText}>Save Resume</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// Application Tracker Screen
function ApplicationTrackerScreen({ navigation }) {
  const [applications, setApplications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newApp, setNewApp] = useState({ company: '', position: '', date: new Date(), status: 'Applied' });
  const insets = useSafeAreaInsets();
  const styles = responsiveStyles(insets);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const apps = await AsyncStorage.getItem('applications');
      if (apps) setApplications(JSON.parse(apps));
    } catch (error) {
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
      Alert.alert('Error', 'Failed to save application');
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={[COLORS.background, '#E5E7EB']} style={styles.listContainer}>
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
              initialNumToRender={10}
              maxToRenderPerBatch={5}
            />
          )}
          <TouchableOpacity style={styles.editButton} onPress={() => setShowForm(true)}>
            <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.gradientButton}>
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
                  placeholderTextColor={COLORS.textSecondary}
                  value={newApp.company}
                  onChangeText={(text) => setNewApp({ ...newApp, company: text })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Position"
                  placeholderTextColor={COLORS.textSecondary}
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
                  placeholder="Status (e.g., Applied, Interviewed)"
                  placeholderTextColor={COLORS.textSecondary}
                  value={newApp.status}
                  onChangeText={(text) => setNewApp({ ...newApp, status: text })}
                />
                <TouchableOpacity style={styles.modalButton} onPress={addApplication}>
                  <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.gradientButton}>
                    <Text style={styles.buttonText}>Save</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButton} onPress={() => setShowForm(false)}>
                  <LinearGradient colors={[COLORS.accent, '#FF8A65']} style={styles.gradientButton}>
                    <Text style={styles.buttonText}>Cancel</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </LinearGradient>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// Main App Component
function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerStyle: {
              backgroundColor: COLORS.card,
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 1,
              borderBottomColor: '#E5E7EB',
            },
            headerTintColor: COLORS.primary,
            headerTitleStyle: {
              fontWeight: '600',
              fontSize: scaleFont(18),
              color: COLORS.textPrimary,
              fontFamily: 'System',
            },
            headerTitleAlign: 'center',
            cardStyle: { backgroundColor: COLORS.background },
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Welcome' }} />
          <Stack.Screen name="ContinueAs" component={ContinueAsScreen} options={{ title: 'Continue' }} />
          <Stack.Screen
            name="JobListings"
            component={JobListingsScreen}
            options={{ headerLeft: null, title: 'Opportunities' }}
          />
          <Stack.Screen name="JobDetails" component={JobDetailsScreen} options={{ title: 'Job Details' }} />
          <Stack.Screen name="SavedJobs" component={SavedJobsScreen} options={{ title: 'Saved Jobs' }} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
          <Stack.Screen name="ProfileDetail" component={ProfileDetailScreen} options={{ title: 'Edit Profile' }} />
          <Stack.Screen name="ResumeBuilder" component={ResumeBuilderScreen} options={{ title: 'Resume Builder' }} />
          <Stack.Screen name="ApplicationTracker" component={ApplicationTrackerScreen} options={{ title: 'Tracker' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
