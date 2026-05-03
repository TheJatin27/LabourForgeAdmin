import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout";
import Dashboard from "./pages/Dashboard";
import States from "./pages/States";
import LabourWages from "./pages/LabourWages";
import Login from "./pages/Login";
import ProtectedLayout from "./pages/ProtectedLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Admin Routes */}
        <Route
          element={
            <ProtectedLayout>
              <AdminLayout />
            </ProtectedLayout>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/states" element={<States />} />
          <Route path="/labour-wages" element={<LabourWages />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}