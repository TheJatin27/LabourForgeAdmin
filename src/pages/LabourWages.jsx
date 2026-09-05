import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
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
  Send
} from "lucide-react";

export default function LabourWages() {
  const [state, setState] = useState("");
  const [month, setMonth] = useState("January"); // Added State Month selector
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [documentUrl, setDocumentUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [headers, setHeaders] = useState([]);
  const [wages, setWages] = useState([]);
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- District Modal & Data State ---
  const [districts, setDistricts] = useState([]);
  const [isDistrictModalOpen, setIsDistrictModalOpen] = useState(false);
  
  // District form inputs
  const [districtName, setDistrictName] = useState("");
  const [districtMonth, setDistrictMonth] = useState("January");
  const [districtYear, setDistrictYear] = useState(new Date().getFullYear().toString());
  const [districtHeaders, setDistrictHeaders] = useState([]);
  const [districtWages, setDistrictWages] = useState([]);
  const [districtPreview, setDistrictPreview] = useState(false);

  // Available dropdown options
  const availableYears = ["2024", "2025", "2026", "2027", "2028"];
  const availableMonths = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  // Main file upload parser
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const parsed = await parseWageTable(file);
      
      if (parsed.headers && parsed.rows) {
        setHeaders(parsed.headers);
        setWages(parsed.rows);
      } else if (Array.isArray(parsed) && parsed.length > 0) {
        setHeaders(Object.keys(parsed[0]));
        setWages(parsed);
      }
      
      setPreview(true);
    } catch (err) {
      alert("Error parsing file: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // District file upload parser
  const handleDistrictUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  // Cell updates for main table
  const updateCell = (rowIndex, columnName, value) => {
    const copy = [...wages];
    copy[rowIndex][columnName] = isNaN(value) || value === "" ? value : Number(value);
    setWages(copy);
  };

  // Cell updates for district modal table
  const updateDistrictCell = (rowIndex, columnName, value) => {
    const copy = [...districtWages];
    copy[rowIndex][columnName] = isNaN(value) || value === "" ? value : Number(value);
    setDistrictWages(copy);
  };

  // Add parsed district to main state array
  const handleSaveDistrict = () => {
    if (!districtName) return alert("Please enter the district name");
    if (!districtMonth) return alert("Please select the month");
    if (!districtYear) return alert("Please select the year");
    if (districtWages.length === 0) return alert("Please upload a file for this district");

    const newDistrict = {
      id: Date.now(),
      districtName: districtName.trim(),
      month: districtMonth,
      year: districtYear,
      headers: districtHeaders,
      wages: districtWages,
    };

    setDistricts([...districts, newDistrict]);
    closeDistrictModal();
  };

  const closeDistrictModal = () => {
    setIsDistrictModalOpen(false);
    setDistrictName("");
    setDistrictMonth("January");
    setDistrictYear(new Date().getFullYear().toString());
    setDistrictHeaders([]);
    setDistrictWages([]);
    setDistrictPreview(false);
  };

  const removeDistrict = (id) => {
    setDistricts(districts.filter((d) => d.id !== id));
  };

  // Publish state data + district arrays to Firestore
  const publish = async () => {
    if (!state.trim()) return alert("Please select or enter a state");
    if (!month.trim()) return alert("Please select a Month");
    if (!year.trim()) return alert("Please select a Year");

    try {
      setLoading(true);
      await addDoc(collection(db, "minimumWages"), {
        state: state.trim(),
        month: month.trim(),
        year: year.trim(),
        documentUrl: documentUrl.trim(),
        notes: notes.trim(),
        headers: headers || [], 
        wages: wages || [],     
        districts,             
        createdAt: new Date(),
      });

      alert("State data published successfully!");
      setPreview(false);
      setWages([]);
      setHeaders([]);
      setDistricts([]);
      setState("");
      setMonth("January");
      setDocumentUrl("");
      setNotes("");
    } catch (err) {
      console.error(err);
      alert("Something went wrong while publishing data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-gray-900">
      {/* Page Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dynamic Labour Wages Management</h2>
          <p className="text-gray-500">Upload state-wide or district-level wage structures dynamically.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDistrictModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-emerald-700 shadow-sm transition-all text-sm"
          >
            <PlusCircle size={18} /> Add District Wage / CPI
          </button>
          
          <button
            onClick={publish}
            disabled={!state || !year || !month || loading}
            className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-5 py-2 rounded-md hover:bg-blue-700 shadow-sm transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} /> Save State Record
          </button>
        </div>
      </div>

      {/* Main Form Panel */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end mb-6">
          
          {/* State Name */}
          <div className="w-full">
            <label className="block text-sm font-semibold text-gray-700 mb-2">State Name *</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                placeholder="e.g. Kerala / Haryana"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Month Dropdown */}
          <div className="w-full">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Month *</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-gray-400 pointer-events-none" size={18} />
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {availableMonths.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Year Dropdown */}
          <div className="w-full">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Year *</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-gray-400 pointer-events-none" size={18} />
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Official Gazette URL */}
          <div className="w-full">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Official Gazette URL</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="url"
                placeholder="https://labour.gov.in/..."
                value={documentUrl}
                onChange={(e) => setDocumentUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Master File Selector */}
          <div className="w-full">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Upload Master Excel / CSV <span className="text-xs font-normal text-gray-400">(Optional)</span>
            </label>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleUpload}
              disabled={loading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 rounded-md cursor-pointer"
            />
          </div>
        </div>

        {/* Compliance Notes */}
        <div className="border-t border-gray-100 pt-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Compliance Notes / Remarks</label>
          <div className="relative border border-gray-200 rounded-md p-3 focus-within:ring-2 focus-within:ring-blue-500">
            <div className="absolute top-3.5 left-3 text-gray-400 pointer-events-none">
              <FileText size={16} />
            </div>
            <textarea
              rows={2}
              placeholder="Add specific exemptions, registration limits, or custom notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full pl-7 text-sm text-gray-700 placeholder-gray-400 outline-none resize-y font-sans"
            />
          </div>
        </div>
      </div>

      {/* Added Districts Summary Cards */}
      {districts.length > 0 && (
        <div className="mb-8 bg-white border border-gray-200 rounded-lg p-5">
          <h3 className="font-bold text-gray-800 text-md mb-3 flex items-center gap-2">
            <Building2 size={18} className="text-emerald-600" /> Attached District Schedules ({districts.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {districts.map((item) => (
              <div key={item.id} className="border border-emerald-200 bg-emerald-50/40 rounded-md p-3 flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-emerald-900 text-sm">{item.districtName}</h4>
                  <p className="text-xs text-emerald-700">Period: {item.month} {item.year}</p>
                  <p className="text-xs text-gray-500">{item.wages.length} rows imported</p>
                </div>
                <button
                  onClick={() => removeDistrict(item.id)}
                  className="text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Master Data Preview Table */}
      {preview && headers.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-gray-700">
              Master State Sheet Preview: {state} ({month} {year})
            </h3>
            <span className="text-xs font-mono text-gray-500">{wages.length} Rows × {headers.length} Columns</span>
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
                  <tr key={rowIndex} className="hover:bg-gray-50">
                    {headers.map((heading, colIndex) => (
                      <td key={colIndex} className="px-4 py-2 min-w-[160px]">
                        <input
                          type={typeof row[heading] === "number" ? "number" : "text"}
                          value={row[heading] ?? ""}
                          onChange={(e) => updateCell(rowIndex, heading, e.target.value)}
                          className={`w-full border rounded px-2 py-1 outline-none text-sm focus:ring-1 focus:ring-blue-500 ${
                            colIndex === 0 ? "bg-gray-50 font-medium text-gray-800 border-gray-200" : "border-gray-300"
                          }`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-gray-200 flex justify-end gap-3 bg-white">
            <button 
              onClick={() => { setPreview(false); setWages([]); setHeaders([]); }}
              className="px-4 py-2 flex items-center gap-2 text-gray-600 font-semibold hover:bg-gray-100 rounded border border-gray-300 text-sm"
            >
              <XCircle size={16} /> Clear Uploaded Master Sheet
            </button>
            <button 
              onClick={publish}
              className="px-6 py-2 flex items-center gap-2 bg-blue-600 text-white font-bold hover:bg-blue-700 rounded shadow-sm text-sm"
            >
              <CheckCircle size={16} /> Save & Publish Data
            </button>
          </div>
        </div>
      )}

      {/* --- District Popup Modal --- */}
      {isDistrictModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <Building2 className="text-emerald-600" size={20} /> Add District / CPI Wage Breakdown
              </h3>
              <button 
                onClick={closeDistrictModal} 
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                
                {/* District Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">District Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Gurgaon"
                    value={districtName}
                    onChange={(e) => setDistrictName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* District Month Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Select Month *</label>
                  <select
                    value={districtMonth}
                    onChange={(e) => setDistrictMonth(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {availableMonths.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* District Year Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Select Year *</label>
                  <select
                    value={districtYear}
                    onChange={(e) => setDistrictYear(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {availableYears.map((yr) => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Upload District Excel/CSV *</label>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleDistrictUpload}
                    className="block w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 border border-gray-300 rounded-md cursor-pointer"
                  />
                </div>
              </div>

              {/* District Table Preview */}
              {districtPreview && districtHeaders.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-100 text-emerald-900 font-semibold text-xs flex justify-between">
                    <span>Previewing: {districtName || "District Data"} ({districtMonth} {districtYear})</span>
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

            {/* Modal Actions */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={closeDistrictModal}
                className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-200 rounded text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDistrict}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded shadow-sm text-sm flex items-center gap-2"
              >
                <CheckCircle size={16} /> Attach District Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Spinner Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-100 flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <p className="text-sm font-bold text-gray-700">Processing Data...</p>
          </div>
        </div>
      )}
    </div>
  );
}