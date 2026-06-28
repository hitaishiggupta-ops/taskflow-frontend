import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  getTasks as getTasksAPI,
  createTask as createTaskAPI,
  updateTaskStatus as updateTaskStatusAPI,
  deleteTask as deleteTaskAPI,
} from "../services/taskService";
import { suggestEstimate as suggestEstimateAPI } from "../services/aiService";
import { getBoards as getBoardsAPI } from "../services/boardService";
import { getProfile as getProfileAPI } from "../services/userService";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import TaskCard from "../components/TaskCard";
import TaskCalendar from "../components/TaskCalendar";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskSchema } from "../validations/taskSchema";

const COLUMNS = [
  { id: "todo",        label: "To do",       dot: "#94a3b8" },
  { id: "in-progress", label: "In progress", dot: "#6366f1" },
  { id: "done",        label: "Done",        dot: "#10b981" },
];

const inputStyle = {
  border: "1px solid var(--border)", borderRadius: "var(--radius)",
  padding: "8px 12px", fontSize: 13, color: "var(--text)",
  background: "var(--surface)", outline: "none", minWidth: 0,
};

export default function BoardPage() {
  const { id } = useParams();

  const [tasks,           setTasks]           = useState([]);
  const [board,           setBoard]           = useState(null);
  const [isOwner,         setIsOwner]         = useState(false);
  const [aiReason,        setAiReason]        = useState("");
  const [search,          setSearch]          = useState("");
  const [filter,          setFilter]          = useState("all");
  const [view,            setView]            = useState("board");
  const [loading,         setLoading]         = useState(true);
  const [showTaskModal,   setShowTaskModal]   = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const {
    register, handleSubmit, watch, setValue, reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(taskSchema), defaultValues: { priority: "medium" } });

  const estimatedEffort = watch("estimatedEffort");

  useEffect(() => { init(); }, []);

  // Load profile + boards + tasks in parallel, then determine ownership
  const init = async () => {
    try {
      setLoading(true);
      const [profileRes, boardsRes, tasksRes] = await Promise.all([
        getProfileAPI(),
        getBoardsAPI(),
        getTasksAPI(id),
      ]);

      const me        = profileRes.data;
      const thisBoard = boardsRes.data.find(b => String(b.id) === String(id));
      setBoard(thisBoard ?? null);
      // FIX: compare ownerId with logged-in user's id
      setIsOwner(thisBoard ? thisBoard.ownerId === me.id : false);
      setTasks(tasksRes.data);
    } catch {
      toast.error("Could not load board.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await getTasksAPI(id);
      setTasks(res.data);
    } catch {
      toast.error("Could not load tasks.");
    }
  };

  const createTask = async (data) => {
    try {
      const formData = new FormData();
      formData.append("title",           data.title);
      formData.append("description",     data.description     || "");
      formData.append("priority",        data.priority        || "medium");
      formData.append("dueDate",         data.dueDate         || "");
      formData.append("estimatedEffort", data.estimatedEffort || "");
      formData.append("boardId",         id);
      if (data.image?.[0]) formData.append("image", data.image[0]);

      await createTaskAPI(formData);
      await fetchTasks();
      toast.success("Task created");
      reset();
      setAiReason("");
      setShowTaskModal(false);
    } catch (error) {
      console.error(error);
      toast.error("Task creation failed");
    }
  };

  // Optimistic drag-drop — update UI first, sync server in background
  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    if (result.destination.droppableId === result.source.droppableId) return;

    const taskId    = Number(result.draggableId);
    const newStatus = result.destination.droppableId;

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

    try {
      await updateTaskStatusAPI(taskId, newStatus);
    } catch {
      toast.error("Could not move task — reverted.");
      await fetchTasks();
    }
  };

  // Optimistic move via button
  const moveTask = async (task, status) => {
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status } : t));
    try {
      await updateTaskStatusAPI(task.id, status);
    } catch {
      toast.error("Could not move task — reverted.");
      await fetchTasks();
    }
  };

  const deleteTask    = (taskId) => setDeleteConfirmId(taskId);

  const confirmDelete = async () => {
    try {
      await deleteTaskAPI(deleteConfirmId);
      await fetchTasks();
      toast.success("Task deleted.");
    } catch {
      toast.error("Could not delete task.");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const suggestEstimate = async () => {
    const title = watch("title");
    const description = watch("description");
    if (!title) { toast.error("Enter a task title first."); return; }
    try {
      const res = await suggestEstimateAPI(title, description);
      setValue("estimatedEffort", res.data.estimatedEffort);
      setAiReason(res.data.reason);
      toast.success(`Suggested: ${res.data.estimatedEffort}`);
    } catch {
      toast.error("AI suggestion failed.");
    }
  };

  const filtered = (status) =>
    tasks
      .filter(t => t.title.toLowerCase().includes(search.toLowerCase()))
      .filter(t => filter === "all" || t.priority === filter)
      .filter(t => t.status === status);

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: "var(--surface)" }}>
        <Sidebar />
        <div style={{ marginLeft: "var(--sidebar-w)", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
          <div style={{ width: 36, height: 36, border: "3px solid var(--border)", borderTop: "3px solid var(--accent)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
          <p style={{ fontSize: 14, color: "var(--text-3)" }}>Loading tasks…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--surface)" }}>
      <Sidebar />

      <div style={{ marginLeft: "var(--sidebar-w)", flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Navbar title="Board Tasks" />

        <main style={{ padding: 24, flex: 1 }}>

          {/* Page header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)" }}>
                  {board?.title ?? "Board Tasks"}
                </h1>
                {/* Role badge */}
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99,
                  background: isOwner ? "#e0e7ff" : "#ecfdf5",
                  color:      isOwner ? "#4338ca" : "#065f46",
                }}>
                  {isOwner ? "👑 Owner" : "👁 Viewer"}
                </span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 4 }}>
                {isOwner
                  ? "You own this board — full access."
                  : "You can view tasks and move them between columns."}
              </p>
            </div>

            {/* Only owner sees + Add task */}
            {isOwner && (
              <button
                onClick={() => setShowTaskModal(true)}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: "var(--radius)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
              >
                + Add task
              </button>
            )}
          </div>

          {/* Search + filter + view toggle */}
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--white)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "7px 12px", flex: "1 1 200px" }}>
              <span style={{ color: "var(--text-3)", fontSize: 14 }}>🔍</span>
              <input
                style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, color: "var(--text)", width: "100%" }}
                placeholder="Search tasks…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <select style={{ ...inputStyle, background: "var(--white)" }} value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">All priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <div style={{ display: "flex", background: "var(--white)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
              {["board", "calendar"].map(v => (
                <button key={v} onClick={() => setView(v)} style={{ padding: "8px 16px", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, background: view === v ? "var(--accent)" : "transparent", color: view === v ? "#fff" : "var(--text-2)", transition: "background 0.15s" }}>
                  {v === "board" ? "⊞ Board" : "📅 Calendar"}
                </button>
              ))}
            </div>
          </div>

          {/* Board / Calendar */}
          {view === "calendar" ? (
            <TaskCalendar tasks={tasks} />
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                {COLUMNS.map(({ id: colId, label, dot }) => (
                  <div key={colId}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: dot }} />
                        <span style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-2)" }}>{label}</span>
                      </div>
                      <span style={{ fontSize: 11, color: "var(--text-3)", background: "var(--border)", padding: "1px 7px", borderRadius: 10 }}>{filtered(colId).length}</span>
                    </div>

                    <Droppable droppableId={colId}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          style={{ minHeight: 480, background: snapshot.isDraggingOver ? "var(--accent-light)" : "var(--surface)", border: "1px solid", borderColor: snapshot.isDraggingOver ? "var(--accent)" : "var(--border)", borderRadius: "var(--card-r)", padding: 10, transition: "background 0.15s, border-color 0.15s" }}
                        >
                          {filtered(colId).length === 0 && (
                            <div style={{ textAlign: "center", padding: "40px 16px", color: "var(--text-3)", fontSize: 13 }}>No tasks here</div>
                          )}

                          {filtered(colId).map((task, index) => (
                            <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={{ marginBottom: 8, opacity: snapshot.isDragging ? 0.85 : 1, ...provided.draggableProps.style }}
                                >
                                  <TaskCard
                                    task={task}
                                    moveTask={moveTask}
                                    deleteTask={deleteTask}
                                    refreshTasks={fetchTasks}
                                    isOwner={isOwner}
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
              </div>
            </DragDropContext>
          )}
        </main>
      </div>

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal-card" style={{ maxWidth: 560, maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ margin: 0 }}>New Task</h2>
              <button onClick={() => { setShowTaskModal(false); reset(); setAiReason(""); }} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "var(--text-3)" }}>✕</button>
            </div>

            <form className="modal-form" onSubmit={handleSubmit(createTask)} noValidate>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)" }}>Task Title *</label>
                <input placeholder="Enter task title" {...register("title")} />
                {errors.title && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{errors.title.message}</p>}
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)" }}>Description</label>
                <textarea rows={4} placeholder="What needs to be done?" {...register("description")} style={{ resize: "vertical", minHeight: 100 }} />
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)" }}>Priority</label>
                  <select {...register("priority")} style={{ width: "100%", padding: "11px 14px", border: "1px solid var(--border)", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", background: "var(--surface)", color: "var(--text)" }}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)" }}>Due Date & Time</label>
                  <input type="datetime-local" {...register("dueDate")} style={{ width: "100%", padding: "11px 14px", border: "1px solid var(--border)", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", background: "var(--surface)", color: "var(--text)" }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)" }}>Estimated Effort</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input placeholder="e.g. 2 hours, 3 days" {...register("estimatedEffort")} style={{ flex: 1 }} />
                  <button type="button" onClick={suggestEstimate} style={{ padding: "10px 14px", background: "#6366f1", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>
                    ✨ AI Suggest
                  </button>
                </div>
                {estimatedEffort && aiReason && (
                  <div style={{ marginTop: 8, padding: "10px 12px", background: "var(--accent-light)", borderRadius: 8, fontSize: 13 }}>
                    <strong style={{ color: "var(--accent-text)" }}>{estimatedEffort}</strong>
                    <span style={{ color: "var(--accent-text)" }}> — {aiReason}</span>
                  </div>
                )}
              </div>

              <div className="file-group">
                <label>Attach Image (optional)</label>
                <input type="file" accept="image/*" {...register("image")} />
              </div>

              <div className="modal-buttons">
                <button type="button" className="cancel-btn" onClick={() => { setShowTaskModal(false); reset(); setAiReason(""); }}>Cancel</button>
                <button type="submit" className="create-btn" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create Task"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: 380, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🗑️</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Delete Task?</h2>
            <p style={{ color: "var(--text-3)", fontSize: 14, marginBottom: 28 }}>
              This action cannot be undone. The task will be permanently removed.
            </p>
            <div className="modal-buttons" style={{ justifyContent: "center" }}>
              <button className="cancel-btn" onClick={() => setDeleteConfirmId(null)}>Cancel</button>
              <button className="create-btn" onClick={confirmDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
