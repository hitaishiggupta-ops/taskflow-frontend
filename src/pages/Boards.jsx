import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import {
  getBoards as getBoardsAPI,
  deleteBoard as deleteBoardAPI,
} from "../services/boardService";
import { getTasks as getTasksAPI } from "../services/taskService";
import toast from "react-hot-toast";

// ── tiny helpers ────────────────────────────────────────────────
const priorityColor = { high: "#ef4444", medium: "#f59e0b", low: "#10b981" };

function ProgressBar({ done, total }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: "var(--text-3)" }}>Progress</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-2)" }}>{pct}%</span>
      </div>
      <div style={{ height: 5, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 99,
          width: `${pct}%`,
          background: pct === 100 ? "#10b981" : "var(--accent)",
          transition: "width 0.4s ease",
        }} />
      </div>
    </div>
  );
}

// ── Board card (grid) ────────────────────────────────────────────
function BoardGridCard({ board, counts, onOpen, onDelete }) {
  const total = counts.todo + counts.inProgress + counts.done;
  const isComplete = total > 0 && counts.done === total;

  return (
    <div style={{
      background: "var(--white)",
      border: "1px solid var(--border)",
      borderTop: `3px solid ${isComplete ? "#10b981" : "var(--accent)"}`,
      borderRadius: "var(--card-r)",
      padding: "18px",
      display: "flex",
      flexDirection: "column",
      gap: 10,
      transition: "box-shadow 0.2s, transform 0.2s",
      cursor: "pointer",
    }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = "0 6px 24px rgba(99,102,241,0.13)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "translateY(0)";
      }}
      onClick={() => onOpen(board.id)}
    >
      {/* Title + badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", lineHeight: 1.3 }}>
          {board.title}
        </h3>
        {isComplete && (
          <span style={{
            fontSize: 10, fontWeight: 700, padding: "2px 8px",
            background: "#ecfdf5", color: "#065f46",
            borderRadius: 99, whiteSpace: "nowrap", flexShrink: 0,
          }}>✓ Done</span>
        )}
      </div>

      {/* Description */}
      <p style={{
        fontSize: 12.5, color: "var(--text-3)", lineHeight: 1.5,
        display: "-webkit-box", WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical", overflow: "hidden",
        margin: 0,
      }}>
        {board.description || "No description"}
      </p>

      {/* Task counts */}
      <div style={{ display: "flex", gap: 8 }}>
        {[
          { label: "To Do",  value: counts.todo,       color: "#94a3b8" },
          { label: "Doing",  value: counts.inProgress, color: "#6366f1" },
          { label: "Done",   value: counts.done,       color: "#10b981" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            flex: 1, textAlign: "center",
            background: "var(--surface)",
            borderRadius: 8, padding: "6px 4px",
            borderTop: `2px solid ${color}`,
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{value}</div>
            <div style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 500 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <ProgressBar done={counts.done} total={total} />

      {/* Footer */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", paddingTop: 10,
        borderTop: "1px solid var(--border)", marginTop: 2,
      }}>
        <span style={{ fontSize: 11, color: "var(--text-3)" }}>
          👤 {board.assignedUser?.name ?? "Unassigned"}
        </span>
        <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
          <button
            onClick={() => onOpen(board.id)}
            style={{
              padding: "5px 12px", background: "var(--accent)", color: "#fff",
              border: "none", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer",
            }}
          >Open</button>
          <button
            onClick={() => onDelete(board.id)}
            style={{
              padding: "5px 10px", background: "transparent",
              border: "1px solid var(--border)", borderRadius: 6,
              fontSize: 12, cursor: "pointer", color: "var(--red)",
            }}
          >Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── Board row (list) ─────────────────────────────────────────────
function BoardListRow({ board, counts, onOpen, onDelete }) {
  const total = counts.todo + counts.inProgress + counts.done;
  const pct   = total === 0 ? 0 : Math.round((counts.done / total) * 100);

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "2fr 1fr 80px 80px 80px 140px 110px",
      alignItems: "center",
      gap: 16,
      padding: "14px 20px",
      background: "var(--white)",
      border: "1px solid var(--border)",
      borderRadius: "var(--card-r)",
      marginBottom: 8,
      transition: "box-shadow 0.15s",
      cursor: "pointer",
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
      onClick={() => onOpen(board.id)}
    >
      {/* Name + desc */}
      <div>
        <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{board.title}</div>
        <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 260,
        }}>
          {board.description || "No description"}
        </div>
      </div>

      {/* Assigned */}
      <div style={{ fontSize: 12, color: "var(--text-2)" }}>
        {board.assignedUser?.name ?? "—"}
      </div>

      {/* Counts */}
      {[counts.todo, counts.inProgress, counts.done].map((v, i) => (
        <div key={i} style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", textAlign: "center" }}>{v}</div>
      ))}

      {/* Progress */}
      <div>
        <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 4 }}>{pct}%</div>
        <div style={{ height: 4, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${pct}%`,
            background: pct === 100 ? "#10b981" : "var(--accent)",
            borderRadius: 99,
          }} />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
        <button
          onClick={() => onOpen(board.id)}
          style={{
            padding: "5px 12px", background: "var(--accent)", color: "#fff",
            border: "none", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer",
          }}
        >Open</button>
        <button
          onClick={() => onDelete(board.id)}
          style={{
            padding: "5px 10px", background: "transparent",
            border: "1px solid var(--border)", borderRadius: 6,
            fontSize: 12, cursor: "pointer", color: "var(--red)",
          }}
        >Del</button>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────
export default function Boards() {
  const navigate = useNavigate();

  const [boards,      setBoards]      = useState([]);
  const [taskCounts,  setTaskCounts]  = useState({});
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [filterStatus,setFilterStatus]= useState("all");  // all | active | complete
  const [viewMode,    setViewMode]    = useState("grid"); // grid | list
  const [deleteId,    setDeleteId]    = useState(null);

  useEffect(() => { loadBoards(); }, []);

  const loadBoards = async () => {
    try {
      setLoading(true);
      const res = await getBoardsAPI();
      setBoards(res.data);

      // fetch task counts for each board in parallel
      const counts = {};
      await Promise.all(
        res.data.map(async (board) => {
          try {
            const t = await getTasksAPI(board.id);
            const tasks = t.data;
            counts[board.id] = {
              todo:       tasks.filter(x => x.status === "todo").length,
              inProgress: tasks.filter(x => x.status === "in-progress").length,
              done:       tasks.filter(x => x.status === "done").length,
            };
          } catch {
            counts[board.id] = { todo: 0, inProgress: 0, done: 0 };
          }
        })
      );
      setTaskCounts(counts);
    } catch (err) {
      console.log(err);
      toast.error("Could not load boards");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteBoardAPI(deleteId);
      toast.success("Board deleted");
      setDeleteId(null);
      loadBoards();
    } catch {
      toast.error("Delete failed");
    }
  };

  // ── Derived list ─────────────────────────────────────────────
  const filtered = boards
    .filter(b => b.title.toLowerCase().includes(search.toLowerCase()))
    .filter(b => {
      if (filterStatus === "all") return true;
      const c = taskCounts[b.id] ?? { todo: 0, inProgress: 0, done: 0 };
      const total = c.todo + c.inProgress + c.done;
      const isComplete = total > 0 && c.done === total;
      return filterStatus === "complete" ? isComplete : !isComplete;
    });

  // ── Summary stats ────────────────────────────────────────────
  const totalTasks  = Object.values(taskCounts).reduce((s, c) => s + c.todo + c.inProgress + c.done, 0);
  const totalDone   = Object.values(taskCounts).reduce((s, c) => s + c.done, 0);
  const totalActive = boards.filter(b => {
    const c = taskCounts[b.id] ?? { todo: 0, inProgress: 0, done: 0 };
    const total = c.todo + c.inProgress + c.done;
    return total === 0 || c.done < total;
  }).length;

  // ── Render ───────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--surface)" }}>
      <Sidebar />

      <div style={{ marginLeft: "var(--sidebar-w)", flex: 1, display: "flex", flexDirection: "column" }}>
        <Navbar title="Boards" />

        <main style={{ padding: 24, flex: 1 }}>

          {/* ── Header ── */}
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--text)" }}>All Boards</h1>
            <p style={{ color: "var(--text-3)", marginTop: 4, fontSize: 13 }}>
              Overview of every project board you own or are assigned to.
            </p>
          </div>

          {/* ── Summary cards ── */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12, marginBottom: 24,
          }}>
            {[
              { label: "Total Boards",  value: boards.length,  color: "var(--accent)", icon: "📋" },
              { label: "Active",        value: totalActive,    color: "var(--yellow)",  icon: "🔄" },
              { label: "Completed",     value: boards.length - totalActive, color: "var(--green)", icon: "✅" },
              { label: "Total Tasks",   value: totalTasks,     color: "var(--blue)",    icon: "📌" },
            ].map(({ label, value, color, icon }) => (
              <div key={label} style={{
                background: "var(--white)", border: "1px solid var(--border)",
                borderTop: `3px solid ${color}`, borderRadius: "var(--card-r)",
                padding: "16px 18px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 18 }}>{icon}</span>
                  <span style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 500 }}>{label}</span>
                </div>
                <div style={{ fontSize: 30, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.5px" }}>
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* ── Search + filters + view toggle ── */}
          <div style={{
            display: "flex", gap: 10, alignItems: "center",
            marginBottom: 20, flexWrap: "wrap",
          }}>
            {/* Search */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "var(--white)", border: "1px solid var(--border)",
              borderRadius: "var(--radius)", padding: "8px 14px", flex: "1 1 220px",
            }}>
              <span style={{ color: "var(--text-3)" }}>🔍</span>
              <input
                placeholder="Search boards…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  border: "none", background: "transparent", outline: "none",
                  fontSize: 13, color: "var(--text)", width: "100%",
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", fontSize: 16, lineHeight: 1 }}
                >×</button>
              )}
            </div>

            {/* Status filter */}
            <div style={{
              display: "flex", background: "var(--white)",
              border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden",
            }}>
              {[
                { id: "all",      label: "All"      },
                { id: "active",   label: "Active"   },
                { id: "complete", label: "Complete" },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterStatus(f.id)}
                  style={{
                    padding: "8px 14px", border: "none", cursor: "pointer",
                    fontSize: 13, fontWeight: 500,
                    background: filterStatus === f.id ? "var(--accent)" : "transparent",
                    color: filterStatus === f.id ? "#fff" : "var(--text-2)",
                    transition: "background 0.15s",
                  }}
                >{f.label}</button>
              ))}
            </div>

            {/* View toggle */}
            <div style={{
              display: "flex", background: "var(--white)",
              border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden",
            }}>
              {[
                { id: "grid", icon: "⊞" },
                { id: "list", icon: "☰" },
              ].map(v => (
                <button
                  key={v.id}
                  onClick={() => setViewMode(v.id)}
                  style={{
                    padding: "8px 14px", border: "none", cursor: "pointer",
                    fontSize: 15,
                    background: viewMode === v.id ? "var(--accent)" : "transparent",
                    color: viewMode === v.id ? "#fff" : "var(--text-2)",
                    transition: "background 0.15s",
                  }}
                >{v.icon}</button>
              ))}
            </div>

            {/* Result count */}
            <span style={{ fontSize: 12, color: "var(--text-3)", whiteSpace: "nowrap" }}>
              {filtered.length} board{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* ── Loading ── */}
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 60, gap: 14 }}>
              <div style={{
                width: 36, height: 36,
                border: "3px solid var(--border)",
                borderTop: "3px solid var(--accent)",
                borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
              }} />
              <p style={{ fontSize: 14, color: "var(--text-3)" }}>Loading boards…</p>
            </div>
          )}

          {/* ── Empty state ── */}
          {!loading && filtered.length === 0 && (
            <div style={{
              textAlign: "center", padding: "60px 20px",
              background: "var(--white)", border: "1px solid var(--border)",
              borderRadius: "var(--card-r)",
            }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
                {search ? "No boards match your search" : "No boards yet"}
              </h2>
              <p style={{ fontSize: 13, color: "var(--text-3)" }}>
                {search ? "Try a different keyword." : "Create your first board from the Dashboard."}
              </p>
            </div>
          )}

          {/* ── List header (list view only) ── */}
          {!loading && filtered.length > 0 && viewMode === "list" && (
            <div style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 80px 80px 80px 140px 110px",
              gap: 16, padding: "8px 20px",
              fontSize: 11, fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.6px", color: "var(--text-3)", marginBottom: 4,
            }}>
              <span>Board</span>
              <span>Assigned</span>
              <span style={{ textAlign: "center" }}>To Do</span>
              <span style={{ textAlign: "center" }}>Doing</span>
              <span style={{ textAlign: "center" }}>Done</span>
              <span>Progress</span>
              <span>Actions</span>
            </div>
          )}

          {/* ── Grid / List ── */}
          {!loading && filtered.length > 0 && (
            viewMode === "grid" ? (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 16,
              }}>
                {filtered.map(board => (
                  <BoardGridCard
                    key={board.id}
                    board={board}
                    counts={taskCounts[board.id] ?? { todo: 0, inProgress: 0, done: 0 }}
                    onOpen={id => navigate(`/board/${id}`)}
                    onDelete={id => setDeleteId(id)}
                  />
                ))}
              </div>
            ) : (
              <div>
                {filtered.map(board => (
                  <BoardListRow
                    key={board.id}
                    board={board}
                    counts={taskCounts[board.id] ?? { todo: 0, inProgress: 0, done: 0 }}
                    onOpen={id => navigate(`/board/${id}`)}
                    onDelete={id => setDeleteId(id)}
                  />
                ))}
              </div>
            )
          )}

        </main>
      </div>

      {/* ── Delete Confirm Modal ── */}
      {deleteId && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: 360, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🗑️</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Delete Board?</h2>
            <p style={{ color: "var(--text-3)", fontSize: 14, marginBottom: 28 }}>
              All tasks inside this board will also be deleted. This cannot be undone.
            </p>
            <div className="modal-buttons" style={{ justifyContent: "center" }}>
              <button className="cancel-btn" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="create-btn" onClick={confirmDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
