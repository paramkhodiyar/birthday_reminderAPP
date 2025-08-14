// src/services/NotificationService.ts
import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Birthday } from '../context/BirthdayContext';

export interface NotificationSettings {
  enabled: boolean;
  time: string; // Format: "HH:MM"
  daysPrior: number; // 0-4 days
}

class NotificationService {
  private static instance: NotificationService;
  private settings: NotificationSettings = {
    enabled: true,
    time: "09:00",
    daysPrior: 1
  };

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public async initialize(): Promise<void> {
    try {
      // Load settings from storage
      await this.loadSettings();

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
        return new Promise((resolve) => {
          PushNotification.requestPermissions(['alert', 'badge', 'sound']).then(
            (data) => {
              resolve(data.alert || data.badge || data.sound);
            }
          );
        });
      }
      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  public async getSettings(): Promise<NotificationSettings> {
    await this.loadSettings();
    return this.settings;
  }

  public async updateSettings(newSettings: Partial<NotificationSettings>): Promise<void> {
    this.settings = { ...this.settings, ...newSettings };
    await this.saveSettings();
  }

  private async loadSettings(): Promise<void> {
    try {
      const savedSettings = await AsyncStorage.getItem('notificationSettings');
      if (savedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  }

  private async saveSettings(): Promise<void> {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }

  public async scheduleBirthdayNotifications(birthday: Birthday): Promise<void> {
    if (!this.settings.enabled) {
      return;
    }

    try {
      // Cancel existing notifications for this birthday
      this.cancelBirthdayNotifications(birthday.id);

      const { name, dateOfBirth } = birthday;
      const birthDate = new Date(dateOfBirth);
      const currentYear = new Date().getFullYear();
      
      // Calculate next birthday
      let nextBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
      if (nextBirthday < new Date()) {
        nextBirthday = new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate());
      }

      // Set the notification time
      const [hours, minutes] = this.settings.time.split(':').map(Number);
      nextBirthday.setHours(hours, minutes, 0, 0);

      // Schedule prior notification if daysPrior > 0
      if (this.settings.daysPrior > 0) {
        const priorDate = new Date(nextBirthday);
        priorDate.setDate(priorDate.getDate() - this.settings.daysPrior);

        if (priorDate > new Date()) {
          const priorMessage = this.settings.daysPrior === 1 
            ? `${name} has their birthday tomorrow! 🎉`
            : `${name} has their birthday in ${this.settings.daysPrior} days! 🎉`;

          this.scheduleNotification(
            `birthday-reminder-${birthday.id}`,
            'Birthday Reminder',
            priorMessage,
            priorDate,
            birthday.id
          );
        }
      }

      // Schedule birthday day notification
      if (nextBirthday > new Date()) {
        this.scheduleNotification(
          `birthday-today-${birthday.id}`,
          'Birthday Today! 🎂',
          `Wohooo! Today is ${name}'s birthday! 🎉`,
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
      try {
        PushNotification.getScheduledLocalNotifications((notifications) => {
          resolve(notifications || []);
        });
      } catch (error) {
        console.error('Error getting scheduled notifications:', error);
        resolve([]);
      }
    });
  }

  public showTestNotification(): void {
    try {
      const testMessage = this.settings.daysPrior === 0 
        ? "Wohooo! Today is John's birthday! 🎉"
        : this.settings.daysPrior === 1
        ? "John has their birthday tomorrow! 🎉"
        : `John has their birthday in ${this.settings.daysPrior} days! 🎉`;

      PushNotification.localNotification({
        title: this.settings.daysPrior === 0 ? 'Birthday Today! 🎂' : 'Birthday Reminder',
        message: testMessage,
        channelId: 'birthday-reminders',
      });
    } catch (error) {
      console.error('Error showing test notification:', error);
    }
  }

  public async updateAllBirthdayNotifications(birthdays: Birthday[]): Promise<void> {
    if (!this.settings.enabled) {
      this.cancelAllNotifications();
      return;
    }

    try {
      this.cancelAllNotifications();
      for (const birthday of birthdays) {
        await this.scheduleBirthdayNotifications(birthday);
      }
    } catch (error) {
      console.error('Error updating all birthday notifications:', error);
    }
  }
}

export default NotificationService.getInstance();