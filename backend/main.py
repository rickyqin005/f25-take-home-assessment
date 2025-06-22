from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import uvicorn
from dotenv import load_dotenv
import os
import requests
import uuid

load_dotenv()
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")

app = FastAPI(title="Weather Data System", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for weather data
weather_storage: Dict[str, Dict[str, Any]] = {}

class WeatherRequest(BaseModel):
    date: str
    location: str
    notes: Optional[str] = ""

class WeatherResponse(BaseModel):
    id: str

@app.post("/weather", response_model=WeatherResponse)
async def create_weather_request(request: WeatherRequest):
    """
    Fetches WeatherStack API for the provided location
    Returns unique ID referencing weather data
    """
    if not WEATHER_API_KEY:
        raise HTTPException(status_code=500, detail="API Key Missing")
    
    response = requests.get("http://api.weatherstack.com/current", params={
        "access_key": WEATHER_API_KEY,
        "query": request.location
    })
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Weather API Error")
    
    combined_data = {
        **response.json(),
        "user_data": request
    }

    if "success" in combined_data and not combined_data["success"]:
        # usually caused by invalid or missing values
        if 605 <= combined_data["error"]["code"] and combined_data["error"]["code"] <= 624:
            raise HTTPException(status_code=400, detail="Weather API Error")
        raise HTTPException(status_code=500, detail="Internal Server Error")

    new_id = str(uuid.uuid4())
    weather_storage[new_id] = combined_data
    return { "id" : new_id }

@app.get("/weather/{weather_id}")
async def get_weather_data(weather_id: str):
    """
    Retrieve stored weather data by ID.
    This endpoint is already implemented for the assessment.
    """
    if weather_id not in weather_storage:
        raise HTTPException(status_code=404, detail="Weather data not found")
    
    return weather_storage[weather_id]


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)