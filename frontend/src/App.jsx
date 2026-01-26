import { useEffect, useMemo, useState } from "react";
import "./App.css";

/**
 * ============================================================
 * Cervical Cancer Risk Check (Frontend)
 * ============================================================
 * What this page does (high-level):
 * 1) Shows 10 simple Yes/No questions (checkbox style)
 * 2) Lets user choose an "analysis method" (friendly labels)
 * 3) Sends the answers to your backend (Render FastAPI)
 * 4) Displays the prediction result + a confidence note
 *
 * IMPORTANT:
 * - The "analysis method" maps to backend endpoints:
 *   - Standard Medical Model  -> /predict/svm
 *   - Rule-Based Medical Model -> /predict/dt
 *
 * Why we do this mapping:
 * - Users don't need to see technical model names.
 * - You still keep both models available for evaluation/demo.
 */

// ✅ 1) PUT YOUR RENDER URL HERE (no trailing slash)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * These are the EXACT feature keys your backend requires.
 * You discovered them from features.pkl:
 * - STDs
 * - STDs:genital herpes
 * - STDs:HIV
 * - Dx:Cancer
 * - Dx:CIN
 * - Dx:HPV
 * - Dx
 * - Hinselmann
 * - Schiller
 * - Citology
 *
 * The left side (key) must match backend feature names EXACTLY.
 * The right side (label) is what the user sees (friendly wording).
 */
const QUESTIONS = [
  { key: "STDs", label: "Have you been diagnosed with any sexually transmitted disease (STD)?" },
  { key: "STDs:genital herpes", label: "Have you tested positive for genital herpes?" },
  { key: "STDs:HIV", label: "Have you tested positive for HIV?" },
  { key: "Dx:Cancer", label: "Have you ever been diagnosed with cervical cancer?" },
  { key: "Dx:CIN", label: "Have you been diagnosed with CIN (Cervical Intraepithelial Neoplasia)?" },
  { key: "Dx:HPV", label: "Have you tested positive for HPV?" },
  { key: "Dx", label: "Have you received any cervical diagnosis from a doctor?" },
  { key: "Hinselmann", label: "Was the Hinselmann test positive?" },
  { key: "Schiller", label: "Was the Schiller test positive?" },
  { key: "Citology", label: "Was the Cytology test positive?" },
];

/**
 * A friendly "analysis method" selector:
 * - value is what we use internally
 * - label is what user sees
 */
const ANALYSIS_METHODS = [
  { value: "svm", label: "Standard Medical Model (Recommended)" },
  { value: "dt", label: "Rule-Based Medical Model (Alternative)" },
];

/**
 * Helper function:
 * Builds an object like:
 * {
 *   "STDs": 0,
 *   "STDs:genital herpes": 0,
 *   ...
 * }
 *
 * Why we store answers as 0/1:
 * - backend expects numeric binary features
 * - easier to send as JSON
 */
function buildDefaultAnswers() {
  const initial = {};
  for (const q of QUESTIONS) {
    initial[q.key] = 0; // default: "No"
  }
  return initial;
}

export default function App() {
  /**
   * ============================================================
   * React State (useState)
   * ============================================================
   * useState is how React "remembers" values between renders.
   * When state changes, React re-renders the UI automatically.
   */

  // answers: object that stores Yes/No values (0/1) for every question
  const [answers, setAnswers] = useState(() => buildDefaultAnswers());

  // method: which model we use (svm or dt)
  const [method, setMethod] = useState("svm");

  // loading: used to disable button and show "checking..." while waiting for server
  const [loading, setLoading] = useState(false);

  // error: store any error message to show to the user
  const [error, setError] = useState("");

  // result: stores backend response (prediction + which model used)
  const [result, setResult] = useState(null);

  /**
   * ============================================================
   * useEffect (optional learning point)
   * ============================================================
   * useEffect runs AFTER React renders.
   * It's used for "side effects" such as:
   * - logging
   * - calling APIs automatically
   * - reacting to changes in state
   *
   * Here we use it only to clear old results when user changes method,
   * so the UI doesn't show outdated results.
   */
  useEffect(() => {
    setResult(null);
    setError("");
  }, [method]);

  /**
   * ============================================================
   * useMemo (optional learning point)
   * ============================================================
   * useMemo is used to compute something derived from state,
   * and only recompute when dependencies change.
   *
   * Here we compute how many "Yes" answers exist.
   * This is not required, but it helps user experience.
   */
  const yesCount = useMemo(() => {
    return Object.values(answers).reduce((sum, v) => sum + (v === 1 ? 1 : 0), 0);
  }, [answers]);

  /**
   * Toggle one answer from 0 -> 1 or 1 -> 0.
   * This gets called whenever user clicks a checkbox.
   */
  function toggleAnswer(featureKey) {
    setAnswers((prev) => {
      const next = { ...prev };
      next[featureKey] = prev[featureKey] === 1 ? 0 : 1;
      return next;
    });
  }

  /**
   * Reset all answers back to "No".
   * Useful for testing and user friendliness.
   */
  function resetForm() {
    setAnswers(buildDefaultAnswers());
    setResult(null);
    setError("");
  }

  /**
   * ============================================================
   * The main action: submit to backend
   * ============================================================
   * This sends:
   * POST {API_BASE_URL}/predict/svm  OR  /predict/dt
   * Body:
   * {
   *   "data": { ...answers }
   * }
   *
   * Then it reads JSON response and updates the UI.
   */
  async function handleCheckRisk() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Decide endpoint based on chosen analysis method
      const endpoint = method === "svm" ? "/predict/svm" : "/predict/dt";
      const url = `${API_BASE_URL}${endpoint}`;

      // Make the request using fetch (built-in browser tool)
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Accept header tells server we want JSON back (not mandatory but good practice)
          Accept: "application/json",
        },
        body: JSON.stringify({ data: answers }),
      });

      // If server responds with a non-200 code, handle it
      if (!response.ok) {
        // Try to read server JSON error (FastAPI returns {"detail": "..."} often)
        let detail = "Request failed. Please try again.";
        try {
          const errJson = await response.json();
          if (errJson?.detail) detail = typeof errJson.detail === "string" ? errJson.detail : JSON.stringify(errJson.detail);
        } catch {
          // ignore JSON parse errors
        }
        throw new Error(detail);
      }

      // Parse successful JSON response
      const data = await response.json();
      // Example: { "model": "SVM", "prediction": 0 }
      setResult(data);
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  /**
   * ============================================================
   * Interpreting prediction (user-friendly text)
   * ============================================================
   * prediction = 1 => "higher risk detected"
   * prediction = 0 => "lower risk detected"
   */
  const riskText =
    result?.prediction === 1
      ? "Higher risk detected"
      : result?.prediction === 0
      ? "Lower risk detected"
      : "";

  /**
   * Friendly "confidence note"
   * Since our backend returns only 0/1, we show an explanation note.
   * (If you later add probabilities from models, we can show real confidence.)
   */
  const confidenceNote =
    yesCount >= 6
      ? "Confidence: Higher (many positive indicators were selected)."
      : yesCount >= 3
      ? "Confidence: Moderate (some positive indicators were selected)."
      : "Confidence: Lower (few or no positive indicators were selected).";

  return (
    <div className="page">
      <div className="card">
        <h1 className="title">Cervical Cancer Risk Check</h1>
        <p className="subtitle">
          This tool estimates risk based on medical test indicators. It is not a diagnosis and does not replace professional medical advice.
        </p>

        {/* Analysis method selector */}
        <div className="section">
          <h2 className="sectionTitle">Choose analysis method</h2>

          <div className="row">
            <select
              className="select"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              aria-label="Choose analysis method"
            >
              {ANALYSIS_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            <div className="hint">
              {method === "svm"
                ? "Recommended for general use."
                : "Alternative method for comparison."}
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="section">
          <h2 className="sectionTitle">Answer the questions</h2>
          <p className="smallNote">Select “Yes” only if the indicator is confirmed/positive.</p>

          <div className="questions">
            {QUESTIONS.map((q) => {
              const checked = answers[q.key] === 1;
              return (
                <label key={q.key} className={`question ${checked ? "checked" : ""}`}>
                <div className="checkboxWrap">
                    <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleAnswer(q.key)}
                    />
                </div>

                <div className="textWrap">
                    <span className="questionText">{q.label}</span>
                </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="section actions">
          <button className="btn secondary" onClick={resetForm} disabled={loading}>
            Reset
          </button>

          <button className="btn primary" onClick={handleCheckRisk} disabled={loading}>
            {loading ? "Checking..." : "Check Risk"}
          </button>
        </div>

        {/* Result area */}
        <div className="section">
          {error && (
            <div className="alert error">
              <strong>Problem:</strong> {error}
            </div>
          )}

          {result && (
            <div className={`alert ${result.prediction === 1 ? "warn" : "ok"}`}>
              <div className="resultLine">
                <strong>Result:</strong> {riskText}
              </div>

              <div className="resultLine">{confidenceNote}</div>

              <div className="smallNote">
                Note: This is a model-based estimate. If you have concerns, please consult a healthcare professional.
              </div>
            </div>
          )}
        </div>

        {/* Small footer info */}
        <div className="footer">
          <span>Selected “Yes”: {yesCount} / {QUESTIONS.length}</span>
        </div>
      </div>
    </div>
  );
}
