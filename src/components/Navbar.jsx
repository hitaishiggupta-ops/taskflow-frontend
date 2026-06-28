import { useNavigate } from "react-router-dom";
import { FiBell, FiSearch, FiSun, FiMoon } from "react-icons/fi";
import { useState, useEffect } from "react";

export default function Navbar({ title = "Dashboard", openBoardModal }) {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <header
      style={{
        height: 52,
        background: "var(--white)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>
        {title}
      </span>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

        {/* Search */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "6px 12px",
            width: 220,
          }}
        >
          <FiSearch style={{ color: "var(--text-3)", fontSize: 14 }} />
          <input
            placeholder="Search tasks, boards…"
            style={{
              border: "none",
              background: "transparent",
              outline: "none",
              fontSize: 13,
              color: "var(--text)",
              width: "100%",
            }}
          />
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={() => setDarkMode(d => !d)}
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          style={{
            width: 34,
            height: 34,
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            background: "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--text-2)",
          }}
        >
          {darkMode ? <FiSun style={{ fontSize: 16 }} /> : <FiMoon style={{ fontSize: 16 }} />}
        </button>

        {/* Bell */}
        <button
          onClick={() => alert("No notifications")}
          style={{
            width: 34,
            height: 34,
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            background: "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--text-2)",
          }}
        >
          <FiBell style={{ fontSize: 16 }} />
        </button>

        {/* New board — only shown when openBoardModal is passed */}
        {openBoardModal && (
          <button
            onClick={openBoardModal}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              background: "var(--accent)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--radius)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            + New board
          </button>
        )}

      </div>
    </header>
  );
}
