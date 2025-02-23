import json
import random
import os
from faker import Faker
from tqdm import tqdm

# Initialize Faker for generating realistic data
fake = Faker()

# Constants
NUM_TRANSACTIONS = 100
BATCH_SIZE = 100  # Process transactions in batches
OUTPUT_FILE = "./datasets/test_transactions.json"

# Typical transaction locations
valid_locations = [
    {"latitude": 40.7128, "longitude": -74.0060, "fullArea": "New York, USA"},
    {"latitude": 34.0522, "longitude": -118.2437, "fullArea": "Los Angeles, USA"},
    {"latitude": 48.8566, "longitude": 2.3522, "fullArea": "Paris, France"},
    {"latitude": 35.6895, "longitude": 139.6917, "fullArea": "Tokyo, Japan"},
    {"latitude": 51.5074, "longitude": -0.1278, "fullArea": "London, UK"},
    {"latitude": -33.8688, "longitude": 151.2093, "fullArea": "Sydney, Australia"},
]


def calculate_fraud_score(transaction_type, amount, speed, distance):
    """Determines a realistic fraud score based on transaction parameters."""
    base_score = 0.01  # Minimum fraud risk

    if transaction_type == "routine":
        base_score += random.uniform(0.01, 0.10)  # Very low risk
    elif transaction_type == "travel":
        base_score += random.uniform(
            0.10, 0.30
        )  # Slightly higher risk due to location changes
    elif transaction_type == "online_shopping":
        base_score += random.uniform(0.05, 0.20)  # Medium risk
    elif transaction_type == "atm_withdrawal":
        base_score += random.uniform(0.01, 0.15)  # Low-moderate risk

    # Adjust score based on extreme values
    if amount > 5000:
        base_score += 0.10  # Higher amounts are riskier
    if speed > 500:
        base_score += 0.15  # Unusual speeds increase risk
    if distance > 5000:
        base_score += 0.20  # Large location jumps increase risk

    return round(min(base_score, 1.0), 2)  # Ensure max fraudScore is 1.0


def generate_valid_transaction():
    """Generates a single valid transaction with realistic fraud scoring."""

    transaction_type = random.choice(
        ["routine", "travel", "online_shopping", "atm_withdrawal"]
    )

    if transaction_type == "routine":
        speed = round(random.uniform(1, 50), 2)
        distance = round(random.uniform(1, 10), 2)
        amount = round(random.uniform(20, 500), 2)
    elif transaction_type == "travel":
        speed = round(random.uniform(5, 40), 2)
        distance = round(random.uniform(500, 2000), 2)
        amount = round(random.uniform(100, 3000), 2)
    elif transaction_type == "online_shopping":
        speed = round(random.uniform(20, 100), 2)
        distance = round(random.uniform(0.1, 5), 2)
        amount = round(random.uniform(10, 2000), 2)
    else:
        speed = round(random.uniform(5, 50), 2)
        distance = round(random.uniform(1, 20), 2)
        amount = round(random.uniform(20, 800), 2)

    fraud_score = calculate_fraud_score(transaction_type, amount, speed, distance)

    return {
        "transactionId": fake.uuid4(),
        "amount": amount,
        "deliveredAmount": round(
            amount * random.uniform(0.98, 1.0), 2
        ),  # Minor bank deductions
        "voidedAmount": 0.00,  # No voided transactions in valid dataset
        "transactionType": transaction_type,
        "currency": random.choice(
            ["USD", "EUR", "GBP", "JPY", "AUD"]
        ),  # Common currencies
        "status": random.choice(["completed", "pending"]),
        "location": random.choice(valid_locations),  # Normal location behavior
        "senderFullName": fake.name(),
        "receiverFullName": fake.name(),
        "deviceId": f"DEVICE-{random.randint(10000000,99999999)}",  # Regular device IDs
        "ipAddress": fake.ipv4(),  # Normal IP behavior
        "isRecurring": random.choice([True, False]),
        "platform": random.choice(["iOS", "Android", "Web", "Windows", "Mac"]),
        "sessionId": fake.uuid4(),
        "previousBalance": round(random.uniform(100, 50000), 2),
        "speed": speed,  # Based on transaction type
        "distance": distance,  # Based on transaction type
        "fraudScore": fraud_score,  # Realistic fraud risk score
    }


def generate_valid_transaction_file():
    """Generates 1,000,000 valid transactions in batches of 100,000 and saves them to a JSON file."""
    if os.path.exists(OUTPUT_FILE):
        print(
            f"⚠️ File {OUTPUT_FILE} already exists. Delete it if you want to regenerate."
        )
        return

    print(f"🚀 Generating {NUM_TRANSACTIONS} optimized valid transactions...")

    with open(OUTPUT_FILE, "w") as f:
        f.write("[\n")  # Start JSON array

        for batch_start in tqdm(
            range(0, NUM_TRANSACTIONS, BATCH_SIZE), desc="Generating valid transactions"
        ):
            batch_end = min(batch_start + BATCH_SIZE, NUM_TRANSACTIONS)
            transactions = [
                generate_valid_transaction() for _ in range(batch_end - batch_start)
            ]

            json.dump(transactions, f, indent=4)

            # Add a comma after each batch except the last one
            if batch_end < NUM_TRANSACTIONS:
                f.write(",\n")

        f.write("\n]")  # End JSON array

    print(f"✅ Valid transactions saved in {OUTPUT_FILE}")


if __name__ == "__main__":
    generate_valid_transaction_file()
