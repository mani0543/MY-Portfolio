import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, StyleSheet } from 'react-native';
import { ShoppingCart, Search } from 'lucide-react-native';
import ProductCard from './components/ProductCard';
import Cart from './components/Cart';
import { products } from './data';

export default function App() { // Remove navigation prop
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (product) => {
    setCartItems(items => {
      const existingItem = items.find(item => item.product.id === product.id);
      if (existingItem) {
        return items.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...items, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, quantity) => {
    setCartItems(items =>
      items.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      ).filter(item => item.quantity > 0)
    );
  };

  const removeItem = (productId) => {
    setCartItems(items => items.filter(item => item.product.id !== productId));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>StyleStore</Text>
        <View style={styles.headerActions}>
          <View style={styles.searchContainer}>
            <Search size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity onPress={() => setIsCartOpen(true)} style={styles.cartButton}>
            <ShoppingCart size={24} color="#333" />
            {cartItems.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.productGrid}>
        {filteredProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={addToCart}
          />
        ))}
      </ScrollView>

      {/* Cart */}
      <Cart
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#FFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#333',
  },
  cartButton: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
  },
});