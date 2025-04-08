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
  Switch,
} from 'react-native';

// Custom mock API function to generate restaurants with 20+ dishes per category
const fetchRestaurants = async (selectedCategory = '1') => {
  const pizzaDishes = [
    { name: 'Margherita Pizza', price: 10.99, image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=500' },
    { name: 'Pepperoni Pizza', price: 12.99, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500' },
    { name: 'Hawaiian Pizza', price: 11.99 },
    { name: 'BBQ Chicken Pizza', price: 13.49 },
    { name: 'Veggie Supreme Pizza', price: 11.49 },
    { name: 'Four Cheese Pizza', price: 12.49 },
    { name: 'Buffalo Chicken Pizza', price: 13.99 },
    { name: 'Meat Lovers Pizza', price: 14.99 },
    { name: 'Mushroom Truffle Pizza', price: 13.29 },
    { name: 'Spicy Sausage Pizza', price: 12.79 },
    { name: 'White Garlic Pizza', price: 11.89 },
    { name: 'Pesto Veggie Pizza', price: 12.39 },
    { name: 'Prosciutto Arugula Pizza', price: 14.49 },
    { name: 'Spinach Alfredo Pizza', price: 12.99 },
    { name: 'Artichoke Heart Pizza', price: 13.19 },
    { name: 'Philly Cheesesteak Pizza', price: 14.29 },
    { name: 'Taco Pizza', price: 13.69 },
    { name: 'Seafood Pizza', price: 15.99 },
    { name: 'Olive and Feta Pizza', price: 12.59 },
    { name: 'Breakfast Pizza', price: 13.89 },
    { name: 'Fig and Goat Cheese Pizza', price: 14.79 },
  ];

  const pastaDishes = [
    { name: 'Spaghetti Carbonara', price: 11.99 },
    { name: 'Penne Alfredo', price: 10.49 },
    { name: 'Lasagna Bolognese', price: 13.99 },
    { name: 'Fettuccine Primavera', price: 12.29 },
    { name: 'Linguine Pesto', price: 11.79 },
    { name: 'Rigatoni Marinara', price: 10.99 },
    { name: 'Spaghetti Aglio e Olio', price: 9.99 },
    { name: 'Pasta Primavera', price: 12.49 },
    { name: 'Macaroni and Cheese', price: 10.29 },
    { name: 'Ravioli Mushroom', price: 13.49 },
    { name: 'Tortellini Spinach', price: 12.99 },
    { name: 'Penne Vodka', price: 11.89 },
    { name: 'Farfalle Pesto Chicken', price: 13.19 },
    { name: 'Orecchiette Sausage', price: 12.69 },
    { name: 'Gnocchi Tomato Basil', price: 13.79 },
    { name: 'Pappardelle Ragu', price: 14.29 },
    { name: 'Spaghetti Clams', price: 15.49 },
    { name: 'Tagliatelle Truffle', price: 14.99 },
    { name: 'Cavatelli Broccoli', price: 11.59 },
    { name: 'Pasta Amatriciana', price: 12.39 },
    { name: 'Lobster Ravioli', price: 16.99 },
  ];

  const saladDishes = [
    { name: 'Caesar Salad', price: 8.99 },
    { name: 'Greek Salad', price: 9.49 },
    { name: 'Cobb Salad', price: 10.99 },
    { name: 'Caprese Salad', price: 9.29 },
    { name: 'Waldorf Salad', price: 10.49 },
    { name: 'Spinach Strawberry Salad', price: 9.79 },
    { name: 'Kale Quinoa Salad', price: 10.29 },
    { name: 'Chicken Caesar Salad', price: 11.49 },
    { name: 'Arugula Beet Salad', price: 9.99 },
    { name: 'Tuna Nicoise Salad', price: 12.99 },
    { name: 'Southwest Chicken Salad', price: 11.89 },
    { name: 'Fattoush Salad', price: 9.59 },
    { name: 'Panzanella Salad', price: 10.19 },
    { name: 'Grilled Peach Salad', price: 10.79 },
    { name: 'Roasted Veggie Salad', price: 11.29 },
    { name: 'Shrimp Avocado Salad', price: 13.49 },
    { name: 'Thai Beef Salad', price: 12.69 },
    { name: 'Watermelon Feta Salad', price: 9.89 },
    { name: 'Chickpea Salad', price: 10.59 },
    { name: 'Salmon Kale Salad', price: 13.99 },
    { name: 'Goat Cheese Pear Salad', price: 11.79 },
  ];

  const dessertDishes = [
    { name: 'Chocolate Lava Cake', price: 7.99 },
    { name: 'Cheesecake', price: 6.99 },
    { name: 'Tiramisu', price: 8.49 },
    { name: 'Apple Pie', price: 6.49 },
    { name: 'Creme Brulee', price: 7.79 },
    { name: 'Brownie Sundae', price: 7.29 },
    { name: 'Key Lime Pie', price: 6.89 },
    { name: 'Panna Cotta', price: 7.59 },
    { name: 'Lemon Raspberry Cake', price: 8.19 },
    { name: 'Chocolate Mousse', price: 7.39 },
    { name: 'Peach Cobbler', price: 6.79 },
    { name: 'Red Velvet Cupcake', price: 5.99 },
    { name: 'Banana Pudding', price: 6.29 },
    { name: 'Carrot Cake', price: 7.49 },
    { name: 'Strawberry Shortcake', price: 7.19 },
    { name: 'Molten Caramel Cake', price: 8.29 },
    { name: 'Pecan Pie', price: 7.69 },
    { name: 'Mango Sorbet', price: 6.59 },
    { name: 'Churros with Chocolate', price: 7.89 },
    { name: 'Baklava', price: 8.99 },
    { name: 'Matcha Green Tea Cake', price: 8.49 },
  ];

  const allDishes = [...pizzaDishes, ...pastaDishes, ...saladDishes, ...dessertDishes];

  const categoryMap = {
    '1': allDishes,
    '2': pizzaDishes,
    '3': pastaDishes,
    '4': saladDishes,
    '5': dessertDishes,
  };

  const selectedDishes = categoryMap[selectedCategory] || allDishes;

  const restaurants = Array.from({ length: 5 }, (_, index) => ({
    id: `${index + 1}`,
    name: `Restaurant ${index + 1}`,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500',
    rating: 4 + Math.random() * 0.8,
    deliveryTime: `${20 + index * 5}-${30 + index * 5}`,
    cuisine: selectedCategory === '1' ? 'Varied' : CATEGORIES.find(c => c.id === selectedCategory)?.name || 'Varied',
    priceRange: '$$',
    menu: selectedDishes.map((dish, dishIndex) => ({
      id: `${dishIndex + 1}`,
      name: dish.name,
      price: dish.price || 10 + Math.random() * 10,
      image: dish.image || 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500',
    })),
  }));

  return restaurants;
};

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
  const [restaurants, setRestaurants] = useState([]);
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'johndoe@example.com',
    image: 'https://avatarfiles.alphacoders.com/367/367252.jpg',
  });
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); // Theme state

  // Animation Values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const welcomeAnim = useRef(new Animated.Value(1)).current;
  const welcomeRotate = useRef(new Animated.Value(0)).current;
  const welcomeScale = useRef(new Animated.Value(1)).current;
  const shineAnim = useRef(new Animated.Value(0)).current; // For shiny toggle effect

  useEffect(() => {
    fetchRestaurants(selectedCategory)
      .then((data) => setRestaurants(data))
      .catch((error) => console.error('Error fetching restaurants:', error));
  }, [selectedCategory]);

  useEffect(() => {
    if (showWelcome) {
      Animated.sequence([
        Animated.timing(welcomeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.delay(1000),
        Animated.parallel([
          Animated.timing(welcomeRotate, { toValue: 1, duration: 1000, easing: Easing.bezier(0.645, 0.045, 0.355, 1), useNativeDriver: true }),
          Animated.timing(welcomeScale, { toValue: 0, duration: 1000, easing: Easing.bezier(0.645, 0.045, 0.355, 1), useNativeDriver: true }),
          Animated.timing(welcomeAnim, { toValue: 0, duration: 800, easing: Easing.bezier(0.645, 0.045, 0.355, 1), useNativeDriver: true }),
        ]),
      ]).start(() => {
        setShowWelcome(false);
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
          Animated.spring(slideAnim, { toValue: 1, tension: 20, friction: 7, useNativeDriver: true }),
        ]).start();
      });
    }
  }, [showWelcome]);

  // Shiny animation for toggle button
  const startShineAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shineAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(shineAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  };

  const addToCart = (item) => setCart([...cart, item]);
  const removeFromCart = (itemId) => setCart(cart.filter((item) => item.id !== itemId));
  const getTotalPrice = () => cart.reduce((total, item) => total + item.price, 0).toFixed(2);

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

  const updateProfile = (newData) => {
    setProfileData({ ...profileData, ...newData });
    setShowEditProfile(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    startShineAnimation();
  };

  const WelcomeScreen = () => (
    <Animated.View
      style={[
        styles.welcomeContainer,
        { opacity: welcomeAnim, transform: [{ scale: welcomeScale }, { rotate: welcomeRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] },
      ]}
    >
      <View style={styles.welcomeContent}>
        <Text style={[styles.welcomeTitle, isDarkMode && styles.darkText]}>Welcome to</Text>
        <Text style={[styles.welcomeBrand, isDarkMode && styles.darkText]}>Food Delivery</Text>
        <Text style={[styles.welcomeSubtitle, isDarkMode && styles.darkText]}>Delicious meals delivered to your door</Text>
      </View>
    </Animated.View>
  );

  const RestaurantDetailsScreen = ({ restaurant }) => (
    <View style={[styles.modalContainer, isDarkMode && styles.darkBackground]}>
      <View style={[styles.modalHeader, isDarkMode && styles.darkCard]}>
        <TouchableOpacity onPress={() => setShowRestaurantDetails(false)}>
          <Text style={[styles.backButtonText, isDarkMode && styles.darkText]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>{restaurant.name}</Text>
      </View>
      <ScrollView style={styles.modalContent}>
        <Image source={{ uri: restaurant.image }} style={styles.restaurantDetailImage} />
        <View style={[styles.restaurantDetailInfo, isDarkMode && styles.darkCard]}>
          <Text style={[styles.restaurantDetailName, isDarkMode && styles.darkText]}>{restaurant.name}</Text>
          <Text style={[styles.restaurantDetailRating, isDarkMode && styles.darkText]}>⭐ {restaurant.rating.toFixed(1)}</Text>
          <Text style={[styles.restaurantDetailCuisine, isDarkMode && styles.darkText]}>{restaurant.cuisine} • {restaurant.priceRange}</Text>
          <Text style={[styles.restaurantDetailDelivery, isDarkMode && styles.darkText]}>🕒 {restaurant.deliveryTime} min</Text>
        </View>
        <Text style={[styles.menuTitle, isDarkMode && styles.darkText, isDarkMode && styles.darkCard]}>Menu</Text>
        {restaurant.menu.map((item) => (
          <View key={item.id} style={[styles.menuItem, isDarkMode && styles.darkCard]}>
            <Image source={{ uri: item.image }} style={styles.menuItemImage} />
            <View style={styles.menuItemInfo}>
              <Text style={[styles.menuItemName, isDarkMode && styles.darkText]}>{item.name}</Text>
              <Text style={[styles.menuItemPrice, isDarkMode && styles.darkText]}>${item.price.toFixed(2)}</Text>
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
    <View style={[styles.container, isDarkMode && styles.darkBackground]}>
      <Text style={[styles.screenTitle, isDarkMode && styles.darkText]}>Your Cart</Text>
      {cart.length === 0 ? (
        <View style={styles.emptyCart}>
          <Text style={[styles.emptyCartText, isDarkMode && styles.darkText]}>Your cart is empty</Text>
          <TouchableOpacity style={styles.browseButton} onPress={() => setActiveTab('home')}>
            <Text style={styles.browseButtonText}>Browse Restaurants</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView>
            {cart.map((item, index) => (
              <View key={index} style={[styles.cartItem, isDarkMode && styles.darkCard]}>
                <Text style={[styles.cartItemName, isDarkMode && styles.darkText]}>{item.name}</Text>
                <Text style={[styles.cartItemPrice, isDarkMode && styles.darkText]}>${item.price.toFixed(2)}</Text>
                <TouchableOpacity style={styles.removeButton} onPress={() => removeFromCart(item.id)}>
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          <View style={[styles.cartTotal, isDarkMode && styles.darkCard]}>
            <Text style={[styles.cartTotalText, isDarkMode && styles.darkText]}>Total: ${getTotalPrice()}</Text>
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
        const results = restaurants.filter(
          (restaurant) =>
            restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            restaurant.menu.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    }, [searchQuery]);

    return (
      <View style={[styles.container, isDarkMode && styles.darkBackground]}>
        <TextInput
          style={[styles.searchInput, isDarkMode && styles.darkInput]}
          placeholder="Search for restaurants or dishes..."
          placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.restaurantCard, isDarkMode && styles.darkCard]}
              onPress={() => {
                setSelectedRestaurant(item);
                setShowRestaurantDetails(true);
              }}
            >
              <Image source={{ uri: item.image }} style={styles.restaurantImage} />
              <View style={styles.restaurantInfo}>
                <Text style={[styles.restaurantName, isDarkMode && styles.darkText]}>{item.name}</Text>
                <View style={styles.restaurantDetails}>
                  <Text style={[styles.restaurantRating, isDarkMode && styles.darkText]}>⭐ {item.rating.toFixed(1)}</Text>
                  <Text style={[styles.restaurantDelivery, isDarkMode && styles.darkText]}>🕒 {item.deliveryTime} min</Text>
                  <Text style={[styles.restaurantPrice, isDarkMode && styles.darkText]}>{item.priceRange}</Text>
                </View>
                <Text style={[styles.restaurantCuisine, isDarkMode && styles.darkText]}>{item.cuisine}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  const ProfileScreen = () => {
    const [editName, setEditName] = useState(profileData.name);
    const [editEmail, setEditEmail] = useState(profileData.email);

    return (
      <View style={[styles.container, isDarkMode && styles.darkBackground]}>
        <Text style={[styles.screenTitle, isDarkMode && styles.darkText]}>Profile</Text>
        <View style={[styles.profileInfo, isDarkMode && styles.darkCard]}>
          <TouchableOpacity onPress={() => Alert.alert('Change Picture', 'This would open image picker in a real app')}>
            <Image source={{ uri: profileData.image }} style={styles.profileImage} />
          </TouchableOpacity>
          <Text style={[styles.profileName, isDarkMode && styles.darkText]}>{profileData.name}</Text>
          <Text style={[styles.profileEmail, isDarkMode && styles.darkText]}>{profileData.email}</Text>
          <TouchableOpacity style={styles.editProfileButton} onPress={() => setShowEditProfile(true)}>
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          <View style={styles.themeToggleContainer}>
            <Text style={[styles.themeToggleText, isDarkMode && styles.darkText]}>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</Text>
            <TouchableOpacity
              style={styles.themeToggleButton}
              onPress={toggleTheme}
            >
              <Animated.View
                style={[
                  styles.shinyOverlay,
                  {
                    opacity: shineAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] }),
                    transform: [
                      { translateX: shineAnim.interpolate({ inputRange: [0, 1], outputRange: [-50, 50] }) },
                    ],
                  },
                ]}
              />
              <Text style={styles.themeToggleButtonText}>{isDarkMode ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={[styles.screenTitle, isDarkMode && styles.darkText]}>Order History</Text>
        <FlatList
          data={ORDERS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.orderItem, isDarkMode && styles.darkCard]}>
              <Text style={[styles.orderRestaurant, isDarkMode && styles.darkText]}>{item.restaurant}</Text>
              <Text style={[styles.orderItems, isDarkMode && styles.darkText]}>{item.items.join(', ')}</Text>
              <Text style={[styles.orderTotal, isDarkMode && styles.darkText]}>Total: ${item.total}</Text>
              <Text style={[styles.orderStatus, isDarkMode && styles.darkText]}>Status: {item.status}</Text>
            </View>
          )}
        />
        <TouchableOpacity style={styles.logoutButton} onPress={() => Alert.alert('Logged Out', 'You have been logged out successfully!')}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        <Modal visible={showEditProfile} transparent animationType="slide">
          <View style={[styles.editProfileModal, isDarkMode && styles.darkModal]}>
            <View style={[styles.editProfileContent, isDarkMode && styles.darkCard]}>
              <Text style={[styles.editProfileTitle, isDarkMode && styles.darkText]}>Edit Profile</Text>
              <TextInput
                style={[styles.editInput, isDarkMode && styles.darkInput]}
                value={editName}
                onChangeText={setEditName}
                placeholder="Name"
                placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
              />
              <TextInput
                style={[styles.editInput, isDarkMode && styles.darkInput]}
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="Email"
                placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
                keyboardType="email-address"
              />
              <View style={styles.editProfileButtons}>
                <TouchableOpacity style={styles.saveButton} onPress={() => updateProfile({ name: editName, email: editEmail })}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setShowEditProfile(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  const CheckoutModal = () => (
    <Modal transparent visible={showCheckout}>
      <View style={[styles.checkoutModal, isDarkMode && styles.darkModal]}>
        <View style={[styles.checkoutContent, isDarkMode && styles.darkCard]}>
          <Text style={[styles.checkoutTitle, isDarkMode && styles.darkText]}>Order Status</Text>
          <Text style={[styles.orderStatus, isDarkMode && styles.darkText]}>{orderStatus}</Text>
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
    <View style={[styles.mainContainer, isDarkMode && styles.darkBackground]}>
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
                    { opacity: fadeAnim, transform: [{ translateX: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [-300, 0] }) }] },
                    isDarkMode && styles.darkBackground,
                  ]}
                >
                  <View style={[styles.header, isDarkMode && styles.darkCard]}>
                    <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>Food Delivery</Text>
                    <Text style={[styles.headerSubtitle, isDarkMode && styles.darkText]}>Delivering happiness to your door</Text>
                  </View>
                  <View style={[styles.searchBar, isDarkMode && styles.darkCard]}>
                    <TextInput
                      style={[styles.searchInput, isDarkMode && styles.darkInput]}
                      placeholder="Search for restaurants or dishes"
                      placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                    />
                  </View>
                  <View style={[styles.categories, isDarkMode && styles.darkCard]}>
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
                            isDarkMode && styles.darkCard,
                          ]}
                          onPress={() => setSelectedCategory(item.id)}
                        >
                          <Text style={[styles.categoryIcon, isDarkMode && styles.darkText]}>{item.icon}</Text>
                          <Text style={[styles.categoryName, isDarkMode && styles.darkText]}>{item.name}</Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                  <ScrollView style={styles.restaurantList}>
                    {restaurants.map((restaurant) => (
                      <TouchableOpacity
                        key={restaurant.id}
                        style={[styles.restaurantCard, isDarkMode && styles.darkCard]}
                        onPress={() => {
                          setSelectedRestaurant(restaurant);
                          setShowRestaurantDetails(true);
                        }}
                      >
                        <Image source={{ uri: restaurant.image }} style={styles.restaurantImage} />
                        <View style={styles.restaurantInfo}>
                          <Text style={[styles.restaurantName, isDarkMode && styles.darkText]}>{restaurant.name}</Text>
                          <View style={styles.restaurantDetails}>
                            <Text style={[styles.restaurantRating, isDarkMode && styles.darkText]}>⭐ {restaurant.rating.toFixed(1)}</Text>
                            <Text style={[styles.restaurantDelivery, isDarkMode && styles.darkText]}>🕒 {restaurant.deliveryTime} min</Text>
                            <Text style={[styles.restaurantPrice, isDarkMode && styles.darkText]}>{restaurant.priceRange}</Text>
                          </View>
                          <Text style={[styles.restaurantCuisine, isDarkMode && styles.darkText]}>{restaurant.cuisine}</Text>
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
          <View style={[styles.navBar, isDarkMode && styles.darkCard]}>
            <TouchableOpacity style={[styles.navItem, activeTab === 'home' && styles.activeNavItem]} onPress={() => setActiveTab('home')}>
              <Text style={[styles.navText, isDarkMode && styles.darkText]}>🏠 Home</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.navItem, activeTab === 'search' && styles.activeNavItem]} onPress={() => setActiveTab('search')}>
              <Text style={[styles.navText, isDarkMode && styles.darkText]}>🔍 Search</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.navItem, activeTab === 'cart' && styles.activeNavItem]} onPress={() => setActiveTab('cart')}>
              <Text style={[styles.navText, isDarkMode && styles.darkText]}>🛒 Cart {cart.length > 0 && `(${cart.length})`}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.navItem, activeTab === 'profile' && styles.activeNavItem]} onPress={() => setActiveTab('profile')}>
              <Text style={[styles.navText, isDarkMode && styles.darkText]}>👤 Profile</Text>
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
    fontSize: 36,
    color: '#fff',
    fontWeight: '300',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  welcomeBrand: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  welcomeSubtitle: {
    fontSize: 22,
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
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    fontSize: 20,
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
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 12,
    fontSize: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    color: '#000',
  },
  categories: {
    padding: 15,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
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
    borderWidth: 1,
    borderColor: '#ccc',
  },
  selectedCategory: {
    backgroundColor: '#ff4b3e',
    transform: [{ scale: 1.05 }],
    borderColor: '#ff4b3e',
  },
  categoryIcon: {
    fontSize: 28,
  },
  categoryName: {
    marginTop: 5,
    fontSize: 16,
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
    borderWidth: 1,
    borderColor: '#ddd',
  },
  restaurantImage: {
    width: '100%',
    height: 200,
  },
  restaurantInfo: {
    padding: 15,
  },
  restaurantName: {
    fontSize: 24,
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
    fontSize: 18,
  },
  restaurantDelivery: {
    marginRight: 15,
    color: '#666',
    fontWeight: '600',
    fontSize: 18,
  },
  restaurantPrice: {
    color: '#666',
    fontWeight: '600',
    fontSize: 18,
  },
  restaurantCuisine: {
    color: '#666',
    fontSize: 16,
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
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
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
    fontSize: 16,
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
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
  },
  backButtonText: {
    fontSize: 18,
    color: '#ff4b3e',
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#1a1a1a',
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
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
  },
  restaurantDetailName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1a1a1a',
  },
  restaurantDetailRating: {
    fontSize: 22,
    color: '#666',
    marginBottom: 5,
  },
  restaurantDetailCuisine: {
    fontSize: 20,
    color: '#666',
    marginBottom: 5,
  },
  restaurantDetailDelivery: {
    fontSize: 20,
    color: '#666',
  },
  menuTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    padding: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    color: '#1a1a1a',
  },
  menuItem: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
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
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 5,
    color: '#1a1a1a',
  },
  menuItemPrice: {
    fontSize: 18,
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
    borderWidth: 1,
    borderColor: '#ff4b3e',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
  },
  cartItemName: {
    fontSize: 20,
    flex: 1,
    color: '#1a1a1a',
  },
  cartItemPrice: {
    fontSize: 20,
    fontWeight: '600',
    marginRight: 15,
    color: '#666',
  },
  removeButton: {
    backgroundColor: '#ff4b3e',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff4b3e',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  cartTotal: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
  },
  cartTotalText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
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
    borderWidth: 1,
    borderColor: '#ff4b3e',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCartText: {
    fontSize: 22,
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
    borderWidth: 1,
    borderColor: '#ff4b3e',
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 18,
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
    borderWidth: 1,
    borderColor: '#ddd',
  },
  checkoutTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1a1a1a',
  },
  orderStatus: {
    fontSize: 22,
    color: '#666',
    marginBottom: 20,
    textTransform: 'capitalize',
  },
  closeButton: {
    backgroundColor: '#ff4b3e',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#ff4b3e',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
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
    borderWidth: 1,
    borderColor: '#ddd',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  profileName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1a1a1a',
  },
  profileEmail: {
    fontSize: 20,
    color: '#666',
    marginBottom: 10,
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
    borderWidth: 1,
    borderColor: '#ddd',
  },
  orderRestaurant: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1a1a1a',
  },
  orderItems: {
    fontSize: 18,
    color: '#666',
    marginBottom: 5,
  },
  orderTotal: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 5,
    color: '#1a1a1a',
  },
  orderStatus: {
    fontSize: 18,
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
    borderWidth: 1,
    borderColor: '#ff4b3e',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  editProfileButton: {
    backgroundColor: '#ff4b3e',
    padding: 10,
    borderRadius: 8,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#ff4b3e',
  },
  editProfileButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  editProfileModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  editProfileContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    width: '80%',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  editProfileTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1a1a1a',
  },
  editInput: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    color: '#000',
  },
  editProfileButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveButton: {
    backgroundColor: '#ff4b3e',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ff4b3e',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#666',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    borderWidth: 1,
    borderColor: '#666',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Dark Mode Styles
  darkBackground: {
    backgroundColor: '#1a1a1a',
  },
  darkCard: {
    backgroundColor: '#2a2a2a',
    borderColor: '#444',
  },
  darkText: {
    color: '#fff',
  },
  darkInput: {
    backgroundColor: '#333',
    borderColor: '#555',
    color: '#fff',
  },
  darkModal: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  // Theme Toggle Styles
  themeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  themeToggleText: {
    fontSize: 16,
    color: '#666',
    marginRight: 10,
  },
  themeToggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ff4b3e',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  themeToggleButtonText: {
    fontSize: 20,
  },
  shinyOverlay: {
    position: 'absolute',
    width: 20,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    transform: [{ skewX: '-20deg' }],
  },
});