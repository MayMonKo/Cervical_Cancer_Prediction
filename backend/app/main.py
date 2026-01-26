# ================================
# IMPORT REQUIRED LIBRARIES
# ================================

# FastAPI is the framework that turns Python into a web API
from fastapi import FastAPI, HTTPException

# CORS middleware allows frontend (Vercel) to talk to backend (Render)
from fastapi.middleware.cors import CORSMiddleware

# Pydantic is used to validate incoming JSON data
from pydantic import BaseModel

# joblib is used to load trained ML models
import joblib


# ================================
# CREATE FASTAPI APPLICATION
# ================================

# This creates the API application
# Once this runs, your backend becomes a web server
app = FastAPI(
    title="Cervical Cancer Prediction API",
    description="Predict cervical cancer risk using SVM and Decision Tree models",
    version="1.0"
)


# ================================
# ENABLE CORS (SECURITY + FRONTEND ACCESS)
# ================================

# Without this, your React app (Vercel) CANNOT call this API
# For FYP, allowing all origins is acceptable
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # Allow requests from any frontend
    allow_methods=["*"],      # Allow GET, POST, etc.
    allow_headers=["*"],      # Allow all headers
)


# ================================
# LOAD TRAINED MODEL ARTIFACTS
# ================================

# ---- Load SVM Model ----
# These files were created in Task A2 from your notebook
svm_model = joblib.load("model_store/svm/model.pkl")
svm_scaler = joblib.load("model_store/svm/scaler.pkl")
svm_features = joblib.load("model_store/svm/features.pkl")

# ---- Load Decision Tree Model ----
dt_model = joblib.load("model_store/dt/model.pkl")
dt_features = joblib.load("model_store/dt/features.pkl")


# ================================
# DEFINE INPUT DATA FORMAT
# ================================

# This class defines how incoming JSON should look
# FastAPI + Pydantic automatically validate this
class PredictRequest(BaseModel):
    data: dict   # Example: {"Age": 30, "Smokes": 0, ...}


# ================================
# HELPER FUNCTION
# ================================

def build_feature_vector(input_data: dict, feature_list: list):
    """
    This function:
    1. Checks if any required feature is missing
    2. Arranges values in the SAME ORDER used during training
    """

    # Check for missing features
    missing = [f for f in feature_list if f not in input_data]

    if missing:
        # If features are missing, return HTTP error
        raise HTTPException(
            status_code=400,
            detail=f"Missing features: {missing}"
        )

    # Return feature values in correct order
    return [input_data[f] for f in feature_list]


# ================================
# HEALTH CHECK ENDPOINT
# ================================

@app.get("/")
def health_check():
    """
    Simple endpoint to check if API is running
    """
    return {"status": "API is running successfully"}


# ================================
# SVM PREDICTION ENDPOINT
# ================================

@app.post("/predict/svm")
def predict_svm(request: PredictRequest):
    """
    Uses the trained SVM model to make predictions
    """

    # Build feature vector in correct order
    x = build_feature_vector(request.data, svm_features)

    # Apply scaling (IMPORTANT for SVM)
    x_scaled = svm_scaler.transform([x])

    # Make prediction
    prediction = svm_model.predict(x_scaled)[0]

    return {
        "model": "SVM",
        "prediction": int(prediction)
    }


# ================================
# DECISION TREE PREDICTION ENDPOINT
# ================================

@app.post("/predict/dt")
def predict_dt(request: PredictRequest):
    """
    Uses the trained Decision Tree model to make predictions
    """

    # Build feature vector in correct order
    x = build_feature_vector(request.data, dt_features)

    # Decision Tree does NOT require scaling
    prediction = dt_model.predict([x])[0]

    return {
        "model": "Decision Tree",
        "prediction": int(prediction)
    }
