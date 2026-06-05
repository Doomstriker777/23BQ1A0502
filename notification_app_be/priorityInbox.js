// notification_app_be/priorityInbox.js

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
                "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJhZGFyc2hraXJhbjEzQGdtYWlsLmNvbSIsImV4cCI6MTc4MDYzODY5MiwiaWF0IjoxNzgwNjM3NzkyLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiMzgyZDAyYjgtNDk0NS00YmU1LThkNmYtMmEzYjIxMmY4NzI4IiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoiYWRhcnNoIGtpcmFuIHRhcHBpdGEiLCJzdWIiOiI3MzVjZTg0MS1lZWJhLTQzZGQtYTA5NC1mYWRjY2JhODVmYTAifSwiZW1haWwiOiJhZGFyc2hraXJhbjEzQGdtYWlsLmNvbSIsIm5hbWUiOiJhZGFyc2gga2lyYW4gdGFwcGl0YSIsInJvbGxObyI6IjIzYnExYTA1MDIiLCJhY2Nlc3NDb2RlIjoiUVFkRVl5IiwiY2xpZW50SUQiOiI3MzVjZTg0MS1lZWJhLTQzZGQtYTA5NC1mYWRjY2JhODVmYTAiLCJjbGllbnRTZWNyZXQiOiJtUnhjWGp4WHpheFhLaFZ3In0.9x4RbjLWVOGK0pK51T280BRYmbm91rsvjTx-fEZNwSM"
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
