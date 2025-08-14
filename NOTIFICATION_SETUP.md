# Birthday App Notification System

## Overview

This birthday app includes a comprehensive notification system that automatically reminds users about upcoming birthdays. The system sends two types of notifications:

1. **3 Days Before Reminder**: "John has their birthday in 3 days! 🎉"
2. **Birthday Day Notification**: "🎂 Today is John's birthday! 🎉"

## Features

- ✅ Automatic notification scheduling when birthdays are added
- ✅ Notifications sent at 9:00 AM for better user experience
- ✅ Yearly recurring notifications
- ✅ Automatic cleanup when birthdays are removed
- ✅ Test notification functionality
- ✅ Notification management screen
- ✅ Cross-platform support (iOS & Android)

## How It Works

### 1. Notification Scheduling
When a birthday is added to the app:
- The system calculates the next birthday date
- Schedules a reminder notification 3 days before
- Schedules a birthday notification on the actual day
- Both notifications are set to repeat yearly

### 2. Notification Timing
- **Reminder**: 3 days before birthday at 9:00 AM
- **Birthday**: On the birthday at 9:00 AM
- Notifications are sent even when the app is closed

### 3. Automatic Management
- Notifications are automatically updated when birthdays are modified
- Notifications are cancelled when birthdays are deleted
- The system handles leap years and date calculations automatically

## Setup Instructions

### Prerequisites
Make sure you have the following packages installed:
```bash
npm install react-native-push-notification @react-native-community/push-notification-ios
```

### Android Setup

1. **Permissions**: The following permissions are automatically added to `android/app/src/main/AndroidManifest.xml`:
   ```xml
   <uses-permission android:name="android.permission.VIBRATE" />
   <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
   <uses-permission android:name="android.permission.WAKE_LOCK" />
   <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
   ```

2. **Notification Channel**: The app automatically creates a notification channel called "Birthday Reminders" with high importance.

### iOS Setup

1. **Permissions**: The app will request notification permissions when first launched.
2. **Background Modes**: No additional setup required.

## Testing Notifications

### 1. Test Button
- Navigate to the "Notifications" tab
- Tap "Test Notification" to send an immediate test notification

### 2. Test with Real Birthdays
- Add a birthday with a date that's within the next few days
- The system will automatically schedule notifications
- Check the "Scheduled Notifications" section to see scheduled notifications

### 3. View Scheduled Notifications
- Go to the "Notifications" tab
- Scroll down to see all scheduled notifications
- Each notification shows the title and scheduled time

## Notification Management

### Available Actions
- **Test Notification**: Send an immediate test notification
- **Refresh Notifications**: Update the list of scheduled notifications
- **Reschedule All Notifications**: Recreate all birthday notifications
- **Clear All Notifications**: Remove all scheduled notifications

### Automatic Actions
- **Add Birthday**: Automatically schedules notifications
- **Remove Birthday**: Automatically cancels related notifications
- **Update Birthday**: Automatically reschedules notifications

## Troubleshooting

### Notifications Not Appearing
1. Check if notification permissions are granted
2. Ensure the app has background app refresh enabled (iOS)
3. Check device notification settings
4. Verify the notification channel exists (Android)

### Permissions Denied
1. Go to device Settings > Apps > Birthday Calculator > Notifications
2. Enable all notification permissions
3. Restart the app

### Notifications Delayed
1. Check if battery optimization is enabled
2. Ensure the app is not restricted in background usage
3. Verify the device time and date are correct

## Technical Details

### Notification Service
- **File**: `src/services/NotificationService.ts`
- **Pattern**: Singleton pattern for global access
- **Storage**: Uses react-native-push-notification for scheduling

### Integration Points
- **BirthdayContext**: Automatically manages notifications when birthdays change
- **App.tsx**: Initializes notification service on app startup
- **NotificationSettingsScreen**: Provides user interface for notification management

### Notification IDs
- **Reminder**: `birthday-reminder-{birthdayId}`
- **Birthday**: `birthday-today-{birthdayId}`

## Best Practices

1. **Test on Real Devices**: Notifications may behave differently on simulators
2. **Check Permissions**: Always verify notification permissions are granted
3. **Monitor Background Behavior**: Ensure notifications work when the app is closed
4. **Handle Edge Cases**: The system automatically handles leap years and date changes

## Support

If you encounter issues with the notification system:
1. Check the console logs for error messages
2. Verify all required packages are installed
3. Test with the built-in test notification feature
4. Check device-specific notification settings
