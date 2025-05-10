import json
import cv2
import numpy as np
from pinecone import Pinecone, ServerlessSpec
from insightface.app import FaceAnalysis
import requests
from uuid import uuid4
from collections import defaultdict


class FaceRecognitionController:
    def __init__(
        self,
        pinecone_api_key: str,
        index_name: str,
        cloud: str = "aws",
        region: str = "us-east-1",
    ):
        # Create Pinecone instance
        self.pc = Pinecone(api_key=pinecone_api_key)

        # Create or connect to the index
        self.index_name = index_name
        if self.index_name not in self.pc.list_indexes().names():
            self.pc.create_index(
                name=self.index_name,
                dimension=512,
                metric="cosine",
                spec=ServerlessSpec(cloud=cloud, region=region),
            )

        self.index = self.pc.Index(self.index_name)

        # Initialize InsightFace for face embedding extraction
        self.face_app = FaceAnalysis(
            name="buffalo_l", providers=["CPUExecutionProvider"]
        )
        self.face_app.prepare(ctx_id=0)

    def get_embedding(self, img_path: str) -> np.ndarray:
        try:
            if img_path.startswith("http://") or img_path.startswith("https://"):
                response = requests.get(img_path)
                if response.status_code != 200:
                    raise ValueError(f"Failed to fetch image from URL: {img_path}")
                image_array = np.frombuffer(response.content, np.uint8)
                img = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
            else:
                img = cv2.imread(img_path)

            if img is None:
                raise ValueError("Could not load image. Check the file path or URL.")

            faces = self.face_app.get(img)
            if not faces:
                raise ValueError("No face detected in image.")

            # This embedding is already based on the cropped and aligned face
            return faces[0].embedding

        except Exception as e:
            raise e

    def register_person(self, person_id: str, image_path: str):
        embedding = self.get_embedding(image_path)
        vector_id = f"{person_id}_{uuid4()}"
        self.index.upsert(
            vectors=[(vector_id, embedding.tolist(), {"person_id": person_id})]
        )

    def recognize_person(self, image_path: str):
        try:
            embedding = self.get_embedding(image_path)
            result = self.index.query(
                vector=embedding.tolist(), top_k=5, include_metadata=True
            )
            matches = result["matches"]

            if not matches:
                return None
                                  
            print(
                json.dumps(
                    {
                        "person_id": matches[0]["metadata"]["person_id"],
                        "score": matches[0]["score"],
                    },
                    indent=2,
                )
            )

            for match in matches:
                if round(match["score"], 2) >= 0.8:
                    return {
                        "person_id": match["metadata"]["person_id"],
                        "score": match["score"],
                    }

            return None

        except Exception as e:
            print(f"Error during recognition: {e}")
            raise e
