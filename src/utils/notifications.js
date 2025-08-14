// src/utils/notifications.js
import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';

export function configureNotifications() {
  PushNotification.configure({
    onNotification: function (notification) {
      // Handle notification tap if needed
    },
    requestPermissions: Platform.OS === 'ios',
  });

  // Android: create channel
  if (Platform.OS === 'android') {
    PushNotification.createChannel(
      {
        channelId: "birthday-channel",
        channelName: "Birthday Reminders",
        channelDescription: "Reminders for birthdays",
        importance: 4,
        vibrate: true,
      },
      (created) => {}
    );
  }
}

// Schedule a notification for a birthday (repeats yearly)
export function scheduleBirthdayNotification({ id, name, date }) {
  const now = new Date();
  let nextBirthday = new Date(date);
  nextBirthday.setFullYear(now.getFullYear());
  if (
    nextBirthday < now ||
    (nextBirthday.getDate() === now.getDate() && nextBirthday.getMonth() === now.getMonth() && now.getHours() >= 9)
  ) {
    nextBirthday.setFullYear(now.getFullYear() + 1);
  }
  nextBirthday.setHours(9, 0, 0, 0); // 9:00 AM

  PushNotification.localNotificationSchedule({
    id: String(id),
    channelId: "birthday-channel",
    title: "🎂 Birthday Reminder!",
    message: `It's ${name}'s birthday today!`,
    date: nextBirthday,
    allowWhileIdle: true,
    repeatType: 'year',
    userInfo: { id },
    data: { id },
  });
}

// Cancel a scheduled notification
export function cancelBirthdayNotification(id) {
  PushNotification.cancelLocalNotifications({ id: String(id) });
}
