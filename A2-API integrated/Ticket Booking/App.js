import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  FlatList,
  Animated,
  Dimensions,
  Switch,
  Alert,
  PixelRatio,
  Platform,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// Screen dimensions for responsiveness
const { width, height } = Dimensions.get('window');
const getWidth = () => Dimensions.get('window').width;
const getHeight = () => Dimensions.get('window').height;
const scaleFont = (size) => PixelRatio.roundToNearestPixel(size * (getWidth() / 360));

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const ThemeContext = React.createContext();

// Mock user storage
const mockUserStorage = {
  users: [],
  currentUser: null,
};

// API Key (Replace with your actual Ticketmaster API key)
const TICKETMASTER_API_KEY = 'newApodr5sfn2hx2TTQDYMkEdXOLNrsl';

// API fetch function for events
const fetchEvents = async () => {
  try {
    const response = await fetch(
      `https://app.ticketmaster.com/discovery/v2/events.json?countryCode=US&apikey=${TICKETMASTER_API_KEY}&size=10`
    );
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();

    if (data._embedded && data._embedded.events) {
      return data._embedded.events.map((event, index) => ({
        id: event.id || `event-${index}`,
        type: 'event',
        title: event.name.slice(0, 20),
        description: event.info || event.description || 'No description available',
        image: event.images && event.images.length > 0 ? event.images[0].url : 'https://via.placeholder.com/150?text=Event',
        price: event.priceRanges && event.priceRanges.length > 0 ? event.priceRanges[0].min : 19.99 + index * 100,
        date: event.dates.start.localDate,
        location: event._embedded?.venues[0]?.city?.name || 'Unknown Location',
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};

// Mock data for movies and flights
const fetchMockMoviesAndFlights = () => [
  {
    id: 'movie1',
    type: 'movie',
    title: 'The Cosmic Journey',
    description: 'A sci-fi adventure in space.',
    image: 'https://via.placeholder.com/150?text=Movie',
    price: 15.99,
    date: '2025-03-15',
    location: 'Los Angeles',
  },
  {
    id: 'flight1',
    type: 'flight',
    title: 'NYC to London',
    description: 'Direct flight with amenities.',
    image: 'https://via.placeholder.com/150?text=Flight',
    price: 299.99,
    date: '2025-03-20',
    location: 'New York to London',
  },
];

// List of countries, locations, and event types
const COUNTRIES = ['USA', 'UK', 'Canada', 'Australia', 'Germany', 'France'];
const LOCATIONS = ['New York', 'Los Angeles', 'London', 'Sydney', 'Berlin', 'Paris'];
const EVENT_TYPES = ['Music Festival', 'Tech Conference', 'Movie', 'Flight'];

// Login Screen
function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = () => {
    setError('');
    if (!email || !password) {
      setError('Please fill out all fields.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    const user = mockUserStorage.users.find(
      (u) => u.email === email && u.password === password
    );
    if (!user) {
      setError('Invalid email or password.');
      return;
    }
    mockUserStorage.currentUser = user;
    navigation.replace('Welcome');
  };

  return (
    <View style={styles.authContainer}>
      <MaterialIcons name="lock" size={scaleFont(80)} color="#00ff9d" />
      <Text style={[styles.authTitle, { fontSize: scaleFont(32) }]}>Login</Text>
      <TextInput
        style={[styles.authInput, { fontSize: scaleFont(16) }]}
        placeholder="Email"
        placeholderTextColor="#666"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={[styles.authInput, { fontSize: scaleFont(16) }]}
        placeholder="Password"
        placeholderTextColor="#666"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error ? <Text style={[styles.authError, { fontSize: scaleFont(14) }]}>{error}</Text> : null}
      <TouchableOpacity style={styles.authButton} onPress={handleLogin}>
        <Text style={[styles.authButtonText, { fontSize: scaleFont(16) }]}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={[styles.authLink, { fontSize: scaleFont(16) }]}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

// Signup Screen
function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSignup = () => {
    setError('');
    if (!name || !email || !phone || !password || !confirmPassword) {
      setError('Please fill out all fields.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (mockUserStorage.users.find((u) => u.email === email)) {
      setError('Email is already registered.');
      return;
    }
    const newUser = {
      name,
      email,
      phone,
      password,
      profilePicture: 'https://via.placeholder.com/150?text=Profile',
    };
    mockUserStorage.users.push(newUser);
    mockUserStorage.currentUser = newUser;
    navigation.replace('Welcome');
  };

  return (
    <View style={styles.authContainer}>
      <MaterialIcons name="person-add" size={scaleFont(80)} color="#00ff9d" />
      <Text style={[styles.authTitle, { fontSize: scaleFont(32) }]}>Sign Up</Text>
      <TextInput
        style={[styles.authInput, { fontSize: scaleFont(16) }]}
        placeholder="Name"
        placeholderTextColor="#666"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={[styles.authInput, { fontSize: scaleFont(16) }]}
        placeholder="Email"
        placeholderTextColor="#666"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={[styles.authInput, { fontSize: scaleFont(16) }]}
        placeholder="Phone"
        placeholderTextColor="#666"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <TextInput
        style={[styles.authInput, { fontSize: scaleFont(16) }]}
        placeholder="Password"
        placeholderTextColor="#666"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={[styles.authInput, { fontSize: scaleFont(16) }]}
        placeholder="Confirm Password"
        placeholderTextColor="#666"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      {error ? <Text style={[styles.authError, { fontSize: scaleFont(14) }]}>{error}</Text> : null}
      <TouchableOpacity style={styles.authButton} onPress={handleSignup}>
        <Text style={[styles.authButtonText, { fontSize: scaleFont(16) }]}>Sign Up</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={[styles.authLink, { fontSize: scaleFont(16) }]}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

// Welcome Screen
function WelcomeScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => navigation.replace('Main'), 3000);
    return () => clearTimeout(timer);
  }, [fadeAnim, navigation, scaleAnim]);

  return (
    <View style={styles.welcomeContainer}>
      <Animated.View style={[styles.welcomeContent, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <MaterialIcons name="flight-takeoff" size={scaleFont(80)} color="#00ff9d" />
        <Text style={[styles.welcomeTitle, { fontSize: scaleFont(32) }]}>Welcome to Mani's</Text>
        <Text style={[styles.welcomeSubtitle, { fontSize: scaleFont(24) }]}>Ticket Booking Mobile App</Text>
        <TouchableOpacity style={styles.getStartedButton} onPress={() => navigation.replace('Main')}>
          <Text style={[styles.getStartedButtonText, { fontSize: scaleFont(18) }]}>Get Started</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// Home Screen
function HomeScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      const fetchedEvents = await fetchEvents();
      const mockData = fetchMockMoviesAndFlights();
      setEvents([...fetchedEvents, ...mockData]);
      setLoading(false);
    };
    loadEvents();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={[styles.loadingText, { fontSize: scaleFont(18) }]}>Loading events...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.searchBar} onPress={() => navigation.navigate('Search')}>
        <MaterialIcons name="search" size={scaleFont(24)} color="#00ff9d" />
        <Text style={[styles.searchText, { fontSize: scaleFont(16) }]}>Search events, movies, or flights...</Text>
      </TouchableOpacity>
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: getHeight() * 0.03 }}>
        {events.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => navigation.navigate('BookingDetails', { item })}
          >
            <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { fontSize: scaleFont(18) }]}>{item.title}</Text>
              <Text style={[styles.cardDescription, { fontSize: scaleFont(14) }]}>{item.description}</Text>
              <Text style={[styles.cardPrice, { fontSize: scaleFont(16) }]}>${item.price}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// Search Screen
function SearchScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [eventTypeModalVisible, setEventTypeModalVisible] = useState(false);

  useEffect(() => {
    const loadEvents = async () => {
      const fetchedEvents = await fetchEvents();
      const mockData = fetchMockMoviesAndFlights();
      setEvents([...fetchedEvents, ...mockData]);
      setLoading(false);
    };
    loadEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    const matchesSearchQuery =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = selectedCountry ? event.location.includes(selectedCountry) : true;
    const matchesLocation = selectedLocation ? event.location.includes(selectedLocation) : true;
    const matchesEventType = selectedEventType ? event.type === selectedEventType.toLowerCase() : true;
    return matchesSearchQuery && matchesCountry && matchesLocation && matchesEventType;
  });

  const renderDropdown = (label, value, onPress, modalVisible, setModalVisible, items, onSelect) => (
    <>
      <TouchableOpacity style={styles.dropdown} onPress={onPress}>
        <Text style={[styles.dropdownText, { fontSize: scaleFont(16) }]}>
          {value || `Select ${label}`}
        </Text>
        <MaterialIcons name="arrow-drop-down" size={scaleFont(24)} color="#00ff9d" />
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.dropdownModal}>
            <Text style={[styles.dropdownModalTitle, { fontSize: scaleFont(20) }]}>
              Select {label}
            </Text>
            <FlatList
              data={[{ value: '', label: `Select ${label}` }, ...items.map(item => ({ value: item, label: item }))]}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    onSelect(item.value);
                    setModalVisible(false);
                  }}
                >
                  <Text style={[styles.dropdownItemText, { fontSize: scaleFont(16) }]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={{ paddingBottom: getHeight() * 0.02 }}
            />
            <TouchableOpacity
              style={styles.dropdownCancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.dropdownCancelText, { fontSize: scaleFont(16) }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={[styles.loadingText, { fontSize: scaleFont(18) }]}>Loading events...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, { fontSize: scaleFont(16) }]}
          placeholder="Search..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {renderDropdown(
          'Country',
          selectedCountry,
          () => setCountryModalVisible(true),
          countryModalVisible,
          setCountryModalVisible,
          COUNTRIES,
          setSelectedCountry
        )}
        {renderDropdown(
          'Location',
          selectedLocation,
          () => setLocationModalVisible(true),
          locationModalVisible,
          setLocationModalVisible,
          LOCATIONS,
          setSelectedLocation
        )}
        {renderDropdown(
          'Event Type',
          selectedEventType,
          () => setEventTypeModalVisible(true),
          eventTypeModalVisible,
          setEventTypeModalVisible,
          EVENT_TYPES,
          setSelectedEventType
        )}
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('BookingDetails', { item })}
            >
              <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { fontSize: scaleFont(18) }]}>{item.title}</Text>
                <Text style={[styles.cardDescription, { fontSize: scaleFont(14) }]}>{item.description}</Text>
                <Text style={[styles.cardPrice, { fontSize: scaleFont(16) }]}>${item.price}</Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: getHeight() * 0.03 }}
        />
      </View>
    </View>
  );
}

// Booking Details Screen
function BookingDetailsScreen({ route, navigation }) {
  const { item } = route.params;

  return (
    <View style={styles.container}>
      <Image source={{ uri: item.image }} style={styles.detailImage} resizeMode="cover" />
      <View style={styles.detailContent}>
        <Text style={[styles.detailTitle, { fontSize: scaleFont(24) }]}>{item.title}</Text>
        <Text style={[styles.detailDescription, { fontSize: scaleFont(16) }]}>{item.description}</Text>
        <Text style={[styles.detailPrice, { fontSize: scaleFont(20) }]}>${item.price}</Text>
        <Text style={[styles.detailInfo, { fontSize: scaleFont(16) }]}>Date: {item.date}</Text>
        <Text style={[styles.detailInfo, { fontSize: scaleFont(16) }]}>Location: {item.location}</Text>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => navigation.navigate('Payment', { item })}
        >
          <Text style={[styles.bookButtonText, { fontSize: scaleFont(16) }]}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Payment Screen
function PaymentScreen({ route, navigation }) {
  const { item } = route.params;
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [discountCode, setDiscountCode] = useState('');
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);

  const handlePayment = () => {
    if (paymentMethod === 'credit') {
      if (!showCardForm) {
        setShowCardForm(true);
        return;
      }
      if (!cardDetails.cardNumber || !cardDetails.cardHolder || !cardDetails.expiryDate || !cardDetails.cvv) {
        setShowValidationModal(true);
        return;
      }
    }
    setShowConfirmation(true);
  };

  const handleConfirmation = () => {
    setShowConfirmation(false);
    navigation.navigate('Main', { screen: 'My Bookings', params: { newBooking: item } });
  };

  return (
    <View style={styles.container}>
      <View style={styles.paymentContent}>
        <Text style={[styles.paymentTitle, styles.shinyGreenText, { fontSize: scaleFont(24) }]}>
          Payment Details
        </Text>
        <View style={styles.paymentMethods}>
          <TouchableOpacity
            style={[styles.paymentMethod, paymentMethod === 'credit' && styles.paymentMethodSelected]}
            onPress={() => setPaymentMethod('credit')}
          >
            <MaterialIcons name="credit-card" size={scaleFont(24)} color="#00ff9d" />
            <Text
              style={[styles.paymentMethodText, styles.shinyGreenText, { fontSize: scaleFont(16) }]}
            >
              Credit Card
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.paymentMethod, paymentMethod === 'paypal' && styles.paymentMethodSelected]}
            onPress={() => setPaymentMethod('paypal')}
          >
            <MaterialIcons name="payment" size={scaleFont(24)} color="#00ff9d" />
            <Text
              style={[styles.paymentMethodText, styles.shinyGreenText, { fontSize: scaleFont(16) }]}
            >
              PayPal
            </Text>
          </TouchableOpacity>
        </View>
        {showCardForm && (
          <View style={styles.cardForm}>
            <Text
              style={[styles.cardFormTitle, styles.shinyGreenText, { fontSize: scaleFont(20) }]}
            >
              Enter Card Details
            </Text>
            <TextInput
              style={[styles.cardInput, { fontSize: scaleFont(16) }]}
              placeholder="Card Number"
              placeholderTextColor="#666"
              value={cardDetails.cardNumber}
              onChangeText={(text) => setCardDetails({ ...cardDetails, cardNumber: text })}
              keyboardType="numeric"
              maxLength={16}
            />
            <TextInput
              style={[styles.cardInput, { fontSize: scaleFont(16) }]}
              placeholder="Card Holder Name"
              placeholderTextColor="#666"
              value={cardDetails.cardHolder}
              onChangeText={(text) => setCardDetails({ ...cardDetails, cardHolder: text })}
            />
            <View style={styles.cardRow}>
              <TextInput
                style={[styles.cardInput, { flex: 1, marginRight: 8, fontSize: scaleFont(16) }]}
                placeholder="Expiry Date (MM/YY)"
                placeholderTextColor="#666"
                value={cardDetails.expiryDate}
                onChangeText={(text) => setCardDetails({ ...cardDetails, expiryDate: text })}
                maxLength={5}
              />
              <TextInput
                style={[styles.cardInput, { flex: 1, fontSize: scaleFont(16) }]}
                placeholder="CVV"
                placeholderTextColor="#666"
                value={cardDetails.cvv}
                onChangeText={(text) => setCardDetails({ ...cardDetails, cvv: text })}
                keyboardType="numeric"
                maxLength={3}
                secureTextEntry
              />
            </View>
          </View>
        )}
        <TextInput
          style={[styles.discountInput, { fontSize: scaleFont(16) }]}
          placeholder="Discount Code"
          placeholderTextColor="#666"
          value={discountCode}
          onChangeText={setDiscountCode}
        />
        <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
          <Text
            style={[styles.payButtonText, styles.shinyGreenText, { fontSize: scaleFont(16) }]}
          >
            {paymentMethod === 'credit' && !showCardForm ? 'Proceed to Card Details' : 'Pay Now'}
          </Text>
        </TouchableOpacity>
      </View>
      <Modal visible={showConfirmation} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModal}>
            <View style={styles.tickCircle}>
              <MaterialIcons name="check" size={scaleFont(50)} color="#00ff9d" />
            </View>
            <Text
              style={[styles.confirmationTitle, styles.shinyGreenText, { fontSize: scaleFont(24) }]}
            >
              Booking Confirmed!
            </Text>
            <Text style={[styles.confirmationText, { fontSize: scaleFont(16) }]}>
              Your booking has been successfully processed.
            </Text>
            <View style={styles.bookingDetails}>
              <Text
                style={[styles.bookingDetailTitle, { fontSize: scaleFont(20) }]}
              >
                {item.title}
              </Text>
              <Text
                style={[styles.bookingDetailText, { fontSize: scaleFont(16) }]}
              >
                Date: {item.date}
              </Text>
              <Text
                style={[styles.bookingDetailText, { fontSize: scaleFont(16) }]}
              >
                Location: {item.location}
              </Text>
              <Text
                style={[styles.bookingDetailText, { fontSize: scaleFont(16) }]}
              >
                Price: ${item.price}
              </Text>
            </View>
            <TouchableOpacity style={styles.confirmationButton} onPress={handleConfirmation}>
              <Text
                style={[
                  styles.confirmationButtonText,
                  styles.shinyGreenText,
                  { fontSize: scaleFont(16) },
                ]}
              >
                View My Bookings
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={showValidationModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.validationModal}>
            <Text
              style={[styles.validationTitle, styles.shinyGreenText, { fontSize: scaleFont(24) }]}
            >
              Missing Details
            </Text>
            <Text style={[styles.validationText, { fontSize: scaleFont(16) }]}>
              Please fill out all credit card details to proceed.
            </Text>
            <TouchableOpacity
              style={styles.validationButton}
              onPress={() => setShowValidationModal(false)}
            >
              <Text
                style={[
                  styles.validationButtonText,
                  styles.shinyGreenText,
                  { fontSize: scaleFont(16) },
                ]}
              >
                OK
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// My Bookings Screen
function MyBookingsScreen({ route }) {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (route.params?.newBooking) {
      setBookings((prevBookings) => [...prevBookings, route.params.newBooking]);
    }
  }, [route.params?.newBooking]);

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { fontSize: scaleFont(24) }]}>My Bookings</Text>
      <ScrollView style={styles.bookingsList} contentContainerStyle={{ paddingBottom: getHeight() * 0.03 }}>
        {bookings.map((booking) => (
          <View key={booking.id} style={styles.bookingCard}>
            <Image
              source={{ uri: booking.image }}
              style={styles.bookingImage}
              resizeMode="cover"
            />
            <View style={styles.bookingInfo}>
              <Text style={[styles.bookingTitle, { fontSize: scaleFont(16) }]}>{booking.title}</Text>
              <Text style={[styles.bookingDate, { fontSize: scaleFont(14) }]}>{booking.date}</Text>
              <Text style={[styles.bookingStatus, { fontSize: scaleFont(14) }]}>Confirmed</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// Profile Screen
function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(
    mockUserStorage.currentUser || {
      name: 'Abdul Rehman',
      email: 'itxmemani0543@gmail.com',
      phone: '+923155',
      profilePicture: 'https://via.placeholder.com/150?text=Profile',
    }
  );
  const [isEditing, setIsEditing] = useState(false);
  const [tempUser, setTempUser] = useState({ ...user });
  const [editError, setEditError] = useState('');
  const [isChangePassword, setIsChangePassword] = useState(false);
  const [passwordDetails, setPasswordDetails] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
  });

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^\+?[1-9]\d{1,14}$/.test(phone);

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Denied',
        'Sorry, we need gallery permissions to change your profile picture.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const newPicture = result.assets[0].uri;
      if (isEditing) {
        setTempUser({ ...tempUser, profilePicture: newPicture });
      } else {
        const updatedUser = { ...user, profilePicture: newPicture };
        setUser(updatedUser);
        mockUserStorage.currentUser = updatedUser;
        const userIndex = mockUserStorage.users.findIndex(
          (u) => u.email === user.email
        );
        if (userIndex !== -1) {
          mockUserStorage.users[userIndex] = updatedUser;
        }
      }
    }
  };

  const handleEditPress = () => {
    setTempUser({ ...user });
    setEditError('');
    setIsEditing(true);
  };

  const handleSave = () => {
    setEditError('');
    if (!tempUser.name) {
      setEditError('Name is required.');
      return;
    }
    if (!validateEmail(tempUser.email)) {
      setEditError('Please enter a valid email address.');
      return;
    }
    if (!validatePhone(tempUser.phone)) {
      setEditError('Please enter a valid phone number (e.g., +1234567890).');
      return;
    }
    if (
      mockUserStorage.users.some(
        (u) => u.email === tempUser.email && u.email !== user.email
      )
    ) {
      setEditError('Email is already registered.');
      return;
    }

    // Update user in mock storage
    const updatedUser = { ...tempUser };
    setUser(updatedUser);
    mockUserStorage.currentUser = updatedUser;

    // Update users array if email changed
    const userIndex = mockUserStorage.users.findIndex(
      (u) => u.email === user.email
    );
    if (userIndex !== -1) {
      mockUserStorage.users[userIndex] = updatedUser;
    }

    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempUser({ ...user });
    setEditError('');
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setTempUser({ ...tempUser, [field]: value });
    setEditError('');
  };

  const handlePasswordChange = () => {
    const { currentPassword, newPassword, confirmPassword } = passwordDetails;
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill out all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New password and confirm password do not match.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long.');
      return;
    }
    if (currentPassword !== mockUserStorage.currentUser.password) {
      Alert.alert('Error', 'Current password is incorrect.');
      return;
    }
    mockUserStorage.currentUser.password = newPassword;
    const userIndex = mockUserStorage.users.findIndex(
      (u) => u.email === user.email
    );
    if (userIndex !== -1) {
      mockUserStorage.users[userIndex].password = newPassword;
    }
    Alert.alert('Success', 'Password changed successfully!');
    setPasswordDetails({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setIsChangePassword(false);
  };

  const toggleNotification = (type) =>
    setNotifications((prev) => ({ ...prev, [type]: !prev[type] }));

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          mockUserStorage.currentUser = null;
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.profileScroll}
        contentContainerStyle={{ paddingBottom: getHeight() * 0.05 }}
      >
        <View style={styles.profileHeader}>
          <View style={styles.profilePictureContainer}>
            <Image
              source={{ uri: user.profilePicture }}
              style={styles.profilePicture}
              resizeMode="cover"
            />
            <TouchableOpacity style={styles.editPictureButton} onPress={pickImage}>
              <MaterialIcons name="edit" size={scaleFont(20)} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.profileName, { fontSize: scaleFont(24) }]}>{user.name}</Text>
        </View>
        <View style={styles.profileContent}>
          <View style={styles.profileItem}>
            <MaterialIcons name="email" size={scaleFont(24)} color="#00ff9d" />
            <Text style={[styles.profileText, { fontSize: scaleFont(16) }]}>{user.email}</Text>
          </View>
          <View style={styles.profileItem}>
            <MaterialIcons name="phone" size={scaleFont(24)} color="#00ff9d" />
            <Text style={[styles.profileText, { fontSize: scaleFont(16) }]}>{user.phone}</Text>
          </View>
          <View style={styles.notificationSection}>
            <Text style={[styles.sectionTitle, { fontSize: scaleFont(20) }]}>Notification Preferences</Text>
            <View style={styles.notificationItem}>
              <Text style={[styles.profileText, { fontSize: scaleFont(16) }]}>Email Notifications</Text>
              <Switch
                value={notifications.email}
                onValueChange={() => toggleNotification('email')}
                trackColor={{ false: '#666666', true: '#00ff9d' }}
                thumbColor="#ffffff"
              />
            </View>
            <View style={styles.notificationItem}>
              <Text style={[styles.profileText, { fontSize: scaleFont(16) }]}>Push Notifications</Text>
              <Switch
                value={notifications.push}
                onValueChange={() => toggleNotification('push')}
                trackColor={{ false: '#666666', true: '#00ff9d' }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={handleEditPress}>
            <Text style={[styles.editButtonText, { fontSize: scaleFont(16) }]}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.changePasswordButton} onPress={() => setIsChangePassword(true)}>
            <Text style={[styles.editButtonText, { fontSize: scaleFont(16) }]}>Change Password</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={[styles.logoutButtonText, { fontSize: scaleFont(16) }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Modal visible={isEditing} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.editModal}>
            <Text style={[styles.editModalTitle, { fontSize: scaleFont(24) }]}>Edit Profile</Text>
            {editError ? (
              <Text style={[styles.authError, { fontSize: scaleFont(14) }]}>{editError}</Text>
            ) : null}
            <TextInput
              style={[styles.editInput, { fontSize: scaleFont(16) }]}
              placeholder="Name"
              placeholderTextColor="#666"
              value={tempUser.name}
              onChangeText={(text) => handleChange('name', text)}
            />
            <TextInput
              style={[styles.editInput, { fontSize: scaleFont(16) }]}
              placeholder="Email"
              placeholderTextColor="#666"
              value={tempUser.email}
              onChangeText={(text) => handleChange('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={[styles.editInput, { fontSize: scaleFont(16) }]}
              placeholder="Phone"
              placeholderTextColor="#666"
              value={tempUser.phone}
              onChangeText={(text) => handleChange('phone', text)}
              keyboardType="phone-pad"
            />
            <TouchableOpacity style={styles.changePictureButton} onPress={pickImage}>
              <Text
                style={[styles.changePictureButtonText, { fontSize: scaleFont(14) }]}
              >
                Change Profile Picture
              </Text>
            </TouchableOpacity>
            <View style={styles.editModalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={[styles.cancelButtonText, { fontSize: scaleFont(16) }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={[styles.saveButtonText, { fontSize: scaleFont(16) }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal visible={isChangePassword} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.editModal}>
            <Text style={[styles.editModalTitle, { fontSize: scaleFont(24) }]}>Change Password</Text>
            <TextInput
              style={[styles.editInput, { fontSize: scaleFont(16) }]}
              placeholder="Current Password"
              placeholderTextColor="#666"
              value={passwordDetails.currentPassword}
              onChangeText={(text) =>
                setPasswordDetails({ ...passwordDetails, currentPassword: text })
              }
              secureTextEntry
            />
            <TextInput
              style={[styles.editInput, { fontSize: scaleFont(16) }]}
              placeholder="New Password"
              placeholderTextColor="#666"
              value={passwordDetails.newPassword}
              onChangeText={(text) =>
                setPasswordDetails({ ...passwordDetails, newPassword: text })
              }
              secureTextEntry
            />
            <TextInput
              style={[styles.editInput, { fontSize: scaleFont(16) }]}
              placeholder="Confirm New Password"
              placeholderTextColor="#666"
              value={passwordDetails.confirmPassword}
              onChangeText={(text) =>
                setPasswordDetails({ ...passwordDetails, confirmPassword: text })
              }
              secureTextEntry
            />
            <View style={styles.editModalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsChangePassword(false)}
              >
                <Text style={[styles.cancelButtonText, { fontSize: scaleFont(16) }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handlePasswordChange}>
                <Text style={[styles.saveButtonText, { fontSize: scaleFont(16) }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Main Tab Navigation
function MainTabNavigator() {
  const tabOffsetValue = useRef(new Animated.Value(0)).current;

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopColor: '#1a1a1a',
          paddingBottom: getHeight() * 0.02,
          height: getHeight() * 0.08,
        },
        tabBarActiveTintColor: '#00ff9d',
        tabBarInactiveTintColor: '#666666',
        headerStyle: { backgroundColor: '#000000' },
        headerTintColor: '#00ff9d',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" color={color} size={scaleFont(size)} />
          ),
        }}
        listeners={{
          tabPress: () =>
            Animated.spring(tabOffsetValue, { toValue: 0, useNativeDriver: true }).start(),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="search" color={color} size={scaleFont(size)} />
          ),
        }}
        listeners={{
          tabPress: () =>
            Animated.spring(tabOffsetValue, {
              toValue: getWidth() / 4,
              useNativeDriver: true,
            }).start(),
        }}
      />
      <Tab.Screen
        name="My Bookings"
        component={MyBookingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="bookmark" color={color} size={scaleFont(size)} />
          ),
        }}
        listeners={{
          tabPress: () =>
            Animated.spring(tabOffsetValue, {
              toValue: getWidth() / 2,
              useNativeDriver: true,
            }).start(),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" color={color} size={scaleFont(size)} />
          ),
        }}
        listeners={{
          tabPress: () =>
            Animated.spring(tabOffsetValue, {
              toValue: getWidth() * 0.75,
              useNativeDriver: true,
            }).start(),
        }}
      />
    </Tab.Navigator>
  );
}

// Main App
function App() {
  const [theme, setTheme] = useState('black-green');

  const toggleTheme = () =>
    setTheme((prevTheme) => (prevTheme === 'black-green' ? 'green-black' : 'black-green'));

  return (
    <ThemeContext.Provider value={theme}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerStyle: {
              backgroundColor: theme === 'black-green' ? '#000000' : '#00ff9d',
            },
            headerTintColor: theme === 'black-green' ? '#00ff9d' : '#000000',
            headerTitleStyle: { fontWeight: 'bold', fontSize: scaleFont(20) },
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
          <Stack.Screen
            name="Main"
            component={MainTabNavigator}
            options={{
              headerShown: false,
              headerRight: () => (
                <TouchableOpacity onPress={toggleTheme} style={{ marginRight: getWidth() * 0.04 }}>
                  <MaterialIcons
                    name="color-lens"
                    size={scaleFont(24)}
                    color={theme === 'black-green' ? '#00ff9d' : '#000000'}
                  />
                </TouchableOpacity>
              ),
            }}
          />
          <Stack.Screen
            name="BookingDetails"
            component={BookingDetailsScreen}
            options={{ title: 'Booking Details' }}
          />
          <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: 'Payment' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeContext.Provider>
  );
}

// Styles
const styles = StyleSheet.create({
  authContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getWidth() * 0.05,
  },
  authTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginVertical: getHeight() * 0.03,
  },
  authInput: {
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    marginBottom: getHeight() * 0.015,
  },
  authError: {
    color: '#ff3333',
    marginBottom: getHeight() * 0.015,
  },
  authButton: {
    backgroundColor: '#00ff9d',
    paddingVertical: 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: getHeight() * 0.015,
  },
  authButtonText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  authLink: {
    color: '#00ff9d',
  },
  welcomeContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: getWidth() * 0.05,
    width: '90%',
  },
  welcomeTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginTop: getHeight() * 0.03,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    color: '#00ff9d',
    marginTop: getHeight() * 0.015,
    marginBottom: getHeight() * 0.05,
    textAlign: 'center',
  },
  getStartedButton: {
    backgroundColor: '#00ff9d',
    paddingVertical: 16,
    paddingHorizontal: getWidth() * 0.08,
    borderRadius: 30,
    marginTop: getHeight() * 0.03,
  },
  getStartedButtonText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    paddingHorizontal: getWidth() * 0.04,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 12,
    margin: getWidth() * 0.04,
    borderRadius: 8,
  },
  searchText: {
    color: '#666666',
    marginLeft: 8,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginBottom: getHeight() * 0.02,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: getWidth() * 0.5,
  },
  cardContent: {
    padding: getWidth() * 0.04,
  },
  cardTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDescription: {
    color: '#999999',
    marginBottom: 8,
  },
  cardPrice: {
    color: '#00ff9d',
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingHorizontal: getWidth() * 0.04,
    paddingVertical: getHeight() * 0.02,
  },
  searchInput: {
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginBottom: getHeight() * 0.02,
  },
  dropdown: {
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
    marginBottom: getHeight() * 0.02,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    color: '#ffffff',
    flex: 1,
  },
  dropdownModal: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: getWidth() * 0.06,
    width: '90%',
    maxHeight: getHeight() * 0.5,
  },
  dropdownModalTitle: {
    color: '#00ff9d',
    fontWeight: 'bold',
    marginBottom: getHeight() * 0.02,
    textAlign: 'center',
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  dropdownItemText: {
    color: '#ffffff',
  },
  dropdownCancelButton: {
    backgroundColor: '#666666',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: getHeight() * 0.02,
  },
  dropdownCancelText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  detailImage: {
    width: '100%',
    height: getWidth() * 0.75,
  },
  detailContent: {
    padding: getWidth() * 0.04,
  },
  detailTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detailDescription: {
    color: '#999999',
    marginBottom: 16,
  },
  detailPrice: {
    color: '#00ff9d',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detailInfo: {
    color: '#ffffff',
    marginBottom: 8,
  },
  bookButton: {
    backgroundColor: '#00ff9d',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: getHeight() * 0.03,
  },
  bookButtonText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  paymentContent: {
    padding: getWidth() * 0.04,
  },
  paymentTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: getHeight() * 0.03,
  },
  paymentMethods: {
    flexDirection: 'row',
    gap: getWidth() * 0.04,
    marginBottom: getHeight() * 0.03,
  },
  paymentMethod: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  paymentMethodSelected: {
    backgroundColor: '#002211',
    borderColor: '#00ff9d',
    borderWidth: 1,
  },
  paymentMethodText: {
    color: '#ffffff',
    marginTop: 8,
  },
  cardForm: {
    marginBottom: getHeight() * 0.03,
  },
  cardFormTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  cardInput: {
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  discountInput: {
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginBottom: getHeight() * 0.03,
  },
  payButton: {
    backgroundColor: '#00ff9d',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  bookingsList: {
    paddingHorizontal: getWidth() * 0.04,
  },
  sectionTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    padding: getWidth() * 0.04,
  },
  bookingCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginBottom: getHeight() * 0.02,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  bookingImage: {
    width: getWidth() * 0.25,
    height: getWidth() * 0.25,
  },
  bookingInfo: {
    flex: 1,
    padding: getWidth() * 0.04,
  },
  bookingTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bookingDate: {
    color: '#999999',
    marginBottom: 4,
  },
  bookingStatus: {
    color: '#00ff9d',
    fontWeight: 'bold',
  },
  profileScroll: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: getHeight() * 0.04,
  },
  profilePictureContainer: {
    position: 'relative',
  },
  profilePicture: {
    width: getWidth() * 0.25,
    height: getWidth() * 0.25,
    borderRadius: getWidth() * 0.125,
    borderWidth: 2,
    borderColor: '#00ff9d',
  },
  editPictureButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#00ff9d',
    borderRadius: getWidth() * 0.04,
    padding: 5,
  },
  profileName: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginTop: getHeight() * 0.02,
  },
  profileContent: {
    paddingHorizontal: getWidth() * 0.04,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: getWidth() * 0.04,
    borderRadius: 8,
    marginBottom: getHeight() * 0.02,
  },
  profileText: {
    color: '#ffffff',
    marginLeft: getWidth() * 0.04,
    flex: 1,
  },
  notificationSection: {
    marginTop: getHeight() * 0.03,
    marginBottom: getHeight() * 0.03,
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: getWidth() * 0.04,
    borderRadius: 8,
    marginBottom: getHeight() * 0.02,
  },
  editButton: {
    backgroundColor: '#00ff9d',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: getHeight() * 0.015,
  },
  changePasswordButton: {
    backgroundColor: '#00ff9d',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: getHeight() * 0.015,
  },
  logoutButton: {
    backgroundColor: '#ff3333',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: getHeight() * 0.02,
  },
  editButtonText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  logoutButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: getWidth() * 0.05,
  },
  editModal: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: getWidth() * 0.06,
    width: '90%',
    maxHeight: getHeight() * 0.8,
  },
  editModalTitle: {
    color: '#00ff9d',
    fontWeight: 'bold',
    marginBottom: getHeight() * 0.03,
    textAlign: 'center',
  },
  editInput: {
    backgroundColor: '#333333',
    color: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginBottom: getHeight() * 0.015,
  },
  changePictureButton: {
    backgroundColor: '#00ff9d',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: getHeight() * 0.015,
  },
  changePictureButtonText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  editModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: getHeight() * 0.03,
  },
  cancelButton: {
    backgroundColor: '#666666',
    padding: 16,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#00ff9d',
    padding: 16,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  shinyGreenText: {
    color: '#00ff9d',
    textShadowColor: '#00ff9d',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  confirmationModal: {
    backgroundColor: '#333333',
    borderRadius: 16,
    padding: getWidth() * 0.06,
    width: '90%',
    alignItems: 'center',
  },
  tickCircle: {
    backgroundColor: '#00ff9d',
    borderRadius: 50,
    padding: 16,
    marginBottom: getHeight() * 0.03,
  },
  confirmationTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: getHeight() * 0.02,
  },
  confirmationText: {
    color: '#ffffff',
    marginBottom: getHeight() * 0.03,
    textAlign: 'center',
  },
  bookingDetails: {
    width: '100%',
    marginBottom: getHeight() * 0.03,
  },
  bookingDetailTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bookingDetailText: {
    color: '#00ff9d',
    marginBottom: 4,
  },
  confirmationButton: {
    backgroundColor: '#000000',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  confirmationButtonText: {
    color: '#00ff9d',
    fontWeight: 'bold',
  },
  validationModal: {
    backgroundColor: '#333333',
    borderRadius: 16,
    padding: getWidth() * 0.06,
    width: '90%',
    alignItems: 'center',
  },
  validationTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: getHeight() * 0.02,
  },
  validationText: {
    color: '#ffffff',
    marginBottom: getHeight() * 0.03,
    textAlign: 'center',
  },
  validationButton: {
    backgroundColor: '#000000',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  validationButtonText: {
    color: '#00ff9d',
    fontWeight: 'bold',
  },
  loadingText: {
    color: '#ffffff',
    textAlign: 'center',
    marginTop: getHeight() * 0.03,
  },
});

export default App;
