import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { getDashboardStats } from "../services/dashboardService";
import { getBoards as getBoardsAPI } from "../services/boardService";
import { getTasks as getTasksAPI } from "../services/taskService";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line, CartesianGrid,
} from "recharts";

// ── colour palette ───────────────────────────────────────────────
const C = {
  accent:  "#6366f1",
  green:   "#10b981",
  yellow:  "#f59e0b",
  red:     "#ef4444",
  blue:    "#3b82f6",
  purple:  "#8b5cf6",
  slate:   "#94a3b8",
};

// ── small stat card ──────────────────────────────────────────────
function StatCard({ label, value, icon, color, sub }) {
  return (
    <div style={{
      background: "var(--white)", border: "1px solid var(--border)",
      borderTop: `3px solid ${color}`, borderRadius: "var(--card-r)",
      padding: "18px 20px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 500, marginBottom: 6 }}>{label}</p>
          <p style={{ fontSize: 32, fontWeight: 700, color: "var(--text)", letterSpacing: "-1px", lineHeight: 1 }}>
            {value}
          </p>
          {sub && <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 6 }}>{sub}</p>}
        </div>
        <span style={{
          fontSize: 22,
          width: 42, height: 42, borderRadius: 10,
          background: color + "18",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>{icon}</span>
      </div>
    </div>
  );
}

// ── chart card wrapper ────────────────────────────────────────────
function ChartCard({ title, subtitle, children, style = {} }) {
  return (
    <div style={{
      background: "var(--white)", border: "1px solid var(--border)",
      borderRadius: "var(--card-r)", padding: "20px 24px",
      ...style,
    }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{title}</h3>
      {subtitle && <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 18 }}>{subtitle}</p>}
      {children}
    </div>
  );
}

// ── custom tooltip ────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--white)", border: "1px solid var(--border)",
      borderRadius: 8, padding: "10px 14px", fontSize: 13,
      boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
    }}>
      <p style={{ fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
}

// ── main ──────────────────────────────────────────────────────────
export default function Analytics() {
  const [stats,    setStats]    = useState(null);
  const [allTasks, setAllTasks] = useState([]);
  const [boards,   setBoards]   = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [statsRes, boardsRes] = await Promise.all([
        getDashboardStats(),
        getBoardsAPI(),
      ]);
      setStats(statsRes.data);
      setBoards(boardsRes.data);

      // gather every task across all boards
      const taskArrays = await Promise.all(
        boardsRes.data.map(b => getTasksAPI(b.id).then(r => r.data).catch(() => []))
      );
      setAllTasks(taskArrays.flat());
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ── derived data ────────────────────────────────────────────────

  // 1. Status breakdown (pie)
  const statusData = [
    { name: "To Do",       value: allTasks.filter(t => t.status === "todo").length,        fill: C.yellow  },
    { name: "In Progress", value: allTasks.filter(t => t.status === "in-progress").length, fill: C.accent  },
    { name: "Done",        value: allTasks.filter(t => t.status === "done").length,        fill: C.green   },
  ];

  // 2. Priority breakdown (bar)
  const priorityData = [
    { name: "High",   count: allTasks.filter(t => t.priority === "high").length,   fill: C.red    },
    { name: "Medium", count: allTasks.filter(t => t.priority === "medium").length, fill: C.yellow },
    { name: "Low",    count: allTasks.filter(t => t.priority === "low").length,    fill: C.green  },
  ];

  // 3. Tasks per board (bar — top 8)
  const perBoardData = boards.map(b => ({
    name:  b.title.length > 14 ? b.title.slice(0, 14) + "…" : b.title,
    tasks: allTasks.filter(t => t.boardId === b.id).length,
  })).sort((a, b) => b.tasks - a.tasks).slice(0, 8);

  // 4. Task creation over last 7 days (line)
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString("en-US", { weekday: "short" });
    const dateStr = d.toISOString().split("T")[0];
    const count = allTasks.filter(t =>
      t.createdAt && t.createdAt.split("T")[0] === dateStr
    ).length;
    return { name: label, Tasks: count };
  });

  // 5. Completion rate
  const total     = allTasks.length;
  const done      = allTasks.filter(t => t.status === "done").length;
  const completionRate = total === 0 ? 0 : Math.round((done / total) * 100);

  // 6. Overdue
  const overdue = allTasks.filter(
    t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done"
  ).length;

  // 7. Most productive board (most done tasks)
  const boardDone = boards.map(b => ({
    name: b.title,
    done: allTasks.filter(t => t.boardId === b.id && t.status === "done").length,
  })).sort((a, b) => b.done - a.done);
  const topBoard = boardDone[0];

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: "var(--surface)" }}>
        <Sidebar />
        <div style={{ marginLeft: "var(--sidebar-w)", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 14 }}>
          <div style={{ width: 36, height: 36, border: "3px solid var(--border)", borderTop: "3px solid var(--accent)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
          <p style={{ fontSize: 14, color: "var(--text-3)" }}>Crunching the numbers…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--surface)" }}>
      <Sidebar />

      <div style={{ marginLeft: "var(--sidebar-w)", flex: 1, display: "flex", flexDirection: "column" }}>
        <Navbar title="Analytics" />

        <main style={{ padding: 24, flex: 1 }}>

          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--text)" }}>Analytics Dashboard</h1>
            <p style={{ color: "var(--text-3)", marginTop: 4, fontSize: 13 }}>
              Productivity insights across all your boards and tasks.
            </p>
          </div>

          {/* ── KPI cards ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
            <StatCard label="Total Tasks"      value={total}           icon="📋" color={C.blue}   sub={`Across ${boards.length} boards`} />
            <StatCard label="Completion Rate"  value={`${completionRate}%`} icon="✅" color={C.green}  sub={`${done} of ${total} done`} />
            <StatCard label="Overdue"          value={overdue}         icon="⚠️" color={C.red}    sub="Not yet completed" />
            <StatCard label="In Progress"      value={allTasks.filter(t => t.status === "in-progress").length} icon="🔄" color={C.accent} sub="Active right now" />
          </div>

          {/* ── Row 1: Status pie + Priority bar ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

            <ChartCard title="Task Status Breakdown" subtitle="Distribution by current status">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%" cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={v => <span style={{ fontSize: 12, color: "var(--text-2)" }}>{v}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Tasks by Priority" subtitle="High, medium, and low priority counts">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={priorityData} barSize={40}>
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--text-3)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "var(--text-3)" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {priorityData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

          </div>

          {/* ── Row 2: Line (7-day trend) + Per-board bar ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

            <ChartCard title="Tasks Created — Last 7 Days" subtitle="Daily task creation trend">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={last7}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--text-3)" }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "var(--text-3)" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="Tasks"
                    stroke={C.accent}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: C.accent, strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Tasks per Board" subtitle="Top boards by task count">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={perBoardData} layout="vertical" barSize={16}>
                  <XAxis type="number" tick={{ fontSize: 12, fill: "var(--text-3)" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12, fill: "var(--text-2)" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="tasks" fill={C.accent} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

          </div>

          {/* ── Row 3: Highlights ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>

            {/* Completion rate visual */}
            <ChartCard title="Overall Completion" subtitle="Tasks done vs total">
              <div style={{ textAlign: "center", padding: "12px 0" }}>
                <div style={{ position: "relative", display: "inline-block" }}>
                  <svg width={140} height={140} viewBox="0 0 140 140">
                    <circle cx={70} cy={70} r={54} fill="none" stroke="var(--border)" strokeWidth={12} />
                    <circle
                      cx={70} cy={70} r={54}
                      fill="none"
                      stroke={completionRate === 100 ? C.green : C.accent}
                      strokeWidth={12}
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 54}`}
                      strokeDashoffset={`${2 * Math.PI * 54 * (1 - completionRate / 100)}`}
                      transform="rotate(-90 70 70)"
                      style={{ transition: "stroke-dashoffset 0.8s ease" }}
                    />
                    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize={26} fontWeight={700} fill="var(--text)">
                      {completionRate}%
                    </text>
                    <text x="50%" y="65%" dominantBaseline="middle" textAnchor="middle" fontSize={11} fill="var(--text-3)">
                      complete
                    </text>
                  </svg>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 8 }}>
                  {done} done · {total - done} remaining
                </p>
              </div>
            </ChartCard>

            {/* Top board */}
            <ChartCard title="Most Productive Board" subtitle="By completed tasks">
              {topBoard && topBoard.done > 0 ? (
                <div style={{ padding: "8px 0" }}>
                  <div style={{
                    background: "var(--accent-light)", borderRadius: 10,
                    padding: "18px 20px", textAlign: "center", marginBottom: 14,
                  }}>
                    <div style={{ fontSize: 28 }}>🏆</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--accent-text)", marginTop: 8 }}>
                      {topBoard.name}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--accent-text)", opacity: 0.75, marginTop: 4 }}>
                      {topBoard.done} tasks completed
                    </div>
                  </div>
                  {boardDone.slice(0, 3).map((b, i) => (
                    <div key={b.name} style={{
                      display: "flex", justifyContent: "space-between",
                      alignItems: "center", padding: "6px 0",
                      borderBottom: i < 2 ? "1px solid var(--border)" : "none",
                    }}>
                      <span style={{ fontSize: 13, color: "var(--text-2)" }}>
                        {["🥇","🥈","🥉"][i]} {b.name.length > 18 ? b.name.slice(0, 18) + "…" : b.name}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{b.done}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text-3)", fontSize: 13 }}>
                  No completed tasks yet
                </div>
              )}
            </ChartCard>

            {/* Quick health summary */}
            <ChartCard title="Health Summary" subtitle="At-a-glance project health">
              <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 4 }}>
                {[
                  {
                    label: "On-time completion",
                    value: `${completionRate}%`,
                    status: completionRate >= 70 ? "good" : completionRate >= 40 ? "warn" : "bad",
                  },
                  {
                    label: "Overdue tasks",
                    value: overdue,
                    status: overdue === 0 ? "good" : overdue <= 3 ? "warn" : "bad",
                  },
                  {
                    label: "Active boards",
                    value: boards.length,
                    status: boards.length > 0 ? "good" : "bad",
                  },
                  {
                    label: "High priority pending",
                    value: allTasks.filter(t => t.priority === "high" && t.status !== "done").length,
                    status: allTasks.filter(t => t.priority === "high" && t.status !== "done").length === 0
                      ? "good"
                      : allTasks.filter(t => t.priority === "high" && t.status !== "done").length <= 3
                      ? "warn" : "bad",
                  },
                ].map(({ label, value, status }) => {
                  const dot = status === "good" ? C.green : status === "warn" ? C.yellow : C.red;
                  const bg  = status === "good" ? "#ecfdf5" : status === "warn" ? "#fffbeb" : "#fef2f2";
                  return (
                    <div key={label} style={{
                      display: "flex", justifyContent: "space-between",
                      alignItems: "center", padding: "10px 12px",
                      background: bg, borderRadius: 8,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: dot, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: "var(--text-2)" }}>{label}</span>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{value}</span>
                    </div>
                  );
                })}
              </div>
            </ChartCard>

          </div>

        </main>
      </div>
    </div>
  );
}
