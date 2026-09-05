import { useState } from "react";

function CodeConverter() {
  const [sourceLanguage, setSourceLanguage] = useState("Python");
  const [targetLanguage, setTargetLanguage] = useState("Java");
  const [sourceCode, setSourceCode] = useState("");
  const [convertedCode, setConvertedCode] = useState("");

  const handleConvert = () => {
    setConvertedCode(
      "// AI converted code will appear here.\n// AI integration will be added later."
    );
  };

  return (
    <div className="converter-page">
      <div className="converter-header">
        <div>
          <h1>Code Converter</h1>
          <p>Convert your code from one programming language to another using AI.</p>
        </div>
      </div>

      <div className="language-selection">
        <div className="language-box">
          <label>Source Language</label>
          <select
            value={sourceLanguage}
            onChange={(e) => setSourceLanguage(e.target.value)}
          >
            <option>Python</option>
            <option>Java</option>
            <option>C++</option>
            <option>JavaScript</option>
          </select>
        </div>

        <div className="arrow">→</div>

        <div className="language-box">
          <label>Target Language</label>
          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
          >
            <option>Java</option>
            <option>Python</option>
            <option>C++</option>
            <option>JavaScript</option>
          </select>
        </div>
      </div>

      <div className="code-editors">
        <div className="editor-card">
          <div className="editor-header">
            <span>Source Code</span>
            <span className="language-label">{sourceLanguage}</span>
          </div>

          <textarea
            value={sourceCode}
            onChange={(e) => setSourceCode(e.target.value)}
            placeholder={`Write or paste your ${sourceLanguage} code here...`}
          />
        </div>

        <div className="editor-card">
          <div className="editor-header">
            <span>Converted Code</span>
            <span className="language-label">{targetLanguage}</span>
          </div>

          <textarea
            value={convertedCode}
            readOnly
            placeholder="AI converted code will appear here..."
          />
        </div>
      </div>

      <div className="convert-section">
        <button className="convert-button" onClick={handleConvert}>
          ✨ Convert with AI
        </button>
      </div>

      <div className="ai-actions">
        <button>📖 Explain Code</button>
        <button>🐞 Debug Code</button>
        <button>⚡ Optimize Code</button>
        <button>🧪 Generate Test Cases</button>
      </div>
    </div>
  );
}

export default CodeConverter;