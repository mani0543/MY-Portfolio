import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  Animated as RNAnimated,
  StatusBar,
  Dimensions,
  SafeAreaView,
  Platform,
} from 'react-native';
import { ShoppingCart, Search, Star, X, Truck, ArrowLeft, CreditCard, Sun, Moon, User } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolate,
  interpolateColor,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');

const App = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [isPaymentDetailsOpen, setIsPaymentDetailsOpen] = useState(false);
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });
  const [showPopup, setShowPopup] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isWelcomeVisible, setIsWelcomeVisible] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profile, setProfile] = useState({ name: 'Abdul Rehman', email: 'itxmemani0543@gmail.com', phone: '+923 155296456' });
  const [selectedCategory, setSelectedCategory] = useState('All');

  const truckPosition = useSharedValue(-100);
  const truckMessageOpacity = useSharedValue(0);
  const popupOpacity = useSharedValue(0);
  const welcomeOpacity = useSharedValue(1);
  const welcomeRotateX = useSharedValue(0);
  const welcomeScale = useSharedValue(1);
  const themeAnimation = useRef(new RNAnimated.Value(1)).current;
  const screenOpacity = useSharedValue(0);
  const screenTranslateZ = useSharedValue(-100);
  const footerScale = useSharedValue(1);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('https://fakestoreapi.com/products');
      if (!response.ok) throw new Error('Network error occurred');
      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      setError('Failed to load products. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    welcomeRotateX.value = withSequence(
      withSpring(0, { damping: 10 }),
      withSpring(360, { damping: 15, stiffness: 100 })
    );
    welcomeScale.value = withSequence(
      withSpring(1.2, { damping: 10 }),
      withSpring(1, { damping: 10 })
    );
    welcomeOpacity.value = withTiming(0, { duration: 2500 }, () => {
      setIsWelcomeVisible(false);
      screenOpacity.value = withSpring(1, { damping: 15 });
      screenTranslateZ.value = withSpring(0, { damping: 15 });
    });
  }, [welcomeOpacity, welcomeRotateX, welcomeScale, screenOpacity, screenTranslateZ]);

  useEffect(() => {
    let filtered = products;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((product) => product.category === selectedCategory);
    }

    if (searchQuery.trim() !== '') {
      filtered = filtered.filter((product) =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, products]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
    RNAnimated.timing(themeAnimation, {
      toValue: isDarkMode ? 0 : 1,
      duration: 400,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  };

  const backgroundColor = themeAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['#F7F7F7', 'rgba(10, 10, 25, 0.95)'],
  });

  const cardBackgroundColor = themeAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['#FFFFFF', 'rgba(30, 30, 60, 0.9)'],
  });

  const textColor = themeAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['#1A2A44', '#00FFFF'],
  });

  const profileTextColor = isDarkMode ? '#FFFFFF' : '#1A2A44';

  const categories = ['All', ...new Set(products.map((product) => product.category))];

  const filterByCategory = (category) => {
    setSelectedCategory(category);
  };

  const addToCart = (product) => {
    setCartItems((items) => {
      const existingItem = items.find((item) => item.product.id === product.id);
      if (existingItem) {
        return items.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...items, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, quantity) => {
    setCartItems((items) =>
      items.map((item) =>
        item.product.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  const removeItem = (productId) => {
    setCartItems((items) => items.filter((item) => item.product.id !== productId));
  };

  const handleProductPress = (product) => {
    setSelectedProduct(product);
    screenOpacity.value = withTiming(0, { duration: 200 }, () => {
      screenOpacity.value = withSpring(1, { damping: 15 });
      screenTranslateZ.value = withSpring(0, { damping: 15 });
    });
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      setShowPopup(true);
      popupOpacity.value = withSpring(1, { damping: 10 }, () => {
        setTimeout(() => {
          popupOpacity.value = withSpring(0, { damping: 10 }, () => {
            setShowPopup(false);
            setIsCartOpen(false);
          });
        }, 2000);
      });
    } else {
      setIsPaymentOpen(true);
    }
  };

  const handlePayment = (method) => {
    setPaymentMethod(method);
    if (method === 'Online Payment') {
      setIsPaymentDetailsOpen(true);
    } else {
      setIsPaymentOpen(false);
      setIsCheckoutOpen(true);
      startTruckAnimation();
    }
  };

  const handlePaymentConfirmation = () => {
    if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv) {
      alert('Please fill in all card details.');
      return;
    }
    setIsPaymentDetailsOpen(false);
    setIsCheckoutOpen(true);
    startTruckAnimation();
  };

  const startTruckAnimation = () => {
    truckPosition.value = -100;
    truckPosition.value = withTiming(width, { duration: 5000, easing: Easing.linear }, () => {
      setTimeout(() => {
        truckPosition.value = -100;
        truckMessageOpacity.value = withTiming(0, { duration: 500 });
        setIsCheckoutOpen(false);
        setCartItems([]);
        setPaymentMethod(null);
      }, 1000);
    });
    truckMessageOpacity.value = withTiming(1, { duration: 1000 });
  };

  const truckAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: truckPosition.value },
      { scale: interpolate(truckPosition.value, [-100, width], [1, 1.2]) },
    ],
  }));

  const truckMessageStyle = useAnimatedStyle(() => ({
    opacity: truckMessageOpacity.value,
    transform: [{ translateY: interpolate(truckMessageOpacity.value, [0, 1], [20, 0]) }],
  }));

  const popupAnimatedStyle = useAnimatedStyle(() => ({
    opacity: popupOpacity.value,
    transform: [
      { scale: interpolate(popupOpacity.value, [0, 1], [0.5, 1]) },
      { translateZ: interpolate(popupOpacity.value, [0, 1], [-50, 0]) },
    ],
  }));

  const welcomeAnimatedStyle = useAnimatedStyle(() => ({
    opacity: welcomeOpacity.value,
    transform: [
      { rotateX: `${welcomeRotateX.value}deg` },
      { scale: welcomeScale.value },
      { perspective: 1000 },
    ],
  }));

  const screenAnimatedStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
    transform: [
      { translateZ: screenTranslateZ.value },
      { perspective: 1000 },
    ],
  }));

  const footerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: footerScale.value }],
    shadowOpacity: interpolate(footerScale.value, [0.9, 1.1], [0.3, 0.5]),
  }));

  const handleFooterPress = (action) => {
    footerScale.value = withSequence(
      withSpring(0.9, { damping: 10, stiffness: 300 }),
      withSpring(1.2, { damping: 10, stiffness: 300 }),
      withSpring(1, { damping: 10, stiffness: 300 })
    );
    action();
  };

  const ProductCard = ({ product, onPress }) => {
    const translateY = useSharedValue(0);
    const scale = useSharedValue(1);
    const glowOpacity = useSharedValue(0.3);
    const particleOpacity = useSharedValue(0);

    const cardStyle = useAnimatedStyle(() => ({
      transform: [
        { translateY: translateY.value },
        { scale: scale.value },
        { perspective: 1000 },
      ],
      shadowOpacity: interpolate(scale.value, [0.95, 1], [0.4, 0.2]),
    }));

    const glowStyle = useAnimatedStyle(() => ({
      opacity: glowOpacity.value,
    }));

    const particleStyle = useAnimatedStyle(() => ({
      opacity: particleOpacity.value,
      transform: [{ scale: interpolate(particleOpacity.value, [0, 1], [0.5, 1.5]) }],
    }));

    useEffect(() => {
      translateY.value = withSequence(
        withTiming(-10, { duration: 1000 }),
        withTiming(0, { duration: 1000 })
      );
      glowOpacity.value = withSequence(
        withTiming(0.5, { duration: 1000 }),
        withTiming(0.3, { duration: 1000 })
      );
    }, [translateY, glowOpacity]);

    const handleAddToCart = () => {
      particleOpacity.value = withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0, { duration: 500 })
      );
      onPress();
    };

    return (
      <Animated.View style={[styles.card, { backgroundColor: cardBackgroundColor }, cardStyle]}>
        <TouchableOpacity
          onPress={handleAddToCart}
          onPressIn={() => {
            scale.value = withSpring(0.95, { damping: 15 });
            glowOpacity.value = withSpring(0.8, { damping: 10 });
          }}
          onPressOut={() => {
            scale.value = withSpring(1, { damping: 15 });
            glowOpacity.value = withSpring(0.3, { damping: 10 });
          }}
        >
          <Animated.View style={[styles.glowEffect, glowStyle]} />
          <Animated.View style={[styles.particleEffect, particleStyle]} />
          <Image source={{ uri: product.image }} style={styles.cardImage} />
          <View style={styles.cardContent}>
            <RNAnimated.Text style={[styles.cardTitle, { color: textColor }]} numberOfLines={2}>
              {product.title}
            </RNAnimated.Text>
            <RNAnimated.Text style={[styles.cardPrice, { color: textColor }]}>
              ${product.price}
            </RNAnimated.Text>
            <View style={styles.ratingContainer}>
              <Star size={16} color="#FFD700" fill="#FFD700" />
              <RNAnimated.Text style={[styles.ratingText, { color: textColor }]}>
                {product.rating.rate} ({product.rating.count})
              </RNAnimated.Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const ProductDetailScreen = ({ product, onAddToCart, onBack, cartItems, setIsCartOpen }) => {
    const isProductInCart = cartItems.some((item) => item.product.id === product.id);
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);

    return (
      <RNAnimated.View style={[styles.productDetailContainer, { backgroundColor }]}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={20} color={isDarkMode ? '#00FFFF' : '#1A2A44'} />
        </TouchableOpacity>
        <Image source={{ uri: product.image }} style={styles.productDetailImage} />
        <ScrollView contentContainerStyle={styles.productDetailContent}>
          <RNAnimated.Text style={[styles.productDetailTitle, { color: textColor }]}>
            {product.title}
          </RNAnimated.Text>
          <RNAnimated.Text style={[styles.productDetailPrice, { color: textColor }]}>
            ${product.price}
          </RNAnimated.Text>
          <View style={styles.sizeContainer}>
            <Text style={[styles.sizeLabel, { color: textColor }]}>Select Size:</Text>
            <View style={styles.sizeOptions}>
              {['S', 'M', 'L', 'XL'].map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[styles.sizeButton, selectedSize === size && styles.selectedSizeButton]}
                  onPress={() => setSelectedSize(size)}
                >
                  <Text style={[styles.sizeButtonText, selectedSize === size && styles.selectedSizeText]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.colorContainer}>
            <Text style={[styles.colorLabel, { color: textColor }]}>Select Color:</Text>
            <View style={styles.colorOptions}>
              {['Red', 'Blue', 'Green', 'Black'].map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorButton,
                    { backgroundColor: color.toLowerCase() },
                    selectedColor === color && styles.selectedColorButton,
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>
          </View>
          <RNAnimated.Text style={[styles.productDetailDescription, { color: textColor }]}>
            {product.description}
          </RNAnimated.Text>
          <TouchableOpacity style={styles.addToCartButton} onPress={() => onAddToCart(product)}>
            <Text style={styles.addToCartButtonText}>Add to Cart</Text>
          </TouchableOpacity>
          {isProductInCart && (
            <TouchableOpacity style={styles.goToCartButton} onPress={() => setIsCartOpen(true)}>
              <Text style={styles.goToCartButtonText}>View Cart</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </RNAnimated.View>
    );
  };

  const Cart = ({ items, onUpdateQuantity, onRemoveItem, onClose, onCheckout }) => {
    const totalPrice = items.reduce((total, item) => total + item.product.price * item.quantity, 0);
    const cartGlow = useSharedValue(0);

    const cartStyle = useAnimatedStyle(() => ({
      shadowOpacity: interpolate(cartGlow.value, [0, 1], [0.3, 0.8]),
    }));

    useEffect(() => {
      cartGlow.value = withSequence(
        withSpring(1, { damping: 10 }),
        withSpring(0, { damping: 10 })
      );
    }, [items, cartGlow]); // Added cartGlow to dependency array

    return (
      <View style={styles.cartOverlay}>
        <Animated.View style={[styles.cartContainer, screenAnimatedStyle, cartStyle]}>
          <View style={styles.cartHeader}>
            <RNAnimated.Text style={[styles.cartTitle, { color: textColor }]}>
              Holographic Cart
            </RNAnimated.Text>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color={isDarkMode ? '#00FFFF' : '#1A2A44'} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.cartItems}>
            {items.map((item) => (
              <View key={item.product.id} style={styles.cartItem}>
                <Image source={{ uri: item.product.image }} style={styles.cartItemImage} />
                <View style={styles.cartItemDetails}>
                  <RNAnimated.Text style={[styles.cartItemTitle, { color: textColor }]}>
                    {item.product.title}
                  </RNAnimated.Text>
                  <RNAnimated.Text style={[styles.cartItemPrice, { color: textColor }]}>
                    ${item.product.price}
                  </RNAnimated.Text>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                    >
                      <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    <RNAnimated.Text style={[styles.quantityText, { color: textColor }]}>
                      {item.quantity}
                    </RNAnimated.Text>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                    >
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity style={styles.removeButton} onPress={() => onRemoveItem(item.product.id)}>
                  <X size={16} color="#FF4500" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          <View style={styles.cartFooter}>
            <RNAnimated.Text style={[styles.totalPrice, { color: textColor }]}>
              Total: ${totalPrice.toFixed(2)}
            </RNAnimated.Text>
            <TouchableOpacity style={styles.checkoutButton} onPress={onCheckout}>
              <Text style={styles.checkoutButtonText}>Launch Checkout</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    );
  };

  const ProfileScreen = ({ onClose }) => {
    const [editProfile, setEditProfile] = useState({ ...profile });
    const saveOpacity = useSharedValue(1);

    const handleSave = () => {
      setProfile(editProfile);
      saveOpacity.value = withSequence(
        withSpring(0.5, { damping: 10 }),
        withSpring(1, { damping: 10 })
      );
      onClose();
    };

    const saveButtonStyle = useAnimatedStyle(() => ({
      opacity: saveOpacity.value,
      transform: [{ scale: interpolate(saveOpacity.value, [0.5, 1], [0.95, 1]) }],
    }));

    return (
      <RNAnimated.View style={[styles.profileContainer, { backgroundColor }]}>
        <View style={styles.profileHeader}>
          <RNAnimated.Text style={[styles.profileTitle, { color: profileTextColor }]}>
            Cosmic Profile
          </RNAnimated.Text>
          <TouchableOpacity onPress={onClose}>
            <X size={20} color={isDarkMode ? '#00FFFF' : '#1A2A44'} />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.profileContent}>
          <Text style={[styles.profileLabel, { color: profileTextColor }]}>Name</Text>
          <TextInput
            style={[styles.input, { color: profileTextColor }]}
            value={editProfile.name}
            onChangeText={(text) => setEditProfile({ ...editProfile, name: text })}
          />
          <Text style={[styles.profileLabel, { color: profileTextColor }]}>Email</Text>
          <TextInput
            style={[styles.input, { color: profileTextColor }]}
            value={editProfile.email}
            onChangeText={(text) => setEditProfile({ ...editProfile, email: text })}
            keyboardType="email-address"
          />
          <Text style={[styles.profileLabel, { color: profileTextColor }]}>Phone</Text>
          <TextInput
            style={[styles.input, { color: profileTextColor }]}
            value={editProfile.phone}
            onChangeText={(text) => setEditProfile({ ...editProfile, phone: text })}
            keyboardType="phone-pad"
          />
          <Animated.View style={[styles.saveButton, saveButtonStyle]}>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Profile</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </RNAnimated.View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDarkMode ? 'rgba(10, 10, 25, 0.95)' : '#F7F7F7' }]}>
        <ActivityIndicator size="large" color={isDarkMode ? '#00FFFF' : '#6200EE'} />
        <Text style={styles.loadingText}>Loading Cosmic Products...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: isDarkMode ? 'rgba(10, 10, 25, 0.95)' : '#F7F7F7' }]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProducts}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        {isWelcomeVisible && (
          <Animated.View style={[styles.welcomeContainer, welcomeAnimatedStyle, { backgroundColor: 'rgba(10, 10, 25, 0.95)' }]}>
            <Text style={styles.welcomeText}>Welcome to Mani's Cosmic Store</Text>
          </Animated.View>
        )}
        <Animated.View style={[styles.container, { backgroundColor }, screenAnimatedStyle]}>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          {selectedProduct ? (
            <ProductDetailScreen
              product={selectedProduct}
              onAddToCart={addToCart}
              onBack={() => setSelectedProduct(null)}
              cartItems={cartItems}
              setIsCartOpen={setIsCartOpen}
            />
          ) : isProfileOpen ? (
            <ProfileScreen onClose={() => setIsProfileOpen(false)} />
          ) : (
            <>
              <View style={styles.header}>
                <RNAnimated.Text style={[styles.headerTitle, { color: textColor }]}>
                  Mani's Cosmic Store
                </RNAnimated.Text>
                <TouchableOpacity onPress={() => setIsCartOpen(true)} style={styles.cartButton}>
                  <ShoppingCart size={20} color={isDarkMode ? '#00FFFF' : '#1A2A44'} />
                  {cartItems.length > 0 && (
                    <View style={styles.cartBadge}>
                      <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
              <View style={styles.headerBorder} />
              <ScrollView contentContainerStyle={styles.productGrid}>
                <View style={[styles.adBanner, { backgroundColor: isDarkMode ? 'rgba(255, 215, 0, 0.2)' : 'rgba(98, 0, 238, 0.1)' }]}>
                  <RNAnimated.Text style={[styles.adText, { color: textColor }]}>
                    Interstellar Shipping on Orders Over $100
                  </RNAnimated.Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[styles.category, selectedCategory === category && styles.selectedCategory]}
                      onPress={() => filterByCategory(category)}
                    >
                      <RNAnimated.Text style={[styles.categoryText, { color: textColor }]}>
                        {category}
                      </RNAnimated.Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
 lançou               <View style={styles.productRow}>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onPress={() => handleProductPress(product)}
                      />
                    ))
                  ) : (
                    <Text style={[styles.noResultsText, { color: textColor }]}>
                      No cosmic items found.
                    </Text>
                  )}
                </View>
              </ScrollView>
            </>
          )}

          {!selectedProduct && !isProfileOpen && (
            <Animated.View style={[styles.footer, footerAnimatedStyle, { backgroundColor: 'rgba(10, 10, 25, 0.95)' }]}>
              <View style={styles.footerGradient}>
                <TouchableOpacity
                  style={styles.footerItem}
                  onPress={() => handleFooterPress(() => setIsProfileOpen(true))}
                >
                  <User size={20} color={isDarkMode ? '#00FFFF' : '#1A2A44'} />
                  <RNAnimated.Text style={[styles.footerText, { color: textColor }]}>
                    Profile
                  </RNAnimated.Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.footerItem}>
                  <View style={styles.searchContainer}>
                    <Search size={18} color={isDarkMode ? '#00FFFF' : '#1A2A44'} style={styles.searchIcon} />
                    <TextInput
                      style={[styles.searchInput, { color: textColor }]}
                      placeholder="Search Cosmos..."
                      placeholderTextColor={isDarkMode ? '#A9A9A9' : '#666666'}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                    />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.footerItem}
                  onPress={() => handleFooterPress(toggleTheme)}
                >
                  {isDarkMode ? <Moon size={20} color="#FFD700" /> : <Sun size={20} color="#FFD700" />}
                  <RNAnimated.Text style={[styles.footerText, { color: textColor }]}>
                    {isDarkMode ? 'Cosmic' : 'Light'}
                  </RNAnimated.Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          {isCartOpen && (
            <Cart
              items={cartItems}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeItem}
              onClose={() => setIsCartOpen(false)}
              onCheckout={handleCheckout}
            />
          )}

          {isPaymentOpen && (
            <View style={styles.paymentOverlay}>
              <Animated.View style={[styles.paymentCard, screenAnimatedStyle]}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setIsPaymentOpen(false)}
                >
                  <X size={20} color={isDarkMode ? '#00FFFF' : '#1A2A44'} />
                </TouchableOpacity>
                <RNAnimated.Text style={[styles.paymentTitle, { color: textColor }]}>
                  Select Payment Portal
                </RNAnimated.Text>
                <TouchableOpacity
                  style={styles.paymentOption}
                  onPress={() => handlePayment('Cash on Delivery')}
                >
                  <RNAnimated.Text style={[styles.paymentOptionText, { color: textColor }]}>
                    Cash on Delivery
                  </RNAnimated.Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.paymentOption}
                  onPress={() => handlePayment('Online Payment')}
                >
                  <RNAnimated.Text style={[styles.paymentOptionText, { color: textColor }]}>
                    Online Payment
                  </RNAnimated.Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          )}

          {isPaymentDetailsOpen && (
            <View style={styles.paymentOverlay}>
              <Animated.View style={[styles.paymentCard, screenAnimatedStyle]}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setIsPaymentDetailsOpen(false)}
                >
                  <X size={20} color={isDarkMode ? '#00FFFF' : '#1A2A44'} />
                </TouchableOpacity>
                <RNAnimated.Text style={[styles.paymentTitle, { color: textColor }]}>
                  Enter Card Details
                </RNAnimated.Text>
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  placeholder="Card Number"
                  placeholderTextColor={isDarkMode ? '#A9A9A9' : '#666666'}
                  value={cardDetails.number}
                  onChangeText={(text) => setCardDetails({ ...cardDetails, number: text })}
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  placeholder="Expiry Date (MM/YY)"
                  placeholderTextColor={isDarkMode ? '#A9A9A9' : '#666666'}
                  value={cardDetails.expiry}
                  onChangeText={(text) => setCardDetails({ ...cardDetails, expiry: text })}
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  placeholder="CVV"
                  placeholderTextColor={isDarkMode ? '#A9A9A9' : '#666666'}
                  value={cardDetails.cvv}
                  onChangeText={(text) => setCardDetails({ ...cardDetails, cvv: text })}
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={styles.paymentOption}
                  onPress={handlePaymentConfirmation}
                >
                  <RNAnimated.Text style={[styles.paymentOptionText, { color: textColor }]}>
                    Confirm Payment
                  </RNAnimated.Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          )}

          {isCheckoutOpen && (
            <View style={styles.checkoutOverlay}>
              <Animated.View style={[styles.checkoutCard, screenAnimatedStyle]}>
                <Animated.View style={[styles.truckAnimation, truckAnimatedStyle]}>
                  <Truck size={30} color="#FFD700" />
                </Animated.View>
                <RNAnimated.Text style={[styles.checkoutText, { color: textColor }]}>
                  Order Launched
                </RNAnimated.Text>
                <Animated.Text style={[styles.truckMessage, truckMessageStyle, { color: textColor }]}>
                  Your order is on the way
                </Animated.Text>
                <RNAnimated.Text style={[styles.paymentMethodText, { color: textColor }]}>
                  Payment Method: {paymentMethod}
                </RNAnimated.Text>
              </Animated.View>
            </View>
          )}

          {showPopup && (
            <Animated.View style={[styles.popupContainer, popupAnimatedStyle]}>
              <Text style={styles.popupText}>Add items to your cosmic cart first!</Text>
            </Animated.View>
          )}
        </Animated.View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 25, 0.95)',
  },
  welcomeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: width * 0.1,
    fontWeight: '900',
    color: '#00FFFF',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
    textShadowColor: '#FFD700',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.02,
  },
  headerTitle: {
    fontSize: width * 0.07,
    fontWeight: '700',
    fontFamily: 'Courier New',
  },
  headerBorder: {
    height: 1,
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    marginHorizontal: width * 0.04,
  },
  cartButton: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -height * 0.015,
    right: -width * 0.03,
    backgroundColor: '#FFD700',
    borderRadius: 12,
    width: width * 0.06,
    height: width * 0.06,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  cartBadgeText: {
    color: '#1A2A44',
    fontSize: width * 0.035,
    fontWeight: 'bold',
  },
  productGrid: {
    paddingHorizontal: width * 0.04,
    paddingBottom: height * 0.15,
  },
  adBanner: {
    borderRadius: 12,
    marginBottom: height * 0.02,
    padding: height * 0.015,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.3)',
  },
  adText: {
    fontSize: width * 0.045,
    fontWeight: '600',
  },
  categories: {
    marginBottom: height * 0.02,
  },
  category: {
    backgroundColor: 'rgba(30, 30, 60, 0.9)',
    borderRadius: 10,
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.05,
    marginRight: width * 0.03,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.5)',
  },
  selectedCategory: {
    backgroundColor: 'rgba(0, 255, 255, 0.3)',
    borderColor: '#00FFFF',
  },
  categoryText: {
    fontSize: width * 0.04,
    fontWeight: '600',
  },
  productRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: width * 0.45,
    borderRadius: 16,
    marginBottom: height * 0.03,
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
    overflow: 'hidden',
  },
  glowEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    borderRadius: 16,
  },
  particleEffect: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255, 215, 0, 0.5)',
    borderRadius: 25,
    transform: [{ translateX: -25 }, { translateY: -25 }],
  },
  cardImage: {
    width: '100%',
    height: height * 0.2,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    resizeMode: 'contain',
  },
  cardContent: {
    padding: width * 0.03,
  },
  cardTitle: {
    fontSize: width * 0.04,
    fontWeight: '600',
    marginBottom: height * 0.005,
  },
  cardPrice: {
    fontSize: width * 0.045,
    fontWeight: '700',
    marginBottom: height * 0.005,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: width * 0.035,
    marginLeft: width * 0.015,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: height * 0.02,
    fontSize: width * 0.045,
    color: '#00FFFF',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: width * 0.045,
    color: '#FF4500',
    fontWeight: '600',
    marginBottom: height * 0.02,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#00FFFF',
    borderRadius: 10,
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.05,
  },
  retryButtonText: {
    color: '#1A2A44',
    fontSize: width * 0.045,
    fontWeight: '700',
  },
  productDetailContainer: {
    flex: 1,
    paddingHorizontal: width * 0.04,
    paddingTop: height * 0.02,
  },
  backButton: {
    padding: width * 0.025,
  },
  productDetailImage: {
    width: '100%',
    height: height * 0.4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.3)',
  },
  productDetailContent: {
    paddingVertical: height * 0.02,
  },
  productDetailTitle: {
    fontSize: width * 0.07,
    fontWeight: '700',
    marginBottom: height * 0.01,
  },
  productDetailPrice: {
    fontSize: width * 0.06,
    fontWeight: '700',
    marginBottom: height * 0.02,
  },
  sizeContainer: {
    marginBottom: height * 0.02,
  },
  sizeLabel: {
    fontSize: width * 0.045,
    fontWeight: '600',
    marginBottom: height * 0.01,
  },
  sizeOptions: {
    flexDirection: 'row',
    gap: width * 0.03,
  },
  sizeButton: {
    padding: width * 0.03,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.5)',
    borderRadius: 10,
  },
  selectedSizeButton: {
    backgroundColor: 'rgba(0, 255, 255, 0.3)',
    borderColor: '#00FFFF',
  },
  sizeButtonText: {
    fontSize: width * 0.04,
    color: '#00FFFF',
  },
  selectedSizeText: {
    color: '#FFFFFF',
  },
  colorContainer: {
    marginBottom: height * 0.02,
  },
  colorLabel: {
    fontSize: width * 0.045,
    fontWeight: '600',
    marginBottom: height * 0.01,
  },
  colorOptions: {
    flexDirection: 'row',
    gap: width * 0.03,
  },
  colorButton: {
    width: width * 0.12,
    height: width * 0.12,
    borderRadius: width * 0.06,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.5)',
  },
  selectedColorButton: {
    borderColor: '#FFD700',
    borderWidth: 2,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  productDetailDescription: {
    fontSize: width * 0.04,
    marginBottom: height * 0.02,
    lineHeight: width * 0.06,
  },
  addToCartButton: {
    backgroundColor: 'rgba(0, 255, 255, 0.3)',
    borderRadius: 10,
    padding: height * 0.02,
    alignItems: 'center',
    marginBottom: height * 0.01,
    borderWidth: 1,
    borderColor: '#00FFFF',
  },
  addToCartButtonText: {
    color: '#FFFFFF',
    fontSize: width * 0.045,
    fontWeight: '700',
  },
  goToCartButton: {
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    borderRadius: 10,
    padding: height * 0.02,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  goToCartButtonText: {
    color: '#FFFFFF',
    fontSize: width * 0.045,
    fontWeight: '700',
  },
  cartOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartContainer: {
    borderRadius: 16,
    width: width * 0.9,
    maxHeight: height * 0.8,
    backgroundColor: 'rgba(30, 30, 60, 0.9)',
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    elevation: 15,
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: width * 0.04,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 255, 255, 0.3)',
  },
  cartTitle: {
    fontSize: width * 0.06,
    fontWeight: '700',
  },
  cartItems: {
    padding: width * 0.04,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.02,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 255, 255, 0.2)',
    paddingBottom: height * 0.015,
  },
  cartItemImage: {
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: 8,
    marginRight: width * 0.03,
  },
  cartItemDetails: {
    flex: 1,
  },
  cartItemTitle: {
    fontSize: width * 0.04,
    fontWeight: '600',
    marginBottom: height * 0.005,
  },
  cartItemPrice: {
    fontSize: width * 0.035,
    fontWeight: '700',
    marginBottom: height * 0.005,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    borderRadius: 6,
    padding: width * 0.015,
    width: width * 0.08,
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: width * 0.04,
    color: '#00FFFF',
  },
  quantityText: {
    fontSize: width * 0.04,
    marginHorizontal: width * 0.025,
  },
  removeButton: {
    padding: width * 0.025,
  },
  cartFooter: {
    padding: width * 0.04,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 255, 255, 0.3)',
  },
  totalPrice: {
    fontSize: width * 0.05,
    fontWeight: '700',
    marginBottom: height * 0.02,
  },
  checkoutButton: {
    backgroundColor: 'rgba(0, 255, 255, 0.3)',
    borderRadius: 10,
    padding: height * 0.02,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00FFFF',
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: width * 0.045,
    fontWeight: '700',
  },
  paymentOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentCard: {
    borderRadius: 16,
    padding: width * 0.06,
    width: width * 0.9,
    backgroundColor: 'rgba(30, 30, 60, 0.9)',
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  closeButton: {
    position: 'absolute',
    top: height * 0.015,
    right: width * 0.03,
  },
  paymentTitle: {
    fontSize: width * 0.06,
    fontWeight: '700',
    marginBottom: height * 0.02,
  },
  paymentOption: {
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    borderRadius: 10,
    padding: height * 0.02,
    marginBottom: height * 0.015,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.5)',
  },
  paymentOptionText: {
    fontSize: width * 0.045,
    fontWeight: '600',
  },
  input: {
    height: height * 0.06,
    borderColor: 'rgba(0, 255, 255, 0.5)',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: width * 0.03,
    marginBottom: height * 0.015,
    fontSize: width * 0.04,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  checkoutOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutCard: {
    borderRadius: 16,
    padding: width * 0.06,
    backgroundColor: 'rgba(30, 30, 60, 0.9)',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  truckAnimation: {
    marginBottom: height * 0.02,
  },
  checkoutText: {
    fontSize: width * 0.05,
    fontWeight: '700',
    marginBottom: height * 0.01,
  },
  truckMessage: {
    fontSize: width * 0.045,
    fontWeight: '600',
    marginBottom: height * 0.01,
  },
  paymentMethodText: {
    fontSize: width * 0.045,
    fontWeight: '600',
  },
  popupContainer: {
    position: 'absolute',
    top: height * 0.05,
    left: width * 0.05,
    right: width * 0.05,
    backgroundColor: 'rgba(255, 69, 0, 0.9)',
    borderRadius: 12,
    padding: height * 0.02,
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: '#FF4500',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  popupText: {
    color: '#FFFFFF',
    fontSize: width * 0.045,
    fontWeight: '600',
  },
  profileContainer: {
    flex: 1,
    paddingHorizontal: width * 0.04,
    paddingTop: height * 0.02,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: height * 0.02,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 255, 255, 0.3)',
  },
  profileTitle: {
    fontSize: width * 0.07,
    fontWeight: '700',
  },
  profileContent: {
    paddingVertical: height * 0.02,
  },
  profileLabel: {
    fontSize: width * 0.045,
    fontWeight: '600',
    marginBottom: height * 0.01,
  },
  saveButton: {
    backgroundColor: 'rgba(0, 255, 255, 0.3)',
    borderRadius: 10,
    padding: height * 0.02,
    alignItems: 'center',
    marginTop: height * 0.02,
    borderWidth: 1,
    borderColor: '#00FFFF',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: width * 0.045,
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.12,
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  footerGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: height * 0.01,
    backgroundColor: 'rgba(10, 10, 25, 0.95)',
  },
  footerItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.3,
  },
  footerText: {
    fontSize: width * 0.035,
    fontWeight: '600',
    marginTop: height * 0.005,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingHorizontal: width * 0.03,
    width: width * 0.25,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.5)',
  },
  searchIcon: {
    marginRight: width * 0.015,
  },
  searchInput: {
    flex: 1,
    height: height * 0.045,
    fontSize: width * 0.04,
  },
  noResultsText: {
    fontSize: width * 0.045,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: height * 0.02,
    width: '100%',
  },
});

export default App;