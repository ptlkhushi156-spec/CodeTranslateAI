import { useEffect, useState } from "react";

function SavedProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [projectName, setProjectName] = useState("");
  const [language, setLanguage] = useState("Python");
  const [code, setCode] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [viewingProject, setViewingProject] = useState(null);

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

  const token = localStorage.getItem("access_token");

  // ================================
  // GET SAVED PROJECTS
  // ================================
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://127.0.0.1:8000/projects", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to fetch projects");
      }

      setProjects(data.projects || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // ================================
  // RESET FORM
  // ================================
  const resetForm = () => {
    setProjectName("");
    setLanguage("Python");
    setCode("");
    setEditingId(null);
    setShowForm(false);
  };

  // ================================
  // SAVE / UPDATE PROJECT
  // ================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!projectName.trim()) {
      setError("Project name is required");
      return;
    }

    if (!code.trim()) {
      setError("Project code is required");
      return;
    }

    try {
      setError("");

      const url = editingId
        ? `http://127.0.0.1:8000/projects/${editingId}`
        : "http://127.0.0.1:8000/projects";

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          project_name: projectName,
          language,
          code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Operation failed");
      }

      await fetchProjects();
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

  // ================================
  // EDIT PROJECT
  // ================================
  const handleEdit = (project) => {
    setEditingId(project.id);
    setProjectName(project.project_name);
    setLanguage(project.language);
    setCode(project.code);
    setShowForm(true);
    setError("");
  };

  // ================================
  // DELETE PROJECT
  // ================================
  const handleDelete = async (projectId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `http://127.0.0.1:8000/projects/${projectId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to delete project");
      }

      await fetchProjects();
    } catch (err) {
      setError(err.message);
    }
  };

  // ================================
  // VIEW PROJECT
  // ================================
  const handleView = (project) => {
    setViewingProject(project);
  };

  // ================================
  // LOADING
  // ================================
  if (loading) {
    return (
      <div className="saved-projects-page">
        <div className="saved-projects-header">
          <div>
            <h1>Saved Projects</h1>
            <p>Manage your saved coding projects.</p>
          </div>
        </div>

        <div className="saved-projects-loading">
          <div className="loading-spinner"></div>
          <p>Loading saved projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="saved-projects-page">

      {/* ================================
          HEADER
      ================================= */}
      <header className="saved-projects-header">

        <div>
          <h1>Saved Projects</h1>
          <p>
            Save, edit and manage your coding projects in one place.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          + New Project
        </button>

      </header>

      {/* ================================
          ERROR
      ================================= */}
      {error && (
        <div className="auth-error saved-project-error">
          {error}
        </div>
      )}

      {/* ================================
          PROJECT FORM
      ================================= */}
      {showForm && (
        <section className="saved-project-form-card">

          <div className="saved-project-form-header">
            <div>
              <h2>
                {editingId ? "Edit Project" : "Create New Project"}
              </h2>

              <p>
                {editingId
                  ? "Update your saved project."
                  : "Save your code for future use."}
              </p>
            </div>

            <button
              className="close-button"
              onClick={resetForm}
              type="button"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="saved-project-form-grid">

              <div className="form-group">
                <label>Project Name</label>

                <input
                  type="text"
                  placeholder="Enter project name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Programming Language</label>

                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  {languages.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            <div className="form-group">
              <label>Source Code</label>

              <textarea
                className="saved-project-code-input"
                placeholder="Paste or write your code here..."
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>

            <div className="saved-project-form-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={resetForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
              >
                {editingId ? "Update Project" : "Save Project"}
              </button>

            </div>

          </form>

        </section>
      )}

      {/* ================================
          EMPTY STATE
      ================================= */}
      {projects.length === 0 && !showForm ? (
        <div className="saved-projects-empty">

          <div className="saved-project-empty-icon">
            ▣
          </div>

          <h2>No Saved Projects</h2>

          <p>
            You haven't saved any coding projects yet.
            Create your first project to get started.
          </p>

          <button
            className="primary-button"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            + Create Your First Project
          </button>

        </div>
      ) : (
        /* ================================
           PROJECT LIST
        ================================= */
        <div className="saved-projects-grid">

          {projects.map((project) => (

            <div
              className="saved-project-card"
              key={project.id}
            >

              <div className="saved-project-card-top">

                <div className="saved-project-icon">
                  {"</>"}
                </div>

                <span className="project-language">
                  {project.language}
                </span>

              </div>

              <h2>{project.project_name}</h2>

              <p className="project-date">
                Updated:{" "}
                {new Date(project.updated_at).toLocaleString()}
              </p>

              <div className="project-code-preview">
                <pre>
                  {project.code}
                </pre>
              </div>

              <div className="project-card-actions">

                <button
                  className="secondary-button"
                  onClick={() => handleView(project)}
                >
                  View
                </button>

                <button
                  className="secondary-button"
                  onClick={() => handleEdit(project)}
                >
                  Edit
                </button>

                <button
                  className="delete-button"
                  onClick={() => handleDelete(project.id)}
                >
                  Delete
                </button>

              </div>

            </div>

          ))}

        </div>
      )}

      {/* ================================
          VIEW PROJECT MODAL
      ================================= */}
      {viewingProject && (
        <div
          className="project-modal-overlay"
          onClick={() => setViewingProject(null)}
        >
          <div
            className="project-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="project-modal-header">
              <div>
                <h2>{viewingProject.project_name}</h2>

                <span className="project-modal-language">
                  {viewingProject.language}
                </span>
              </div>

              <button
                className="project-modal-close"
                onClick={() => setViewingProject(null)}
              >
                ×
              </button>
            </div>

            <div className="project-modal-body">
              <div className="project-modal-code-header">
                <span>Source Code</span>

                <span>
                  {viewingProject.language}
                </span>
              </div>

              <pre className="project-modal-code">
                {viewingProject.code}
              </pre>
            </div>

            <div className="project-modal-footer">
              <button
                className="secondary-button"
                onClick={() => setViewingProject(null)}
              >
                Close
              </button>

              <button
                className="primary-button"
                onClick={() => {
                  handleEdit(viewingProject);
                  setViewingProject(null);
                }}
              >
                Edit Project
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default SavedProjects;