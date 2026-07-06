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
import ShopsEstablishmentsManager from "./pages/ShopsEstablishmentsManager";

import StateComplianceManager from "./pages/StateComplianceManager";

import ManageStateCompliance from "./pages/ManageStateCompliance";

import EditStateCompliance from "./pages/EditStateCompliance";

import AdminHomepageManager from "./pages/AdminHomepageManager";

import ProfessionalTax from "./pages/ProfessionalTax";

import ManageProfessionalTaxes from "./pages/ManageProfessionalTaxes";  

import EditProfessionalTax from "./pages/EditProfessionalTax";

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

          {/* MANAGE PROFESSIONAL TAX */}
          <Route
            path="/admin/professional-taxes/manage"
            element={<ManageProfessionalTaxes />}
          />


          {/* EDIT PROFESSIONAL TAX */}
          <Route
            path="/admin/professional-taxes/edit/:id"
            element={<EditProfessionalTax />}
          />



          {/* PROFESSIONAL TAX */}
          <Route
            path="/professional-tax"
            element={<ProfessionalTax />}
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


          {/* ADMIN HOMEPAGE */}
          <Route
            path="/admin/homepage"
            element={<AdminHomepageManager />}
          />

          {/* SHOPS AND ESTABLISHMENTS */}
          <Route
            path="/admin/shops-establishments"
            element={<ShopsEstablishmentsManager />}
          />

          {/* STATE COMPLIANCE */}
          {/* STATE COMPLIANCE */}
<Route 
  path="/admin/shops-establishments/state-grid" 
  element={<StateComplianceManager />} 
/>

          {/* MANAGE STATE COMPLIANCE */}
          <Route
            path="/admin/shops-establishments/manage"
            element={<ManageStateCompliance />}
           /> 


{/* Paste this row alongside your other manage routes */}
<Route 
  path="/admin/shops-establishments/state-grid/edit/:id" 
  element={<EditStateCompliance />} 
/>


        </Route>

      </Routes>

    </BrowserRouter>
  );
}