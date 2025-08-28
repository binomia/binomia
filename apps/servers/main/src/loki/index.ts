import axios from "axios";

// Your Grafana Cloud Loki credentials
const LOKI_USERNAME = "1148112"; // something like `123456`
const LOKI_PASSWORD = "glc_eyJvIjoiMTM2NzA2MyIsIm4iOiJzdGFjay0xMTkwMzEzLWhsLXdyaXRlLWJpbm9taWEiLCJrIjoib1AyMzc4VjhISmEyNzk2c0ZWcXM2WHRZIiwibSI6eyJyIjoicHJvZC11cy1lYXN0LTAifX0=";
const LOKI_URL = "https://logs-prod-036.grafana.net/loki/api/v1/push";
// Replace <region> with your Grafana Cloud region, e.g. "us-central1"


class Loki {
    static push = async (message: string, labels: Record<string, string>) => {
        try {
            const streams = [
                {
                    stream: labels,
                    values: [
                        [
                            (Date.now() * 1_000_000).toString(), // Loki expects nanosecond timestamp
                            message,
                        ],
                    ],
                },
            ];

            const res = await axios.post(
                LOKI_URL,
                { streams },
                {
                    auth: {
                        username: LOKI_USERNAME,
                        password: LOKI_PASSWORD,
                    },
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            console.log("Log sent:", res.data);
        } catch (err: any) {
            console.error("Error pushing log:", err.response?.data || err.message);
        }
    }
}