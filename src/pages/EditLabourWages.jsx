import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { parseWageTable } from "../utils/parseWageTable";
import { 
  MapPin, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Calendar, 
  PlusCircle, 
  Trash2, 
  Building2,
  Edit3
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

export default function EditLabourWages() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [state, setState] = useState("");
  const [month, setMonth] = useState("January"); // Added State-level month selector
  const [year, setYear] = useState(""); 
  const [documentUrl, setDocumentUrl] = useState("");
  const [notes, setNotes] = useState(""); 
  const [headers, setHeaders] = useState([]); 
  const [wages, setWages] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // --- District Schedule Modal & State ---
  const [districts, setDistricts] = useState([]); 
  const [isDistrictModalOpen, setIsDistrictModalOpen] = useState(false);
  const [editingDistrictId, setEditingDistrictId] = useState(null);

  // District Form & Preview Inputs
  const [districtName, setDistrictName] = useState("");
  const [districtMonth, setDistrictMonth] = useState("January");
  const [districtYear, setDistrictYear] = useState(new Date().getFullYear().toString());
  const [districtHeaders, setDistrictHeaders] = useState([]);
  const [districtWages, setDistrictWages] = useState([]);
  const [districtPreview, setDistrictPreview] = useState(false);
  const [districtParsing, setDistrictParsing] = useState(false);

  const monthsList = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  // FETCH DATA STREAM FROM FIRESTORE RECORD
  useEffect(() => {
    const fetchWageData = async () => {
      try {
        const ref = doc(db, "minimumWages", id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          setState(data.state || "");
          setMonth(data.month || "January"); // Populates saved month or falls back to January
          setYear(data.year || data.period || ""); 
          setDocumentUrl(data.documentUrl || "");
          setNotes(data.notes || "");
          setWages(data.wages || []);

          // Ensure every fetched district has a stable String ID
          const sanitizedDistricts = (data.districts || []).map((dist, idx) => ({
            ...dist,
            id: String(dist.id || `dist_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`)
          }));
          setDistricts(sanitizedDistricts); 

          if (data.headers) {
            setHeaders(data.headers);
          } else if (data.wages && data.wages.length > 0) {
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

  // Master Table Cell Mutations
  const updateCell = (rowIndex, columnName, value) => {
    const copy = [...wages];
    copy[rowIndex][columnName] = isNaN(value) || value === "" ? value : Number(value);
    setWages(copy);
  };

  // District Excel/CSV File Parsing Handler
  const handleDistrictUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setDistrictParsing(true);
      const parsed = await parseWageTable(file);

      if (parsed.headers && parsed.rows) {
        setDistrictHeaders(parsed.headers);
        setDistrictWages(parsed.rows);
      } else if (Array.isArray(parsed) && parsed.length > 0) {
        setDistrictHeaders(Object.keys(parsed[0]));
        setDistrictWages(parsed);
      }

      setDistrictPreview(true);
    } catch (err) {
      alert("Error parsing district file: " + err.message);
    } finally {
      setDistrictParsing(false);
    }
  };

  // District Cell Mutations inside Modal
  const updateDistrictCell = (rowIndex, columnName, value) => {
    const copy = [...districtWages];
    copy[rowIndex][columnName] = isNaN(value) || value === "" ? value : Number(value);
    setDistrictWages(copy);
  };

  // Open modal to add a new district
  const handleOpenAddDistrict = () => {
    setEditingDistrictId(null);
    setDistrictName("");
    setDistrictMonth("January");
    setDistrictYear(new Date().getFullYear().toString());
    setDistrictHeaders([]);
    setDistrictWages([]);
    setDistrictPreview(false);
    setIsDistrictModalOpen(true);
  };

  // Open modal to edit an existing district
  const handleOpenEditDistrict = (item) => {
    setEditingDistrictId(String(item.id));
    setDistrictName(item.districtName || "");
    setDistrictMonth(item.month || "January");
    setDistrictYear(item.year || new Date().getFullYear().toString());
    setDistrictHeaders(item.headers || []);
    setDistrictWages(item.wages || []);
    setDistrictPreview(true);
    setIsDistrictModalOpen(true);
  };

  // Save or Update district in local state array
  const handleSaveDistrict = () => {
    if (!districtName.trim()) return alert("Please enter a district name");
    if (!districtMonth) return alert("Please select a month");
    if (!districtYear.trim()) return alert("Please enter a year");
    if (districtWages.length === 0) return alert("Please upload or provide data rows for this district");

    if (editingDistrictId) {
      setDistricts(districts.map(d => String(d.id) === String(editingDistrictId) ? {
        ...d,
        districtName: districtName.trim(),
        month: districtMonth,
        year: districtYear.trim(),
        headers: districtHeaders,
        wages: districtWages
      } : d));
    } else {
      const newDistrict = {
        id: `dist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        districtName: districtName.trim(),
        month: districtMonth,
        year: districtYear.trim(),
        headers: districtHeaders,
        wages: districtWages,
      };
      setDistricts(prev => [...prev, newDistrict]);
    }

    closeDistrictModal();
  };

  const closeDistrictModal = () => {
    setIsDistrictModalOpen(false);
    setEditingDistrictId(null);
    setDistrictName("");
    setDistrictMonth("January");
    setDistrictYear(new Date().getFullYear().toString());
    setDistrictHeaders([]);
    setDistrictWages([]);
    setDistrictPreview(false);
  };

  const removeDistrict = (districtId, e) => {
    e.stopPropagation();
    setDistricts(districts.filter((d) => String(d.id) !== String(districtId)));
  };

  // POST UPDATED DATA MATRICES BACK TO CLOUD DATABASE
  const saveChanges = async () => {
    if (!state.trim()) {
      alert("State field cannot be left blank");
      return;
    }
    if (!month.trim()) {
      alert("Please select a month");
      return;
    }
    if (!year.trim()) {
      alert("Please enter the Year context (e.g., 2026)");
      return;
    }

    try {
      setSaving(true);
      const ref = doc(db, "minimumWages", id);

      await updateDoc(ref, {
        state: state.trim(),
        month: month.trim(),
        year: year.trim(),
        documentUrl: documentUrl.trim(),
        notes: notes.trim(),
        headers,
        wages,
        districts,
        updatedAt: new Date(),
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
      
      {/* Page Header Bar */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Edit Labour Wages Record</h2>
          <p className="text-gray-500">Modify regional dataset arrays and district breakdown tables dynamically.</p>
        </div>
        <button
          type="button"
          onClick={handleOpenAddDistrict}
          className="flex items-center gap-2 bg-emerald-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-emerald-700 shadow-sm transition-all text-sm"
        >
          <PlusCircle size={18} /> Add District / CPI Schedule
        </button>
      </div>

      {/* Input Metadata Control Panel */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-6">
          
          {/* State Name Field */}
          <div className="w-full">
            <label className="block text-sm font-semibold text-gray-700 mb-2">State Name</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                placeholder="e.g. Haryana / Kerala"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>

          {/* Month Selector Dropdown */}
          <div className="w-full">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Month</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-gray-400 pointer-events-none" size={18} />
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
              >
                {monthsList.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dynamic Year Configuration Tracker */}
          <div className="w-full">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                placeholder="e.g. 2026"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>

          {/* Official Gazette URL Field */}
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

        {/* Compliance Remarks Field */}
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

      {/* Attached District Schedules Cards Overview */}
      {districts.length > 0 && (
        <div className="mb-8 bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <h3 className="font-bold text-gray-800 text-md mb-3 flex items-center gap-2">
            <Building2 size={18} className="text-emerald-600" /> Attached District Schedules ({districts.length})
          </h3>
          <p className="text-xs text-gray-500 mb-4">Click any card to view or modify its data schedule.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {districts.map((item) => (
              <div 
                key={item.id} 
                onClick={() => handleOpenEditDistrict(item)}
                className="border border-emerald-200 bg-emerald-50/40 rounded-lg p-4 flex justify-between items-center cursor-pointer hover:bg-emerald-50 transition-all shadow-sm"
              >
                <div>
                  <h4 className="font-bold text-emerald-900 text-sm uppercase">{item.districtName}</h4>
                  <p className="text-xs text-emerald-700 font-medium mt-0.5">
                    Applicable: {item.month} {item.year}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{item.wages ? item.wages.length : 0} Rows configured</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-full transition-colors" title="Modify District">
                    <Edit3 size={16} />
                  </span>
                  <button
                    type="button"
                    onClick={(e) => removeDistrict(item.id, e)}
                    className="text-red-500 hover:bg-red-100 p-1.5 rounded-full transition-colors"
                    title="Remove District"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Master Dynamic Schema Grid Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-700">
            Wage Value Matrices Map: {state ? `${state} (${month} ${year})` : ""}
          </h3>
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

        {/* Action Bottom Control Panel */}
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
              <><CheckCircle size={16} /> Save Changes</>
            )}
          </button>
        </div>
      </div>

      {/* --- Add/Edit District Popup Modal --- */}
      {isDistrictModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <Building2 className="text-emerald-600" size={20} /> 
                {editingDistrictId ? "Modify District Schedule" : "Add District / CPI Schedule"}
              </h3>
              <button 
                type="button"
                onClick={closeDistrictModal} 
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                
                {/* District Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">District Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Thiruvananthapuram"
                    value={districtName}
                    onChange={(e) => setDistrictName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Applicable Month Selector */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Applicable Month</label>
                  <select
                    value={districtMonth}
                    onChange={(e) => setDistrictMonth(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {monthsList.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Applicable Year Input */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Applicable Year</label>
                  <input
                    type="text"
                    placeholder="e.g. 2026"
                    value={districtYear}
                    onChange={(e) => setDistrictYear(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Excel File Input */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Upload/Replace Excel</label>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleDistrictUpload}
                    disabled={districtParsing}
                    className="block w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 border border-gray-300 rounded-md cursor-pointer disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Parsing Progress State */}
              {districtParsing && (
                <div className="p-8 text-center text-gray-500">
                  <Loader2 className="animate-spin text-emerald-600 mx-auto mb-2" size={24} />
                  <p className="text-xs font-bold">Parsing district sheet structure...</p>
                </div>
              )}

              {/* District Sheet Data Preview & Modification Grid */}
              {districtPreview && districtHeaders.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-100 text-emerald-900 font-semibold text-xs flex justify-between">
                    <span>Configuring Table: {districtName || "District Table"} ({districtMonth} {districtYear})</span>
                    <span>{districtWages.length} Rows</span>
                  </div>
                  <div className="overflow-x-auto max-h-[300px]">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-gray-100 text-gray-600 uppercase font-bold sticky top-0 border-b border-gray-200">
                        <tr>
                          {districtHeaders.map((heading, idx) => (
                            <th key={idx} className="px-4 py-2 whitespace-nowrap">{heading}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {districtWages.map((row, rowIndex) => (
                          <tr key={rowIndex} className="hover:bg-gray-50">
                            {districtHeaders.map((heading, colIndex) => (
                              <td key={colIndex} className="px-3 py-1.5 min-w-[120px]">
                                <input
                                  type={typeof row[heading] === "number" ? "number" : "text"}
                                  value={row[heading] ?? ""}
                                  onChange={(e) => updateDistrictCell(rowIndex, heading, e.target.value)}
                                  className="w-full border border-gray-300 rounded px-2 py-1 outline-none text-xs focus:ring-1 focus:ring-emerald-500"
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Action Controls */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeDistrictModal}
                className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-200 rounded text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDistrict}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded shadow-sm text-sm flex items-center gap-2"
              >
                <CheckCircle size={16} /> {editingDistrictId ? "Update District Schedule" : "Attach District Schedule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}