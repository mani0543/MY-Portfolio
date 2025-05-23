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
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

// Get screen width for tab animations
const { width } = Dimensions.get('window');
const getWidth = () => width;

// Mock Data
const MOCK_EVENTS = [
  {
    id: 1,
    type: 'event',
    title: 'Summer Music Festival',
    description: 'Three days of amazing music performances',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3',
    price: 149.99,
    date: '2024-07-15',
    location: 'Central Park, New York',
  },
  {
    id: 2,
    type: 'movie',
    title: 'Inception 2',
    description: 'The mind-bending sequel',
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1',
    price: 19.99,
    date: '2024-03-20',
    location: 'Cinema City, Los Angeles',
  },
  {
    id: 3,
    type: 'flight',
    title: 'NYC to London',
    description: 'Direct flight, 7 hours',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05',
    price: 599.99,
    date: '2024-04-01',
    location: 'JFK Airport, New York',
  },
];

// List of countries, locations, and event types
const COUNTRIES = ['USA', 'UK', 'Canada', 'Australia', 'Germany', 'France'];
const LOCATIONS = ['New York', 'Los Angeles', 'London', 'Sydney', 'Berlin', 'Paris'];
const EVENT_TYPES = ['Music Festival', 'Tech Conference', 'Movie', 'Flight'];

// Create Stack and Tab Navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Theme Context
const ThemeContext = React.createContext();

// Welcome Screen with Animation
function WelcomeScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto navigate after 3 seconds
    const timer = setTimeout(() => {
      navigation.replace('Main');
    }, 3000);

    return () => clearTimeout(timer);
  }, [fadeAnim, navigation, scaleAnim]);

  return (
    <View style={styles.welcomeContainer}>
      <Animated.View
        style={[
          styles.welcomeContent,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <MaterialIcons name="flight-takeoff" size={80} color="#00ff9d" />
        <Text style={styles.welcomeTitle}>Welcome to Mani's</Text>
        <Text style={styles.welcomeSubtitle}>Ticket Booking Mobile App</Text>

        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={() => navigation.replace('Main')}
        >
          <Text style={styles.getStartedButtonText}>Get Started</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// Home Screen
function HomeScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.searchBar}
        onPress={() => navigation.navigate('Search')}
      >
        <MaterialIcons name="search" size={24} color="#00ff9d" />
        <Text style={styles.searchText}>Search events, movies, or flights...</Text>
      </TouchableOpacity>

      <ScrollView style={styles.content}>
        {MOCK_EVENTS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => navigation.navigate('BookingDetails', { item })}
          >
            <Image source={{ uri: item.image }} style={styles.cardImage} />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDescription}>{item.description}</Text>
              <Text style={styles.cardPrice}>${item.price}</Text>
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

  // Filter MOCK_EVENTS based on search query and dropdown selections
  const filteredEvents = MOCK_EVENTS.filter((event) => {
    const matchesSearchQuery = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                               event.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCountry = selectedCountry ? event.location.includes(selectedCountry) : true;
    const matchesLocation = selectedLocation ? event.location.includes(selectedLocation) : true;
    const matchesEventType = selectedEventType ? event.type === selectedEventType.toLowerCase() : true;

    return matchesSearchQuery && matchesCountry && matchesLocation && matchesEventType;
  });

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* Dropdown for Country */}
        <Picker
          selectedValue={selectedCountry}
          onValueChange={(itemValue) => setSelectedCountry(itemValue)}
          style={styles.picker}
          dropdownIconColor="#00ff9d"
        >
          <Picker.Item label="Select Country" value="" />
          {COUNTRIES.map((country, index) => (
            <Picker.Item key={index} label={country} value={country} />
          ))}
        </Picker>

        {/* Dropdown for Location */}
        <Picker
          selectedValue={selectedLocation}
          onValueChange={(itemValue) => setSelectedLocation(itemValue)}
          style={styles.picker}
          dropdownIconColor="#00ff9d"
        >
          <Picker.Item label="Select Location" value="" />
          {LOCATIONS.map((location, index) => (
            <Picker.Item key={index} label={location} value={location} />
          ))}
        </Picker>

        {/* Dropdown for Event Type */}
        <Picker
          selectedValue={selectedEventType}
          onValueChange={(itemValue) => setSelectedEventType(itemValue)}
          style={styles.picker}
          dropdownIconColor="#00ff9d"
        >
          <Picker.Item label="Select Event Type" value="" />
          {EVENT_TYPES.map((event, index) => (
            <Picker.Item key={index} label={event} value={event} />
          ))}
        </Picker>

        {/* Display Filtered Events */}
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('BookingDetails', { item })}
            >
              <Image source={{ uri: item.image }} style={styles.cardImage} />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDescription}>{item.description}</Text>
                <Text style={styles.cardPrice}>${item.price}</Text>
              </View>
            </TouchableOpacity>
          )}
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
      <Image source={{ uri: item.image }} style={styles.detailImage} />
      <View style={styles.detailContent}>
        <Text style={styles.detailTitle}>{item.title}</Text>
        <Text style={styles.detailDescription}>{item.description}</Text>
        <Text style={styles.detailPrice}>${item.price}</Text>
        <Text style={styles.detailInfo}>Date: {item.date}</Text>
        <Text style={styles.detailInfo}>Location: {item.location}</Text>

        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => navigation.navigate('Payment', { item })}
        >
          <Text style={styles.bookButtonText}>Book Now</Text>
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
  const [showValidationModal, setShowValidationModal] = useState(false); // New state for validation modal

  const handlePayment = () => {
    if (paymentMethod === 'credit') {
      if (!showCardForm) {
        setShowCardForm(true);
        return;
      }

      // Validate credit card details
      if (
        !cardDetails.cardNumber ||
        !cardDetails.cardHolder ||
        !cardDetails.expiryDate ||
        !cardDetails.cvv
      ) {
        setShowValidationModal(true); // Show validation modal if details are missing
        return;
      }
    }

    // Show confirmation modal if all details are filled
    setShowConfirmation(true);
  };

  const handleConfirmation = () => {
    setShowConfirmation(false);

    // Navigate to the "My Bookings" tab and pass the new booking
    navigation.navigate('Main', {
      screen: 'My Bookings',
      params: { newBooking: item },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.paymentContent}>
        <Text style={[styles.paymentTitle, styles.shinyGreenText]}>Payment Details</Text>

        <View style={styles.paymentMethods}>
          <TouchableOpacity
            style={[
              styles.paymentMethod,
              paymentMethod === 'credit' && styles.paymentMethodSelected,
            ]}
            onPress={() => setPaymentMethod('credit')}
          >
            <MaterialIcons name="credit-card" size={24} color="#00ff9d" />
            <Text style={[styles.paymentMethodText, styles.shinyGreenText]}>Credit Card</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentMethod,
              paymentMethod === 'paypal' && styles.paymentMethodSelected,
            ]}
            onPress={() => setPaymentMethod('paypal')}
          >
            <MaterialIcons name="payment" size={24} color="#00ff9d" />
            <Text style={[styles.paymentMethodText, styles.shinyGreenText]}>PayPal</Text>
          </TouchableOpacity>
        </View>

        {showCardForm && (
          <View style={styles.cardForm}>
            <Text style={[styles.cardFormTitle, styles.shinyGreenText]}>Enter Card Details</Text>

            <TextInput
              style={styles.cardInput}
              placeholder="Card Number"
              placeholderTextColor="#666"
              value={cardDetails.cardNumber}
              onChangeText={(text) => setCardDetails({ ...cardDetails, cardNumber: text })}
              keyboardType="numeric"
              maxLength={16}
            />

            <TextInput
              style={styles.cardInput}
              placeholder="Card Holder Name"
              placeholderTextColor="#666"
              value={cardDetails.cardHolder}
              onChangeText={(text) => setCardDetails({ ...cardDetails, cardHolder: text })}
            />

            <View style={styles.cardRow}>
              <TextInput
                style={[styles.cardInput, { flex: 1, marginRight: 8 }]}
                placeholder="Expiry Date (MM/YY)"
                placeholderTextColor="#666"
                value={cardDetails.expiryDate}
                onChangeText={(text) => setCardDetails({ ...cardDetails, expiryDate: text })}
                maxLength={5}
              />

              <TextInput
                style={[styles.cardInput, { flex: 1 }]}
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
          style={styles.discountInput}
          placeholder="Discount Code"
          placeholderTextColor="#666"
          value={discountCode}
          onChangeText={setDiscountCode}
        />

        <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
          <Text style={[styles.payButtonText, styles.shinyGreenText]}>
            {paymentMethod === 'credit' && !showCardForm ? 'Proceed to Card Details' : 'Pay Now'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Confirmation Modal */}
      <Modal visible={showConfirmation} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModal}>
            <View style={styles.tickCircle}>
              <MaterialIcons name="check" size={50} color="#00ff9d" />
            </View>

            <Text style={[styles.confirmationTitle, styles.shinyGreenText]}>Booking Confirmed!</Text>
            <Text style={styles.confirmationText}>Your booking has been successfully processed.</Text>

            <View style={styles.bookingDetails}>
              <Text style={styles.bookingDetailTitle}>{item.title}</Text>
              <Text style={styles.bookingDetailText}>Date: {item.date}</Text>
              <Text style={styles.bookingDetailText}>Location: {item.location}</Text>
              <Text style={styles.bookingDetailText}>Price: ${item.price}</Text>
            </View>

            <TouchableOpacity
              style={styles.confirmationButton}
              onPress={handleConfirmation}
            >
              <Text style={[styles.confirmationButtonText, styles.shinyGreenText]}>View My Bookings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Validation Modal */}
      <Modal visible={showValidationModal} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.validationModal}>
            <Text style={[styles.validationTitle, styles.shinyGreenText]}>Missing Details</Text>
            <Text style={styles.validationText}>Please fill out all credit card details to proceed with your booking.</Text>

            <TouchableOpacity
              style={styles.validationButton}
              onPress={() => setShowValidationModal(false)}
            >
              <Text style={[styles.validationButtonText, styles.shinyGreenText]}>OK</Text>
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
      <Text style={styles.sectionTitle}>My Bookings</Text>
      <ScrollView style={styles.bookingsList}>
        {bookings.map((booking, index) => (
          <View key={index} style={styles.bookingCard}>
            <Image source={{ uri: booking.image }} style={styles.bookingImage} />
            <View style={styles.bookingInfo}>
              <Text style={styles.bookingTitle}>{booking.title}</Text>
              <Text style={styles.bookingDate}>{booking.date}</Text>
              <Text style={styles.bookingStatus}>Confirmed</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// Profile Screen
function ProfileScreen() {
  const [user, setUser] = useState({
    name: 'Abdul Rehman',
    email: 'itxmemani0543@gmail.com',
    phone: '+923 155',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempUser, setTempUser] = useState({ ...user });

  const handleEditPress = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setUser(tempUser);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempUser(user);
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setTempUser({ ...tempUser, [field]: value });
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <MaterialIcons name="account-circle" size={80} color="#00ff9d" />
        <Text style={styles.profileName}>{user.name}</Text>
      </View>

      <View style={styles.profileContent}>
        <View style={styles.profileItem}>
          <MaterialIcons name="email" size={24} color="#00ff9d" />
          <Text style={styles.profileText}>{user.email}</Text>
        </View>
        <View style={styles.profileItem}>
          <MaterialIcons name="phone" size={24} color="#00ff9d" />
          <Text style={styles.profileText}>{user.phone}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.editButton} onPress={handleEditPress}>
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>

      {/* Edit Profile Modal */}
      <Modal visible={isEditing} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.editModal}>
            <Text style={styles.editModalTitle}>Edit Profile</Text>

            <TextInput
              style={styles.editInput}
              placeholder="Name"
              placeholderTextColor="#666"
              value={tempUser.name}
              onChangeText={(text) => handleChange('name', text)}
            />
            <TextInput
              style={styles.editInput}
              placeholder="Email"
              placeholderTextColor="#666"
              value={tempUser.email}
              onChangeText={(text) => handleChange('email', text)}
            />
            <TextInput
              style={styles.editInput}
              placeholder="Phone"
              placeholderTextColor="#666"
              value={tempUser.phone}
              onChangeText={(text) => handleChange('phone', text)}
            />

            <View style={styles.editModalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
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
        },
        tabBarActiveTintColor: '#00ff9d',
        tabBarInactiveTintColor: '#666666',
        headerStyle: {
          backgroundColor: '#000000',
        },
        headerTintColor: '#00ff9d',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" color={color} size={size} />
          ),
        }}
        listeners={{
          tabPress: () => {
            Animated.spring(tabOffsetValue, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          },
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="search" color={color} size={size} />
          ),
        }}
        listeners={{
          tabPress: () => {
            Animated.spring(tabOffsetValue, {
              toValue: getWidth() / 4,
              useNativeDriver: true,
            }).start();
          },
        }}
      />
      <Tab.Screen
        name="My Bookings"
        component={MyBookingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="bookmark" color={color} size={size} />
          ),
        }}
        listeners={{
          tabPress: () => {
            Animated.spring(tabOffsetValue, {
              toValue: getWidth() / 2,
              useNativeDriver: true,
            }).start();
          },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" color={color} size={size} />
          ),
        }}
        listeners={{
          tabPress: () => {
            Animated.spring(tabOffsetValue, {
              toValue: getWidth() * 0.75,
              useNativeDriver: true,
            }).start();
          },
        }}
      />
    </Tab.Navigator>
  );
}

// Main App with Stack Navigation
function App() {
  const [theme, setTheme] = useState('black-green');

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'black-green' ? 'green-black' : 'black-green'));
  };

  return (
    <ThemeContext.Provider value={theme}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Welcome"
          screenOptions={{
            headerStyle: {
              backgroundColor: theme === 'black-green' ? '#000000' : '#00ff9d',
            },
            headerTintColor: theme === 'black-green' ? '#00ff9d' : '#000000',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Main"
            component={MainTabNavigator}
            options={{
              headerShown: false,
              headerRight: () => (
                <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 16 }}>
                  <MaterialIcons
                    name="color-lens"
                    size={24}
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
          <Stack.Screen
            name="Payment"
            component={PaymentScreen}
            options={{ title: 'Payment' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeContext.Provider>
  );
}

// Styles
const styles = StyleSheet.create({
  // Welcome Screen Styles
  welcomeContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  welcomeTitle: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    color: '#00ff9d',
    fontSize: 24,
    marginTop: 10,
    marginBottom: 40,
    textAlign: 'center',
  },
  getStartedButton: {
    backgroundColor: '#00ff9d',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    marginTop: 20,
  },
  getStartedButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Main App Styles
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  searchText: {
    color: '#666666',
    marginLeft: 8,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 200,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDescription: {
    color: '#999999',
    marginBottom: 8,
  },
  cardPrice: {
    color: '#00ff9d',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 16,
  },
  cardInput: {
  backgroundColor: '#1a1a1a',
  color: '#00ff9d', // Updated text color
  padding: 12,
  borderRadius: 8,
  marginBottom: 12,
},
  searchInput: {
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  picker: {
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    marginBottom: 16,
    borderRadius: 8,
  },
  detailImage: {
    width: '100%',
    height: 300,
  },
  detailContent: {
    padding: 16,
  },
  detailTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detailDescription: {
    color: '#999999',
    marginBottom: 16,
  },
  detailPrice: {
    color: '#00ff9d',
    fontSize: 20,
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
    marginTop: 24,
  },
  bookButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  paymentContent: {
    padding: 16,
  },
  paymentTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  paymentMethods: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
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
  discountInput: {
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  payButton: {
    backgroundColor: '#00ff9d',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bookingsList: {
    padding: 16,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
  },
  bookingCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  bookingImage: {
    width: 100,
    height: 100,
  },
  bookingInfo: {
    flex: 1,
    padding: 16,
  },
  bookingTitle: {
    color: '#ffffff',
    fontSize: 16,
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
  profileHeader: {
    alignItems: 'center',
    padding: 32,
  },
  profileName: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
  profileContent: {
    padding: 16,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  profileText: {
    color: '#ffffff',
    marginLeft: 16,
  },
  editButton: {
    backgroundColor: '#00ff9d',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    margin: 16,
  },
  editButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Edit Profile Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  editModal: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    width: '90%',
  },
  editModalTitle: {
    color: '#00ff9d',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  editInput: {
    backgroundColor: '#333333',
    color: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  editModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
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
    fontSize: 16,
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
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Shiny Green Text Style
  shinyGreenText: {
    color: '#00ff9d',
    textShadowColor: '#00ff9d',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },

  // Confirmation Modal Styles
  confirmationModal: {
    backgroundColor: '#333333',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    alignItems: 'center',
  },
  tickCircle: {
    backgroundColor: '#00ff9d',
    borderRadius: 50,
    padding: 16,
    marginBottom: 20,
  },
  confirmationTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  confirmationText: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  bookingDetails: {
    width: '100%',
    marginBottom: 24,
  },
  bookingDetailTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bookingDetailText: {
    color: '#008000',
    fontSize: 16,
    marginBottom: 4,
  },
  confirmationButton: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  confirmationButtonText: {
    color: '#00ff9d',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Validation Modal Styles
  validationModal: {
    backgroundColor: '#333333',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    alignItems: 'center',
  },
  validationTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  validationText: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  validationButton: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  validationButtonText: {
    color: '#00ff9d',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default App;