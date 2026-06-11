import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterUserScreen from '../screens/auth/RegisterUserScreen';
import RegisterOwnerScreen from '../screens/auth/RegisterOwnerScreen';

const Stack = createStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome"       component={WelcomeScreen} />
      <Stack.Screen name="Login"         component={LoginScreen} />
      <Stack.Screen name="RegisterUser"  component={RegisterUserScreen} />
      <Stack.Screen name="RegisterOwner" component={RegisterOwnerScreen} />
    </Stack.Navigator>
  );
}
