const REMINDER_KEY = 'innerlytics_reminder_time';
const ENABLED_KEY = 'innerlytics_notifications_enabled';

export const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) return false;
    const permission = await Notification.requestPermission();
    const enabled = permission === 'granted';
    localStorage.setItem(ENABLED_KEY, JSON.stringify(enabled));
    return enabled;
};

export const areNotificationsEnabled = (): boolean => {
    return JSON.parse(localStorage.getItem(ENABLED_KEY) || 'false') && Notification.permission === 'granted';
};

export const setReminderTime = (time: string) => {
    localStorage.setItem(REMINDER_KEY, time);
    // In a real app, this would register a Service Worker or schedule a push notification.
    // For this local version, we'll simulate the setting.
};

export const getReminderTime = (): string => {
    return localStorage.getItem(REMINDER_KEY) || '20:00';
};

export const scheduleLocalNotification = (title: string, body: string) => {
    if (areNotificationsEnabled()) {
        new Notification(title, { body, icon: '/favicon.ico' });
    }
};
