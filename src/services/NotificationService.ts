import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';
import { Birthday } from '../types/Birthday';

class NotificationService {
  private static instance: NotificationService;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public initialize(): void {
    if (this.isInitialized) return;

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
          importance: 4,
          vibrate: true,
        },
        (created) => console.log(`Channel created: ${created}`)
      );
    }

    this.isInitialized = true;
  }

  public requestPermissions(): Promise<boolean> {
    return new Promise((resolve) => {
      if (Platform.OS === 'ios') {
        PushNotification.requestPermissions(['alert', 'badge', 'sound']).then(
          (permissions) => {
            const hasPermissions = permissions.alert && permissions.badge && permissions.sound;
            resolve(hasPermissions);
          }
        );
      } else {
        // Android permissions are handled in the manifest
        resolve(true);
      }
    });
  }

  public scheduleBirthdayNotifications(birthday: Birthday): void {
    try {
      // Cancel any existing notifications for this birthday
      this.cancelBirthdayNotifications(birthday.id);

      const { name, dateOfBirth } = birthday;
      const birthDate = new Date(dateOfBirth);
      const currentYear = new Date().getFullYear();
      
      // Calculate next birthday
      let nextBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
      if (nextBirthday < new Date()) {
        nextBirthday = new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate());
      }

      // Schedule notification 3 days before
      const threeDaysBefore = new Date(nextBirthday);
      threeDaysBefore.setDate(threeDaysBefore.getDate() - 3);

      // Only schedule if the date is in the future
      if (threeDaysBefore > new Date()) {
        this.scheduleNotification(
          `birthday-reminder-${birthday.id}`,
          `${name} has their birthday in 3 days! 🎉`,
          `Don't forget to wish ${name} a happy birthday!`,
          threeDaysBefore,
          birthday.id
        );
      }

      // Schedule notification on the actual birthday
      if (nextBirthday > new Date()) {
        this.scheduleNotification(
          `birthday-today-${birthday.id}`,
          `🎂 Today is ${name}'s birthday! 🎉`,
          `Wish ${name} a wonderful birthday!`,
          nextBirthday,
          birthday.id
        );
      }

      console.log(`Scheduled notifications for ${name}'s birthday`);
    } catch (error) {
      console.error('Error scheduling birthday notifications:', error);
    }
  }

  public cancelBirthdayNotifications(birthdayId: string): void {
    try {
      // Cancel reminder notification
      PushNotification.cancelLocalNotification(`birthday-reminder-${birthdayId}`);
      // Cancel birthday notification
      PushNotification.cancelLocalNotification(`birthday-today-${birthdayId}`);
    } catch (error) {
      console.error('Error canceling birthday notifications:', error);
    }
  }

  public cancelAllNotifications(): void {
    try {
      PushNotification.cancelAllLocalNotifications();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  public getScheduledNotifications(): Promise<any[]> {
    return new Promise((resolve) => {
      PushNotification.getScheduledLocalNotifications((notifications) => {
        resolve(notifications || []);
      });
    });
  }

  private scheduleNotification(
    id: string,
    title: string,
    message: string,
    date: Date,
    birthdayId: string
  ): void {
    const notificationDate = new Date(date);
    
    // Set time to 9:00 AM for better user experience
    notificationDate.setHours(9, 0, 0, 0);

    PushNotification.localNotificationSchedule({
      id: id,
      title: title,
      message: message,
      date: notificationDate,
      allowWhileIdle: true,
      channelId: 'birthday-reminders',
      userInfo: {
        birthdayId: birthdayId,
        type: 'birthday-reminder',
      },
      repeatType: 'year', // Repeat yearly
      number: 1, // Badge number
    });
  }

  public showTestNotification(): void {
    PushNotification.localNotification({
      title: 'Test Notification',
      message: 'This is a test notification from your birthday app!',
      channelId: 'birthday-reminders',
    });
  }

  public updateAllBirthdayNotifications(birthdays: Birthday[]): void {
    // Cancel all existing notifications
    this.cancelAllNotifications();
    
    // Schedule new notifications for all birthdays
    birthdays.forEach(birthday => {
      this.scheduleBirthdayNotifications(birthday);
    });
  }
}

export default NotificationService.getInstance();
