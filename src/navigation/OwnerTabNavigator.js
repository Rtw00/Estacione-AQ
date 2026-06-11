import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import OwnerDashboardScreen    from '../screens/owner/OwnerDashboardScreen';
import AddParkingScreen        from '../screens/owner/AddParkingScreen';
import OwnerReservationsScreen from '../screens/owner/OwnerReservationsScreen';
import ProfileScreen           from '../screens/user/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function OwnerTabNavigator() {
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
            Meus: focused ? 'business' : 'business-outline',
            Adicionar: focused ? 'add-circle' : 'add-circle-outline',
            Reservas: focused ? 'list' : 'list-outline',
            Perfil: focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Meus"      component={OwnerDashboardScreen} options={{ title: 'Meus Estac.' }} />
      <Tab.Screen name="Adicionar" component={AddParkingScreen} />
      <Tab.Screen name="Reservas"  component={OwnerReservationsScreen} />
      <Tab.Screen name="Perfil"    component={ProfileScreen} />
    </Tab.Navigator>
  );
}
