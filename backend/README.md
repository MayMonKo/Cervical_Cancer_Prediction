# Backend API — Cervical Cancer Prediction

This backend service provides machine learning inference capabilities through a RESTful API. It is responsible for validating input data, enforcing security controls, and executing predictions using pre-trained models.

---

## Responsibilities

- Expose prediction endpoints for ML models
- Validate and preprocess incoming JSON requests
- Perform in-memory machine learning inference
- Enforce security measures (CORS, rate limiting)
- Return prediction results in a structured format

---

## Technologies Used

- Python
- FastAPI
- Pydantic (data validation)
- Scikit-learn
- joblib
- SlowAPI (rate limiting)

---

## API Endpoints

### Health Check

GET/

Returns API status to confirm deployment health.

---

### SVM Prediction
POST /predict/svm

- Accepts JSON input containing medical indicators
- Applies feature scaling
- Returns binary risk prediction

---

### Decision Tree Prediction

POST /predict/dt

- Accepts JSON input containing medical indicators
- Performs direct inference
- Returns binary risk prediction

---

## Security Measures

### CORS Protection
Only approved frontend origins are allowed to access the API, preventing unauthorized browser-based requests.

### Rate Limiting
Prediction endpoints are rate-limited (e.g., 10 requests per minute per IP) to prevent abuse, spam, and denial-of-service attacks.

### Stateless Design
- No user data is stored
- All inference is performed in memory
- Enhances privacy and compliance for medical data handling

---

## Model Loading Strategy

- Models are loaded once at application startup
- Artifacts include:
  - Trained model
  - Feature list
  - Scaler (for SVM)
- This minimizes inference latency and improves performance
