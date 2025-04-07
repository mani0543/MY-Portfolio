import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Image,
  Switch,
} from 'react-native';
import { LineChart, PieChart, BarChart } from 'react-native-chart-kit';
import Svg, { LinearGradient, Stop, Defs, Rect } from 'react-native-svg';
import { launchImageLibrary } from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SwipeListView } from 'react-native-swipe-list-view';
import Modal from 'react-native-modal';
import { Searchbar, Button as PaperButton } from 'react-native-paper';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const App = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [screen, setScreen] = useState('dashboard'); // 'dashboard', 'addExpense', 'transactions', 'reports', 'budget', or 'profile'
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStartDate, setFilterStartDate] = useState(null);
  const [filterEndDate, setFilterEndDate] = useState(null);
  const [activeTab, setActiveTab] = useState('spending'); // 'spending', 'savings', 'comparison'
  const [budgets, setBudgets] = useState([
    { category: 'Food', limit: 800, notifications: true },
    { category: 'Transport', limit: 500, notifications: true },
    { category: 'Entertainment', limit: 300, notifications: true },
    { category: 'Utilities', limit: 600, notifications: true },
    { category: 'Others', limit: 1000, notifications: true },
  ]);
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    currency: 'USD',
    language: 'English',
    theme: 'light', // 'light', 'dark', or 'custom'
    biometricAuth: false,
  });
  const [isCategoryFilterModalVisible, setCategoryFilterModalVisible] = useState(false);

  // New state for welcome screen animation
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);
  const fadeAnim = useSharedValue(1); // Initial opacity for the welcome screen

  // Theme state
  const [theme, setTheme] = useState(profile.theme);

  // Update theme when profile.theme changes
  useEffect(() => {
    setTheme(profile.theme);
  }, [profile.theme]);

  // Welcome screen animation
  useEffect(() => {
    if (showWelcomeScreen) {
      const timer = setTimeout(() => {
        fadeAnim.value = withTiming(0, { duration: 1000 }, () => {
          setShowWelcomeScreen(false);
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showWelcomeScreen]);

  // Dynamic styles based on theme
  const styles = getStyles(theme);

  // Handle Theme Change
  const handleThemeChange = (selectedTheme) => {
    setProfile((prevProfile) => ({
      ...prevProfile,
      theme: selectedTheme,
    }));
  };

  // Animation for selected category
  const opacity = useSharedValue(0); // Initialize shared value
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(opacity.value, {
        duration: 500,
        easing: Easing.inOut(Easing.ease),
      }),
    };
  });

  // Data for charts
  const data = {
    income: 5000,
    expenses: 3200,
    savings: 1800,
    categories: [
      { name: 'Food', amount: 800, color: '#FF6384' },
      { name: 'Transport', amount: 500, color: '#36A2EB' },
      { name: 'Entertainment', amount: 300, color: '#FFCE56' },
      { name: 'Utilities', amount: 600, color: '#4BC0C0' },
      { name: 'Others', amount: 1000, color: '#9966FF' },
    ],
  };

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [3000, 4500, 2800, 5000, 4000, 6000],
        color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`, // Income line
        strokeWidth: 2,
      },
      {
        data: [2000, 3000, 2500, 4000, 3500, 5000],
        color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`, // Expenses line
        strokeWidth: 2,
      },
    ],
  };

  const pieData = data.categories.map((category) => ({
    name: category.name,
    amount: category.amount,
    color: category.color,
    legendFontColor: '#7F7F7F',
    legendFontSize: 15,
  }));

  const barData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [800, 500, 300, 600, 1000, 400],
      },
    ],
  };

  // Handle Add Expense
  const handleAddExpense = () => {
    const newTransaction = {
      id: Math.random().toString(),
      amount: parseFloat(amount),
      category,
      date: date.toISOString(),
      notes,
      receipt,
      type: amount > 0 ? 'income' : 'expense',
    };
    setTransactions([...transactions, newTransaction]);
    setScreen('dashboard');
    setAmount('');
    setCategory('');
    setDate(new Date());
    setNotes('');
    setReceipt(null);
  };

  // Handle Edit Transaction
  const handleEditTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setModalVisible(true);
  };

  // Handle Delete Transaction
  const handleDeleteTransaction = (id) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  // Handle Update Transaction
  const handleUpdateTransaction = (updatedTransaction) => {
    setTransactions(
      transactions.map((t) =>
        t.id === updatedTransaction.id ? updatedTransaction : t
      )
    );
    setModalVisible(false);
  };

  // Handle Image Upload
  const handleImageUpload = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (!response.didCancel && !response.error) {
        setReceipt(response.assets[0].uri);
      }
    });
  };

  // Handle Date Change
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  // Handle Budget Change
  const handleBudgetChange = (category, value) => {
    setBudgets(
      budgets.map((budget) =>
        budget.category === category ? { ...budget, limit: parseFloat(value) } : budget
      )
    );
  };

  // Handle Notification Toggle
  const handleNotificationToggle = (category) => {
    setBudgets(
      budgets.map((budget) =>
        budget.category === category
          ? { ...budget, notifications: !budget.notifications }
          : budget
      )
    );
  };

  // Handle Profile Change
  const handleProfileChange = (field, value) => {
    setProfile({ ...profile, [field]: value });
  };

  // Filter Transactions
  const filteredTransactions = transactions
    .filter((t) =>
      t.category.toLowerCase().includes(filterCategory.toLowerCase())
    )
    .filter((t) => {
      if (!filterStartDate || !filterEndDate) return true;
      const transactionDate = new Date(t.date);
      return transactionDate >= filterStartDate && transactionDate <= filterEndDate;
    })
    .filter((t) =>
      t.notes.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Render Transaction Item
  const renderTransactionItem = ({ item }) => (
    <View style={styles.transactionItem}>
      <Text style={styles.transactionCategory}>{item.category}</Text>
      <Text style={styles.transactionAmount}>${item.amount}</Text>
      <Text style={styles.transactionDate}>
        {new Date(item.date).toLocaleDateString()}
      </Text>
      <Text style={styles.transactionNotes}>{item.notes}</Text>
    </View>
  );

  // Render Hidden Item (Edit/Delete)
  const renderHiddenItem = ({ item }) => (
    <View style={styles.hiddenItem}>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => handleEditTransaction(item)}
      >
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteTransaction(item.id)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  // Render Category Filter Modal
  const renderCategoryFilterModal = () => (
    <Modal isVisible={isCategoryFilterModalVisible}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Filter by Category</Text>
        {data.categories.map((category, index) => (
          <TouchableOpacity
            key={index}
            style={styles.categoryFilterItem}
            onPress={() => {
              setFilterCategory(category.name);
              setCategoryFilterModalVisible(false);
            }}
          >
            <Text style={styles.categoryFilterText}>{category.name}</Text>
          </TouchableOpacity>
        ))}
        <PaperButton
          mode="outlined"
          onPress={() => {
            setFilterCategory('');
            setCategoryFilterModalVisible(false);
          }}
        >
          Clear Filter
        </PaperButton>
      </View>
    </Modal>
  );

  // Render Reports Screen
  const renderReportsScreen = () => {
    return (
      <View style={styles.reportsContainer}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'spending' && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab('spending')}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'spending' && styles.activeTabButtonText,
              ]}
            >
              Spending
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'savings' && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab('savings')}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'savings' && styles.activeTabButtonText,
              ]}
            >
              Savings
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'comparison' && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab('comparison')}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'comparison' && styles.activeTabButtonText,
              ]}
            >
              Comparison
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'spending' && (
          <>
            <Text style={styles.reportsTitle}>Spending Trends</Text>
            <LineChart
              data={chartData}
              width={width - 40}
              height={220}
              yAxisLabel="$"
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#ffa726',
                },
              }}
              bezier
              style={styles.chart}
            />

            <Text style={styles.reportsTitle}>Category-wise Breakdown</Text>
            <PieChart
              data={pieData}
              width={width - 40}
              height={200}
              chartConfig={{
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              }}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </>
        )}

        {activeTab === 'savings' && (
          <>
            <Text style={styles.reportsTitle}>Savings Patterns</Text>
            <BarChart
              data={barData}
              width={width - 40}
              height={220}
              yAxisLabel="$"
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
              style={styles.chart}
            />
          </>
        )}

        {activeTab === 'comparison' && (
          <>
            <Text style={styles.reportsTitle}>Monthly Comparison</Text>
            <LineChart
              data={chartData}
              width={width - 40}
              height={220}
              yAxisLabel="$"
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#ffa726',
                },
              }}
              bezier
              style={styles.chart}
            />
          </>
        )}
      </View>
    );
  };

  // Render Budget Settings Screen
  const renderBudgetSettingsScreen = () => {
    return (
      <View style={styles.budgetContainer}>
        <Text style={styles.budgetTitle}>Budget Settings</Text>
        {budgets.map((budget, index) => (
          <View key={index} style={styles.budgetItem}>
            <Text style={styles.budgetCategory}>{budget.category}</Text>
            <TextInput
              style={styles.budgetInput}
              placeholder="Budget Limit"
              keyboardType="numeric"
              value={budget.limit.toString()}
              onChangeText={(value) => handleBudgetChange(budget.category, value)}
            />
            <View style={styles.notificationContainer}>
              <Text style={styles.notificationText}>Notifications</Text>
              <Switch
                value={budget.notifications}
                onValueChange={() => handleNotificationToggle(budget.category)}
              />
            </View>
          </View>
        ))}
      </View>
    );
  };

  // Render Profile Settings Screen
  const renderProfileSettingsScreen = () => {
    return (
      <View style={styles.profileContainer}>
        <Text style={styles.profileTitle}>Profile & Theme Settings</Text>

        {/* Profile Details */}
        <Text style={styles.sectionTitle}>Profile Details</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={profile.name}
          onChangeText={(value) => handleProfileChange('name', value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={profile.email}
          onChangeText={(value) => handleProfileChange('email', value)}
        />

        {/* Currency and Language */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        <TextInput
          style={styles.input}
          placeholder="Currency"
          value={profile.currency}
          onChangeText={(value) => handleProfileChange('currency', value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Language"
          value={profile.language}
          onChangeText={(value) => handleProfileChange('language', value)}
        />

        {/* Theme Settings */}
        <Text style={styles.sectionTitle}>Theme</Text>
        <TouchableOpacity
          style={[
            styles.themeButton,
            profile.theme === 'light' && styles.activeThemeButton,
          ]}
          onPress={() => handleThemeChange('light')}
        >
          <Text style={styles.themeButtonText}>Light Mode</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.themeButton,
            profile.theme === 'dark' && styles.activeThemeButton,
          ]}
          onPress={() => handleThemeChange('dark')}
        >
          <Text style={styles.themeButtonText}>Dark Mode</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.themeButton,
            profile.theme === 'custom' && styles.activeThemeButton,
          ]}
          onPress={() => handleThemeChange('custom')}
        >
          <Text style={styles.themeButtonText}>Custom Theme</Text>
        </TouchableOpacity>

        {/* Biometric Authentication */}
        <Text style={styles.sectionTitle}>Security</Text>
        <View style={styles.securityContainer}>
          <Text style={styles.securityText}>Biometric Authentication</Text>
          <Switch
            value={profile.biometricAuth}
            onValueChange={() =>
              handleProfileChange('biometricAuth', !profile.biometricAuth)
            }
          />
        </View>
      </View>
    );
  };

  // Render Back Button
  const renderBackButton = () => (
    <TouchableOpacity
      style={styles.backButton}
      onPress={() => setScreen('dashboard')}
    >
      <Text style={styles.backButtonText}>← Back</Text>
    </TouchableOpacity>
  );

  // Render Welcome Screen
  const renderWelcomeScreen = () => {
    return (
      <Animated.View style={[styles.welcomeContainer, { opacity: fadeAnim }]}>
        <Text style={styles.welcomeTitle}>Expense Tracker</Text>
      </Animated.View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Gradient Background */}
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
        <Defs>
          <LinearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#6a11cb" stopOpacity="1" />
            <Stop offset="100%" stopColor="#2575fc" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#gradient)" />
      </Svg>

      {showWelcomeScreen ? (
        renderWelcomeScreen()
      ) : (
        <>
          {screen === 'dashboard' ? (
            <>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerText}>Dashboard</Text>
                <TouchableOpacity onPress={() => setScreen('addExpense')} style={styles.addButton}>
                  <Text style={styles.addButtonText}>+ Add Expense</Text>
                </TouchableOpacity>
              </View>

              {/* Summary Cards */}
              <View style={styles.summaryContainer}>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Income</Text>
                  <Text style={styles.cardValue}>${data.income}</Text>
                </View>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Expenses</Text>
                  <Text style={styles.cardValue}>${data.expenses}</Text>
                </View>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Savings</Text>
                  <Text style={styles.cardValue}>${data.savings}</Text>
                </View>
              </View>

              {/* Income vs Expenses Chart */}
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Income vs Expenses</Text>
                <LineChart
                  data={chartData}
                  width={width - 40}
                  height={220}
                  yAxisLabel="$"
                  chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 2,
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: {
                      borderRadius: 16,
                    },
                    propsForDots: {
                      r: '6',
                      strokeWidth: '2',
                      stroke: '#ffa726',
                    },
                  }}
                  bezier
                  style={styles.chart}
                />
              </View>

              {/* Top Spending Categories */}
              <View style={styles.categoriesContainer}>
                <Text style={styles.categoriesTitle}>Top Spending Categories</Text>
                <View style={styles.categoriesList}>
                  {data.categories.map((category, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.categoryItem, { borderColor: category.color }]}
                      onPress={() => setSelectedCategory(category)}
                    >
                      <Text style={styles.categoryName}>{category.name}</Text>
                      <Text style={styles.categoryAmount}>${category.amount}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Selected Category Details */}
              {selectedCategory && (
                <Animated.View style={[styles.selectedCategoryContainer, animatedStyle]}>
                  <Text style={styles.selectedCategoryTitle}>{selectedCategory.name}</Text>
                  <Text style={styles.selectedCategoryAmount}>${selectedCategory.amount}</Text>
                </Animated.View>
              )}

              {/* Pie Chart */}
              <View style={styles.pieChartContainer}>
                <Text style={styles.pieChartTitle}>Spending Breakdown</Text>
                <PieChart
                  data={pieData}
                  width={width - 40}
                  height={200}
                  chartConfig={{
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  }}
                  accessor="amount"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
              </View>

              {/* Transactions List Button */}
              <TouchableOpacity
                style={styles.transactionsButton}
                onPress={() => setScreen('transactions')}
              >
                <Text style={styles.transactionsButtonText}>View Transactions</Text>
              </TouchableOpacity>

              {/* Reports & Analytics Button */}
              <TouchableOpacity
                style={styles.reportsButton}
                onPress={() => setScreen('reports')}
              >
                <Text style={styles.reportsButtonText}>Reports & Analytics</Text>
              </TouchableOpacity>

              {/* Budget Settings Button */}
              <TouchableOpacity
                style={styles.budgetButton}
                onPress={() => setScreen('budget')}
              >
                <Text style={styles.budgetButtonText}>Budget Settings</Text>
              </TouchableOpacity>

              {/* Profile & Theme Settings Button */}
              <TouchableOpacity
                style={styles.profileButton}
                onPress={() => setScreen('profile')}
              >
                <Text style={styles.profileButtonText}>Profile & Theme Settings</Text>
              </TouchableOpacity>
            </>
          ) : screen === 'addExpense' ? (
            <>
              {/* Add Expense Screen */}
              <View style={styles.addExpenseContainer}>
                <Text style={styles.addExpenseTitle}>Add Expense</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Amount"
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Category (e.g., Food, Transport)"
                  value={category}
                  onChangeText={setCategory}
                />
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
                  <Text>{date.toDateString()}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                  />
                )}
                <TextInput
                  style={styles.input}
                  placeholder="Notes (optional)"
                  value={notes}
                  onChangeText={setNotes}
                />
                <TouchableOpacity onPress={handleImageUpload} style={styles.uploadButton}>
                  <Text style={styles.uploadButtonText}>Upload Receipt</Text>
                </TouchableOpacity>
                {receipt && <Image source={{ uri: receipt }} style={styles.receiptImage} />}
                <TouchableOpacity onPress={handleAddExpense} style={styles.addButton}>
                  <Text style={styles.addButtonText}>Add Expense</Text>
                </TouchableOpacity>
                {renderBackButton()}
              </View>
            </>
          ) : screen === 'transactions' ? (
            <>
              {/* Transactions List Screen */}
              <View style={styles.transactionsContainer}>
                <Text style={styles.transactionsTitle}>Transactions</Text>
                <Searchbar
                  placeholder="Search notes"
                  onChangeText={setSearchQuery}
                  value={searchQuery}
                  style={styles.searchBar}
                />
                <PaperButton
                  icon="filter"
                  mode="contained"
                  onPress={() => setCategoryFilterModalVisible(true)}
                  style={styles.filterButton}
                >
                  Filter by Category
                </PaperButton>
                <SwipeListView
                  data={filteredTransactions}
                  renderItem={renderTransactionItem}
                  renderHiddenItem={renderHiddenItem}
                  leftOpenValue={75}
                  rightOpenValue={-75}
                  keyExtractor={(item) => item.id}
                />
                {renderBackButton()}
              </View>
            </>
          ) : screen === 'reports' ? (
            <>
              {/* Reports & Analytics Screen */}
              {renderReportsScreen()}
              {renderBackButton()}
            </>
          ) : screen === 'budget' ? (
            <>
              {/* Budget Settings Screen */}
              {renderBudgetSettingsScreen()}
              {renderBackButton()}
            </>
          ) : (
            <>
              {/* Profile & Theme Settings Screen */}
              {renderProfileSettingsScreen()}
              {renderBackButton()}
            </>
          )}

          {/* Render Category Filter Modal */}
          {renderCategoryFilterModal()}

          {/* Edit Transaction Modal */}
          <Modal isVisible={isModalVisible}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Transaction</Text>
              <TextInput
                style={styles.input}
                placeholder="Amount"
                keyboardType="numeric"
                value={selectedTransaction?.amount.toString()}
                onChangeText={(text) =>
                  setSelectedTransaction({ ...selectedTransaction, amount: parseFloat(text) })
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Category"
                value={selectedTransaction?.category}
                onChangeText={(text) =>
                  setSelectedTransaction({ ...selectedTransaction, category: text })
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Notes"
                value={selectedTransaction?.notes}
                onChangeText={(text) =>
                  setSelectedTransaction({ ...selectedTransaction, notes: text })
                }
              />
              <PaperButton
                mode="contained"
                onPress={() => handleUpdateTransaction(selectedTransaction)}
              >
                Save
              </PaperButton>
              <PaperButton
                mode="outlined"
                onPress={() => setModalVisible(false)}
              >
                Cancel
              </PaperButton>
            </View>
          </Modal>
        </>
      )}
    </ScrollView>
  );
};

// Dynamic Styles Based on Theme
const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      padding: 20,
      backgroundColor: theme === 'dark' ? '#121212' : '#f5f5f5',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    headerText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme === 'dark' ? '#fff' : '#000',
    },
    addButton: {
      backgroundColor: theme === 'dark' ? '#333' : '#fff',
      padding: 10,
      borderRadius: 8,
    },
    addButtonText: {
      color: theme === 'dark' ? '#fff' : '#6a11cb',
      fontWeight: 'bold',
    },
    summaryContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    card: {
      backgroundColor: theme === 'dark' ? '#333' : '#fff',
      borderRadius: 10,
      padding: 15,
      width: '30%',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
    },
    cardTitle: {
      fontSize: 14,
      color: theme === 'dark' ? '#fff' : '#666',
    },
    cardValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme === 'dark' ? '#fff' : '#333',
    },
    chartContainer: {
      backgroundColor: theme === 'dark' ? '#333' : '#fff',
      borderRadius: 10,
      padding: 15,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
    },
    chartTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
      color: theme === 'dark' ? '#fff' : '#333',
    },
    chart: {
      borderRadius: 16,
    },
    categoriesContainer: {
      backgroundColor: theme === 'dark' ? '#333' : '#fff',
      borderRadius: 10,
      padding: 15,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
    },
    categoriesTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
      color: theme === 'dark' ? '#fff' : '#333',
    },
    categoriesList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    categoryItem: {
      width: '48%',
      padding: 10,
      borderWidth: 1,
      borderRadius: 8,
      marginBottom: 10,
      alignItems: 'center',
      borderColor: theme === 'dark' ? '#555' : '#ccc',
    },
    categoryName: {
      fontSize: 14,
      color: theme === 'dark' ? '#fff' : '#333',
    },
    categoryAmount: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme === 'dark' ? '#fff' : '#333',
    },
    selectedCategoryContainer: {
      backgroundColor: theme === 'dark' ? '#333' : '#fff',
      borderRadius: 10,
      padding: 15,
      marginBottom: 20,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
    },
    selectedCategoryTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme === 'dark' ? '#fff' : '#333',
    },
    selectedCategoryAmount: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme === 'dark' ? '#fff' : '#333',
    },
    pieChartContainer: {
      backgroundColor: theme === 'dark' ? '#333' : '#fff',
      borderRadius: 10,
      padding: 15,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
    },
    pieChartTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
      color: theme === 'dark' ? '#fff' : '#333',
    },
    addExpenseContainer: {
      backgroundColor: theme === 'dark' ? '#333' : '#fff',
      borderRadius: 10,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
    },
    addExpenseTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      color: theme === 'dark' ? '#fff' : '#333',
    },
    input: {
      backgroundColor: theme === 'dark' ? '#555' : '#f5f5f5',
      borderRadius: 8,
      padding: 10,
      marginBottom: 15,
      color: theme === 'dark' ? '#fff' : '#000',
    },
    uploadButton: {
      backgroundColor: '#6a11cb',
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 15,
    },
    uploadButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    receiptImage: {
      width: '100%',
      height: 200,
      borderRadius: 8,
      marginBottom: 15,
    },
    transactionsButton: {
      backgroundColor: '#6a11cb',
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 20,
    },
    transactionsButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    reportsButton: {
      backgroundColor: '#6a11cb',
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 20,
    },
    reportsButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    budgetButton: {
      backgroundColor: '#6a11cb',
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 20,
    },
    budgetButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    profileButton: {
      backgroundColor: '#6a11cb',
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 20,
    },
    profileButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    transactionsContainer: {
      backgroundColor: theme === 'dark' ? '#333' : '#fff',
      borderRadius: 10,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
    },
    transactionsTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      color: theme === 'dark' ? '#fff' : '#333',
    },
    searchBar: {
      marginBottom: 15,
    },
    filterButton: {
      marginBottom: 15,
    },
    transactionItem: {
      backgroundColor: theme === 'dark' ? '#555' : '#f5f5f5',
      borderRadius: 8,
      padding: 15,
      marginBottom: 10,
    },
    transactionCategory: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme === 'dark' ? '#fff' : '#333',
    },
    transactionAmount: {
      fontSize: 14,
      color: theme === 'dark' ? '#fff' : '#333',
    },
    transactionDate: {
      fontSize: 12,
      color: theme === 'dark' ? '#ccc' : '#666',
    },
    transactionNotes: {
      fontSize: 12,
      color: theme === 'dark' ? '#ccc' : '#666',
    },
    hiddenItem: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      padding: 15,
      marginBottom: 10,
    },
    editButton: {
      backgroundColor: '#36A2EB',
      padding: 10,
      borderRadius: 8,
      marginRight: 10,
    },
    editButtonText: {
      color: '#fff',
    },
    deleteButton: {
      backgroundColor: '#FF6384',
      padding: 10,
      borderRadius: 8,
    },
    deleteButtonText: {
      color: '#fff',
    },
    modalContent: {
      backgroundColor: theme === 'dark' ? '#333' : '#fff',
      borderRadius: 10,
      padding: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
      color: theme === 'dark' ? '#fff' : '#333',
    },
    categoryFilterItem: {
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme === 'dark' ? '#555' : '#ccc',
    },
    categoryFilterText: {
      fontSize: 16,
      color: theme === 'dark' ? '#fff' : '#333',
    },
    reportsContainer: {
      backgroundColor: theme === 'dark' ? '#333' : '#fff',
      borderRadius: 10,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
    },
    reportsTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
      color: theme === 'dark' ? '#fff' : '#333',
    },
    tabContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 20,
    },
    tabButton: {
      padding: 10,
      borderRadius: 8,
      backgroundColor: theme === 'dark' ? '#555' : '#f5f5f5',
    },
    activeTabButton: {
      backgroundColor: '#6a11cb',
    },
    tabButtonText: {
      color: theme === 'dark' ? '#fff' : '#333',
      fontWeight: 'bold',
    },
    activeTabButtonText: {
      color: '#fff',
    },
    budgetContainer: {
      backgroundColor: theme === 'dark' ? '#333' : '#fff',
      borderRadius: 10,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
    },
    budgetTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      color: theme === 'dark' ? '#fff' : '#333',
    },
    budgetItem: {
      marginBottom: 20,
    },
    budgetCategory: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme === 'dark' ? '#fff' : '#333',
      marginBottom: 10,
    },
    budgetInput: {
      backgroundColor: theme === 'dark' ? '#555' : '#f5f5f5',
      borderRadius: 8,
      padding: 10,
      marginBottom: 10,
      color: theme === 'dark' ? '#fff' : '#000',
    },
    notificationContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    notificationText: {
      fontSize: 14,
      color: theme === 'dark' ? '#fff' : '#333',
    },
    profileContainer: {
      backgroundColor: theme === 'dark' ? '#333' : '#fff',
      borderRadius: 10,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
    },
    profileTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      color: theme === 'dark' ? '#fff' : '#333',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
      color: theme === 'dark' ? '#fff' : '#333',
    },
    themeButton: {
      backgroundColor: theme === 'dark' ? '#555' : '#f5f5f5',
      borderRadius: 8,
      padding: 15,
      marginBottom: 10,
      alignItems: 'center',
    },
    activeThemeButton: {
      backgroundColor: '#6a11cb',
    },
    themeButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme === 'dark' ? '#fff' : '#333',
    },
    securityContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    securityText: {
      fontSize: 16,
      color: theme === 'dark' ? '#fff' : '#333',
    },
    backButton: {
      backgroundColor: '#6a11cb',
      padding: 10,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 20,
    },
    backButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    welcomeContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme === 'dark' ? '#121212' : '#f5f5f5',
    },
    welcomeTitle: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme === 'dark' ? '#fff' : '#333',
    },
  });

export default App;