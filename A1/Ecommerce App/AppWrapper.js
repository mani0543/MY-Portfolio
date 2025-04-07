import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import App from './App'; // Main App component
import { CheckoutScreen } from './screens/CheckoutScreen'; // Checkout screen
import { SuccessScreen } from './screens/SuccessScreen'; // Success screen

const Stack = createStackNavigator();

export default function AppWrapper() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* Main App Screen */}
        <Stack.Screen
          name="Home"
          component={App}
          options={{ headerShown: false }} // Hide header for the main screen
        />

        {/* Checkout Screen */}
        <Stack.Screen
          name="Checkout"
          component={CheckoutScreen}
          options={{ title: 'Checkout' }} // Add a title for the Checkout screen
        />

        {/* Success Screen */}
        <Stack.Screen
          name="Success"
          component={SuccessScreen}
          options={{ title: 'Order Success' }} // Add a title for the Success screen
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}