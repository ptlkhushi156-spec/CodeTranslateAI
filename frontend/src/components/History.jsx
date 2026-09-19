import { useEffect, useState } from "react";

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("Please login first.");
        setLoading(false);
        return;
      }

      const response = await fetch("http://127.0.0.1:8000/history", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to fetch history");
      }

      setHistory(data.history || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="history-page">Loading history...</div>;
  }

  if (error) {
    return <div className="history-page error">{error}</div>;
  }

  return (
    <div className="history-page">
      <div className="history-header">
        <h1>Conversion History</h1>
        <p>View your previous code conversions</p>
      </div>

      {history.length === 0 ? (
        <div className="empty-history">
          <h2>No conversion history</h2>
          <p>Your converted code will appear here.</p>
        </div>
      ) : (
        <div className="history-list">
          {history.map((item) => (
            <div className="history-card" key={item._id}>
              <div className="history-card-header">
                <div>
                  <span className="language">
                    {item.source_language}
                  </span>

                  <span className="arrow">→</span>

                  <span className="language">
                    {item.target_language}
                  </span>
                </div>

                <span className="history-date">
                  {new Date(item.created_at).toLocaleString()}
                </span>
              </div>

              <div className="code-section">
                <h3>Source Code</h3>
                <pre>
                  <code>{item.source_code}</code>
                </pre>
              </div>

              <div className="code-section">
                <h3>Converted Code</h3>
                <pre>
                  <code>{item.converted_code}</code>
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default History;
