import { BrowserRouter, Routes, Route } from "react-router-dom";

import AdminLayout from "./layout/AdminLayout";

import Dashboard from "./pages/Dashboard";
import States from "./pages/States";
import LabourWages from "./pages/LabourWages";
import EditLabourWages from "./pages/EditLabourWages";

import Login from "./pages/Login";
import ProtectedLayout from "./pages/ProtectedLayout";
import ManageLabourWages from "./pages/ManageLabourWages";

import ELibraryManager from "./pages/ELibraryManager";
import ManageELibrary from "./pages/ManageELibrary";
import EditELibrary from "./pages/EditELibrary";

export default function App() {

  return (
    <BrowserRouter>

      <Routes>

        {/* PUBLIC */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* PROTECTED ADMIN */}
        <Route
          element={
            <ProtectedLayout>
              <AdminLayout />
            </ProtectedLayout>
          }
        >

          {/* DASHBOARD */}
          <Route
            path="/"
            element={<Dashboard />}
          />

          {/* STATES */}
          <Route
            path="/states"
            element={<States />}
          />

          {/* EDIT LABOUR WAGES */}
          <Route
            path="/admin/labour-wages/edit/:id"
            element={<EditLabourWages />}
          />

          {/* LABOUR WAGES */}
          <Route
            path="/labour-wages"
            element={<LabourWages />}
          />

          {/* E-LIBRARY ADD */}
          <Route
            path="/admin/e-library"
            element={<ELibraryManager />}
          />

          {/* E-LIBRARY MANAGE */}
          <Route
            path="/admin/e-library/manage"
            element={<ManageELibrary />}
          />

          {/* MANAGE LABOUR WAGES */}
          <Route
            path="/admin/labour-wages/manage"
            element={<ManageLabourWages />}
          />

          {/* E-LIBRARY EDIT */}
          <Route
            path="/admin/e-library/edit/:id"
            element={<EditELibrary />}
          />

        </Route>

      </Routes>

    </BrowserRouter>
  );
}