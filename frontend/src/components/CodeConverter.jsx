import { useState } from "react";

function CodeConverter() {
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

  const [sourceLanguage, setSourceLanguage] = useState("Python");
  const [targetLanguage, setTargetLanguage] = useState("Java");
  const [sourceCode, setSourceCode] = useState("");
  const [convertedCode, setConvertedCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [aiResult, setAiResult] = useState("");
  const [aiAction, setAiAction] = useState("");

  // ================================
  // CONVERT CODE
  // ================================
  const handleConvert = async () => {
    setError("");
    setConvertedCode("");
    setAiResult("");
    setAiAction("");

    if (!sourceCode.trim()) {
      setError("Please enter some code to convert.");
      return;
    }

    if (sourceLanguage === targetLanguage) {
      setError(
        "Source and target languages cannot be the same."
      );
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
        "http://127.0.0.1:8000/translate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            source_code: sourceCode,
            source_language: sourceLanguage,
            target_language: targetLanguage,
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
          data.detail || "Code conversion failed."
        );
      }

      setConvertedCode(
        data.converted_code ||
          "// No converted code was returned."
      );

    } catch (err) {
      setError(
        err.message || "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // SWAP LANGUAGES
  // ================================
  const handleSwapLanguages = () => {
    const oldSource = sourceLanguage;

    setSourceLanguage(targetLanguage);
    setTargetLanguage(oldSource);

    setSourceCode(convertedCode);
    setConvertedCode(sourceCode);

    setAiResult("");
    setAiAction("");
    setError("");
  };

  // ================================
  // COMMON AI REQUEST
  // ================================
  const handleAIAction = async (action) => {
    setError("");
    setAiResult("");
    setAiAction(action);

    if (!sourceCode.trim()) {
      setError("Please enter some code first.");
      setAiAction("");
      return;
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("You are not logged in. Please login again.");
      setAiAction("");
      return;
    }

    setLoading(true);

    try {
      let endpoint = "";
      let body = {};

      // Explain Code
      if (action === "explain") {
        endpoint = "http://127.0.0.1:8000/explain";

        body = {
          code: sourceCode,
          language: sourceLanguage,
        };
      }

      // Debug Code
      if (action === "debug") {
        endpoint = "http://127.0.0.1:8000/debug";

        body = {
          code: sourceCode,
          language: sourceLanguage,
          error_message: "",
        };
      }

      // Optimize Code
      if (action === "optimize") {
        endpoint = "http://127.0.0.1:8000/optimize";

        body = {
          code: sourceCode,
          language: sourceLanguage,
        };
      }

      // Generate Test Cases
      if (action === "test") {
        endpoint = "http://127.0.0.1:8000/test-cases";

        body = {
          code: sourceCode,
          language: sourceLanguage,
        };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

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
          data.detail || "AI request failed."
        );
      }

      // ================================
      // EXPLAIN RESULT
      // ================================
      if (action === "explain") {
        let result = "";

        if (data.what_the_code_does) {
          result +=
            "WHAT THE CODE DOES\n\n" +
            data.what_the_code_does +
            "\n\n";
        }

        if (data.step_by_step) {
          result +=
            "STEP-BY-STEP EXPLANATION\n\n" +
            data.step_by_step +
            "\n\n";
        }

        if (data.important_concepts) {
          result +=
            "IMPORTANT CONCEPTS\n\n" +
            data.important_concepts +
            "\n\n";
        }

        if (data.expected_output) {
          result +=
            "EXPECTED OUTPUT\n\n" +
            data.expected_output +
            "\n\n";
        }

        if (data.possible_improvements) {
          result +=
            "POSSIBLE IMPROVEMENTS\n\n" +
            data.possible_improvements;
        }

        setAiResult(
          result || "No explanation was returned."
        );
      }

      // ================================
      // DEBUG RESULT
      // ================================
      if (action === "debug") {
        let result = "";

        if (data.corrected_code) {
          result +=
            "CORRECTED CODE\n\n" +
            data.corrected_code +
            "\n\n";
        }

        if (data.error_detected) {
          result +=
            "ERROR DETECTED\n\n" +
            data.error_detected +
            "\n\n";
        }

        if (data.explanation) {
          result +=
            "EXPLANATION\n\n" +
            data.explanation +
            "\n\n";
        }

        if (data.solution) {
          result +=
            "SOLUTION\n\n" +
            data.solution;
        }

        setAiResult(
          result || "No debugging result was returned."
        );
      }

      // ================================
      // OPTIMIZE RESULT
      // ================================
      if (action === "optimize") {
        setAiResult(
          data.optimized_code ||
            "No optimized code was returned."
        );
      }

      // ================================
      // TEST CASE RESULT
      // ================================
      if (action === "test") {
        setAiResult(
          data.test_cases ||
            "No test cases were generated."
        );
      }

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

      {/* Header */}
      <div className="converter-header">
        <div>
          <h1>Code Converter</h1>

          <p>
            Convert your code from one programming language
            to another using AI.
          </p>
        </div>
      </div>


      {/* Language Selection */}
      <div className="language-selection">

        {/* Source Language */}
        <div className="language-box">

          <label>Source Language</label>

          <select
            value={sourceLanguage}
            onChange={(e) =>
              setSourceLanguage(e.target.value)
            }
          >
            {languages.map((language) => (
              <option
                key={language}
                value={language}
              >
                {language}
              </option>
            ))}
          </select>

        </div>


        {/* Swap Button */}
        <button
          className="swap-button"
          onClick={handleSwapLanguages}
          title="Swap languages"
        >
          ⇄
        </button>


        {/* Target Language */}
        <div className="language-box">

          <label>Target Language</label>

          <select
            value={targetLanguage}
            onChange={(e) =>
              setTargetLanguage(e.target.value)
            }
          >
            {languages.map((language) => (
              <option
                key={language}
                value={language}
              >
                {language}
              </option>
            ))}
          </select>

        </div>

      </div>


      {/* Code Editors */}
      <div className="code-editors">

        {/* Source Code */}
        <div className="editor-card">

          <div className="editor-header">

            <span>Source Code</span>

            <span className="language-label">
              {sourceLanguage}
            </span>

          </div>

          <textarea
            value={sourceCode}
            onChange={(e) =>
              setSourceCode(e.target.value)
            }
            placeholder={`Write or paste your ${sourceLanguage} code here...`}
          />

        </div>


        {/* Converted Code */}
        <div className="editor-card">

          <div className="editor-header">

            <span>Converted Code</span>

            <span className="language-label">
              {targetLanguage}
            </span>

          </div>

          <textarea
            value={convertedCode}
            readOnly
            placeholder="AI converted code will appear here..."
          />

        </div>

      </div>


      {/* Error */}
      {error && (
        <div className="auth-error">
          {error}
        </div>
      )}


      {/* Convert Button */}
      <div className="convert-section">

        <button
          className="convert-button"
          onClick={handleConvert}
          disabled={loading}
        >
          {loading && !aiAction
            ? "⏳ Converting..."
            : "✨ Convert with AI"}
        </button>

      </div>


      {/* AI Actions */}
      <div className="ai-actions">

        <button
          onClick={() => handleAIAction("explain")}
          disabled={loading}
        >
          {loading && aiAction === "explain"
            ? "⏳ Explaining..."
            : "📖 Explain Code"}
        </button>


        <button
          onClick={() => handleAIAction("debug")}
          disabled={loading}
        >
          {loading && aiAction === "debug"
            ? "⏳ Debugging..."
            : "🐞 Debug Code"}
        </button>


        <button
          onClick={() => handleAIAction("optimize")}
          disabled={loading}
        >
          {loading && aiAction === "optimize"
            ? "⏳ Optimizing..."
            : "⚡ Optimize Code"}
        </button>


        <button
          onClick={() => handleAIAction("test")}
          disabled={loading}
        >
          {loading && aiAction === "test"
            ? "⏳ Generating..."
            : "🧪 Generate Test Cases"}
        </button>

      </div>


      {/* AI RESULT */}
      {aiResult && (
        <div className="ai-result-card">

          <div className="ai-result-header">
            <h2>
              {aiAction === "explain" &&
                "📖 Code Explanation"}

              {aiAction === "debug" &&
                "🐞 Debug Result"}

              {aiAction === "optimize" &&
                "⚡ Optimized Code"}

              {aiAction === "test" &&
                "🧪 Generated Test Cases"}
            </h2>
          </div>

          <pre className="ai-result-content">
            {aiResult}
          </pre>

        </div>
      )}

    </div>
  );
}

export default CodeConverter;