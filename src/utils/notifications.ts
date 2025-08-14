import { Platform, Alert, PermissionsAndroid } from 'react-native';
import PushNotification, { Importance } from 'react-native-push-notification';

export const configureNotifications = async () => {
  try {
    // Request permissions for Android 13+
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: 'Notification Permission',
          message: 'This app needs notification permission to send birthday reminders.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Notification permission denied');
        return false;
      }
    }

    // Configure push notifications
    PushNotification.configure({
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });

    // Create notification channel for Android
    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: 'birthday-reminders',
          channelName: 'Birthday Reminders',
          channelDescription: 'Notifications for upcoming birthdays',
          playSound: true,
          soundName: 'default',
          importance: Importance.HIGH,
          vibrate: true,
        },
        (created) => console.log(`Notification channel created: ${created}`)
      );
    }
    
    return true;
  } catch (error) {
    console.error('Error configuring notifications:', error);
    return false;
  }
};

export const requestNotificationPermissions = async () => {
  if (Platform.OS === 'ios') {
    return new Promise((resolve) => {
      PushNotification.requestPermissions(['alert', 'badge', 'sound']).then(
        (data) => {
          resolve(data.alert || data.badge || data.sound);
        }
      );
    });
  }
  return true;
};

export const showTestNotification = () => {
  PushNotification.localNotification({
    title: 'Test Notification',
    message: 'This is a test birthday reminder!',
    channelId: 'birthday-reminders',
  });
};