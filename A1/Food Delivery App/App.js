import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
  Animated,
  Modal,
  Easing,
  Alert,
} from 'react-native';

// Mock Data
const RESTAURANTS = [
  {
    id: '1',
    name: 'Pizza Hut',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500',
    rating: 4.5,
    deliveryTime: '20-30',
    cuisine: 'Italian',
    priceRange: '$$',
    menu: [
      { id: '1', name: 'Pepperoni Pizza', price: 12.99, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500' },
      { id: '2', name: 'Margherita Pizza', price: 10.99, image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=500' },
    ],
  },
  {
    id: '2',
    name: 'Pizza Palace',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500',
    rating: 4.3,
    deliveryTime: '25-35',
    cuisine: 'Italian',
    priceRange: '$$',
    menu: [
      { id: '1', name: 'Margherita Pizza', price: 14.99, image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=500' },
      { id: '2', name: 'Pepperoni Pizza', price: 16.99, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500' },
    ],
  },
  {
    id: '3',
    name: 'Sushi Master',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500',
    rating: 4.8,
    deliveryTime: '30-40',
    cuisine: 'Japanese',
    priceRange: '$$$',
    menu: [
      { id: '1', name: 'California Roll', price: 18.99, image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500' },
      { id: '2', name: 'Salmon Nigiri', price: 15.99, image: 'https://images.unsplash.com/photo-1633478062482-3358e83356fc?w=500' },
    ],
  },
];

const CATEGORIES = [
  { id: '1', name: 'All', icon: '🍽️' },
  { id: '2', name: 'Pizza', icon: '🍕' },
  { id: '3', name: 'Pasta', icon: '🍝' },
  { id: '4', name: 'Salads', icon: '🥗' },
  { id: '5', name: 'Desserts', icon: '🍰' },
];

const ORDERS = [
  { id: '1', restaurant: 'Pizza Hut', items: ['Pepperoni Pizza', 'Margherita Pizza'], total: 23.98, status: 'Delivered' },
  { id: '2', restaurant: 'Sushi Master', items: ['California Roll', 'Salmon Nigiri'], total: 34.98, status: 'On the Way' },
];

export default function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('1');
  const [cart, setCart] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showRestaurantDetails, setShowRestaurantDetails] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);

  // Animation Values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const welcomeAnim = useRef(new Animated.Value(1)).current;
  const welcomeRotate = useRef(new Animated.Value(0)).current;
  const welcomeScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (showWelcome) {
      // Welcome screen animation sequence
      Animated.sequence([
        Animated.timing(welcomeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.delay(1000),
        Animated.parallel([
          Animated.timing(welcomeRotate, {
            toValue: 1,
            duration: 1000,
            easing: Easing.bezier(0.645, 0.045, 0.355, 1),
            useNativeDriver: true,
          }),
          Animated.timing(welcomeScale, {
            toValue: 0,
            duration: 1000,
            easing: Easing.bezier(0.645, 0.045, 0.355, 1),
            useNativeDriver: true,
          }),
          Animated.timing(welcomeAnim, {
            toValue: 0,
            duration: 800,
            easing: Easing.bezier(0.645, 0.045, 0.355, 1),
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        setShowWelcome(false);
        // Start main content animation
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 1,
            tension: 20,
            friction: 7,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  }, [showWelcome]);

  const addToCart = (item) => {
    setCart([...cart, item]);
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price, 0).toFixed(2);
  };

  const handleCheckout = () => {
    setOrderStatus('preparing');
    setShowCheckout(true);
    setTimeout(() => {
      setOrderStatus('on the way');
      setTimeout(() => {
        setOrderStatus('delivered');
        setCart([]);
        setShowCheckout(false);
      }, 5000);
    }, 3000);
  };

  const WelcomeScreen = () => (
    <Animated.View
      style={[
        styles.welcomeContainer,
        {
          opacity: welcomeAnim,
          transform: [
            { scale: welcomeScale },
            {
              rotate: welcomeRotate.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.welcomeContent}>
        <Text style={styles.welcomeTitle}>Welcome to</Text>
        <Text style={styles.welcomeBrand}>Pizza Hut</Text>
        <Text style={styles.welcomeSubtitle}>Delicious pizzas delivered to your door</Text>
      </View>
    </Animated.View>
  );

  const RestaurantDetailsScreen = ({ restaurant }) => (
    <View style={styles.modalContainer}>
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={() => setShowRestaurantDetails(false)}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.modalTitle}>{restaurant.name}</Text>
      </View>
      <ScrollView style={styles.modalContent}>
        <Image source={{ uri: restaurant.image }} style={styles.restaurantDetailImage} />
        <View style={styles.restaurantDetailInfo}>
          <Text style={styles.restaurantDetailName}>{restaurant.name}</Text>
          <Text style={styles.restaurantDetailRating}>⭐ {restaurant.rating}</Text>
          <Text style={styles.restaurantDetailCuisine}>{restaurant.cuisine} • {restaurant.priceRange}</Text>
          <Text style={styles.restaurantDetailDelivery}>🕒 {restaurant.deliveryTime} min</Text>
        </View>
        <Text style={styles.menuTitle}>Menu</Text>
        {restaurant.menu.map((item) => (
          <View key={item.id} style={styles.menuItem}>
            <Image source={{ uri: item.image }} style={styles.menuItemImage} />
            <View style={styles.menuItemInfo}>
              <Text style={styles.menuItemName}>{item.name}</Text>
              <Text style={styles.menuItemPrice}>${item.price}</Text>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={() => addToCart(item)}>
              <Text style={styles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const CartScreen = () => (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Your Cart</Text>
      {cart.length === 0 ? (
        <View style={styles.emptyCart}>
          <Text style={styles.emptyCartText}>Your cart is empty</Text>
          <TouchableOpacity style={styles.browseButton} onPress={() => setActiveTab('home')}>
            <Text style={styles.browseButtonText}>Browse Restaurants</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView>
            {cart.map((item, index) => (
              <View key={index} style={styles.cartItem}>
                <Text style={styles.cartItemName}>{item.name}</Text>
                <Text style={styles.cartItemPrice}>${item.price}</Text>
                <TouchableOpacity style={styles.removeButton} onPress={() => removeFromCart(item.id)}>
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          <View style={styles.cartTotal}>
            <Text style={styles.cartTotalText}>Total: ${getTotalPrice()}</Text>
            <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
              <Text style={styles.checkoutButtonText}>Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );

  const SearchScreen = () => {
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
      if (searchQuery) {
        const results = RESTAURANTS.filter((restaurant) =>
          restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          restaurant.menu.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    }, [searchQuery]);

    return (
      <View style={styles.container}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for restaurants or dishes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.restaurantCard}
              onPress={() => {
                setSelectedRestaurant(item);
                setShowRestaurantDetails(true);
              }}
            >
              <Image source={{ uri: item.image }} style={styles.restaurantImage} />
              <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName}>{item.name}</Text>
                <View style={styles.restaurantDetails}>
                  <Text style={styles.restaurantRating}>⭐ {item.rating}</Text>
                  <Text style={styles.restaurantDelivery}>🕒 {item.deliveryTime} min</Text>
                  <Text style={styles.restaurantPrice}>{item.priceRange}</Text>
                </View>
                <Text style={styles.restaurantCuisine}>{item.cuisine}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  const ProfileScreen = () => (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Profile</Text>
      <View style={styles.profileInfo}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500' }}
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>John Doe</Text>
        <Text style={styles.profileEmail}>johndoe@example.com</Text>
      </View>
      <Text style={styles.screenTitle}>Order History</Text>
      <FlatList
        data={ORDERS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.orderItem}>
            <Text style={styles.orderRestaurant}>{item.restaurant}</Text>
            <Text style={styles.orderItems}>{item.items.join(', ')}</Text>
            <Text style={styles.orderTotal}>Total: ${item.total}</Text>
            <Text style={styles.orderStatus}>Status: {item.status}</Text>
          </View>
        )}
      />
      <TouchableOpacity style={styles.logoutButton} onPress={() => Alert.alert('Logged Out', 'You have been logged out successfully!')}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );

  const CheckoutModal = () => (
    <Modal transparent visible={showCheckout}>
      <View style={styles.checkoutModal}>
        <View style={styles.checkoutContent}>
          <Text style={styles.checkoutTitle}>Order Status</Text>
          <Text style={styles.orderStatus}>{orderStatus}</Text>
          {orderStatus === 'delivered' && (
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowCheckout(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.mainContainer}>
      {showWelcome ? (
        <WelcomeScreen />
      ) : (
        <>
          {showRestaurantDetails ? (
            <RestaurantDetailsScreen restaurant={selectedRestaurant} />
          ) : (
            <>
              {activeTab === 'home' && (
                <Animated.View
                  style={[
                    styles.container,
                    {
                      opacity: fadeAnim,
                      transform: [
                        {
                          translateX: slideAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-300, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <View style={styles.header}>
                    <Text style={styles.headerTitle}>Food Delivery</Text>
                    <Text style={styles.headerSubtitle}>Delivering happiness to your door</Text>
                  </View>

                  <View style={styles.searchBar}>
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search for restaurants or dishes"
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                    />
                  </View>

                  <View style={styles.categories}>
                    <FlatList
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      data={CATEGORIES}
                      keyExtractor={(item) => item.id}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={[
                            styles.categoryItem,
                            selectedCategory === item.id && styles.selectedCategory,
                          ]}
                          onPress={() => setSelectedCategory(item.id)}
                        >
                          <Text style={styles.categoryIcon}>{item.icon}</Text>
                          <Text style={styles.categoryName}>{item.name}</Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>

                  <ScrollView style={styles.restaurantList}>
                    {RESTAURANTS.map((restaurant) => (
                      <TouchableOpacity
                        key={restaurant.id}
                        style={styles.restaurantCard}
                        onPress={() => {
                          setSelectedRestaurant(restaurant);
                          setShowRestaurantDetails(true);
                        }}
                      >
                        <Image source={{ uri: restaurant.image }} style={styles.restaurantImage} />
                        <View style={styles.restaurantInfo}>
                          <Text style={styles.restaurantName}>{restaurant.name}</Text>
                          <View style={styles.restaurantDetails}>
                            <Text style={styles.restaurantRating}>⭐ {restaurant.rating}</Text>
                            <Text style={styles.restaurantDelivery}>🕒 {restaurant.deliveryTime} min</Text>
                            <Text style={styles.restaurantPrice}>{restaurant.priceRange}</Text>
                          </View>
                          <Text style={styles.restaurantCuisine}>{restaurant.cuisine}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </Animated.View>
              )}

              {activeTab === 'search' && <SearchScreen />}
              {activeTab === 'cart' && <CartScreen />}
              {activeTab === 'profile' && <ProfileScreen />}
            </>
          )}

          <View style={styles.navBar}>
            <TouchableOpacity
              style={[styles.navItem, activeTab === 'home' && styles.activeNavItem]}
              onPress={() => setActiveTab('home')}
            >
              <Text style={styles.navText}>🏠 Home</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navItem, activeTab === 'search' && styles.activeNavItem]}
              onPress={() => setActiveTab('search')}
            >
              <Text style={styles.navText}>🔍 Search</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navItem, activeTab === 'cart' && styles.activeNavItem]}
              onPress={() => setActiveTab('cart')}
            >
              <Text style={styles.navText}>🛒 Cart {cart.length > 0 && `(${cart.length})`}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navItem, activeTab === 'profile' && styles.activeNavItem]}
              onPress={() => setActiveTab('profile')}
            >
              <Text style={styles.navText}>👤 Profile</Text>
            </TouchableOpacity>
          </View>

          <CheckoutModal />
        </>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  welcomeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ff4b3e',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  welcomeContent: {
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 36, // Increased font size
    color: '#fff',
    fontWeight: '300',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  welcomeBrand: {
    fontSize: 56, // Increased font size
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  welcomeSubtitle: {
    fontSize: 22, // Increased font size
    color: '#fff',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingBottom: 60,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1, // Added border
    borderColor: '#ddd', // Added border color
    borderRadius: 10, // Added border radius
  },
  headerTitle: {
    fontSize: 32, // Increased font size
    fontWeight: 'bold',
    color: '#1a1a1a',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    fontSize: 20, // Increased font size
    color: '#666',
    marginTop: 5,
  },
  searchBar: {
    padding: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1, // Added border
    borderColor: '#ddd', // Added border color
    borderRadius: 10, // Added border radius
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 12,
    fontSize: 18, // Increased font size
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1, // Added border
    borderColor: '#ccc', // Added border color
  },
  categories: {
    padding: 15,
    backgroundColor: '#fff',
    borderWidth: 1, // Added border
    borderColor: '#ddd', // Added border color
    borderRadius: 10, // Added border radius
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    transform: [{ scale: 1 }],
    borderWidth: 1, // Added border
    borderColor: '#ccc', // Added border color
  },
  selectedCategory: {
    backgroundColor: '#ff4b3e',
    transform: [{ scale: 1.05 }],
    borderColor: '#ff4b3e', // Added border color
  },
  categoryIcon: {
    fontSize: 28, // Increased font size
  },
  categoryName: {
    marginTop: 5,
    fontSize: 16, // Increased font size
    color: '#666',
    fontWeight: '600',
  },
  restaurantList: {
    padding: 15,
  },
  restaurantCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    transform: [{ scale: 1 }],
    borderWidth: 1, // Added border
    borderColor: '#ddd', // Added border color
  },
  restaurantImage: {
    width: '100%',
    height: 200,
  },
  restaurantInfo: {
    padding: 15,
  },
  restaurantName: {
    fontSize: 24, // Increased font size
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  restaurantDetails: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 4,
  },
  restaurantRating: {
    marginRight: 15,
    color: '#666',
    fontWeight: '600',
    fontSize: 18, // Increased font size
  },
  restaurantDelivery: {
    marginRight: 15,
    color: '#666',
    fontWeight: '600',
    fontSize: 18, // Increased font size
  },
  restaurantPrice: {
    color: '#666',
    fontWeight: '600',
    fontSize: 18, // Increased font size
  },
  restaurantCuisine: {
    color: '#666',
    fontSize: 16, // Increased font size
    fontWeight: '500',
  },
  navBar: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    height: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1, // Added border
    borderColor: '#ddd', // Added border color
    borderRadius: 10, // Added border radius
  },
  navItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ scale: 1 }],
  },
  activeNavItem: {
    borderTopWidth: 2,
    borderTopColor: '#ff4b3e',
    transform: [{ scale: 1.05 }],
  },
  navText: {
    fontSize: 16, // Increased font size
    color: '#666',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1, // Added border
    borderColor: '#ddd', // Added border color
    borderRadius: 10, // Added border radius
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 18, // Increased font size
    color: '#ff4b3e',
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 24, // Increased font size
    fontWeight: 'bold',
    marginLeft: 10,
  },
  modalContent: {
    flex: 1,
  },
  restaurantDetailImage: {
    width: '100%',
    height: 250,
  },
  restaurantDetailInfo: {
    padding: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1, // Added border
    borderColor: '#ddd', // Added border color
    borderRadius: 10, // Added border radius
  },
  restaurantDetailName: {
    fontSize: 28, // Increased font size
    fontWeight: 'bold',
    marginBottom: 10,
  },
  restaurantDetailRating: {
    fontSize: 22, // Increased font size
    color: '#666',
    marginBottom: 5,
  },
  restaurantDetailCuisine: {
    fontSize: 20, // Increased font size
    color: '#666',
    marginBottom: 5,
  },
  restaurantDetailDelivery: {
    fontSize: 20, // Increased font size
    color: '#666',
  },
  menuTitle: {
    fontSize: 26, // Increased font size
    fontWeight: 'bold',
    padding: 20,
    backgroundColor: '#fff',
    borderWidth: 1, // Added border
    borderColor: '#ddd', // Added border color
    borderRadius: 10, // Added border radius
  },
  menuItem: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
    borderWidth: 1, // Added border
    borderColor: '#ddd', // Added border color
    borderRadius: 10, // Added border radius
  },
  menuItemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  menuItemInfo: {
    flex: 1,
    marginLeft: 15,
  },
  menuItemName: {
    fontSize: 20, // Increased font size
    fontWeight: '600',
    marginBottom: 5,
  },
  menuItemPrice: {
    fontSize: 18, // Increased font size
    color: '#666',
  },
  addButton: {
    backgroundColor: '#ff4b3e',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1, // Added border
    borderColor: '#ff4b3e', // Added border color
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16, // Increased font size
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderWidth: 1, // Added border
    borderColor: '#ddd', // Added border color
    borderRadius: 10, // Added border radius
  },
  cartItemName: {
    fontSize: 20, // Increased font size
    flex: 1,
  },
  cartItemPrice: {
    fontSize: 20, // Increased font size
    fontWeight: '600',
    marginRight: 15,
  },
  removeButton: {
    backgroundColor: '#ff4b3e',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1, // Added border
    borderColor: '#ff4b3e', // Added border color
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14, // Increased font size
  },
  cartTotal: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1, // Added border
    borderColor: '#ddd', // Added border color
    borderRadius: 10, // Added border radius
  },
  cartTotalText: {
    fontSize: 22, // Increased font size
    fontWeight: 'bold',
  },
  checkoutButton: {
    backgroundColor: '#ff4b3e',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1, // Added border
    borderColor: '#ff4b3e', // Added border color
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18, // Increased font size
    fontWeight: '600',
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCartText: {
    fontSize: 22, // Increased font size
    color: '#666',
    marginBottom: 20,
  },
  browseButton: {
    backgroundColor: '#ff4b3e',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1, // Added border
    borderColor: '#ff4b3e', // Added border color
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 18, // Increased font size
    fontWeight: '600',
  },
  checkoutModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  checkoutContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1, // Added border
    borderColor: '#ddd', // Added border color
  },
  checkoutTitle: {
    fontSize: 28, // Increased font size
    fontWeight: 'bold',
    marginBottom: 20,
  },
  orderStatus: {
    fontSize: 22, // Increased font size
    color: '#666',
    marginBottom: 20,
    textTransform: 'capitalize',
  },
  closeButton: {
    backgroundColor: '#ff4b3e',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    borderWidth: 1, // Added border
    borderColor: '#ff4b3e', // Added border color
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18, // Increased font size
    fontWeight: '600',
  },
  profileInfo: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1, // Added border
    borderColor: '#ddd', // Added border color
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  profileName: {
    fontSize: 28, // Increased font size
    fontWeight: 'bold',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 20, // Increased font size
    color: '#666',
  },
  orderItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 16,
    margin: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1, // Added border
    borderColor: '#ddd', // Added border color
  },
  orderRestaurant: {
    fontSize: 22, // Increased font size
    fontWeight: 'bold',
    marginBottom: 5,
  },
  orderItems: {
    fontSize: 18, // Increased font size
    color: '#666',
    marginBottom: 5,
  },
  orderTotal: {
    fontSize: 20, // Increased font size
    fontWeight: '600',
    marginBottom: 5,
  },
  orderStatus: {
    fontSize: 18, // Increased font size
    color: '#666',
  },
  logoutButton: {
    backgroundColor: '#ff4b3e',
    padding: 12,
    borderRadius: 8,
    margin: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1, // Added border
    borderColor: '#ff4b3e', // Added border color
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18, // Increased font size
    fontWeight: '600',
  },
});