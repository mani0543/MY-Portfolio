import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, TextInput, Switch, ActivityIndicator } from 'react-native';
import { LineChart, PieChart, BarChart } from 'react-native-chart-kit';
import Svg, { LinearGradient, Stop, Defs, Rect } from 'react-native-svg';
import { launchImageLibrary } from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SwipeListView } from 'react-native-swipe-list-view';
import Modal from 'react-native-modal';
import { Searchbar, Button as PaperButton } from 'react-native-paper';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, Easing } from 'react-native-reanimated';
import axios from 'axios';

const { width } = Dimensions.get('window');

// Custom hook for screen transition animation
const useScreenTransition = () => {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const transitionTo = (newScreen, setScreen) => {
    translateX.value = withTiming(-width, { duration: 300, easing: Easing.out(Easing.ease) });
    opacity.value = withTiming(0, { duration: 200 }, () => {
      setScreen(newScreen);
      translateX.value = width;
      opacity.value = withTiming(1, { duration: 200 });
      translateX.value = withSpring(0, { damping: 15, stiffness: 100 });
    });
  };

  return { animatedStyle, transitionTo };
};

const App = () => {
  const [screen, setScreen] = useState('dashboard');
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
  const [activeTab, setActiveTab] = useState('spending');
  const [budgets, setBudgets] = useState({
    Food: { limit: 800, spent: 0, notifications: true },
    Transport: { limit: 500, spent: 0, notifications: true },
    Entertainment: { limit: 300, spent: 0, notifications: true },
    Utilities: { limit: 600, spent: 0, notifications: true },
    Others: { limit: 1000, spent: 0, notifications: true },
  });
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    currency: 'USD',
    language: 'English',
    theme: 'dark',
    biometricAuth: false,
  });
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [calcIncome, setCalcIncome] = useState('');
  const [calcExpenses, setCalcExpenses] = useState('');
  const [calcResult, setCalcResult] = useState(null);
  const [isLossModalVisible, setLossModalVisible] = useState(false);

  const { animatedStyle, transitionTo } = useScreenTransition();

  useEffect(() => {
    if (showWelcomeScreen) {
      const timer = setTimeout(() => {
        setShowWelcomeScreen(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showWelcomeScreen]);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const response = await axios.get('https://jsonplaceholder.typicode.com/posts');
        const mockTransactions = response.data.slice(0, 20).map((item) => {
          const category = Object.keys(budgets)[Math.floor(Math.random() * 5)];
          const amount = Math.floor(Math.random() * 500) + 50;
          return {
            id: item.id.toString(),
            amount,
            category,
            date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            notes: item.title.slice(0, 20),
            type: Math.random() > 0.5 ? 'income' : 'expense',
          };
        });
        setTransactions(mockTransactions);
        updateBudgets(mockTransactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  useEffect(() => {
    if (screen === 'reports') {
      const savings = data.income - data.expenses;
      if (savings < 0) {
        setLossModalVisible(true);
        const timer = setTimeout(() => setLossModalVisible(false), 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [screen, transactions]);

  const updateBudgets = (trans) => {
    const newBudgets = { ...budgets };
    Object.keys(newBudgets).forEach((cat) => {
      newBudgets[cat].spent = trans
        .filter((t) => t.category === cat && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    });
    setBudgets(newBudgets);
  };

  const styles = getStyles(profile.theme);

  const handleScreenChange = (newScreen) => {
    if (newScreen !== screen) {
      transitionTo(newScreen, setScreen);
    }
  };

  const data = {
    income: transactions.reduce((sum, t) => (t.type === 'income' ? sum + t.amount : sum), 0),
    expenses: transactions.reduce((sum, t) => (t.type === 'expense' ? sum + t.amount : sum), 0),
    savings: () => data.income - data.expenses,
    categories: Object.entries(budgets).map(([name, { spent }], i) => ({
      name,
      amount: spent,
      color: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'][i],
    })),
  };

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      { data: [3000, 4500, 2800, 5000, 4000, 6000], color: () => '#36A2EB', strokeWidth: 2 },
      { data: [2000, 3000, 2500, 4000, 3500, 5000], color: () => '#FF6384', strokeWidth: 2 },
    ],
  };

  const pieData = data.categories.map((category) => ({
    name: category.name,
    amount: category.amount,
    color: category.color,
    legendFontColor: '#fff',
    legendFontSize: 14,
  }));

  const barData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{ data: [800, 500, 300, 600, 1000, 400] }],
  };

  const handleAddTransaction = () => {
    const newTransaction = {
      id: Date.now().toString(),
      amount: parseFloat(amount) || 0,
      category: category || 'Others',
      date: date.toISOString(),
      notes,
      receipt,
      type: parseFloat(amount) >= 0 ? 'income' : 'expense',
    };
    const updatedTransactions = [...transactions, newTransaction];
    setTransactions(updatedTransactions);
    updateBudgets(updatedTransactions);
    handleScreenChange('dashboard');
    resetForm();
  };

  const handleEditTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setModalVisible(true);
  };

  const handleDeleteTransaction = (id) => {
    const updatedTransactions = transactions.filter((t) => t.id !== id);
    setTransactions(updatedTransactions);
    updateBudgets(updatedTransactions);
  };

  const handleUpdateTransaction = (updatedTransaction) => {
    const updatedTransactions = transactions.map((t) => (t.id === updatedTransaction.id ? updatedTransaction : t));
    setTransactions(updatedTransactions);
    updateBudgets(updatedTransactions);
    setModalVisible(false);
  };

  const handleImageUpload = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (!response.didCancel && !response.errorCode) {
        setReceipt(response.assets[0].uri);
      }
    });
  };

  const calculateSavings = () => {
    const income = parseFloat(calcIncome) || 0;
    const expenses = parseFloat(calcExpenses) || 0;
    setCalcResult(income - expenses);
  };

  const resetForm = () => {
    setAmount('');
    setCategory('');
    setDate(new Date());
    setNotes('');
    setReceipt(null);
  };

  const filteredTransactions = transactions
    .filter((t) => t.category.toLowerCase().includes(filterCategory.toLowerCase()))
    .filter((t) => {
      if (!filterStartDate || !filterEndDate) return true;
      const transactionDate = new Date(t.date);
      return transactionDate >= filterStartDate && transactionDate <= filterEndDate;
    })
    .filter((t) => t.notes.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const renderDashboard = () => (
    <Animated.View style={[styles.screenContainer, animatedStyle]}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Expense Tracker</Text>
        <TouchableOpacity onPress={() => handleScreenChange('addExpense')} style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#00c4cc" />
      ) : (
        <>
          <View style={styles.summaryContainer}>
            {[
              { title: 'Income', value: data.income },
              { title: 'Expenses', value: data.expenses },
              { title: 'Savings', value: data.income - data.expenses },
            ].map((item, index) => (
              <Animated.View key={index} style={[styles.card, { transform: [{ scale: withSpring(1, { delay: index * 100 }) }] }]}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardValue}>${item.value.toFixed(2)}</Text>
              </Animated.View>
            ))}
          </View>
          <Animated.View style={[styles.chartContainer, { transform: [{ translateY: withSpring(0, { damping: 15 }) }] }]}>
            <Text style={styles.chartTitle}>Monthly Trends</Text>
            <LineChart data={chartData} width={width - 40} height={220} yAxisLabel="$" chartConfig={chartConfig} bezier style={styles.chart} />
          </Animated.View>
          <Animated.View style={[styles.budgetOverview, { transform: [{ translateY: withSpring(0, { damping: 15 }) }] }]}>
            <Text style={styles.budgetTitle}>Budget Overview</Text>
            {Object.entries(budgets).map(([cat, { limit, spent }], i) => (
              <Animated.View key={cat} style={[styles.budgetItem, { transform: [{ translateX: withSpring(0, { delay: i * 100 }) }] }]}>
                <Text style={styles.budgetCategory}>{cat}</Text>
                <Text style={styles.budgetAmount}>${spent.toFixed(2)} / ${limit.toFixed(2)}</Text>
                <View style={[styles.progressBar, { width: `${Math.min((spent / limit) * 100, 100)}%`, backgroundColor: spent > limit ? '#FF6384' : '#36A2EB' }]} />
              </Animated.View>
            ))}
          </Animated.View>
          <Animated.View style={[styles.pieChartContainer, { transform: [{ translateY: withSpring(0, { damping: 15 }) }] }]}>
            <Text style={styles.pieChartTitle}>Spending Breakdown</Text>
            <PieChart data={pieData} width={width - 40} height={200} chartConfig={chartConfig} accessor="amount" backgroundColor="transparent" paddingLeft="15" absolute />
          </Animated.View>
        </>
      )}
      <View style={styles.navButtons}>
        {['transactions', 'reports', 'calculator', 'budget', 'profile'].map((nav, i) => (
          <TouchableOpacity key={nav} style={styles.navButton} onPress={() => handleScreenChange(nav)}>
            <Animated.Text style={[styles.navButtonText, { transform: [{ scale: withSpring(1, { delay: i * 100 }) }] }]}>
              {nav.charAt(0).toUpperCase() + nav.slice(1)}
            </Animated.Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );

  const renderAddExpense = () => (
    <Animated.View style={[styles.screenContainer, animatedStyle]}>
      <Text style={styles.addExpenseTitle}>Add Transaction</Text>
      <TextInput style={styles.input} placeholder="Amount" keyboardType="numeric" value={amount} onChangeText={setAmount} />
      <TextInput style={styles.input} placeholder="Category" value={category} onChangeText={setCategory} />
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
        <Text style={styles.dateText}>{date.toDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && <DateTimePicker value={date} mode="date" display="default" onChange={(e, d) => { setShowDatePicker(false); if (d) setDate(d); }} />}
      <TextInput style={styles.input} placeholder="Notes" value={notes} onChangeText={setNotes} />
      <TouchableOpacity onPress={handleImageUpload} style={styles.uploadButton}>
        <Text style={styles.uploadButtonText}>Upload Receipt</Text>
      </TouchableOpacity>
      {receipt && <Image source={{ uri: receipt }} style={styles.receiptImage} />}
      <TouchableOpacity onPress={handleAddTransaction} style={styles.addButton}>
        <Text style={styles.addButtonText}>Add Transaction</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={() => handleScreenChange('dashboard')}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderReports = () => (
    <Animated.View style={[styles.screenContainer, animatedStyle]}>
      <Text style={styles.reportsTitle}>Reports & Analytics</Text>
      <View style={styles.tabContainer}>
        {['spending', 'savings', 'comparison'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabButtonText, activeTab === tab && styles.activeTabButtonText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {activeTab === 'spending' && (
        <>
          <LineChart data={chartData} width={width - 40} height={220} yAxisLabel="$" chartConfig={chartConfig} bezier style={styles.chart} />
          <PieChart data={pieData} width={width - 40} height={200} chartConfig={chartConfig} accessor="amount" backgroundColor="transparent" paddingLeft="15" absolute />
        </>
      )}
      {activeTab === 'savings' && (
        <BarChart data={barData} width={width - 40} height={220} yAxisLabel="$" chartConfig={chartConfig} style={styles.chart} />
      )}
      {activeTab === 'comparison' && (
        <LineChart data={chartData} width={width - 40} height={220} yAxisLabel="$" chartConfig={chartConfig} bezier style={styles.chart} />
      )}
      <TouchableOpacity style={styles.backButton} onPress={() => handleScreenChange('dashboard')}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
      <Modal isVisible={isLossModalVisible} backdropOpacity={0.5}>
        <Animated.View style={[styles.lossModalContent, { transform: [{ scale: withSpring(1, { damping: 10 }) }] }]}>
          <Text style={styles.lossModalTitle}>Financial Loss Alert</Text>
          <Text style={styles.lossModalText}>
            {data.income - data.expenses < 0 ? (
              Object.entries(budgets).some(([_, { limit, spent }]) => spent > limit) ? (
                `You are in a loss of $${Math.abs(data.income - data.expenses).toFixed(2)}. Reasons:\n- Overspending in: ${Object.entries(budgets)
                  .filter(([_, { limit, spent }]) => spent > limit)
                  .map(([cat, { spent, limit }]) => `${cat} (Spent: $${spent.toFixed(2)}, Limit: $${limit.toFixed(2)})`).join(', ')}\n\nSuggestions:\n- Reduce spending in these categories.\n- Increase income sources.\n- Adjust budget limits realistically.`
              ) : (
                `You are in a loss of $${Math.abs(data.income - data.expenses).toFixed(2)}. Reasons:\n- Expenses exceed income.\n\nSuggestions:\n- Cut unnecessary expenses.\n- Boost your income.\n- Review and adjust your budget.`
              )
            ) : ''}
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={() => setLossModalVisible(false)}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    </Animated.View>
  );

  const renderCalculator = () => (
    <Animated.View style={[styles.screenContainer, animatedStyle]}>
      <Text style={styles.calculatorTitle}>Expense Calculator</Text>
      <TextInput style={styles.input} placeholder="Total Income" keyboardType="numeric" value={calcIncome} onChangeText={setCalcIncome} />
      <TextInput style={styles.input} placeholder="Total Expenses" keyboardType="numeric" value={calcExpenses} onChangeText={setCalcExpenses} />
      <TouchableOpacity style={styles.calculateButton} onPress={calculateSavings}>
        <Text style={styles.calculateButtonText}>Calculate</Text>
      </TouchableOpacity>
      {calcResult !== null && <Text style={styles.calcResult}>Savings: ${calcResult.toFixed(2)}</Text>}
      <TouchableOpacity style={styles.backButton} onPress={() => handleScreenChange('dashboard')}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderTransactions = () => (
    <Animated.View style={[styles.screenContainer, animatedStyle]}>
      <Text style={styles.transactionsTitle}>Transactions</Text>
      <Searchbar placeholder="Search notes" onChangeText={setSearchQuery} value={searchQuery} style={styles.searchBar} />
      <SwipeListView
        data={filteredTransactions}
        renderItem={({ item }) => (
          <Animated.View style={[styles.transactionItem, { transform: [{ scale: withSpring(1) }] }]}>
            <Text style={styles.transactionCategory}>{item.category}</Text>
            <Text style={[styles.transactionAmount, { color: item.type === 'income' ? '#36A2EB' : '#FF6384' }]}>${item.amount.toFixed(2)}</Text>
            <Text style={styles.transactionDate}>{new Date(item.date).toLocaleDateString()}</Text>
            <Text style={styles.transactionNotes}>{item.notes}</Text>
          </Animated.View>
        )}
        renderHiddenItem={({ item }) => (
          <View style={styles.hiddenItem}>
            <TouchableOpacity style={styles.editButton} onPress={() => handleEditTransaction(item)}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteTransaction(item.id)}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        leftOpenValue={75}
        rightOpenValue={-75}
        keyExtractor={(item) => item.id}
      />
      <TouchableOpacity style={styles.backButton} onPress={() => handleScreenChange('dashboard')}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderBudget = () => (
    <Animated.View style={[styles.screenContainer, animatedStyle]}>
      <Text style={styles.budgetTitle}>Budget Settings</Text>
      {Object.entries(budgets).map(([cat, { limit, spent, notifications }], i) => (
        <Animated.View key={cat} style={[styles.budgetItem, { transform: [{ translateY: withSpring(0, { delay: i * 100 }) }] }]}>
          <Text style={styles.budgetCategory}>{cat}</Text>
          <TextInput
            style={styles.budgetInput}
            placeholder="Limit"
            keyboardType="numeric"
            value={limit.toString()}
            onChangeText={(value) => setBudgets({ ...budgets, [cat]: { ...budgets[cat], limit: parseFloat(value) || 0 } })}
          />
          <Text style={styles.budgetSpent}>Spent: ${spent.toFixed(2)}</Text>
          <View style={styles.notificationContainer}>
            <Text style={styles.notificationText}>Notifications</Text>
            <Switch value={notifications} onValueChange={() => setBudgets({ ...budgets, [cat]: { ...budgets[cat], notifications: !notifications } })} />
          </View>
        </Animated.View>
      ))}
      <TouchableOpacity style={styles.backButton} onPress={() => handleScreenChange('dashboard')}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderProfile = () => (
    <Animated.View style={[styles.screenContainer, animatedStyle]}>
      <Text style={styles.profileTitle}>Profile</Text>
      <TextInput style={styles.input} placeholder="Name" value={profile.name} onChangeText={(v) => setProfile({ ...profile, name: v })} />
      <TextInput style={styles.input} placeholder="Email" value={profile.email} onChangeText={(v) => setProfile({ ...profile, email: v })} />
      <Text style={styles.sectionTitle}>Theme</Text>
      {['light', 'dark'].map((t) => (
        <TouchableOpacity
          key={t}
          style={[styles.themeButton, profile.theme === t && styles.activeThemeButton]}
          onPress={() => setProfile({ ...profile, theme: t })}
        >
          <Text style={styles.themeButtonText}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.backButton} onPress={() => handleScreenChange('dashboard')}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const chartConfig = {
    backgroundGradientFrom: profile.theme === 'dark' ? '#1A1A2E' : '#FFFFFF',
    backgroundGradientTo: profile.theme === 'dark' ? '#16213E' : '#FFFFFF',
    decimalPlaces: 2,
    color: () => (profile.theme === 'dark' ? '#00c4cc' : '#2575fc'),
    labelColor: () => (profile.theme === 'dark' ? '#FFFFFF' : '#333333'),
    propsForDots: { r: '6', strokeWidth: '2', stroke: '#ffa726' },
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={profile.theme === 'dark' ? '#1A1A2E' : '#6a11cb'} />
            <Stop offset="50%" stopColor={profile.theme === 'dark' ? '#16213E' : '#2575fc'} />
            <Stop offset="100%" stopColor={profile.theme === 'dark' ? '#0E0E23' : '#00c4cc'} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#gradient)" />
      </Svg>

      {showWelcomeScreen ? (
        <Animated.View style={[styles.welcomeContainer, { transform: [{ scale: withSpring(1, { damping: 10 }) }] }]}>
          <Text style={styles.welcomeTitle}>Expense Tracker</Text>
          <Text style={styles.welcomeSubtitle}>Your Financial Companion</Text>
        </Animated.View>
      ) : (
        <View style={styles.content}>
          {screen === 'dashboard' && renderDashboard()}
          {screen === 'addExpense' && renderAddExpense()}
          {screen === 'transactions' && renderTransactions()}
          {screen === 'reports' && renderReports()}
          {screen === 'calculator' && renderCalculator()}
          {screen === 'budget' && renderBudget()}
          {screen === 'profile' && renderProfile()}
          <Modal isVisible={isModalVisible}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Transaction</Text>
              <TextInput
                style={styles.input}
                placeholder="Amount"
                keyboardType="numeric"
                value={selectedTransaction?.amount.toString()}
                onChangeText={(text) => setSelectedTransaction({ ...selectedTransaction, amount: parseFloat(text) || 0 })}
              />
              <TextInput
                style={styles.input}
                placeholder="Category"
                value={selectedTransaction?.category}
                onChangeText={(text) => setSelectedTransaction({ ...selectedTransaction, category: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Notes"
                value={selectedTransaction?.notes}
                onChangeText={(text) => setSelectedTransaction({ ...selectedTransaction, notes: text })}
              />
              <PaperButton mode="contained" onPress={() => handleUpdateTransaction(selectedTransaction)} style={styles.saveButton}>
                Save
              </PaperButton>
              <PaperButton mode="outlined" onPress={() => setModalVisible(false)}>
                Cancel
              </PaperButton>
            </View>
          </Modal>
        </View>
      )}
    </ScrollView>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: { flexGrow: 1, padding: 20 },
  content: { paddingBottom: 50 },
  screenContainer: { flex: 1, paddingBottom: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerText: { fontSize: 28, fontWeight: 'bold', color: '#fff', textShadowColor: '#00c4cc', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 5 },
  addButton: { backgroundColor: '#00c4cc', padding: 12, borderRadius: 20, elevation: 5 },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  summaryContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  card: { backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 15, padding: 15, width: '30%', alignItems: 'center', elevation: 5, borderWidth: 1, borderColor: 'rgba(0, 196, 204, 0.3)' },
  cardTitle: { fontSize: 14, color: '#fff', opacity: 0.8 },
  cardValue: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginTop: 5 },
  chartContainer: { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 15, padding: 20, marginBottom: 20, elevation: 5 },
  chartTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  chart: { borderRadius: 15 },
  budgetOverview: { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 15, padding: 20, marginBottom: 20, elevation: 5 },
  budgetTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 15 },
  budgetItem: { marginBottom: 15 },
  budgetCategory: { fontSize: 16, color: '#fff', fontWeight: '600' },
  budgetAmount: { fontSize: 14, color: '#fff', opacity: 0.8 },
  progressBar: { height: 5, borderRadius: 5, marginTop: 5 },
  pieChartContainer: { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 15, padding: 20, marginBottom: 20, elevation: 5 },
  pieChartTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  navButtons: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  navButton: { backgroundColor: '#00c4cc', padding: 15, borderRadius: 20, width: '19%', alignItems: 'center', marginBottom: 15, elevation: 5 },
  navButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  addExpenseTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  input: { backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 10, padding: 15, marginBottom: 15, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: 'rgba(0, 196, 204, 0.3)' },
  dateText: { color: '#fff' },
  uploadButton: { backgroundColor: '#36A2EB', padding: 15, borderRadius: 20, alignItems: 'center', marginBottom: 15, elevation: 5 },
  uploadButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  receiptImage: { width: '100%', height: 200, borderRadius: 10, marginBottom: 15 },
  transactionsTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  searchBar: { marginBottom: 15, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 10 },
  transactionItem: { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 10, padding: 15, marginBottom: 10, elevation: 3 },
  transactionCategory: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  transactionAmount: { fontSize: 14, fontWeight: 'bold' },
  transactionDate: { fontSize: 12, color: '#fff', opacity: 0.7 },
  transactionNotes: { fontSize: 12, color: '#fff', opacity: 0.7 },
  hiddenItem: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', padding: 15, marginBottom: 10 },
  editButton: { backgroundColor: '#36A2EB', padding: 10, borderRadius: 10, marginRight: 10 },
  editButtonText: { color: '#fff', fontWeight: 'bold' },
  deleteButton: { backgroundColor: '#FF6384', padding: 10, borderRadius: 10 },
  deleteButtonText: { color: '#fff', fontWeight: 'bold' },
  modalContent: { backgroundColor: theme === 'dark' ? '#16213E' : '#fff', borderRadius: 15, padding: 20, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: theme === 'dark' ? '#fff' : '#333', marginBottom: 20 },
  saveButton: { backgroundColor: '#00c4cc', marginBottom: 10 },
  reportsTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  tabContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  tabButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 25, backgroundColor: 'rgba(255, 255, 255, 0.1)' },
  activeTabButton: { backgroundColor: '#00c4cc' },
  tabButtonText: { color: '#fff', fontWeight: 'bold' },
  activeTabButtonText: { color: '#fff' },
  lossModalContent: { backgroundColor: '#16213E', borderRadius: 15, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#FF6384' },
  lossModalTitle: { fontSize: 22, fontWeight: 'bold', color: '#FF6384', marginBottom: 15 },
  lossModalText: { fontSize: 16, color: '#fff', textAlign: 'center', marginBottom: 20 },
  closeButton: { backgroundColor: '#00c4cc', padding: 10, borderRadius: 20, elevation: 5 },
  closeButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  calculatorTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  calculateButton: { backgroundColor: '#00c4cc', padding: 15, borderRadius: 20, alignItems: 'center', marginBottom: 15, elevation: 5 },
  calculateButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  calcResult: { fontSize: 20, color: '#fff', textAlign: 'center', marginBottom: 15 },
  budgetTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  budgetItem: { marginBottom: 20 },
  budgetCategory: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  budgetInput: { backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 10, padding: 15, marginBottom: 10, color: '#fff', borderWidth: 1, borderColor: 'rgba(0, 196, 204, 0.3)' },
  budgetSpent: { fontSize: 14, color: '#fff', opacity: 0.8, marginBottom: 10 },
  notificationContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  notificationText: { fontSize: 14, color: '#fff' },
  profileTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 10, marginTop: 20 },
  themeButton: { backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 10, padding: 15, marginBottom: 10, alignItems: 'center' },
  activeThemeButton: { backgroundColor: '#00c4cc' },
  themeButtonText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  backButton: { backgroundColor: '#36A2EB', padding: 15, borderRadius: 20, alignItems: 'center', marginTop: 20, elevation: 5 },
  backButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  welcomeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  welcomeTitle: { fontSize: 36, fontWeight: 'bold', color: '#fff', textShadowColor: '#00c4cc', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 10 },
  welcomeSubtitle: { fontSize: 18, color: '#fff', opacity: 0.8, marginTop: 10 },
});

export default App;