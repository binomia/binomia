from jsonrpc import dispatcher
import river.anomaly
import pickle
import os

from src.controllers.TransactionController import TransactionController


# Define the model storage file
MODEL_FILE = "fraud_model.pkl"

# Load the stored model or create a new one
if os.path.exists(MODEL_FILE):
    with open(MODEL_FILE, "rb") as f:
        fraud_model = pickle.load(f)
else:
    fraud_model = river.anomaly.HalfSpaceTrees(seed=42)  # Create a new model


@dispatcher.add_method
def detect_fraudulent_transaction(features: list):
    try:
        fraud_model = TransactionController.load_model()
        processed_transaction = TransactionController.process_transaction(features, fraud_model)

        return processed_transaction

    except Exception as e:
        print(f"Error processing transaction: {e}")
        return False


@dispatcher.add_method
def retrain_model(features: list):
    try:
        load_last_transaction = TransactionController.retrain_model(features)
        return str(load_last_transaction)

    except Exception as e:
        print(f"Error processing transaction: {e}")
        return False

# text :


@dispatcher.add_method
def add(a: int, b: int) -> int:
    return a + b
