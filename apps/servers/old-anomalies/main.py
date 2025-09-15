import json
import os
import uuid
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from jsonrpc import dispatcher, JSONRPCResponseManager
from starlette.requests import Request
from starlette.responses import JSONResponse
from src.controllers.TransactionController import TransactionController
from starlette_prometheus import PrometheusMiddleware
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST

import multiprocessing
import subprocess
import src.methods
import uvicorn


PORT = 8003


os.environ["ORT_LOG_SEVERITY_LEVEL"] = "4"
app = FastAPI()

# Add prometheus middleware
app.add_middleware(PrometheusMiddleware)

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


# Create metrics endpoint manually
@app.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)


@app.get("/")
async def root():
    return {"message": "Hello World"}


# JSON-RPC Handler
@app.post("/")
async def json_rpc_handler(request: Request):
    try:
        request_data = await request.json()
        response = JSONRPCResponseManager.handle(
            json.dumps(request_data), dispatcher)

        # Convert JSON response string to a dictionary
        response_dict = json.loads(response.json)
        response_dict["id"] = str(uuid.uuid4()).replace("-", "")

        return JSONResponse(content=response_dict)

    except Exception as e:
        print(json.loads(str(e)))
        return JSONResponse(content={"error": str(e)}, status_code=400)


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)
