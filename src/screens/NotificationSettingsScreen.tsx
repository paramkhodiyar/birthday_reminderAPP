import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  Modal,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import PushNotification from 'react-native-push-notification';
import { useTheme } from '../context/ThemeContext';
import { useBirthday } from '../context/BirthdayContext';

interface NotificationSettings {
  enabled: boolean;
  time: string;
  daysPrior: number;
}

const NotificationSettingsScreen = () => {
  const { colors } = useTheme();
  const { birthdays } = useBirthday();
  const [scheduledNotifications, setScheduledNotifications] = useState<any[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    time: "09:00",
    daysPrior: 1
  });
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempTime, setTempTime] = useState(new Date());

  useEffect(() => {
    loadSettings();
    loadScheduledNotifications();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('notificationSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({ ...settings, ...parsedSettings });
        
        // Set temp time for picker
        const [hours, minutes] = parsedSettings.time?.split(':').map(Number) || [9, 0];
        const timeDate = new Date();
        timeDate.setHours(hours, minutes, 0, 0);
        setTempTime(timeDate);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadScheduledNotifications = async () => {
    try {
      PushNotification.getScheduledLocalNotifications((notifications) => {
        setScheduledNotifications(notifications || []);
      });
    } catch (error) {
      console.error('Error loading scheduled notifications:', error);
    }
  };

  const updateSetting = async (key: keyof NotificationSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
    
    // Reschedule notifications when settings change
    if (newSettings.enabled) {
      scheduleAllBirthdayNotifications(birthdays, newSettings);
    } else {
      PushNotification.cancelAllLocalNotifications();
    }
    await loadScheduledNotifications();
  };

  const handleTimeConfirm = async (selectedTime: Date) => {
    const timeString = `${selectedTime.getHours().toString().padStart(2, '0')}:${selectedTime.getMinutes().toString().padStart(2, '0')}`;
    await updateSetting('time', timeString);
    setShowTimePicker(false);
  };

  const testNotification = () => {
    const testMessage = settings.daysPrior === 0 
      ? "Wohooo! Today is John's birthday! 🎉"
      : settings.daysPrior === 1
      ? "John has their birthday tomorrow! 🎉"
      : `John has their birthday in ${settings.daysPrior} days! 🎉`;

    PushNotification.localNotification({
      title: settings.daysPrior === 0 ? 'Birthday Today! 🎂' : 'Birthday Reminder',
      message: testMessage,
      channelId: 'birthday-reminders',
    });
    
    Alert.alert('Test Notification', 'A test notification has been sent based on your current settings!');
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
            PushNotification.cancelAllLocalNotifications();
            await loadScheduledNotifications();
            Alert.alert('Cleared', 'All notifications have been cleared!');
          },
        },
      ]
    );
  };

  const rescheduleAllNotifications = async () => {
    try {
      if (settings.enabled) {
        scheduleAllBirthdayNotifications(birthdays, settings);
      }
      await loadScheduledNotifications();
      Alert.alert('Success', 'All birthday notifications have been rescheduled!');
    } catch (error) {
      Alert.alert('Error', 'Failed to reschedule notifications');
    }
  };

  const scheduleAllBirthdayNotifications = (birthdays: any[], settings: NotificationSettings) => {
    PushNotification.cancelAllLocalNotifications();
    
    birthdays.forEach((birthday) => {
      const { name, dateOfBirth } = birthday;
      const birthDate = new Date(dateOfBirth);
      const currentYear = new Date().getFullYear();
      
      // Calculate next birthday
      let nextBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
      if (nextBirthday < new Date()) {
        nextBirthday = new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate());
      }

      // Set the notification time
      const [hours, minutes] = settings.time.split(':').map(Number);
      nextBirthday.setHours(hours, minutes, 0, 0);

      // Schedule prior notification if daysPrior > 0
      if (settings.daysPrior > 0) {
        const priorDate = new Date(nextBirthday);
        priorDate.setDate(priorDate.getDate() - settings.daysPrior);

        if (priorDate > new Date()) {
          const priorMessage = settings.daysPrior === 1 
            ? `${name} has their birthday tomorrow! 🎉`
            : `${name} has their birthday in ${settings.daysPrior} days! 🎉`;

          PushNotification.localNotificationSchedule({
            id: `birthday-reminder-${birthday.id}`,
            title: 'Birthday Reminder',
            message: priorMessage,
            date: priorDate,
            repeatType: 'year',
            allowWhileIdle: true,
            channelId: 'birthday-reminders',
            userInfo: { birthdayId: birthday.id },
          });
        }
      }

      // Schedule birthday day notification
      if (nextBirthday > new Date()) {
        PushNotification.localNotificationSchedule({
          id: `birthday-today-${birthday.id}`,
          title: 'Birthday Today! 🎂',
          message: `Wohooo! Today is ${name}'s birthday! 🎉`,
          date: nextBirthday,
          repeatType: 'year',
          allowWhileIdle: true,
          channelId: 'birthday-reminders',
          userInfo: { birthdayId: birthday.id },
        });
      }
    });
  };

  const getDaysPriorText = (days: number) => {
    switch (days) {
      case 0: return 'On birthday only';
      case 1: return '1 day before';
      default: return `${days} days before`;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    safeArea: {
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
      marginTop: 35,
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
      elevation: 1,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    settingLeft: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },
    settingDescription: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    settingValue: {
      fontSize: 16,
      color: colors.primary,
      fontWeight: '600',
    },
    daysPriorContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 10,
      marginBottom: 10,
    },
    daysPriorButton: {
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderRadius: 8,
      minWidth: 60,
      alignItems: 'center',
    },
    daysPriorButtonActive: {
      backgroundColor: colors.primary,
    },
    daysPriorButtonInactive: {
      backgroundColor: colors.background,
    },
    daysPriorText: {
      fontSize: 14,
      fontWeight: '600',
    },
    daysPriorTextActive: {
      color: colors.surface,
    },
    daysPriorTextInactive: {
      color: colors.textSecondary,
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
      elevation: 1,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
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
      elevation: 1,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    statsText: {
      fontSize: 16,
      color: colors.text,
      textAlign: 'center',
      marginBottom: 5,
    },
    disabledOverlay: {
      opacity: 0.5,
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notification Settings</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notification Preferences</Text>
            
            {/* Enable/Disable Notifications */}
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingTitle}>Enable Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive birthday reminders
                </Text>
              </View>
              <Switch
                value={settings.enabled}
                onValueChange={(value) => updateSetting('enabled', value)}
                trackColor={{ false: colors.border, true: colors.primary + '40' }}
                thumbColor={settings.enabled ? colors.primary : colors.textSecondary}
              />
            </View>

            <View style={[!settings.enabled && styles.disabledOverlay]}>
              {/* Notification Time */}
              <TouchableOpacity 
                style={styles.settingRow}
                onPress={() => settings.enabled && setShowTimePicker(true)}
                disabled={!settings.enabled}
              >
                <View style={styles.settingLeft}>
                  <Text style={styles.settingTitle}>Notification Time</Text>
                  <Text style={styles.settingDescription}>
                    When to send birthday reminders
                  </Text>
                </View>
                <Text style={styles.settingValue}>{settings.time}</Text>
              </TouchableOpacity>

              {/* Days Prior Selection */}
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Text style={styles.settingTitle}>Reminder Timing</Text>
                  <Text style={styles.settingDescription}>
                    When to send the reminder
                  </Text>
                </View>
              </View>
              
              <View style={styles.daysPriorContainer}>
                {[0, 1, 2, 3, 4].map((days) => (
                  <TouchableOpacity
                    key={days}
                    style={[
                      styles.daysPriorButton,
                      settings.daysPrior === days 
                        ? styles.daysPriorButtonActive 
                        : styles.daysPriorButtonInactive
                    ]}
                    onPress={() => settings.enabled && updateSetting('daysPrior', days)}
                    disabled={!settings.enabled}
                  >
                    <Text style={[
                      styles.daysPriorText,
                      settings.daysPrior === days 
                        ? styles.daysPriorTextActive 
                        : styles.daysPriorTextInactive
                    ]}>
                      {days === 0 ? 'Same day' : `${days}d`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

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
              <Text style={styles.statsText}>
                Reminders: {getDaysPriorText(settings.daysPrior)} at {settings.time}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Scheduled Notifications</Text>
            
            {scheduledNotifications.length === 0 ? (
              <View style={styles.notificationItem}>
                <Text style={styles.notificationTitle}>No notifications scheduled</Text>
                <Text style={styles.notificationDate}>
                  {settings.enabled 
                    ? "Notifications will be scheduled automatically when you add birthdays"
                    : "Enable notifications to schedule birthday reminders"
                  }
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

        {/* Time Picker Modal */}
      </View>
    </SafeAreaView>
  );
};

export default NotificationSettingsScreen;