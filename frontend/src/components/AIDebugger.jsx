import { useState } from "react";

function AIDebugger() {
  const languages = [
    "Python",
    "Java",
    "C",
    "C++",
    "C#",
    "JavaScript",
    "TypeScript",
    "Go",
    "Rust",
    "PHP",
    "Ruby",
    "Kotlin",
    "Swift",
    "Dart",
    "SQL",
  ];

  const [language, setLanguage] = useState("Python");
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [debugResult, setDebugResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDebug = async () => {
    setError("");
    setDebugResult(null);

    if (!code.trim()) {
      setError("Please enter some code to debug.");
      return;
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("You are not logged in. Please login again.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/debug",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            code: code,
            language: language,
            error_message: errorMessage,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");

          throw new Error(
            "Your session has expired. Please login again."
          );
        }

        throw new Error(
          data.detail || "AI debugging failed."
        );
      }

      setDebugResult(data);
    } catch (err) {
      setError(
        err.message || "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="converter-page">

      <div className="converter-header">
        <div>
          <h1>AI Debugger</h1>
          <p>
            Find programming errors and get AI-powered solutions.
          </p>
        </div>
      </div>

      <div className="language-selection">
        <div className="language-box">
          <label>Programming Language</label>

          <select
            value={language}
            onChange={(e) =>
              setLanguage(e.target.value)
            }
          >
            {languages.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="code-editors">

        <div className="editor-card">
          <div className="editor-header">
            <span>Source Code</span>

            <span className="language-label">
              {language}
            </span>
          </div>

          <textarea
            value={code}
            onChange={(e) =>
              setCode(e.target.value)
            }
            placeholder={`Paste your ${language} code here...`}
          />

          <div className="error-input">
            <label>
              Error Message <span>(Optional)</span>
            </label>

            <textarea
              value={errorMessage}
              onChange={(e) =>
                setErrorMessage(e.target.value)
              }
              placeholder="Paste the error message here if you have one..."
              rows="4"
            />
          </div>
        </div>

        <div className="editor-card">
          <div className="editor-header">
            <span>Corrected Code</span>

            <span className="language-label">
              {language}
            </span>
          </div>

          <textarea
            value={debugResult?.corrected_code || ""}
            readOnly
            placeholder="AI corrected code will appear here..."
          />
        </div>

      </div>

      {error && (
        <div className="auth-error">
          {error}
        </div>
      )}

      {debugResult && (
        <div className="debug-result">

          <div className="debug-section">
            <h3>🔴 Error Detected</h3>
            <p>
              {debugResult.error_detected}
            </p>
          </div>

          <div className="debug-section">
            <h3>📖 Explanation</h3>
            <p>
              {debugResult.explanation}
            </p>
          </div>

          <div className="debug-section">
            <h3>💡 Suggested Solution</h3>
            <p>
              {debugResult.solution}
            </p>
          </div>

        </div>
      )}

      <div className="convert-section">
        <button
          className="convert-button"
          onClick={handleDebug}
          disabled={loading}
        >
          {loading
            ? "⏳ Debugging..."
            : "🐞 Debug with AI"}
        </button>
      </div>

    </div>
  );
}

export default AIDebugger;