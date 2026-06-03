import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import CompanySettings from "./pages/CompanySettings";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<CompanySettings />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
