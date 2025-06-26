import json
import os
import uuid
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from jsonrpc import JSONRPCResponseManager, dispatcher
from starlette.requests import Request
from starlette.responses import JSONResponse
import uvicorn
from src.controllers.TransactionController import TransactionController
import src.methods


app = FastAPI()

# Allow CORS for frontend clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@dispatcher.add_method
def test():
    try:
        data = [[[0, 0, 15, 0, 0, 0, 0]]]

        load_last_transaction = TransactionController.retrain_model(data)
        return str(load_last_transaction)

    except Exception as e:
        print(f"Error processing transaction: {e}")
        return False


# JSON-RPC Handler
@app.post("/")
async def json_rpc_handler(request: Request):
    try:
        request_data = await request.json()
        response = JSONRPCResponseManager.handle(json.dumps(request_data), dispatcher)

        # Convert JSON response string to a dictionary
        response_dict = json.loads(response.json)
        response_dict["id"] = str(uuid.uuid4()).replace("-", "")

        return JSONResponse(content=response_dict)

    except Exception as e:
        print(json.loads(str(e)))
        return JSONResponse(content={"error": str(e)}, status_code=400)


# Run server using: uvicorn json_rpc_server:app --host 0.0.0.0 --port 8000
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8004, reload=True)
