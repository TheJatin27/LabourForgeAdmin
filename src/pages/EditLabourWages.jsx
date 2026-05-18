import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { MapPin, FileText, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

export default function EditLabourWages() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [state, setState] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [wages, setWages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // FETCH CURRENT ENTRY VALUE MATRICES FROM FIRESTORE
  useEffect(() => {
    const fetchWageData = async () => {
      try {
        const ref = doc(db, "minimumWages", id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          setState(data.state || "");
          setDocumentUrl(data.documentUrl || "");
          setWages(data.wages || []);
        } else {
          alert("Document context record not found");
          navigate("/admin/labour-wages/manage");
        }
      } catch (err) {
        console.error("Error retrieving snapshot data:", err);
        alert("Failed to pull record data from database");
      } finally {
        setLoading(false);
      }
    };

    fetchWageData();
  }, [id, navigate]);

  // HANDLE SINGLE CELL NUMERIC RECORD CHANGES
  const updateCell = (i, field, value) => {
    const copy = [...wages];
    copy[i][field] = Number(value);
    setWages(copy);
  };

  // UPDATE DATA MATRIX TRANSACTION PIPELINE
  const saveChanges = async () => {
    if (!state.trim()) {
      alert("State field cannot be left blank");
      return;
    }

    try {
      setSaving(true);
      const ref = doc(db, "minimumWages", id);
      
      await updateDoc(ref, {
        state: state.trim(),
        documentUrl: documentUrl.trim(),
        wages,
        updatedAt: new Date()
      });

      alert("Wage configurations saved successfully");
      navigate("/admin/labour-wages/manage");
    } catch (err) {
      console.error("Error firing update database sequence:", err);
      alert("Something went wrong while attempting to commit updates");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Loading Configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-gray-900">
      
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Edit Labour Wages Record</h2>
        <p className="text-gray-500">Modify dynamic regional values and documentation pointers link templates.</p>
      </div>

      {/* Step 1: Input Controls Wrapper Grid */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          
          {/* State Name Controller Input */}
          <div className="w-full">
            <label className="block text-sm font-semibold text-gray-700 mb-2">State Name</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                placeholder="e.g. Karnataka"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* Act / Notification URL Controller Field */}
          <div className="w-full">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Official Act / Gazette URL</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="url"
                placeholder="https://labour.gov.in/act-details..."
                value={documentUrl}
                onChange={(e) => setDocumentUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
          </div>
          
        </div>
      </div>

      {/* Step 2: Live Configuration Matrix Table Block */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-700">Wage Value Matrices Map</h3>
          <span className="text-xs font-mono text-gray-500">{wages.length} Categories Configured</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-bold border-b border-gray-200">
              <tr>
                <th className="px-6 py-3">Class / Category</th>
                <th className="px-4 py-3">Basic / Month</th>
                <th className="px-4 py-3">VDA / Month</th>
                <th className="px-4 py-3">Total / Month</th>
                <th className="px-6 py-3">Total / Day</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {wages.map((w, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-800 bg-gray-50/30">{w.class}</td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={w.basicPerMonth}
                      onChange={(e) => updateCell(i, "basicPerMonth", e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={w.vdaPerMonth}
                      onChange={(e) => updateCell(i, "vdaPerMonth", e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </td>
                  <td className="px-4 py-2 font-semibold">
                    <input
                      type="number"
                      value={w.totalPerMonth}
                      onChange={(e) => updateCell(i, "totalPerMonth", e.target.value)}
                      className="w-full border border-blue-200 bg-blue-50 text-blue-700 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 outline-none font-bold"
                    />
                  </td>
                  <td className="px-6 py-2">
                    <input
                      type="number"
                      value={w.totalPerDay}
                      onChange={(e) => updateCell(i, "totalPerDay", e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Form Controls Footer Buttons */}
        <div className="p-4 border-t border-gray-200 flex justify-end gap-3 bg-white">
          <button 
            type="button"
            onClick={() => navigate("/admin/labour-wages/manage")}
            disabled={saving}
            className="px-4 py-2 flex items-center gap-2 text-gray-600 font-semibold hover:bg-gray-100 rounded border border-gray-300 transition-all text-sm disabled:opacity-50"
          >
            <XCircle size={16} /> Cancel
          </button>
          
          <button 
            type="button"
            onClick={saveChanges}
            disabled={saving}
            className="px-6 py-2 flex items-center gap-2 bg-blue-600 text-white font-bold hover:bg-blue-700 rounded shadow-sm transition-all text-sm disabled:opacity-50"
          >
            {saving ? (
              <><Loader2 size={16} className="animate-spin" /> Saving Changes...</>
            ) : (
              <><CheckCircle size={16} /> Save Changes</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}