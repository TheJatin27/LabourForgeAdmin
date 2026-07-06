import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { parseWageTable } from "../utils/parseWageTable";
import { MapPin, FileText, CheckCircle, XCircle, Loader2, Calendar } from "lucide-react";

export default function LabourWages() {
  const [state, setState] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [period, setPeriod] = useState(""); // State for Year / Period
  const [notes, setNotes] = useState(""); // State for Compliance Notes / Remarks
  const [headers, setHeaders] = useState([]); // Array of column titles from the file
  const [wages, setWages] = useState([]); // Array of row objects from the file
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const parsed = await parseWageTable(file);
      
      // Map data according to the structural format returned by your utility
      if (parsed.headers && parsed.rows) {
        setHeaders(parsed.headers);
        setWages(parsed.rows);
      } else if (Array.isArray(parsed) && parsed.length > 0) {
        // Fallback: If parseWageTable yields an array of row objects directly
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

  // Modifies cell data using the row index and exact matching column heading key
  const updateCell = (rowIndex, columnName, value) => {
    const copy = [...wages];
    // Saves as number if numeric, otherwise leaves as string
    copy[rowIndex][columnName] = isNaN(value) || value === "" ? value : Number(value);
    setWages(copy);
  };

  const publish = async () => {
    if (!state) return alert("Please select or enter a state");
    if (!period) return alert("Please enter the Year / Period (e.g., 2026)");

    try {
      setLoading(true);
      await addDoc(collection(db, "minimumWages"), {
        state: state.trim(),
        period: period.trim(),
        documentUrl: documentUrl.trim(),
        notes: notes.trim(), // Saves the compliance notes into the database
        headers, // Saves the dynamic columns schema array
        wages,   // Saves the dynamic rows data exactly as imported
        createdAt: new Date(),
      });

      alert("Data published successfully!");
      setPreview(false);
      setWages([]);
      setHeaders([]);
      setState("");
      setDocumentUrl("");
      setPeriod("");
      setNotes(""); // Clear notes on successful publish
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
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Dynamic Labour Wages Management</h2>
        <p className="text-gray-500">Upload any state layout. Columns, fields, and headers adapt completely from the file.</p>
      </div>

      {/* Control Configuration Panel */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-6">
          
          {/* State Name */}
          <div className="w-full">
            <label className="block text-sm font-semibold text-gray-700 mb-2">State Name</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                placeholder="e.g. Haryana"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Year / Period Input */}
          <div className="w-full">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Year / Period</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                placeholder="e.g. 2026 (Jan-Jun)"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Gazette URL */}
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

          {/* File Selector */}
          <div className="w-full">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Excel / CSV</label>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleUpload}
              disabled={!state || !period || loading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 rounded-md cursor-pointer"
            />
          </div>
        </div>

        {/* Compliance Notes Section */}
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

      {/* Dynamic Data Presentation Table */}
      {preview && headers.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-gray-700">Modifying Layout: {state} ({period})</h3>
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

          {/* Action Footer */}
          <div className="p-4 border-t border-gray-200 flex justify-end gap-3 bg-white">
            <button 
              onClick={() => { setPreview(false); setWages([]); setHeaders([]); }}
              className="px-4 py-2 flex items-center gap-2 text-gray-600 font-semibold hover:bg-gray-100 rounded border border-gray-300 text-sm"
            >
              <XCircle size={16} /> Discard
            </button>
            <button 
              onClick={publish}
              className="px-6 py-2 flex items-center gap-2 bg-blue-600 text-white font-bold hover:bg-blue-700 rounded shadow-sm text-sm"
            >
              <CheckCircle size={16} /> Save Data
            </button>
          </div>
        </div>
      )}

      {/* Loading Spin Animation Control */}
      {loading && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-100 flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <p className="text-sm font-bold text-gray-700">Importing Raw Sheet Architecture...</p>
          </div>
        </div>
      )}
    </div>
  );
}