# Cervical Cancer Risk Prediction System

This project is a full-stack web-based machine learning application designed to estimate cervical cancer risk based on selected medical test indicators. The system integrates a modern frontend, a secure backend API, and pre-trained machine learning models to deliver real-time predictions through a browser interface.

⚠️ Disclaimer: This system is for educational and research purposes only. It is not a medical diagnostic tool and does not replace professional medical advice.

---

## System Overview

The application follows a client–server architecture with machine learning inference provided as a backend service.
You can try the system out at https://cervical-cancer-prediction.vercel.app/ 

- Users interact with a web-based frontend to input medical indicators.
- The frontend sends validated inputs to a backend API over HTTPS.
- The backend processes the request, applies security controls, and performs in-memory machine learning inference.
- Prediction results are returned to the frontend for display.

The complete system architecture is illustrated below.

![System Architecture](CC_SA.jpg)

---

## Technology Stack

### Frontend
- React (Vite)
- JavaScript
- HTML5 / CSS3
- Deployed on Vercel

### Backend
- FastAPI (Python)
- RESTful API design
- Rate limiting and CORS protection
- Deployed on Render

### Machine Learning
- Scikit-learn models
- Support Vector Machine (SVM)
- Decision Tree
- Model artifacts stored using `joblib`

---

## Key Features

- Real-time cervical cancer risk prediction
- Secure API communication using HTTPS
- Rate-limited prediction endpoints to prevent abuse
- No storage of user medical data (stateless design)
- Modular architecture for scalability and maintainability

---

## Deployment Architecture

- Frontend hosted on Vercel
- Backend hosted on Render
- Communication via JSON over HTTPS
- Environment variables used for configuration and security


## Repository Structure

