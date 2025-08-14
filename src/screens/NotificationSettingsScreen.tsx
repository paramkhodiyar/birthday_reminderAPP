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
import DatePicker from 'react-native-date-picker';
import { useTheme } from '../context/ThemeContext';
import NotificationService, { NotificationSettings } from '../services/NotificationService';
import { useBirthday } from '../context/BirthdayContext';

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
      const currentSettings = await NotificationService.getSettings();
      setSettings(currentSettings);
      
      // Set temp time for picker
      const [hours, minutes] = currentSettings.time.split(':').map(Number);
      const timeDate = new Date();
      timeDate.setHours(hours, minutes, 0, 0);
      setTempTime(timeDate);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadScheduledNotifications = async () => {
    try {
      const notifications = await NotificationService.getScheduledNotifications();
      setScheduledNotifications(notifications);
    } catch (error) {
      console.error('Error loading scheduled notifications:', error);
    }
  };

  const updateSetting = async (key: keyof NotificationSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await NotificationService.updateSettings({ [key]: value });
    
    // Update all notifications when settings change
    if (key === 'enabled' || key === 'time' || key === 'daysPrior') {
      await NotificationService.updateAllBirthdayNotifications(birthdays);
      await loadScheduledNotifications();
    }
  };

  const handleTimeConfirm = async (selectedTime: Date) => {
    const timeString = `${selectedTime.getHours().toString().padStart(2, '0')}:${selectedTime.getMinutes().toString().padStart(2, '0')}`;
    await updateSetting('time', timeString);
    setShowTimePicker(false);
  };

  const testNotification = () => {
    NotificationService.showTestNotification();
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
      await NotificationService.updateAllBirthdayNotifications(birthdays);
      await loadScheduledNotifications();
      Alert.alert('Success', 'All birthday notifications have been rescheduled!');
    } catch (error) {
      Alert.alert('Error', 'Failed to reschedule notifications');
    }
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
        <Modal
          visible={showTimePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowTimePicker(false)}
        >
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}>
            <View style={{
              backgroundColor: colors.surface,
              borderRadius: 20,
              padding: 20,
              alignItems: 'center',
              minWidth: 300,
            }}>
              <Text style={{
                fontSize: 18,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 20
              }}>
                Select Notification Time
              </Text>
              
              <DatePicker
                date={tempTime}
                onDateChange={setTempTime}
                mode="time"
                textColor={colors.text}
                style={{ height: 200 }}
              />
              
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                width: '100%',
                marginTop: 20
              }}>
                <TouchableOpacity
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 30,
                    borderRadius: 8,
                    backgroundColor: colors.textSecondary + '20'
                  }}
                  onPress={() => setShowTimePicker(false)}
                >
                  <Text style={{
                    color: colors.textSecondary,
                    fontSize: 16,
                    fontWeight: '600'
                  }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 30,
                    borderRadius: 8,
                    backgroundColor: colors.primary
                  }}
                  onPress={() => handleTimeConfirm(tempTime)}
                >
                  <Text style={{
                    color: colors.surface,
                    fontSize: 16,
                    fontWeight: '600'
                  }}>
                    Confirm
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default NotificationSettingsScreen;