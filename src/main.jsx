import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthProvider from "./context/AuthContext";

ReactDOM.createRoot(
    document.getElementById("root")
).render(
    <React.StrictMode>
        <AuthProvider>
            <App />
            <ToastContainer />
        </AuthProvider>
    </React.StrictMode>
);