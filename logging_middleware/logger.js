// logging_middleware/logger.js

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
                // Added "Bearer " before the token!
                "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJhZGFyc2hraXJhbjEzQGdtYWlsLmNvbSIsImV4cCI6MTc4MDYzNzcxNywiaWF0IjoxNzgwNjM2ODE3LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiNzgwODJlYjUtZDU0MS00OTA0LWJhNmItZDVmNzY5ZDFhNzM2IiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoiYWRhcnNoIGtpcmFuIHRhcHBpdGEiLCJzdWIiOiI3MzVjZTg0MS1lZWJhLTQzZGQtYTA5NC1mYWRjY2JhODVmYTAifSwiZW1haWwiOiJhZGFyc2hraXJhbjEzQGdtYWlsLmNvbSIsIm5hbWUiOiJhZGFyc2gga2lyYW4gdGFwcGl0YSIsInJvbGxObyI6IjIzYnExYTA1MDIiLCJhY2Nlc3NDb2RlIjoiUVFkRVl5IiwiY2xpZW50SUQiOiI3MzVjZTg0MS1lZWJhLTQzZGQtYTA5NC1mYWRjY2JhODVmYTAiLCJjbGllbnRTZWNyZXQiOiJtUnhjWGp4WHpheFhLaFZ3In0.IZ5ZaNLtdiByJQdmdnb4smFVrvJJ3l1Xkn2NZ79SjWo.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJhZGFyc2hraXJhbjEzQGdtYWlsLmNvbSIsImV4cCI6MTc4MDYzNTY2MiwiaWF0IjoxNzgwNjM0NzYyLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiYWIwYjJmMGYtOTZkZS00NDliLWExNWMtNjZjNGJiZjE4MTIyIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoiYWRhcnNoIGtpcmFuIHRhcHBpdGEiLCJzdWIiOiI3MzVjZTg0MS1lZWJhLTQzZGQtYTA5NC1mYWRjY2JhODVmYTAifSwiZW1haWwiOiJhZGFyc2hraXJhbjEzQGdtYWlsLmNvbSIsIm5hbWUiOiJhZGFyc2gga2lyYW4gdGFwcGl0YSIsInJvbGxObyI6IjIzYnExYTA1MDIiLCJhY2Nlc3NDb2RlIjoiUVFkRVl5IiwiY2xpZW50SUQiOiI3MzVjZTg0MS1lZWJhLTQzZGQtYTA5NC1mYWRjY2JhODVmYTAiLCJjbGllbnRTZWNyZXQiOiJtUnhjWGp4WHpheFhLaFZ3In0.ySCb1C9RUE8xW9R3OBr9HqVH6Hv0elOQJ9srf31oF_g` 
            },
            // Fixed the "paayload" typo!
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
