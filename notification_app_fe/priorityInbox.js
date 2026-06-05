// notification_app_fe/priorityInbox.js

// Helper function to assign weight based on notification type
const getWeight = (notificationType) => {
    if (notificationType === "Placement") {
        return 3;
    } else if (notificationType === "Result") {
        return 2;
    } else if (notificationType === "Event") {
        return 1;
    }
    return 0; // Default for unknown types
};

// Main async function to fetch and sort notifications
const getTopNotifications = async () => {
    const url = "http://4.224.186.213/evaluation-service/notifications";
    
    try {
        // Fetch notifications from the API
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer YOUR_TOKEN_HERE"
            }
        });

        // Check if the response is ok
        if (!response.ok) {
            console.error("Failed to fetch notifications. Status:", response.status);
            return;
        }

        // Parse the JSON response
        const data = await response.json();
        const notifications = data.notifications;

        // Check if notifications array exists
        if (!Array.isArray(notifications)) {
            console.error("Notifications is not an array");
            return;
        }

        // Sort notifications by weight (descending) and then by timestamp (newest first)
        const sortedNotifications = notifications.sort((a, b) => {
            // Get weights for both notifications
            const weightA = getWeight(a.type);
            const weightB = getWeight(b.type);

            // Compare weights first (higher weight comes first)
            if (weightA !== weightB) {
                return weightB - weightA;
            }

            // If weights are equal, compare timestamps (newest first)
            const dateA = new Date(a.timestamp);
            const dateB = new Date(b.timestamp);
            return dateB - dateA;
        });

        // Get the top 10 notifications
        const topTen = sortedNotifications.slice(0, 10);

        // Print to console
        console.log("\n=== TOP 10 NOTIFICATIONS (Sorted by Priority) ===\n");
        console.log(JSON.stringify(topTen, null, 2));
        console.log("\n=== END OF NOTIFICATIONS ===\n");

    } catch (error) {
        console.error("Error fetching notifications:", error);
    }
};

// Call the function
getTopNotifications();
