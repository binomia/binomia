import json
import random
import os
from faker import Faker
from tqdm import tqdm

# Initialize Faker for generating realistic data
fake = Faker()

# Number of fraudulent transactions
NUM_TRANSACTIONS = 10_000
OUTPUT_FILE = "./datasets/fraud_transactions.json"

# Fraudulent indicators with extreme patterns
fraudulent_ips = [
    "192.168.99.99",
    "10.10.99.99",
    "172.16.99.99",
    "222.222.222.222",
    "250.250.250.250",
]
fraudulent_devices = [
    "DEVICE-FAKE-123",
    "DEVICE-99999999",
    "DEVICE-HACKER-007",
    "DEVICE-UNKNOWN",
    "DEVICE-SPOOFED",
]
fraudulent_locations = [
    {"latitude": 51.5074, "longitude": -0.1278, "fullArea": "Westminster, London"},
    {"latitude": 35.6895, "longitude": 139.6917, "fullArea": "Shinjuku, Tokyo"},
    {"latitude": -33.8688, "longitude": 151.2093, "fullArea": "Sydney, Australia"},
    {"latitude": 55.7558, "longitude": 37.6173, "fullArea": "Moscow, Russia"},
    {"latitude": 40.7128, "longitude": -74.0060, "fullArea": "Manhattan, NY"},
    {"latitude": 34.0522, "longitude": -118.2437, "fullArea": "Los Angeles, CA"},
]


def generate_fraudulent_transaction():
    """Generates a single fraudulent transaction with optimized fraud patterns."""

    fraud_type = random.choice(
        ["fast fraud", "slow fraud", "high voided", "multiple devices"]
    )

    if fraud_type == "fast fraud":
        # Fast, local fraud - Speed is very high, distance is normal
        speed = round(random.uniform(300, 1200), 2)
        distance = round(random.uniform(5, 50), 2)
    elif fraud_type == "slow fraud":
        # Slow, international fraud - Distance is extremely high, speed is low
        speed = round(random.uniform(1, 20), 2)
        distance = round(random.uniform(5000, 50000), 2)
    elif fraud_type == "high voided":
        # Transactions with a high percentage of voided amounts
        speed = round(random.uniform(50, 200), 2)
        distance = round(random.uniform(50, 500), 2)
    else:
        # Fraudulent activity with multiple device switches
        speed = round(random.uniform(100, 500), 2)
        distance = round(random.uniform(100, 1000), 2)

    return {
        "transactionId": fake.uuid4(),
        "amount": round(random.uniform(5000, 100000), 2),  # Large transaction amounts
        "deliveredAmount": round(random.uniform(1000, 95000), 2),
        "voidedAmount": round(
            (
                random.uniform(500, 10000)
                if fraud_type == "high voided"
                else random.uniform(100, 2000)
            ),
            2,
        ),  # High voided for some cases
        "transactionType": random.choice(
            ["transfer", "withdrawal", "payment", "loan", "crypto", "currency_exchange"]
        ),
        "currency": random.choice(
            ["USD", "EUR", "BTC", "ETH", "JPY"]
        ),  # Random currencies
        "status": random.choice(
            ["pending", "failed", "reversed", "flagged"]
        ),  # More failure-related statuses
        "location": random.choice(fraudulent_locations),  # Sudden location changes
        "senderFullName": fake.name(),
        "receiverFullName": fake.name(),
        "deviceId": (
            random.choice(fraudulent_devices)
            if fraud_type == "multiple devices"
            else f"DEVICE-{random.randint(10000000,99999999)}"
        ),
        "ipAddress": random.choice(fraudulent_ips),
        "isRecurring": random.choice([True, False]),
        "platform": random.choice(["iOS", "Android", "Web", "Windows", "Mac"]),
        "sessionId": fake.uuid4(),
        "previousBalance": round(random.uniform(100, 50000), 2),
        "speed": speed,  # Based on fraud type
        "distance": distance,  # Based on fraud type
        "fraudScore": round(
            random.uniform(0.8, 1.0), 2
        ),  # Higher fraud score for better filtering
    }


def generate_fraudulent_transaction_file():
    """Generates fraudulent transactions and saves them to a JSON file."""
    if os.path.exists(OUTPUT_FILE):
        print(
            f"⚠️ File {OUTPUT_FILE} already exists. Delete it if you want to regenerate."
        )
        return

    print(f"🚀 Generating {NUM_TRANSACTIONS} optimized fraudulent transactions...")

    transactions = [
        generate_fraudulent_transaction()
        for _ in tqdm(range(NUM_TRANSACTIONS), desc="Generating fraud transactions")
    ]

    # Save to JSON file
    with open(OUTPUT_FILE, "w") as f:
        json.dump(transactions, f, indent=4)

    print(f"✅ Fraudulent transactions saved in {OUTPUT_FILE}")


if __name__ == "__main__":
    generate_fraudulent_transaction_file()
