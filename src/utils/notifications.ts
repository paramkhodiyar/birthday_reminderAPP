import { Platform, Alert } from 'react-native';
import NotificationService from '../services/NotificationService';

export const configureNotifications = async () => {
  try {
    // Initialize the notification service
    NotificationService.initialize();
    
    // Request permissions
    const hasPermissions = await NotificationService.requestPermissions();
    
    if (!hasPermissions) {
      Alert.alert(
        'Notification Permissions Required',
        'To receive birthday reminders, please enable notifications in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Settings', onPress: () => {
            // On iOS, this will open the app settings
            if (Platform.OS === 'ios') {
              // iOS will automatically open settings when permissions are denied
            }
          }}
        ]
      );
    }
    
    return hasPermissions;
  } catch (error) {
    console.error('Error configuring notifications:', error);
    return false;
  }
};

export const requestNotificationPermissions = async () => {
  return await NotificationService.requestPermissions();
};

export const showTestNotification = () => {
  NotificationService.showTestNotification();
};
