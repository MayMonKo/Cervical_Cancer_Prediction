# Frontend Web Application — Cervical Cancer Risk Check

This frontend application provides a user-friendly interface for collecting medical indicators and displaying cervical cancer risk predictions in real time.

---

## Responsibilities

- Collect user input through an intuitive form
- Validate user selections before submission
- Communicate with the backend API securely
- Display prediction results clearly and responsibly
- Handle loading and error states gracefully

---

## Technologies Used

- React
- Vite
- JavaScript (ES6+)
- HTML5 / CSS3
- Deployed on Vercel

---

## Application Flow

1. User selects medical indicators via checkboxes
2. Frontend constructs a JSON payload
3. Payload is sent to the backend API over HTTPS
4. Prediction result is received and displayed
5. No user data is stored locally or remotely

---

## Environment Configuration

The backend API URL is configured using environment variables:

VITE_API_BASE_URL=https://<render-backend-url>


This ensures:
- No hardcoded secrets
- Safe deployment across environments
- Secure integration with cloud services

---

## UX & Design Principles

- Clear medical disclaimers
- Minimalistic and accessible layout
- Visual feedback for selected inputs
- Disabled actions during API requests
- Responsive design for different screen sizes

---

## Interview Notes

The frontend demonstrates:
- Clean React component design
- Secure API consumption
- Real-world deployment practices
- User-centric interface for sensitive data
