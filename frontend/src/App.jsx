import { useEffect, useState } from "react";
import "./App.css";
import SavedProjects from "./components/SavedProjects";
import AIDebugger from "./components/AIDebugger";
import CodeExplanation from "./components/CodeExplanation";
import History from "./components/History";
import CodeConverter from "./components/CodeConverter";
import Login from "./components/Login";
import Register from "./components/Register";

function App() {
  const savedUser = localStorage.getItem("user");

  const [user, setUser] = useState(
    savedUser ? JSON.parse(savedUser) : null
  );

  const [authPage, setAuthPage] = useState("login");
  const [activePage, setActivePage] = useState("Dashboard");

  const [dashboardStats, setDashboardStats] = useState({
    total_conversions: 0,
    saved_projects: 0,
    successful_conversions: 0,
    ai_requests: 0,
  });

  const [statsLoading, setStatsLoading] = useState(true);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setActivePage("Dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    setUser(null);
    setAuthPage("login");
  };

  const fetchDashboardStats = async () => {
  try {
    const token = localStorage.getItem("access_token");

    if (!token) {
      return;
    }

    setStatsLoading(true);

    const response = await fetch(
      "http://127.0.0.1:8000/dashboard-stats",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || "Failed to fetch dashboard stats"
      );
    }

    setDashboardStats(data);
    } catch (error) {
      console.error("Dashboard stats error:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (user && activePage === "Dashboard") {
      fetchDashboardStats();
    }
  }, [user, activePage]);

  // Show Login/Register before Dashboard
  
  useEffect(() => {
    if (user) {
      fetchDashboardStats();
    }
  }, [user]);

  // Show Login/Register before Dashboard
  if (!user) {
    if (authPage === "register") {
      return (
        <Register
          onRegisterSuccess={() => setAuthPage("login")}
          onLogin={() => setAuthPage("login")}
        />
      );
    }

    return (
      <Login
        onLogin={handleLogin}
        onRegister={() => setAuthPage("register")}
      />
    );
  }

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
              <div className="avatar">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>

              <span>{user.name}</span>
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
                <h3>
                  {statsLoading ? "..." : dashboardStats.total_conversions}
                </h3>
                <p>Total Conversions</p>
              </div>
            </div>

            <div className="stat-card">
              <span className="stat-icon">▣</span>
              <div>
                <h3>
                  {statsLoading ? "..." : dashboardStats.saved_projects}
                </h3>
                <p>Saved Projects</p>
              </div>
            </div>

            <div className="stat-card">
              <span className="stat-icon">✓</span>
              <div>
                <h3>
                  {statsLoading ? "..." : dashboardStats.successful_conversions}
                </h3>
                <p>Successful Conversions</p>
              </div>
            </div>

            <div className="stat-card">
              <span className="stat-icon">⚡</span>
              <div>
                <h3>
                  {statsLoading ? "..." : dashboardStats.ai_requests}
                </h3>
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

              {/* Code Converter */}
              <div className="tool-card">
                <div className="tool-icon">⇄</div>

                <h3>Code Converter</h3>

                <p>
                  Convert code from one programming language to another
                  using AI.
                </p>

                <button
                  onClick={() => setActivePage("Code Converter")}
                >
                  Open Tool →
                </button>
              </div>

              {/* Code Explanation */}
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

              {/* AI Debugger */}
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

              {/* Conversion History */}
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

              {/* Saved Projects */}
              <div className="tool-card">
                <div className="tool-icon">▣</div>

                <h3>Saved Projects</h3>

                <p>
                  Save, edit and manage your coding projects for future use.
                </p>

                <button
                  onClick={() => setActivePage("Saved Projects")}
                >
                  Open Projects →
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

    if (activePage === "Code Explanation") {
      return <CodeExplanation />;
    }

    if (activePage === "AI Debugger") {
      return <AIDebugger />;
    }

    if (activePage === "Conversion History") {
      return <History />;
    }

    if (activePage === "Saved Projects") {
      return <SavedProjects />;
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

          <button
            className="nav-item"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>

          <div className="user-card">

            <div className="avatar">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>

            <div>
              <strong>{user.name}</strong>
              <small>{user.email}</small>
            </div>

          </div>

        </div>
      </aside>

      <main className="main-content">
        {renderPage()}
      </main>

    </div>
  );
}

export default App;
