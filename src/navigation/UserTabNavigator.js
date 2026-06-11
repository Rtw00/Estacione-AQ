import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import ParkingListScreen  from '../screens/user/ParkingListScreen';
import ParkingDetailScreen from '../screens/user/ParkingDetailScreen';
import ReserveScreen       from '../screens/user/ReserveScreen';
import MyReservationsScreen from '../screens/user/MyReservationsScreen';
import ProfileScreen       from '../screens/user/ProfileScreen';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

function ParkingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ParkingList"   component={ParkingListScreen} />
      <Stack.Screen name="ParkingDetail" component={ParkingDetailScreen} />
      <Stack.Screen name="Reserve"       component={ReserveScreen} />
    </Stack.Navigator>
  );
}

export default function UserTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0A2342',
          borderTopColor: '#1a3a5c',
          paddingBottom: 6,
          height: 62,
        },
        tabBarActiveTintColor: '#00C9A7',
        tabBarInactiveTintColor: '#6a8faf',
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Buscar: focused ? 'search' : 'search-outline',
            Reservas: focused ? 'bookmark' : 'bookmark-outline',
            Perfil: focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Buscar"   component={ParkingStack} />
      <Tab.Screen name="Reservas" component={MyReservationsScreen} />
      <Tab.Screen name="Perfil"   component={ProfileScreen} />
    </Tab.Navigator>
  );
}
