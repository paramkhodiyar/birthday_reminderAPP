// src/services/NotificationService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';
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
      await this.loadSettings();
      console.log('Notification service initialized');
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  public async requestPermissions(): Promise<boolean> {
    try {
      // For now, we'll assume permissions are granted
      // In a real implementation, you would request actual permissions here
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
      console.log(`Scheduling notifications for ${birthday.name}'s birthday`);
      // In a real implementation, you would schedule actual notifications here
      // For now, we'll just log the scheduling
      
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

      // Log what would be scheduled
      if (this.settings.daysPrior > 0) {
        const priorDate = new Date(nextBirthday);
        priorDate.setDate(priorDate.getDate() - this.settings.daysPrior);

        if (priorDate > new Date()) {
          const priorMessage = this.settings.daysPrior === 1 
            ? `${name} has their birthday tomorrow! 🎉`
            : `${name} has their birthday in ${this.settings.daysPrior} days! 🎉`;

          console.log(`Would schedule reminder: "${priorMessage}" for ${priorDate.toLocaleString()}`);
        }
      }

      // Log birthday day notification
      if (nextBirthday > new Date()) {
        console.log(`Would schedule birthday notification: "Wohooo! Today is ${name}'s birthday! 🎉" for ${nextBirthday.toLocaleString()}`);
      }

    } catch (error) {
      console.error('Error scheduling birthday notifications:', error);
    }
  }

  public cancelBirthdayNotifications(birthdayId: string): void {
    try {
      console.log(`Would cancel notifications for birthday ID: ${birthdayId}`);
      // In a real implementation, you would cancel actual notifications here
    } catch (error) {
      console.error('Error canceling birthday notifications:', error);
    }
  }

  public cancelAllNotifications(): void {
    try {
      console.log('Would cancel all notifications');
      // In a real implementation, you would cancel all notifications here
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  public getScheduledNotifications(): Promise<any[]> {
    return new Promise((resolve) => {
      try {
        // In a real implementation, you would return actual scheduled notifications
        // For now, return mock data based on settings
        const mockNotifications = this.settings.enabled ? [
          {
            id: 'mock-1',
            title: 'Birthday Reminder',
            message: 'John has their birthday tomorrow! 🎉',
            date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'mock-2',
            title: 'Birthday Today! 🎂',
            message: 'Wohooo! Today is Jane\'s birthday! 🎉',
            date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          }
        ] : [];
        
        resolve(mockNotifications);
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

      const title = this.settings.daysPrior === 0 ? 'Birthday Today! 🎂' : 'Birthday Reminder';
      
      Alert.alert(
        title,
        testMessage,
        [{ text: 'OK' }]
      );
      
      console.log(`Test notification: ${title} - ${testMessage}`);
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