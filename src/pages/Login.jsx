import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/authService";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../validations/loginSchema";
export default function Login() {
  const {
    register,
    handleSubmit,
    formState:{ errors }
}
= useForm({

    resolver:
        zodResolver(loginSchema)
});

  const { setToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const loginUser = async (data) => {
  try {

    const res = await login(data.email, data.password);
console.log(res.data);

    setToken(res.data.token);

localStorage.setItem(
    "user",
    JSON.stringify(res.data.user)
);

    toast.success("Login successful");

    navigate("/dashboard");

  } catch (error) {

    toast.error(
      "Invalid credentials — check your email and password."
    );

  }
};

  const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "var(--text-2)",
  marginBottom: 6,
};

const inputStyle = {
  width: "100%",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: "9px 12px",
  fontSize: 13,
  color: "var(--text)",
  outline: "none",
  background: "var(--surface)",
};
return (
  <div style={{
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--surface)",
  }}>
    <div style={{
      background: "var(--white)",
      border: "1px solid var(--border)",
      borderRadius: 16,
      padding: "36px 40px",
      width: 380,
      boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
    }}>
      {/* Brand */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 28,
      }}>
        <div style={{
          width: 36, height: 36,
          background: "var(--accent)",
          borderRadius: 9,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          color: "#fff",
          fontSize: 18,
        }}>T</div>
        <span style={{ fontSize: 18, fontWeight: 600 }}>TaskFlow</span>
      </div>

      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
        Welcome back
      </h1>
      <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 24 }}>
        Sign in to your workspace
      </p>

      <form onSubmit={handleSubmit(loginUser)}>
      <label style={labelStyle}>Email</label>
      <input
        style={inputStyle}
        type="email"
        {...register("email")}
    placeholder="Email"
/>

{
errors.email &&
<p style={{color:"red"}}>
    {errors.email.message}
</p>
}

      <label style={{ ...labelStyle, marginTop: 14 }}>Password</label>
      <input
        style={inputStyle}
        type="password"
        {...register("password")}
    placeholder="Password"
/>

{
errors.password &&
<p style={{color:"red"}}>
    {errors.password.message}
</p>
}

      <button type="submit"  style={{
        width: "100%",
        marginTop: 20,
        padding: "10px 0",
        background: "var(--accent)",
        color: "#fff",
        border: "none",
        borderRadius: "var(--radius)",
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
      }}>
        Sign in
      </button>

      </form>

      <p style={{ textAlign: "center", marginTop: 18, fontSize: 13, color: "var(--text-3)" }}>
        No account?{" "}
        <Link to="/register" style={{ color: "var(--accent)", fontWeight: 500 }}>
          Create one
        </Link>
      </p>
    </div>
  </div>
);




}