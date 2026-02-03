import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Screens
import HomeScreen from './app-tabs/HomeScreen';
import ScanScreen from './app-tabs/ScanScreen';
import DiaryScreen from './app-tabs/DiaryScreen';
import ProgressScreen from './app-tabs/ProgressScreen';
import SettingsScreen from './app-tabs/SettingsScreen';

// Storage
import { loadData, saveData } from './app-lib/storage';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Scan') {
              iconName = focused ? 'barcode' : 'barcode-outline';
            } else if (route.name === 'Diary') {
              iconName = focused ? 'journal' : 'journal-outline';
            } else if (route.name === 'Progress') {
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#4CAF50',
          tabBarInactiveTintColor: 'gray',
          headerStyle: { backgroundColor: '#4CAF50' },
          headerTintColor: 'white',
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
        <Tab.Screen name="Scan" component={ScanScreen} options={{ title: 'Scan' }} />
        <Tab.Screen name="Diary" component={DiaryScreen} options={{ title: 'Diary' }} />
        <Tab.Screen name="Progress" component={ProgressScreen} options={{ title: 'Progress' }} />
        <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      </Tab.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
});
