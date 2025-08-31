import onnx
import onnxruntime as ort

# disable logging
ort.set_default_logger_severity(4)

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
        self.pc = Pinecone(api_key=pinecone_api_key)
        self.index_name = index_name

        if self.index_name not in self.pc.list_indexes().names():
            self.pc.create_index(
                name=self.index_name,
                dimension=512,
                metric="cosine",
                spec=ServerlessSpec(cloud=cloud, region=region),
            )

        self.index = self.pc.Index(self.index_name)

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

            return faces[0].embedding

        except Exception as e:
            raise e

    def register_person(self, person_id: str, image_paths: list[str]):
        all_embeddings = []

        for path in image_paths:
            embedding = self.get_embedding(path)
            all_embeddings.append(embedding)

            # Save each individual vector
            vector_id = f"{person_id}_{uuid4()}"
            self.index.upsert(
                [
                    (
                        vector_id,
                        embedding.tolist(),
                        {"person_id": person_id, "type": "individual"},
                    )
                ]
            )

        # Calculate and store centroid vector
        centroid = np.mean(all_embeddings, axis=0)
        centroid_id = f"{person_id}_main"

        self.index.upsert(
            [
                (
                    centroid_id,
                    centroid.tolist(),
                    {"person_id": person_id, "type": "centroid"},
                )
            ]
        )

    def recognize_person(
        self, image_path: str, top_k: int = 10, threshold: float = 0.8
    ):
        try:
            embedding = self.get_embedding(image_path)
            result = self.index.query(
                vector=embedding.tolist(), top_k=top_k, include_metadata=True
            )
            matches = result["matches"]

            if not matches:
                return None
            
            person_best_score = {}

            for match in matches:
                person_id = match["metadata"]["person_id"]
                score = match["score"]
                
                print(f"Person ID: {person_id}, Score: {score}")
                
                if score >= threshold:
                    if (person_id not in person_best_score or score > person_best_score[person_id]):
                        person_best_score[person_id] = score

            if not person_best_score:
                return None

            # Return the best match overall
            best_person_id = max(person_best_score, key=person_best_score.get)
            best_score = person_best_score[best_person_id]

            return {"person_id": best_person_id, "score": best_score}

        except Exception as e:
            print(f"Error during recognition: {e}")
            raise e
