import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { MapPin, FileText, CheckCircle, XCircle, Loader2, Calendar } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

export default function EditLabourWages() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [state, setState] = useState("");
  const [period, setPeriod] = useState(""); // Holds Year / Period
  const [documentUrl, setDocumentUrl] = useState("");
  const [notes, setNotes] = useState(""); // Holds Compliance Notes / Remarks
  const [headers, setHeaders] = useState([]); // Dynamic headers from database snapshot
  const [wages, setWages] = useState([]); // Dynamic row objects
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // FETCH DATA STREAM FROM FIRESTORE RECORD
  useEffect(() => {
    const fetchWageData = async () => {
      try {
        const ref = doc(db, "minimumWages", id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          setState(data.state || "");
          setPeriod(data.period || ""); // Pull period matrix values
          setDocumentUrl(data.documentUrl || "");
          setNotes(data.notes || ""); // Pull stored compliance notes
          setWages(data.wages || []);
          
          // Re-instantiate schema headers layout dynamically
          if (data.headers) {
            setHeaders(data.headers);
          } else if (data.wages && data.wages.length > 0) {
            // Fallback generation logic if schema key tracks are unpopulated
            setHeaders(Object.keys(data.wages[0]));
          }
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

  // HANDLE INTERACTIVE CELL DATA SELECTION MUTATIONS DYNAMICALLY
  const updateCell = (rowIndex, columnName, value) => {
    const copy = [...wages];
    // Keep numeric entry format intact where applicable, fallback to generic strings
    copy[rowIndex][columnName] = isNaN(value) || value === "" ? value : Number(value);
    setWages(copy);
  };

  // POST UPDATED STRUCTURAL VALUE MATRICES BACK TO CLOUD DATABASE
  const saveChanges = async () => {
    if (!state.trim()) {
      alert("State field cannot be left blank");
      return;
    }
    if (!period.trim()) {
      alert("Please enter the Effective Period / Year context");
      return;
    }

    try {
      setSaving(true);
      const ref = doc(db, "minimumWages", id);
      
      await updateDoc(ref, {
        state: state.trim(),
        period: period.trim(),
        documentUrl: documentUrl.trim(),
        notes: notes.trim(), // Save the compliance notes field
        headers, // Keep column schema map records updated
        wages,   // Save dynamic modified dataset rows 
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
        <p className="text-gray-500">Modify regional dataset arrays and tracking values dynamically.</p>
      </div>

      {/* Step 1: Input Metadata Control Blocks */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-6">
          
          {/* State Name Field */}
          <div className="w-full">
            <label className="block text-sm font-semibold text-gray-700 mb-2">State Name</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                placeholder="e.g. Haryana"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>

          {/* Dynamic Period Configuration Tracker Field */}
          <div className="w-full">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Effective Period / Year</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                placeholder="e.g. 2026-2027"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>

          {/* Act / Notification URL Field */}
          <div className="w-full">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Official Gazette URL</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="url"
                placeholder="https://labour.gov.in/..."
                value={documentUrl}
                onChange={(e) => setDocumentUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>
        </div>

        {/* Compliance Notes / Remarks Block */}
        <div className="border-t border-gray-100 pt-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Compliance Notes / Remarks</label>
          <div className="relative border border-gray-200 rounded-md p-3 focus-within:ring-2 focus-within:ring-blue-500">
            <div className="absolute top-3.5 left-3 text-gray-400 pointer-events-none">
              <FileText size={16} />
            </div>
            <textarea
              rows={3}
              placeholder="Add specific exemptions, registration limits, or custom notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full pl-7 text-sm text-gray-700 placeholder-gray-400 outline-none resize-y font-sans"
            />
          </div>
        </div>
      </div>

      {/* Step 2: Dynamic Schema Representation Matrix Grid Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-700">Wage Value Matrices Map</h3>
          <span className="text-xs font-mono text-gray-500">{wages.length} Categories Configured</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-bold border-b border-gray-200">
              <tr>
                {headers.map((heading, idx) => (
                  <th key={idx} className="px-6 py-3 whitespace-nowrap">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {wages.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                  {headers.map((heading, colIndex) => (
                    <td key={colIndex} className="px-4 py-2 min-w-[160px]">
                      <input
                        type={typeof row[heading] === "number" ? "number" : "text"}
                        value={row[heading] ?? ""}
                        onChange={(e) => updateCell(rowIndex, heading, e.target.value)}
                        className={`w-full border rounded px-2 py-1 outline-none text-sm focus:ring-1 focus:ring-blue-500 ${
                          colIndex === 0 
                            ? "bg-gray-50 font-medium text-gray-800 border-gray-200" 
                            : "border-gray-300"
                        }`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action Bottom Layout Strip Control Panel */}
        <div className="p-4 border-t border-gray-200 flex justify-end gap-3 bg-white">
          <button 
            type="button"
            onClick={() => navigate("/admin/labour-wages/manage")}
            disabled={saving}
            className="px-4 py-2 flex items-center gap-2 text-gray-600 font-semibold hover:bg-gray-100 rounded border border-gray-300 transition-all text-sm disabled:opacity-50"
          >
            <XCircle size={16} /> Cancel Modification
          </button>
          
          <button 
            type="button"
            onClick={saveChanges}
            disabled={saving}
            className="px-6 py-2 flex items-center gap-2 bg-blue-600 text-white font-bold hover:bg-blue-700 rounded shadow-sm transition-all text-sm disabled:opacity-50"
          >
            {saving ? (
              <><Loader2 size={16} className="animate-spin" /> Committing Configurations...</>
            ) : (
              <><CheckCircle size={16} /> Update Changes</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}