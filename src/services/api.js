// src/services/api.js

export const fetchNotifications = async (token, options = {}) => {
    // Build the base URL using Vite proxy
    let url = "/api/notifications";
    
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
