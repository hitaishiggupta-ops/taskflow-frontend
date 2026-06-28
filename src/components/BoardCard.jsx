import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { updateBoard as updateBoardAPI } from "../services/boardService";
import { getTasks as getTasksAPI } from "../services/taskService";
import { getProfile as getProfileAPI } from "../services/userService";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { boardSchema } from "../validations/boardSchema";

export default function BoardCard({ board, deleteBoard, refreshBoards }) {
  const navigate = useNavigate();
  const [editing,      setEditing]      = useState(false);
  const [taskCounts,   setTaskCounts]   = useState({ todo: 0, inProgress: 0, done: 0 });
  const [isOwner,      setIsOwner]      = useState(false);
  const [isAssigned,   setIsAssigned]   = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(boardSchema),
    defaultValues: { title: board.title, description: board.description },
  });

  useEffect(() => {
    // FIX: get current user from API, not localStorage (user is never stored there)
    const loadData = async () => {
      try {
        const [profileRes, tasksRes] = await Promise.all([
          getProfileAPI(),
          getTasksAPI(board.id),
        ]);

        const me = profileRes.data;
        setIsOwner(board.ownerId === me.id);
        setIsAssigned(board.assignedUserId === me.id);

        const tasks = tasksRes.data;
        setTaskCounts({
          todo:       tasks.filter(t => t.status === "todo").length,
          inProgress: tasks.filter(t => t.status === "in-progress").length,
          done:       tasks.filter(t => t.status === "done").length,
        });
      } catch {
        // non-critical — silently ignore
      }
    };
    loadData();
  }, [board.id, board.ownerId, board.assignedUserId]);

  const updateBoard = async (data) => {
    try {
      await updateBoardAPI(board.id, data.title, data.description);
      await refreshBoards();
      toast.success("Board updated");
      setEditing(false);
    } catch (error) {
      console.error(error);
      toast.error("Update failed");
    }
  };

  const canOpen = isOwner || isAssigned;

  const inputStyle = {
    width: "100%", border: "1px solid var(--border)", borderRadius: "var(--radius)",
    padding: "8px 10px", fontSize: 13, color: "var(--text)", outline: "none",
    marginBottom: 6, boxSizing: "border-box", background: "var(--surface)",
  };

  const primaryBtn = {
    marginTop: 8, padding: "8px 14px", background: "var(--accent)",
    color: "#fff", border: "none", borderRadius: "var(--radius)",
    fontSize: 13, fontWeight: 500, cursor: "pointer",
  };

  return (
    <div
      style={{ background: "var(--white)", border: "1px solid var(--border)", borderTop: "3px solid var(--accent)", borderRadius: "var(--card-r)", padding: "16px 18px", transition: "box-shadow 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(99,102,241,0.12)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
    >
      {/* Title + description */}
      <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, color: "var(--text)" }}>{board.title}</h2>
      <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 12 }}>{board.description || "No description"}</p>

      {/* Per-board task stats */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {[
          { label: "To Do",       value: taskCounts.todo,       color: "#94a3b8" },
          { label: "In Progress", value: taskCounts.inProgress, color: "#6366f1" },
          { label: "Done",        value: taskCounts.done,       color: "#10b981" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ flex: 1, textAlign: "center", background: "var(--surface)", borderRadius: 8, padding: "6px 4px", borderTop: `2px solid ${color}` }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>{value}</div>
            <div style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 500 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Assigned user + role badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <p style={{ fontSize: 12, color: "var(--text-3)", margin: 0 }}>
          Assigned to: <strong style={{ color: "var(--text-2)" }}>{board.assignedUser?.name ?? "Unassigned"}</strong>
        </p>
        {(isOwner || isAssigned) && (
          <span style={{
            fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
            background: isOwner ? "#e0e7ff" : "#ecfdf5",
            color:      isOwner ? "#4338ca" : "#065f46",
          }}>
            {isOwner ? "👑 Owner" : "👁 Assigned"}
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 6, marginBottom: editing ? 14 : 0 }}>

        {/* FIX: Open only for owner/assigned, View Progress (disabled) for others */}
        {canOpen ? (
          <button
            type="button"
            onClick={() => navigate(`/board/${board.id}`)}
            style={{ flex: 1, padding: "7px 0", background: "var(--accent)", color: "#fff", border: "none", borderRadius: "var(--radius)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
          >
            Open
          </button>
        ) : (
          <button
            type="button"
            disabled
            style={{ flex: 1, padding: "7px 0", background: "#e5e7eb", color: "#6b7280", border: "none", borderRadius: "var(--radius)", fontSize: 13, fontWeight: 500, cursor: "not-allowed" }}
          >
            View Progress
          </button>
        )}

        {/* FIX: Edit and Delete only for owner */}
        {isOwner && (
          <>
            <button
              type="button"
              onClick={() => setEditing(!editing)}
              style={{ padding: "7px 12px", background: editing ? "var(--accent-light)" : "transparent", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 13, cursor: "pointer", color: editing ? "var(--accent-text)" : "var(--text-2)" }}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => deleteBoard(board.id)}
              style={{ padding: "7px 12px", background: "transparent", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 13, cursor: "pointer", color: "var(--red)" }}
            >
              Delete
            </button>
          </>
        )}
      </div>

      {/* Inline edit form — owner only */}
      {isOwner && editing && (
        <form onSubmit={handleSubmit(updateBoard)} style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
          <input {...register("title")} style={inputStyle} placeholder="Board title" />
          {errors.title && <p style={{ color: "#ef4444", fontSize: 12, marginBottom: 6 }}>{errors.title.message}</p>}
          <textarea {...register("description")} style={{ ...inputStyle, minHeight: 72, resize: "vertical" }} placeholder="Description" />
          {errors.description && <p style={{ color: "#ef4444", fontSize: 12, marginBottom: 6 }}>{errors.description.message}</p>}
          <button type="submit" style={primaryBtn}>Save changes</button>
        </form>
      )}
    </div>
  );
}
