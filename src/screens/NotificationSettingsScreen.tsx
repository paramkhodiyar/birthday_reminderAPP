import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../context/ThemeContext';
import NotificationService from '../services/NotificationService';
import { useBirthday } from '../context/BirthdayContext';

const NotificationSettingsScreen = () => {
  const { colors } = useTheme();
  const { birthdays } = useBirthday();
  const [scheduledNotifications, setScheduledNotifications] = useState<any[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    loadScheduledNotifications();
  }, []);

  const loadScheduledNotifications = async () => {
    try {
      const notifications = await NotificationService.getScheduledNotifications();
      setScheduledNotifications(notifications);
    } catch (error) {
      console.error('Error loading scheduled notifications:', error);
    }
  };

  const testNotification = () => {
    NotificationService.showTestNotification();
    Alert.alert('Test Notification', 'A test notification has been sent!');
  };

  const refreshNotifications = async () => {
    await loadScheduledNotifications();
    Alert.alert('Refreshed', 'Notification list has been updated!');
  };

  const clearAllNotifications = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all scheduled birthday notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            NotificationService.cancelAllNotifications();
            await loadScheduledNotifications();
            Alert.alert('Cleared', 'All notifications have been cleared!');
          },
        },
      ]
    );
  };

  const rescheduleAllNotifications = async () => {
    try {
      NotificationService.updateAllBirthdayNotifications(birthdays);
      await loadScheduledNotifications();
      Alert.alert('Success', 'All birthday notifications have been rescheduled!');
    } catch (error) {
      Alert.alert('Error', 'Failed to reschedule notifications');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 15,
      backgroundColor: colors.surface,
      elevation: 2,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    section: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 15,
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 15,
      paddingHorizontal: 15,
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginBottom: 10,
    },
    settingText: {
      fontSize: 16,
      color: colors.text,
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: 15,
      paddingHorizontal: 20,
      borderRadius: 12,
      alignItems: 'center',
      marginBottom: 15,
    },
    buttonText: {
      color: colors.surface,
      fontSize: 16,
      fontWeight: '600',
    },
    secondaryButton: {
      backgroundColor: colors.textSecondary + '20',
      paddingVertical: 15,
      paddingHorizontal: 20,
      borderRadius: 12,
      alignItems: 'center',
      marginBottom: 15,
    },
    secondaryButtonText: {
      color: colors.textSecondary,
      fontSize: 16,
      fontWeight: '600',
    },
    notificationItem: {
      backgroundColor: colors.surface,
      padding: 15,
      borderRadius: 12,
      marginBottom: 10,
    },
    notificationTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 5,
    },
    notificationDate: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    statsContainer: {
      backgroundColor: colors.surface,
      padding: 20,
      borderRadius: 12,
      marginBottom: 20,
    },
    statsText: {
      fontSize: 16,
      color: colors.text,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notification Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity style={styles.button} onPress={testNotification}>
            <Text style={styles.buttonText}>Test Notification</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={refreshNotifications}>
            <Text style={styles.buttonText}>Refresh Notifications</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={rescheduleAllNotifications}>
            <Text style={styles.buttonText}>Reschedule All Notifications</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={clearAllNotifications}>
            <Text style={styles.secondaryButtonText}>Clear All Notifications</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              {birthdays.length} birthday{birthdays.length !== 1 ? 's' : ''} saved
            </Text>
            <Text style={styles.statsText}>
              {scheduledNotifications.length} notification{scheduledNotifications.length !== 1 ? 's' : ''} scheduled
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scheduled Notifications</Text>
          
          {scheduledNotifications.length === 0 ? (
            <View style={styles.notificationItem}>
              <Text style={styles.notificationTitle}>No notifications scheduled</Text>
              <Text style={styles.notificationDate}>
                Notifications will be scheduled automatically when you add birthdays
              </Text>
            </View>
          ) : (
            scheduledNotifications.map((notification, index) => (
              <View key={index} style={styles.notificationItem}>
                <Text style={styles.notificationTitle}>{notification.title}</Text>
                <Text style={styles.notificationDate}>
                  Scheduled for: {new Date(notification.date).toLocaleString()}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default NotificationSettingsScreen;
