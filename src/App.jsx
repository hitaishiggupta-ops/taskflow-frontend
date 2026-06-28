import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import BoardPage from "./pages/BoardPage";
import NotFound from "./pages/NotFound";
import Boards from "./pages/Boards";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";


function App() {
  return (
    <BrowserRouter>

    <Toaster />
      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route

          path="/dashboard"

          element={

            <ProtectedRoute>

              <Dashboard />

            </ProtectedRoute>

          }

        />

        <Route

          path="/board/:id"

          element={

            <ProtectedRoute>

              <BoardPage />

            </ProtectedRoute>

          }

        />

        <Route path="*" element={<NotFound />} />

        <Route
  path="/boards"
  element={
    <ProtectedRoute>
      <Boards />
    </ProtectedRoute>
  }
/>

<Route
  path="/analytics"
  element={
    <ProtectedRoute>
      <Analytics />
    </ProtectedRoute>
  }
/>

<Route
  path="/settings"
  element={
    <ProtectedRoute>
      <Settings />
    </ProtectedRoute>
  }
/>



      </Routes>

    </BrowserRouter>
  );
}

export default App;