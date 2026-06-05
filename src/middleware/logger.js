// src/middleware/logger.js

export const Log = async (stack, level, pkg, message) => {
    // 1. The API endpoint provided by Affordmed
    const url = "http://4.224.186.213/evaluation-service/logs";

    // 2. The data structure required by the API constraints
    const payload = {
        stack: stack,
        level: level,
        package: pkg,
        message: message
    };

    try {
        // 3. Making the POST request to the evaluation server
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // This is your protected route key!
                "Authorization": `Bearer YOUR_TOKEN_HERE` 
            },
            body: JSON.stringify(payload)
        });

        // 4. Checking if the server accepted it
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
