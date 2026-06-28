import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getProfile as getProfileAPI,
  updateProfile as updateProfileAPI,
} from "../services/userService";
import toast from "react-hot-toast";
import { profileSchema } from "../validations/profileSchema";

export default function Settings() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await getProfileAPI();
        reset({ name: res.data.name || "", email: res.data.email || "", password: "" });
      } catch (err) {
        console.log(err);
        toast.error("Failed to load profile");
      }
    };
    loadProfile();
  }, [reset]);

  // ✅ Fixed: was using bare variables instead of `data`
  const updateProfile = async (data) => {
    try {
      await updateProfileAPI({
        name:     data.name,
        email:    data.email,
        password: data.password?.trim() ? data.password : undefined,
      });
      toast.success("Profile updated successfully");
      reset({ ...data, password: "" });
    } catch (error) {
      console.log(error);
      toast.error("Update failed");
    }
  };

  const inputStyle = {
    width: "100%",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "10px 12px",
    fontSize: 13,
    marginTop: 4,
    marginBottom: 2,
    outline: "none",
    background: "var(--surface)",
    color: "var(--text)",
  };

  const labelStyle = {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--text-2)",
    marginTop: 12,
    display: "block",
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--surface)" }}>
      <Sidebar />

      <div style={{ marginLeft: "var(--sidebar-w)", flex: 1, display: "flex", flexDirection: "column" }}>
        <Navbar title="Settings" />

        <div style={{ padding: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text)" }}>Profile Settings</h1>
          <p style={{ color: "var(--text-3)", marginTop: 6 }}>Manage your account preferences</p>

          <form
            onSubmit={handleSubmit(updateProfile)}
            style={{
              marginTop: 24,
              maxWidth: 420,
              background: "var(--white)",
              border: "1px solid var(--border)",
              padding: 24,
              borderRadius: 12,
            }}
          >
            <label style={labelStyle}>Name</label>
            <input style={inputStyle} {...register("name")} placeholder="Enter name" />
            {errors.name && <p style={{ color: "#ef4444", fontSize: 12 }}>{errors.name.message}</p>}

            <label style={labelStyle}>Email</label>
            <input style={inputStyle} {...register("email")} placeholder="Enter email" />
            {errors.email && <p style={{ color: "#ef4444", fontSize: 12 }}>{errors.email.message}</p>}

            <label style={labelStyle}>Password (optional)</label>
            <input
              type="password"
              style={inputStyle}
              {...register("password")}
              placeholder="Leave blank to keep current password"
            />
            {errors.password && <p style={{ color: "#ef4444", fontSize: 12 }}>{errors.password.message}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                marginTop: 18,
                width: "100%",
                padding: "10px",
                background: "var(--accent)",
                color: "#fff",
                border: "none",
                borderRadius: "var(--radius)",
                fontSize: 14,
                fontWeight: 600,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.6 : 1,
              }}
            >
              {isSubmitting ? "Saving…" : "Update Profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
