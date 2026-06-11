import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

import AuthNavigator from './AuthNavigator';
import UserTabNavigator from './UserTabNavigator';
import OwnerTabNavigator from './OwnerTabNavigator';

const Stack = createStackNavigator();

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A2342' }}>
        <ActivityIndicator size="large" color="#00C9A7" />
      </View>
    );
  }

  if (!user) return <AuthNavigator />;
  if (user.role === 'owner') return <OwnerTabNavigator />;
  return <UserTabNavigator />;
}
