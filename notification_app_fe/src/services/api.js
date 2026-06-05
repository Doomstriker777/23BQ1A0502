// src/services/api.js

export const getAuthToken = async () => {
    const cachedToken = localStorage.getItem("auth_token");
    const expiry = localStorage.getItem("auth_token_expiry");

    // Check if token exists and is not expired (unix epoch in seconds)
    if (cachedToken && expiry && (Date.now() / 1000) < Number(expiry) - 60) {
        return cachedToken;
    }

    try {
        const response = await fetch("/api/auth", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                companyName: "Afford Medical Technologies Private Limited",
                clientID: "735ce841-eeba-43dd-a094-fadccba85fa0",
                clientSecret: "mRxcXjxXzaxXKhVw",
                name: "adarsh kiran tappita",
                email: "adarshkiran13@gmail.com",
                rollNo: "23bq1a0502",
                accessCode: "QQdEYy"
            })
        });

        if (!response.ok) {
            throw new Error(`Auth failed with status ${response.status}`);
        }

        const data = await response.json();
        const token = data.access_token;
        const expiresAt = data.expires_in;

        localStorage.setItem("auth_token", token);
        localStorage.setItem("auth_token_expiry", String(expiresAt));
        return token;
    } catch (err) {
        console.error("Failed to authenticate frontend:", err);
        throw err;
    }
};

export const fetchNotifications = async (token, options = {}) => {
    // Build the base URL using Vite proxy
    let url = "/api/notifications";
    
    try {
        const resolvedToken = token || await getAuthToken();
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${resolvedToken}`
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

