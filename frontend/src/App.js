import React, { useEffect, useState } from "react";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:15000";

function App() {
  const [tasks, setTasks] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const loadTasks = async () => {
    try {
      setErr("");
      setLoading(true);
      const res = await fetch(`${API_BASE}/tasks`);
      if (!res.ok) throw new Error(`GET /tasks -> ${res.status}`);
      const data = await res.json();
      setTasks(data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // Create a task
  const addTask = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    try {
      setErr("");
      await fetch(`${API_BASE}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed, completed: false }),
      });
      setText("");
      await loadTasks();
    } catch (e) {
      setErr(e.message);
    }
  };

  // Toggle completion
  const toggleTask = async (task) => {
    try {
      setErr("");
      await fetch(`${API_BASE}/tasks/${task._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...task, completed: !task.completed }),
      });
      await loadTasks();
    } catch (e) {
      setErr(e.message);
    }
  };

  // Delete
  const deleteTask = async (id) => {
    try {
      setErr("");
      await fetch(`${API_BASE}/tasks/${id}`, { method: "DELETE" });
      await loadTasks();
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 520 }}>
      <h1>To-Do App</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          value={text}
          placeholder="Add a task..."
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={addTask}>Add</button>
      </div>

      {loading && <p>Loading…</p>}
      {err && (
        <p style={{ color: "crimson" }}>
          Error: {err} — is the backend running at {API_BASE}?
        </p>
      )}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {tasks.map((task) => (
          <li
            key={task._id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 0",
            }}
          >
            <input
              type="checkbox"
              checked={!!task.completed}
              onChange={() => toggleTask(task)}
            />
            <span style={{ flex: 1, textDecoration: task.completed ? "line-through" : "none" }}>
              {task.text}
            </span>
            <button onClick={() => deleteTask(task._id)}>✖</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
