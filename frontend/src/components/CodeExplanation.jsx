import { useState } from "react";

function CodeExplanation() {
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
  const [explanation, setExplanation] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleExplain = async () => {
    setError("");
    setExplanation(null);
    setCopied(false);

    if (!code.trim()) {
      setError("Please enter some code to explain.");
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
        "http://127.0.0.1:8000/explain",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            code: code,
            language: language,
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
          data.detail || "Code explanation failed."
        );
      }

      setExplanation(data.explanation);
    } catch (err) {
      setError(
        err.message || "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  const getExplanationText = () => {
    if (!explanation) {
      return "";
    }

    return `WHAT THE CODE DOES

${explanation.what_the_code_does}

STEP-BY-STEP

${explanation.step_by_step}

IMPORTANT CONCEPTS

${explanation.important_concepts}

EXPECTED OUTPUT

${explanation.expected_output}

POSSIBLE IMPROVEMENTS

${explanation.possible_improvements}`;
  };

  const handleCopy = async () => {
    if (!explanation) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        getExplanationText()
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setError("Unable to copy explanation.");
    }
  };

  const handleClear = () => {
    setCode("");
    setExplanation(null);
    setError("");
    setCopied(false);
  };

  return (
    <div className="explanation-page">

      <div className="explanation-header">
        <div>
          <h1>Code Explanation</h1>

          <p>
            Understand your code with an AI-powered explanation.
          </p>
        </div>
      </div>

      <div className="explanation-language">
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

      <div className="explanation-editors">

        {/* SOURCE CODE */}

        <div className="explanation-editor-card">

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

        </div>

        {/* AI EXPLANATION */}

        <div className="explanation-result-card">

          <div className="editor-header">
            <span>AI Explanation</span>

            <span className="language-label">
              AI
            </span>
          </div>

          {!explanation ? (
            <div className="explanation-placeholder">

              <div className="placeholder-icon">
                📖
              </div>

              <h3>AI Explanation</h3>

              <p>
                Your detailed code explanation
                will appear here.
              </p>

            </div>
          ) : (
            <div className="explanation-content">

              <section>
                <h3>💡 What the Code Does</h3>

                <p>
                  {explanation.what_the_code_does}
                </p>
              </section>

              <section>
                <h3>🔍 Step-by-Step</h3>

                <div className="explanation-text">
                  {explanation.step_by_step}
                </div>
              </section>

              <section>
                <h3>🧠 Important Concepts</h3>

                <div className="explanation-text">
                  {explanation.important_concepts}
                </div>
              </section>

              <section>
                <h3>📤 Expected Output</h3>

                <pre className="output-box">
                  {explanation.expected_output}
                </pre>
              </section>

              <section>
                <h3>✨ Possible Improvements</h3>

                <div className="explanation-text">
                  {explanation.possible_improvements}
                </div>
              </section>

            </div>
          )}

        </div>

      </div>

      {error && (
        <div className="auth-error">
          {error}
        </div>
      )}

      <div className="explanation-actions">

        <button
          className="convert-button"
          onClick={handleExplain}
          disabled={loading}
        >
          {loading
            ? "⏳ Analyzing..."
            : "📖 Explain Code"}
        </button>

        <button
          className="secondary-button"
          onClick={handleCopy}
          disabled={!explanation}
        >
          {copied
            ? "✓ Copied"
            : "📋 Copy Explanation"}
        </button>

        <button
          className="secondary-button"
          onClick={handleClear}
        >
          🗑 Clear
        </button>

      </div>

    </div>
  );
}

export default CodeExplanation;