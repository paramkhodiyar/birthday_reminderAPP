// src/services/NotificationService.ts
// Temporarily disabled due to package uninstallation
// Will be re-implemented with a compatible notification package later

/*
import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';
import { Birthday } from '../types/Birthday';

class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public initialize(): void {
    try {
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
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  public async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        const authStatus = await PushNotification.requestPermissions(['alert', 'badge', 'sound']);
        return authStatus === 'authorized';
      }
      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  public scheduleBirthdayNotifications(birthday: Birthday): void {
    try {
      this.cancelBirthdayNotifications(birthday.id);
      const { name, dateOfBirth } = birthday;
      const birthDate = new Date(dateOfBirth);
      const currentYear = new Date().getFullYear();
      let nextBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
      
      if (nextBirthday < new Date()) {
        nextBirthday = new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate());
      }

      const threeDaysBefore = new Date(nextBirthday);
      threeDaysBefore.setDate(threeDaysBefore.getDate() - 3);

      if (threeDaysBefore > new Date()) {
        this.scheduleNotification(
          `birthday-reminder-${birthday.id}`,
          `${name} has their birthday in 3 days! 🎉`,
          `Don't forget to wish ${name} a happy birthday!`,
          threeDaysBefore,
          birthday.id
        );
      }

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

  private scheduleNotification(
    id: string,
    title: string,
    message: string,
    date: Date,
    birthdayId: string
  ): void {
    try {
      PushNotification.localNotificationSchedule({
        id,
        title,
        message,
        date,
        repeatType: 'year',
        allowWhileIdle: true,
        channelId: 'birthday-reminders',
        userInfo: { birthdayId },
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  public cancelBirthdayNotifications(birthdayId: string): void {
    try {
      PushNotification.cancelLocalNotifications({ userInfo: { birthdayId } });
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

  public showTestNotification(): void {
    try {
      PushNotification.localNotification({
        title: 'Test Notification',
        message: 'This is a test notification from Birthday Calculator!',
        channelId: 'birthday-reminders',
      });
    } catch (error) {
      console.error('Error showing test notification:', error);
    }
  }

  public updateAllBirthdayNotifications(birthdays: Birthday[]): void {
    try {
      this.cancelAllNotifications();
      birthdays.forEach(birthday => {
        this.scheduleBirthdayNotifications(birthday);
      });
    } catch (error) {
      console.error('Error updating all birthday notifications:', error);
    }
  }
}

export default NotificationService.getInstance();
*/

// Placeholder export to prevent import errors
const NotificationService = {
  initialize: () => console.log('Notifications disabled'),
  requestPermissions: () => Promise.resolve(false),
  scheduleBirthdayNotifications: () => console.log('Notifications disabled'),
  cancelBirthdayNotifications: () => console.log('Notifications disabled'),
  cancelAllNotifications: () => console.log('Notifications disabled'),
  getScheduledNotifications: () => Promise.resolve([]),
  showTestNotification: () => console.log('Notifications disabled'),
  updateAllBirthdayNotifications: () => console.log('Notifications disabled'),
};

export default NotificationService;
