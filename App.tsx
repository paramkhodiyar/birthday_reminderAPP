// src/App.tsx
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {StatusBar} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
// import { configureNotifications } from './src/utils/notifications';
import {useEffect} from 'react';

import HomeScreen from './src/screens/HomeScreen';
import SavedBirthdaysScreen from './src/screens/SavedBirthdaysScreen';
import NotificationSettingsScreen from './src/screens/NotificationSettingsScreen';
import {ThemeProvider} from './src/context/ThemeContext';
import {BirthdayProvider} from './src/context/BirthdayContext';
import {useTheme} from './src/context/ThemeContext';
import NotificationService from './src/services/NotificationService';

const Tab = createBottomTabNavigator();

const AppContent = () => {
  const {theme, colors} = useTheme();

  useEffect(() => {
    const setupNotifications = async () => {
      try {
        await NotificationService.initialize();
      } catch (error) {
        console.error('Failed to configure notifications:', error);
      }
    };
    
    setupNotifications();
  }, []);


  return (
    <>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({route}) => ({
            tabBarIcon: ({focused, color, size}) => {
              let iconName = '';
              if (route.name === 'Calculator') {
          iconName = 'calculate';
          return <Icon name={iconName} size={size} color={color} />;
              } else if (route.name === 'Saved') {
          iconName = 'bookmark';
          return <Ionicons name={iconName} size={size} color={color} />;
              } else if (route.name === 'Notifications') {
          iconName = 'notifications';
          return <Icon name={iconName} size={size} color={color} />;
              }
            },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textSecondary,
            tabBarStyle: {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
              elevation: 8,
              shadowColor: colors.shadow,
              shadowOffset: {width: 0, height: -2},
              shadowOpacity: 0.1,
              shadowRadius: 4,
            },
            headerStyle: {
              backgroundColor: colors.surface,
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTitleStyle: {
              color: colors.text,
              fontSize: 18,
              fontWeight: '600',
            },
          })}>
          <Tab.Screen 
            name="Calculator" 
            component={HomeScreen}
            options={{headerShown: false}}
          />
          <Tab.Screen 
            name="Saved"
            component={SavedBirthdaysScreen}
            options={{headerShown: false}}
          />
          <Tab.Screen 
            name="Notifications"
            component={NotificationSettingsScreen}
            options={{headerShown: false}}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <BirthdayProvider>
        <AppContent />
      </BirthdayProvider>
    </ThemeProvider>
  );
};

export default App;