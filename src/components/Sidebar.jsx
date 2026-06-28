import { NavLink, useNavigate } from "react-router-dom";
import {
  FaHome, FaClipboardList, FaChartPie,
  FaCog, FaSignOutAlt,
} from "react-icons/fa";
import { useEffect, useState } from "react";
import { getProfile as getProfileAPI } from "../services/userService";

const navItems = [
  { icon: FaHome,          label: "Dashboard", to: "/dashboard" },
  { icon: FaClipboardList, label: "Boards",    to: "/boards"    },
  { icon: FaChartPie,      label: "Analytics", to: "/analytics" },
];

const bottomItems = [
  { icon: FaCog, label: "Settings", to: "/settings" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const res = await getProfileAPI();
      setUser(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const navLinkStyle = ({ isActive }) => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 8,
    marginBottom: 2,
    fontSize: 13.5,
    fontWeight: isActive ? 600 : 400,
    color: isActive ? "#fff" : "rgba(255,255,255,0.65)",
    background: isActive ? "rgba(99,102,241,0.25)" : "transparent",
    transform: isActive ? "translateX(4px)" : "translateX(0)",
    transition: "all .2s ease",
    textDecoration: "none",
  });

  const sectionLabel = {
    fontSize: 10,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    color: "rgba(255,255,255,0.35)",
    padding: "8px 12px",
    marginTop: 4,
  };

  return (
    <aside
      style={{
        width: "var(--sidebar-w)",
        minWidth: "var(--sidebar-w)",
        background: "var(--navy)",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        display: "flex",
        flexDirection: "column",
        zIndex: 50,
        boxShadow: "4px 0 20px rgba(0,0,0,0.15)",
      }}
    >
      {/* ── Logo ─────────────────────────────────────── */}
      <div
        style={{
          padding: "18px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            color: "#fff",
            fontSize: 16,
            flexShrink: 0,
          }}
        >
          T
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>
            TaskFlow
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 400 }}>
            Project Manager
          </div>
        </div>
      </div>

      {/* ── Main Nav ─────────────────────────────────── */}
      <div style={{ padding: "12px 8px 0" }}>
        <p style={sectionLabel}>Workspace</p>
        {navItems.map(({ icon: Icon, label, to }) => (
          <NavLink key={to} to={to} style={navLinkStyle}>
            <Icon style={{ fontSize: 15, opacity: 0.85 }} />
            {label}
          </NavLink>
        ))}
      </div>

      {/* ── Bottom Nav ───────────────────────────────── */}
      <div style={{ padding: "0 8px", marginTop: "auto" }}>
        <p style={sectionLabel}>Account</p>

        {bottomItems.map(({ icon: Icon, label, to }) => (
          <NavLink key={to} to={to} style={navLinkStyle}>
            <Icon style={{ fontSize: 15, opacity: 0.85 }} />
            {label}
          </NavLink>
        ))}

        {/* Logout button */}
        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            marginBottom: 2,
            fontSize: 13.5,
            fontWeight: 400,
            color: "rgba(255,100,100,0.85)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            textAlign: "left",
            transition: "all .2s ease",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(239,68,68,0.15)";
            e.currentTarget.style.color = "#ff6b6b";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "rgba(255,100,100,0.85)";
          }}
        >
          <FaSignOutAlt style={{ fontSize: 15, opacity: 0.85 }} />
          Logout
        </button>
      </div>

      {/* ── User profile strip ───────────────────────── */}
      <div
        style={{
          padding: "14px 16px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 15,
            flexShrink: 0,
          }}
        >
          {user?.name?.charAt(0)?.toUpperCase() ?? "?"}
        </div>

        {/* Name + email */}
        <div style={{ overflow: "hidden" }}>
          <div
            style={{
              color: "#fff",
              fontWeight: 600,
              fontSize: 13.5,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {user?.name ?? "Loading…"}
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: 11,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {user?.email ?? ""}
          </div>
        </div>
      </div>
    </aside>
  );
}
