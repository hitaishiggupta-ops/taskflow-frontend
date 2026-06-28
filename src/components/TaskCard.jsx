import { useState } from "react";
import { updateTask as updateTaskAPI } from "../services/taskService";
import toast from "react-hot-toast";

const PRIORITY_STYLES = {
  high:   { background: "var(--red-bg)",    color: "#991b1b" },
  medium: { background: "var(--yellow-bg)", color: "#92400e" },
  low:    { background: "var(--green-bg)",  color: "#065f46" },
};

const inputStyle = {
  width: "100%", border: "1px solid var(--border)", borderRadius: "var(--radius)",
  padding: "8px 10px", fontSize: 13, color: "var(--text)",
  background: "var(--surface)", outline: "none", boxSizing: "border-box",
};

const labelStyle = {
  fontSize: 11, fontWeight: 600, color: "var(--text-2)", display: "block", marginBottom: 4,
};

// FIX: accept isOwner prop — defaults to true so existing usage without prop still works
export default function TaskCard({ task, moveTask, deleteTask, refreshTasks, isOwner = true }) {
  const [editing,     setEditing]     = useState(false);
  const [title,       setTitle]       = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [priority,    setPriority]    = useState(task.priority);
  const [dueDate,     setDueDate]     = useState(task.dueDate ? task.dueDate.split("T")[0] : "");

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";
  const isDone    = task.status === "done";

  const updateTask = async () => {
    try {
      await updateTaskAPI(task.id, { title, description, priority, dueDate });
      await refreshTasks();
      toast.success("Task updated");
      setEditing(false);
    } catch (error) {
      console.error(error);
      toast.error("Update failed");
    }
  };

  const moveOptions = [
    { status: "todo",        label: "To do"       },
    { status: "in-progress", label: "In progress" },
    { status: "done",        label: "Done"        },
  ].filter(o => o.status !== task.status);

  const moveColors = {
    "todo":        { bg: "var(--surface)", color: "var(--text-2)", border: "var(--border)" },
    "in-progress": { bg: "var(--blue-bg)", color: "#1d4ed8",       border: "#bfdbfe"       },
    "done":        { bg: "var(--green-bg)",color: "#065f46",       border: "#bbf7d0"       },
  };

  return (
    <div
      style={{ background: isOverdue ? "var(--red-bg)" : "var(--white)", border: "1px solid", borderColor: isOverdue ? "#fca5a5" : "var(--border)", borderRadius: "var(--card-r)", padding: "14px 16px", transition: "box-shadow 0.15s", opacity: isDone ? 0.72 : 1 }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.07)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
    >
      {/* Title + priority badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
        <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text)", lineHeight: 1.4, textDecoration: isDone ? "line-through" : "none", flex: 1 }}>
          {task.title}
        </h3>
        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10, flexShrink: 0, textTransform: "uppercase", letterSpacing: "0.4px", ...(PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.medium) }}>
          {task.priority}
        </span>
      </div>

      {/* Description */}
      {task.description && (
        <p style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.5, marginBottom: 10, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {task.description}
        </p>
      )}

      {/* Attached image */}
      {task.imageUrl && (
        <img
          src={`${import.meta.env.VITE_API_URL || "http://localhost:8000"}${task.imageUrl}`}
          alt="task attachment"
          style={{ width: "100%", borderRadius: 8, marginBottom: 10, maxHeight: 160, objectFit: "cover" }}
        />
      )}

      {/* Due date + effort */}
      <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        {task.dueDate && (
          <span style={{ fontSize: 11, color: isOverdue ? "var(--red)" : "var(--text-3)", fontWeight: isOverdue ? 600 : 400, display: "flex", alignItems: "center", gap: 4 }}>
            {isOverdue ? "⚠ " : "📅 "}{isOverdue ? "Overdue · " : ""}
            {new Date(task.dueDate).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
        {task.estimatedEffort && (
          <span style={{ fontSize: 11, color: "var(--text-3)", display: "flex", alignItems: "center", gap: 4 }}>
            ⏱ {task.estimatedEffort}
          </span>
        )}
      </div>

      {/* Move buttons — visible to everyone (owner + assigned) */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
        {moveOptions.map(({ status, label }) => (
          <button
            key={status}
            onClick={() => moveTask(task, status)}
            style={{ fontSize: 11, fontWeight: 500, padding: "4px 10px", border: `1px solid ${moveColors[status].border}`, borderRadius: 6, cursor: "pointer", background: moveColors[status].bg, color: moveColors[status].color, transition: "opacity 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.75"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            → {label}
          </button>
        ))}
      </div>

      {/* FIX: Edit / Delete — only for board owner */}
      {isOwner && (
        <div style={{ display: "flex", gap: 6, paddingTop: 8, borderTop: "1px solid var(--border)" }}>
          <button
            onClick={() => setEditing(v => !v)}
            style={{ flex: 1, padding: "6px 0", background: editing ? "var(--accent-light)" : "transparent", border: "1px solid", borderColor: editing ? "var(--accent)" : "var(--border)", borderRadius: "var(--radius)", fontSize: 12, fontWeight: 500, cursor: "pointer", color: editing ? "var(--accent-text)" : "var(--text-2)" }}
          >
            {editing ? "Cancel" : "Edit"}
          </button>
          <button
            onClick={() => deleteTask(task.id)}
            style={{ flex: 1, padding: "6px 0", background: "transparent", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 12, fontWeight: 500, cursor: "pointer", color: "var(--red)" }}
          >
            Delete
          </button>
        </div>
      )}

      {/* Inline edit form — owner only */}
      {isOwner && editing && (
        <div style={{ borderTop: "1px solid var(--border)", marginTop: 12, paddingTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <label style={labelStyle}>Title</label>
            <input style={inputStyle} value={title} onChange={e => setTitle(e.target.value)} placeholder="Task title" />
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 72 }} value={description} onChange={e => setDescription(e.target.value)} placeholder="What needs to be done?" />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Priority</label>
              <select style={inputStyle} value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Due date</label>
              <input type="date" style={inputStyle} value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
          </div>
          <button onClick={updateTask} style={{ alignSelf: "flex-start", padding: "8px 16px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: "var(--radius)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
            Save changes
          </button>
        </div>
      )}
    </div>
  );
}
