import { useEffect, useState } from 'react';
import { areNotificationsEnabled, getReminderTime, scheduleLocalNotification } from '../services/notificationService';

export const useReminders = () => {
    const [showUINotification, setShowUINotification] = useState(false);

    useEffect(() => {
        const checkReminder = () => {
            const now = new Date();
            const reminderTime = getReminderTime(); // format "HH:MM"
            if (!reminderTime) return;

            const [rHour, rMin] = reminderTime.split(':').map(Number);
            const isPastReminder =
                now.getHours() > rHour ||
                (now.getHours() === rHour && now.getMinutes() >= rMin);

            if (isPastReminder) {
                const lastNotified = localStorage.getItem('innerlytics_last_notified');
                const today = now.toISOString().split('T')[0];

                // If we haven't notified them today, show both UI and Browser notifications
                if (lastNotified !== today) {
                    setShowUINotification(true);

                    if (areNotificationsEnabled()) {
                        scheduleLocalNotification('Daily Reflection Time ✨', 'How are you feeling today? Take a quick moment for yourself.');
                    }

                    localStorage.setItem('innerlytics_last_notified', today);
                }
            }
        };

        // Check interval every 60 seconds
        const interval = setInterval(checkReminder, 60000);
        // Initial check on mount
        setTimeout(checkReminder, 2000);

        return () => clearInterval(interval);
    }, []);

    return { showUINotification, dismissNotification: () => setShowUINotification(false) };
};
