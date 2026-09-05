import { useState } from "react";
import "./App.css";
import CodeConverter from "./components/CodeConverter";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");

  const menuItems = [
    { name: "Dashboard", icon: "⌂" },
    { name: "Code Converter", icon: "⇄" },
    { name: "Code Explanation", icon: "▤" },
    { name: "AI Debugger", icon: "🐞" },
    { name: "Conversion History", icon: "◷" },
    { name: "Saved Projects", icon: "▣" },
  ];

  const renderPage = () => {
  if (activePage === "Dashboard") {
    return (
      <>
        <header className="topbar">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome to CodeTranslate AI</p>
          </div>

          <div className="profile">
            <div className="avatar">U</div>
            <span>User</span>
          </div>
        </header>

        <section className="welcome-card">
          <div>
            <h2>Translate Your Code with AI</h2>

            <p>
              Convert, understand, debug and improve your code using
              artificial intelligence.
            </p>

            <button
              className="primary-button"
              onClick={() => setActivePage("Code Converter")}
            >
              Start Code Conversion →
            </button>
          </div>

          <div className="code-symbol">
            &lt;/&gt;
          </div>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <span className="stat-icon">⇄</span>
            <div>
              <h3>0</h3>
              <p>Total Conversions</p>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">▣</span>
            <div>
              <h3>0</h3>
              <p>Saved Projects</p>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">✓</span>
            <div>
              <h3>0</h3>
              <p>Successful Conversions</p>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">⚡</span>
            <div>
              <h3>0</h3>
              <p>AI Requests</p>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <div>
              <h2>AI Coding Tools</h2>
              <p>Choose a tool to get started</p>
            </div>
          </div>

          <div className="tools-grid">
            <div className="tool-card">
              <div className="tool-icon">⇄</div>
              <h3>Code Converter</h3>
              <p>
                Convert code from one programming language to another using
                AI.
              </p>
              <button
                onClick={() => setActivePage("Code Converter")}
              >
                Open Tool →
              </button>
            </div>

            <div className="tool-card">
              <div className="tool-icon">▤</div>
              <h3>Code Explanation</h3>
              <p>
                Understand complex code with AI-generated explanations.
              </p>
              <button
                onClick={() => setActivePage("Code Explanation")}
              >
                Open Tool →
              </button>
            </div>

            <div className="tool-card">
              <div className="tool-icon">🐞</div>
              <h3>AI Debugger</h3>
              <p>
                Find programming errors and get AI-powered solutions.
              </p>
              <button
                onClick={() => setActivePage("AI Debugger")}
              >
                Open Tool →
              </button>
            </div>

            <div className="tool-card">
              <div className="tool-icon">◷</div>
              <h3>Conversion History</h3>
              <p>
                View and manage your previous code conversion activities.
              </p>
              <button
                onClick={() => setActivePage("Conversion History")}
              >
                View History →
              </button>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (activePage === "Code Converter") {
    return <CodeConverter />;
  }

  return (
    <div className="placeholder-page">
      <h1>{activePage}</h1>
      <p>
        This module will be implemented in the next development phase.
      </p>

      <div className="placeholder-box">
        <span>🚀</span>
        <h2>Coming Soon</h2>
        <p>
          We are building this module as part of CodeTranslate AI.
        </p>
      </div>
    </div>
  );
};

  return (
    <div className="app">

      {/* Sidebar */}
      <aside className="sidebar">

        <div className="logo">
          <span className="logo-icon">&lt;/&gt;</span>
          <span>CodeTranslate AI</span>
        </div>

        <nav className="navigation">

          {menuItems.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${
                activePage === item.name ? "active" : ""
              }`}
              onClick={() => setActivePage(item.name)}
            >
              <span>{item.icon}</span>
              {item.name}
            </button>
          ))}

        </nav>

        <div className="sidebar-bottom">

          <button
            className={`nav-item ${
              activePage === "Settings" ? "active" : ""
            }`}
            onClick={() => setActivePage("Settings")}
          >
            <span>⚙</span>
            Settings
          </button>

          <div className="user-card">
            <div className="avatar">U</div>

            <div>
              <strong>User</strong>
              <small>Student</small>
            </div>
          </div>

        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {renderPage()}
      </main>

    </div>
  );
}

export default App;