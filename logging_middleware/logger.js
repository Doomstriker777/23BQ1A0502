// logging_middleware/logger.js

let cachedToken = null;
let tokenExpiry = null;

const getLoggerToken = async () => {
    // Check if we have a valid token that hasn't expired (give it a 60s buffer)
    if (cachedToken && tokenExpiry && (Date.now() / 1000) < tokenExpiry - 60) {
        return cachedToken;
    }

    try {
        const response = await fetch("http://4.224.186.213/evaluation-service/auth", {
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
        cachedToken = data.access_token;
        tokenExpiry = data.expires_in;
        return cachedToken;
    } catch (err) {
        console.error("Logger auth failed:", err);
        return null;
    }
};

export const Log = async (stack, level, pkg, message) => {
    const token = await getLoggerToken();
    if (!token) {
        console.error("Cannot send log: authentication failed.");
        return;
    }

    const url = "http://4.224.186.213/evaluation-service/logs";
    const payload = {
        stack: stack,
        level: level,
        package: pkg,
        message: message
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Success! Log created with ID:", data.logID);
        } else {
            console.error("Failed to send log. Status:", response.status);
        }
    } catch (error) {
        console.error("Network error while sending log:", error);
    }
};

