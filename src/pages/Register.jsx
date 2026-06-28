import { Link, useNavigate } from "react-router-dom";
import { register as registerAPI } from "../services/authService";
import toast from "react-hot-toast";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../validations/registerSchema";

export default function Register() {

    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({

        resolver: zodResolver(registerSchema)

    });

    const registerUser = async (data) => {

        try {

            await registerAPI(data.name, data.email, data.password);

            toast.success(
                "Account created successfully"
            );

            navigate("/");

        } catch (error) {

            toast.error(
                error.response?.data?.message ||
                "Registration failed"
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

    const errorStyle = {
        color: "#ef4444",
        fontSize: 12,
        marginTop: 4,
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--surface)",
            }}
        >
            <div
                style={{
                    background: "var(--white)",
                    border: "1px solid var(--border)",
                    borderRadius: 16,
                    padding: "36px 40px",
                    width: 400,
                    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                }}
            >
                {/* Logo */}

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 28,
                    }}
                >
                    <div
                        style={{
                            width: 36,
                            height: 36,
                            background: "var(--accent)",
                            borderRadius: 9,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: 18,
                        }}
                    >
                        T
                    </div>

                    <span
                        style={{
                            fontSize: 18,
                            fontWeight: 600,
                        }}
                    >
                        TaskFlow
                    </span>
                </div>

                <h1
                    style={{
                        fontSize: 20,
                        fontWeight: 700,
                        marginBottom: 4,
                    }}
                >
                    Create account
                </h1>

                <p
                    style={{
                        fontSize: 13,
                        color: "var(--text-3)",
                        marginBottom: 24,
                    }}
                >
                    Start managing your projects
                </p>

                <form onSubmit={handleSubmit(registerUser)}>

                    {/* Name */}

                    <label style={labelStyle}>
                        Name
                    </label>

                    <input
                        style={inputStyle}
                        placeholder="Full name"
                        {...register("name")}
                    />

                    {errors.name && (
                        <p style={errorStyle}>
                            {errors.name.message}
                        </p>
                    )}

                    {/* Email */}

                    <label
                        style={{
                            ...labelStyle,
                            marginTop: 14,
                        }}
                    >
                        Email
                    </label>

                    <input
                        style={inputStyle}
                        type="email"
                        placeholder="Email"
                        {...register("email")}
                    />

                    {errors.email && (
                        <p style={errorStyle}>
                            {errors.email.message}
                        </p>
                    )}

                    {/* Password */}

                    <label
                        style={{
                            ...labelStyle,
                            marginTop: 14,
                        }}
                    >
                        Password
                    </label>

                    <input
                        style={inputStyle}
                        type="password"
                        placeholder="Password"
                        {...register("password")}
                    />

                    {errors.password && (
                        <p style={errorStyle}>
                            {errors.password.message}
                        </p>
                    )}

                    {/* Confirm Password */}

                    <label
                        style={{
                            ...labelStyle,
                            marginTop: 14,
                        }}
                    >
                        Confirm Password
                    </label>

                    <input
                        style={inputStyle}
                        type="password"
                        placeholder="Confirm password"
                        {...register("confirmPassword")}
                    />

                    {errors.confirmPassword && (
                        <p style={errorStyle}>
                            {errors.confirmPassword.message}
                        </p>
                    )}

                    <button
                        type="submit"
                        style={{
                            width: "100%",
                            marginTop: 22,
                            padding: "10px",
                            background: "var(--accent)",
                            color: "#fff",
                            border: "none",
                            borderRadius: "var(--radius)",
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: "pointer",
                        }}
                    >
                        Create Account
                    </button>
                </form>

                <p
                    style={{
                        textAlign: "center",
                        marginTop: 18,
                        fontSize: 13,
                        color: "var(--text-3)",
                    }}
                >
                    Already have an account?{" "}
                    <Link
                        to="/"
                        style={{
                            color: "var(--accent)",
                            fontWeight: 500,
                        }}
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}