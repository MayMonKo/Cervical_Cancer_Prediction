# ================================
# IMPORT REQUIRED LIBRARIES
# ================================

# FastAPI: Web framework for building APIs
from fastapi import FastAPI, HTTPException, Request

# CORS: Allows frontend (Vercel) to communicate with backend (Render)
from fastapi.middleware.cors import CORSMiddleware

# Pydantic: Validates incoming JSON request bodies
from pydantic import BaseModel

# joblib: Loads trained machine learning models and artifacts
import joblib

# SlowAPI: Rate limiting to protect against abuse
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

# Used to return custom JSON error responses
from fastapi.responses import JSONResponse


# ================================
# INITIALIZE RATE LIMITER
# ================================

# Uses client IP address as the rate-limit key
limiter = Limiter(key_func=get_remote_address)


# ================================
# CREATE FASTAPI APPLICATION
# ================================

app = FastAPI(
    title="Cervical Cancer Prediction API",
    description="Predict cervical cancer risk using SVM and Decision Tree models",
    version="1.0"
)

# Attach limiter to the app state
app.state.limiter = limiter

# Enable rate-limiting middleware
app.add_middleware(SlowAPIMiddleware)


# ================================
# CONFIGURE CORS (SECURITY)
# ================================

# Only allow requests from known frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",                         # Local development
        "https://cervical-cancer-prediction.vercel.app"  # Production frontend
    ],
    allow_credentials=True,
    allow_methods=["POST"],
    allow_headers=["*"],
)


# ================================
# LOAD TRAINED MODEL ARTIFACTS
# ================================

# ---- SVM artifacts ----
svm_model = joblib.load("model_store/svm/model.pkl")
svm_scaler = joblib.load("model_store/svm/scaler.pkl")
svm_features = joblib.load("model_store/svm/features.pkl")

# ---- Decision Tree artifacts ----
dt_model = joblib.load("model_store/dt/model.pkl")
dt_features = joblib.load("model_store/dt/features.pkl")


# ================================
# REQUEST BODY SCHEMA
# ================================

class PredictRequest(BaseModel):
    """
    Expected input format from frontend.

    Example:
    {
        "data": {
            "STDs": 0,
            "Dx:Cancer": 0,
            ...
        }
    }
    """
    data: dict


# ================================
# HELPER FUNCTION
# ================================

def build_feature_vector(input_data: dict, feature_list: list):
    """
    Ensures:
    1. All required features are present
    2. Feature order matches training order exactly

    This is critical for correct ML predictions.
    """

    # Identify missing features
    missing_features = [f for f in feature_list if f not in input_data]

    if missing_features:
        raise HTTPException(
            status_code=400,
            detail=f"Missing features: {missing_features}"
        )

    # Return features in correct order
    return [input_data[f] for f in feature_list]


# ================================
# GLOBAL ERROR HANDLER (RATE LIMIT)
# ================================

@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Too many requests. Please try again later."}
    )


# ================================
# HEALTH CHECK ENDPOINT
# ================================

@app.get("/")
def health_check():
    """
    Simple endpoint used to verify that the API is running.
    """
    return {"status": "API is running successfully"}


# ================================
# SVM PREDICTION ENDPOINT
# ================================

@app.post("/predict/svm")
@limiter.limit("10/minute")
def predict_svm(request: Request, payload: PredictRequest):
    """
    Uses the trained Support Vector Machine (SVM) model
    to predict cervical cancer risk.
    """

    # Build ordered feature vector
    x = build_feature_vector(payload.data, svm_features)

    # Apply scaling (required for SVM)
    x_scaled = svm_scaler.transform([x])

    # Perform prediction
    prediction = svm_model.predict(x_scaled)[0]

    return {
        "model": "SVM",
        "prediction": int(prediction)
    }


# ================================
# DECISION TREE PREDICTION ENDPOINT
# ================================

@app.post("/predict/dt")
@limiter.limit("10/minute")
def predict_dt(request: Request, payload: PredictRequest):
    """
    Uses the trained Decision Tree model
    to predict cervical cancer risk.
    """

    # Build ordered feature vector
    x = build_feature_vector(payload.data, dt_features)

    # Decision Trees do NOT require scaling
    prediction = dt_model.predict([x])[0]

    return {
        "model": "Decision Tree",
        "prediction": int(prediction)
    }
