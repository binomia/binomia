from jsonrpc import dispatcher
from src.controllers.FaceRecognitionController import FaceRecognitionController


index_name = "face-recognition"
api_key = "pcsk_4mwQ1f_16K64Hjsxi1giCoALuLJcK7D8XMhvHZJEXi7QYQ9Z5F7j1Uszbj9DwiPc8Lzcvu"
environment = "us-east-1"

recognition = FaceRecognitionController(
    pinecone_api_key=api_key,
    index_name=index_name,
)


# text :
@dispatcher.add_method
def register_person(uuid: str, image_path: str):
    print("Adding face to the database...")
    return recognition.register_person(uuid, image_path)


@dispatcher.add_method
def recognize_person(image_path: str):
    print("Adding face to the database...")
    return recognition.recognize_person(image_path)
