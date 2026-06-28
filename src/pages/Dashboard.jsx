import { useEffect, useState } from "react";
import {
  getBoards as getBoardsAPI,
  createBoard as createBoardAPI,
  deleteBoard as deleteBoardAPI,
} from "../services/boardService";
import { getDashboardStats as getDashboardStatsAPI } from "../services/dashboardService";
import Navbar from "../components/Navbar";
import BoardCard from "../components/BoardCard";
import Sidebar from "../components/Sidebar";
import ActivityTimeline from "../components/ActivityTimeline";
import { toast } from "react-toastify";
import { getUsers } from "../services/userService";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { boardSchema } from "../validations/boardSchema";

export default function Dashboard() {
  const [boards,        setBoards]        = useState([]);
  const [stats,         setStats]         = useState(null);
  const [users,         setUsers]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [showBoardModal,setShowBoardModal] = useState(false);

  // FIX: darkMode removed — Navbar owns the theme toggle now

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(boardSchema) });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchBoards(), fetchStats(), fetchUsers()]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const fetchBoards = async () => {
    try {
      const res = await getBoardsAPI();
      setBoards(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await getDashboardStatsAPI();
      setStats(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const createBoard = async (data) => {
    try {
      const formData = new FormData();
      formData.append("title",       data.title);
      formData.append("description", data.description || "");

      // FIX: only append if a real user was selected
      if (data.assignedUserId && data.assignedUserId !== "") {
        formData.append("assignedUserId", data.assignedUserId);
      }

      if (data.trdFile?.[0]) formData.append("trd", data.trdFile[0]);
      if (data.brdFile?.[0]) formData.append("brd", data.brdFile[0]);
      if (data.prdFile?.[0]) formData.append("prd", data.prdFile[0]);

      await createBoardAPI(formData);
      toast.success("Board created");
      await fetchBoards();
      await fetchStats();
      setShowBoardModal(false);
      reset();
    } catch (error) {
      console.error(error);
      toast.error("Board creation failed");
    }
  };

  const deleteBoard = async (id) => {
    try {
      await deleteBoardAPI(id);
      await fetchBoards();
      await fetchStats();
    } catch (error) {
      console.error(error);
      toast.error("Delete failed");
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: "var(--surface)" }}>
        <Sidebar />
        <div style={{ marginLeft: "var(--sidebar-w)", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
          <div style={{ width: 36, height: 36, border: "3px solid var(--border)", borderTop: "3px solid var(--accent)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
          <p style={{ fontSize: 14, color: "var(--text-3)" }}>Loading…</p>
        </div>
      </div>
    );
  }

  const chartData = stats
    ? [
        { name: "Todo",      value: stats.todoTasks    },
        { name: "Completed", value: stats.doneTasks     },
        { name: "Overdue",   value: stats.overdueTasks  },
      ]
    : [];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--surface)" }}>
      <Sidebar />

      <div style={{ marginLeft: "var(--sidebar-w)", flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Navbar title="Dashboard" openBoardModal={() => setShowBoardModal(true)} />

        <main style={{ padding: 24, flex: 1 }}>

          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text)" }}>Welcome Back</h1>
            <p style={{ color: "var(--text-3)", marginTop: 4 }}>Here's what's happening with your projects today</p>
          </div>

          {/* Stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
            {[
              { label: "Total tasks", value: stats?.totalTasks   ?? 0, color: "var(--blue)"   },
              { label: "Pending",     value: stats?.todoTasks    ?? 0, color: "var(--yellow)" },
              { label: "Completed",   value: stats?.doneTasks    ?? 0, color: "var(--green)"  },
              { label: "Overdue",     value: stats?.overdueTasks ?? 0, color: "var(--red)"    },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: "var(--card-r)", padding: "16px 18px", borderTop: `3px solid ${color}` }}>
                <p style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 500, marginBottom: 6 }}>{label}</p>
                <p style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.5px", color: "var(--text)" }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Task Analytics */}
          {stats && (
            <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: "var(--card-r)", padding: 24, marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: "var(--text)" }}>Task Analytics</h2>
              <div style={{ width: "100%", height: 280 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={100} label>
                      <Cell fill="#eab308" />
                      <Cell fill="#22c55e" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Boards grid */}
          {boards.length === 0 ? (
            <div style={{ padding: 40, borderRadius: 12, textAlign: "center", background: "var(--white)", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)" }}>No Boards Yet</h2>
              <p style={{ color: "var(--text-3)", marginTop: 6 }}>Click "+ New board" to create your first project board.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {boards.map(board => (
                <BoardCard
                  key={board.id}
                  board={board}
                  deleteBoard={deleteBoard}
                  refreshBoards={fetchBoards}
                />
              ))}
            </div>
          )}

          {/* Recent Activity — bottom */}
          <div style={{ marginTop: 32 }}>
            <ActivityTimeline refresh={boards} />
          </div>

        </main>
      </div>

      {/* Create Board Modal */}
      {showBoardModal && (
        <div className="modal-overlay" onClick={() => setShowBoardModal(false)}>
          <div className="modal-card" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <h2 style={{ margin: 0 }}>Create New Board</h2>
              <button onClick={() => { setShowBoardModal(false); reset(); }} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "var(--text-3)" }}>✕</button>
            </div>

            <form className="modal-form" onSubmit={handleSubmit(createBoard)}>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)" }}>Board Title *</label>
                <input placeholder="Enter board title" {...register("title")} />
                {errors.title && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{errors.title.message}</p>}
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)" }}>Description *</label>
                <textarea rows={3} placeholder="What is this board about?" {...register("description")} />
                {errors.description && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{errors.description.message}</p>}
              </div>

              {/* FIX: removed custom onChange — react-hook-form's register handles it */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)" }}>Assign User</label>
                <select
                  {...register("assignedUserId")}
                  style={{ width: "100%", padding: "11px 14px", border: "1px solid var(--border)", borderRadius: 10, fontSize: 14, outline: "none", background: "var(--surface)", color: "var(--text)", boxSizing: "border-box" }}
                >
                  <option value="">Select User (optional)</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} — {user.email}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)", margin: 0 }}>
                  Project Documents (.md) — used for AI effort estimation
                </p>
                {[
                  { label: "TRD — Technical Requirements Document", field: "trdFile" },
                  { label: "BRD — Business Requirements Document",  field: "brdFile" },
                  { label: "PRD — Product Requirements Document",   field: "prdFile" },
                ].map(({ label, field }) => (
                  <div className="file-group" key={field}>
                    <label>{label}</label>
                    <input type="file" accept=".md" {...register(field)} />
                  </div>
                ))}
              </div>

              <div className="modal-buttons">
                <button type="button" className="cancel-btn" onClick={() => { setShowBoardModal(false); reset(); }}>Cancel</button>
                <button type="submit" className="create-btn" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Board"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
