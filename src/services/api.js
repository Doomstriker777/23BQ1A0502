// src/services/api.js

export const fetchNotifications = async (token, options = {}) => {
    const { limit = 10, page = 1, notification_type = null } = options;
    
    // Build the base URL
    let url = "http://4.224.186.213/evaluation-service/notifications";
    
    // Add query parameters
    const params = new URLSearchParams();
    params.append("limit", limit);
    params.append("page", page);
    
    if (notification_type) {
        params.append("notification_type", notification_type);
    }
    
    url += "?" + params.toString();
    
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching notifications:", error);
        throw error;
    }
};
