import numpy as np
import json
import os
import joblib
from pyod.models.iforest import IForest
from collections import deque


# Define file paths
FRAUD_FILE = f"{os.getcwd()}/datasets/fraud_transactions.json"
VALID_FILE = f"{os.getcwd()}/datasets/valid_transactions.json"
TEST_FILE = f"{os.getcwd()}/datasets/test_transactions.json"
MODEL_PATH = f"{os.getcwd()}/datasets/fraud_model.pkl"
DATA_PATH = f"{os.getcwd()}/datasets/training_data.npy"
BATCH_UPDATE_SIZE = 100  # Retrain model after 100 new transactions

# Transaction buffer (stores transactions before retraining)
transaction_buffer = deque(maxlen=BATCH_UPDATE_SIZE)


class TransactionController:
    @staticmethod
    def extract_features(transaction):
        """
        Extract numerical features from a transaction for fraud detection.
        """
        return [
            transaction["speed"],
            transaction["distance"],
            transaction["amount"],
            transaction["currency"],
            (
                1
                if transaction["transactionType"]
                in ["transfer", "withdrawal", "crypto"]
                else 0
            ),
            (1 if transaction["platform"] in ["ios", "android", "web"] else 0),
            1 if transaction["status"] == "pending" else 0,
        ]

    @staticmethod
    def load_model():
        """
        Loads the trained model if it exists; otherwise, trains a new one.
        """
        if os.path.exists(MODEL_PATH):
            print("✅ Loading existing fraud detection model...")
            return joblib.load(MODEL_PATH)

        print("⚠️ No existing model found. Training a new one...")
        return TransactionController.train_fraud_detection()

    @staticmethod
    def train_fraud_detection():
        try:
            """
            Loads training data, trains a fraud detection model, and saves it.
            """

            print("🔄 Training model...")
            if not os.path.exists(DATA_PATH):
                print("❌ No training data found! Training from scratch...")
                fraud_features = TransactionController.load_transactions(FRAUD_FILE)
                valid_features = TransactionController.load_transactions(VALID_FILE)

                if fraud_features.size == 0 or valid_features.size == 0:
                    print("❌ Error: Cannot train model. Ensure datasets exist.")
                    return None

                X_train = np.vstack((fraud_features, valid_features))
                np.save(DATA_PATH, X_train)
            else:

                print("✅ Loading existing training data...")

                X_train = np.load(DATA_PATH)

            print(f"🔄 Training model on {len(X_train)} transactions...")

            model = IForest(contamination=0.02)
            model.fit(X_train)

            joblib.dump(model, MODEL_PATH)
            print(f"✅ Model trained and saved as {MODEL_PATH}")

            return model

        except Exception as e:
            print(f"Error training model: {e}")
            return None

    @staticmethod
    def load_transactions(file_path):
        """
        Loads transactions from a JSON file and extracts features.
        """
        if not os.path.exists(file_path):
            print(f"❌ Error: File {file_path} not found!")
            return np.array([])

        with open(file_path, "r") as file:
            transactions = json.load(file)

        features = [TransactionController.extract_features(tx) for tx in transactions]

        return np.array(features, dtype=np.float32)

    @staticmethod
    def retrain_model(features):
        """
        Updates the model by training it with a new feature array
        and merging it with previously trained data.

        Parameters:
            new_data (list of lists): A new batch of transaction features.
            Each transaction is nested inside another list.
        """
        # Flatten the nested structure (convert [[x]] → [x])
        new_data = np.array([item[0] for item in features], dtype=np.float32)

        if new_data.ndim != 2:
            raise ValueError("Expected a 2D feature array after flattening.")

        print(f"🔄 Updating model with {len(new_data)} new transactions...")

        # Load previous training data (if exists)
        if os.path.exists(DATA_PATH):
            try:
                X_train = np.load(DATA_PATH)
                if X_train.ndim != 2:
                    raise ValueError("Corrupted training data format.")

            except Exception as e:
                print(f"⚠️ Failed to load training data: {e}. Reinitializing dataset.")
                X_train = np.empty((0, new_data.shape[1]), dtype=np.float32)
        else:
            X_train = np.empty((0, new_data.shape[1]), dtype=np.float32)

        # Merge new data with previous training data
        X_train = np.vstack((X_train, new_data))

        # Retrain the model
        model = IForest(contamination=0.02)
        model.fit(X_train)

        # Save updated model & training data
        try:
            joblib.dump(model, MODEL_PATH)
            np.save(DATA_PATH, X_train)
            print(f"✅ Model updated with {len(X_train)} total transactions.")

        except Exception as e:
            print(f"⚠️ Error saving model or data: {e}")
            return

    @staticmethod
    def load_last_transaction():
        """Loads the last transaction (features & label) stored in the .npy file."""
        if not os.path.exists(DATA_PATH):
            print("⚠️ No training data file found!")
            return None, None

        # Load training data (X_train and y_train should be saved together)
        data = np.load(DATA_PATH, allow_pickle=True)

        if data.size == 0:
            print("⚠️ Training data is empty.")
            return None, None

        # Split into features (X_train) and labels (y_train)
        X_train, y_train = data[:, :-1], data[:, -1]

        # Retrieve last transaction's features and label
        last_transaction = X_train[-1]  # Last row (latest transaction features)
        last_label = y_train[-1]  # Last row's label (fraud or not fraud)

        # print(f"✅ Last transaction loaded: {last_transaction}")
        # print(f"✅ Corresponding label: {last_label}")

        last_features = last_transaction.tolist()
        last_features.append(float(last_label))

        return [last_features]

    @staticmethod
    def process_transaction(features, model):
        """
        Processes a single transaction, determines fraud, and stores it for future retraining.
        """
        reshaped_features = np.array(features).reshape(1, -1)
        score = model.decision_function(reshaped_features)[0]
        is_fraud = model.predict(reshaped_features)[0] == 1

        last_transaction_features = TransactionController.load_last_transaction()

        result = {
            "fraud_score": round(float(score), 2),
            "is_fraud": bool(is_fraud),
            "features": [[round(float(i), 2) for i in reshaped_features.tolist()[0]]],
            "last_transaction_features": last_transaction_features,
        } 

        # Add transaction to buffer for retraining
        transaction_buffer.append(reshaped_features.flatten())

        # # Update model if needed
        # TransactionController.update_model()
        return result
