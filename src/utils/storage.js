// src/utils/storage.js

const READ_NOTIFICATIONS_KEY = "readNotifications";

// Get all read notification IDs from localStorage
export const getReadNotifications = () => {
    const data = localStorage.getItem(READ_NOTIFICATIONS_KEY);
    return data ? JSON.parse(data) : [];
};

// Mark a notification as read
export const markAsRead = (notificationId) => {
    const readList = getReadNotifications();
    if (!readList.includes(notificationId)) {
        readList.push(notificationId);
        localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify(readList));
    }
};

// Check if a notification is read
export const isRead = (notificationId) => {
    const readList = getReadNotifications();
    return readList.includes(notificationId);
};

// Clear all read notifications (optional)
export const clearReadNotifications = () => {
    localStorage.removeItem(READ_NOTIFICATIONS_KEY);
};
