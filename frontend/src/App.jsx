import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import CompanySettings from "./pages/CompanySettings";
import Login from "./pages/Login";
import { useAuth } from "./context/authContext";

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<Login />} />
          <Route
            path="/home"
            element={
              <RequireAuth>
                <CompanySettings />
              </RequireAuth>
            }
          />
        </Routes>
      </Router>
    </>
  )
}

export default App
