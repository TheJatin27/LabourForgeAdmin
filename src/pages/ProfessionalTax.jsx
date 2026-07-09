import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { parseWageTable } from "../utils/parseWageTable";
import { MapPin, FileText, CheckCircle, XCircle, Loader2, Calendar, HelpCircle, Activity, StickyNote, Save } from "lucide-react";

export default function ProfessionalTaxesAdmin() {
  const [state, setState] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [period, setPeriod] = useState("Jul 2026"); 
  const [status, setStatus] = useState("Applicable"); 
  const [frequency, setFrequency] = useState("Monthly"); 
  const [notes, setNotes] = useState(""); 
  const [headers, setHeaders] = useState([]); 
  const [wages, setWages] = useState([]); 
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  const cleanTextFormatting = (textString) => {
    if (!textString) return "";
    return textString
      .replace(/\r?\n|\r/g, " ") 
      .replace(/Paym\s+ent/gi, "Payment")
      .replace(/Payme\s*-\s*nt/gi, "Payment")
      .replace(/princi\s+ple/gi, "principle")
      .replace(/C\s+entral/gi, "Central")
      .replace(/I\s*-\s*t/g, "It");
  };

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

  const updateCell = (rowIndex, columnName, value) => {
    const copy = [...wages];
    copy[rowIndex][columnName] = isNaN(value) || value === "" ? value : Number(value);
    setWages(copy);
  };

  const publish = async () => {
    if (!state.trim()) return alert("CRITICAL: Please select or enter a valid State Name");
    if (!period.trim()) return alert("Please enter the Year / Period");

    try {
      setLoading(true);
      
      // Forces explicitly defined keys into the collection document schema
      await addDoc(collection(db, "professionalTaxes"), {
        state: state.trim(),
        period: period.trim(),
        status: status, 
        frequency: status === "Not Applicable" ? "-" : frequency, 
        documentUrl: documentUrl.trim(),
        notes: notes.trim(), 
        headers: status === "Not Applicable" ? [] : headers, 
        wages: status === "Not Applicable" ? [] : wages,   
        createdAt: new Date(),
      });

      alert("Professional Tax record saved and published successfully!");
      setPreview(false);
      setWages([]);
      setHeaders([]);
      setState("");
      setDocumentUrl("");
      setNotes("");
      setStatus("Applicable");
      setFrequency("Monthly");
    } catch (err) {
      console.error(err);
      alert("Something went wrong while publishing data layout structure");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-gray-900">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Dynamic Professional Taxes Management</h2>
        <p className="text-gray-500">Upload state slab layouts or record non-applicable states directly into the system.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end mb-4">
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">State Name</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                placeholder="e.g. Delhi"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            <div className="relative">
              <HelpCircle className="absolute left-3 top-3 text-gray-400" size={18} />
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  if (e.target.value === "Not Applicable") {
                    setPreview(false);
                  }
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
              >
                <option value="Applicable">Applicable</option>
                <option value="Not Applicable">Not Applicable</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Frequency</label>
            <div className="relative">
              <Activity className="absolute left-3 top-3 text-gray-400" size={18} />
              <select
                value={frequency}
                disabled={status === "Not Applicable"}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:text-gray-400 appearance-none"
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Semi-Annually">Semi-Annually</option>
                <option value="Annually">Annually</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Year / Period</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                placeholder="e.g. Jul 2026"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Official Gazette URL</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="url"
                placeholder="https://labour.gov.in/..."
                value={documentUrl}
                onChange={(e) => setDocumentUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {status === "Not Applicable" ? "Action" : "Upload Excel / CSV"}
            </label>
            {status === "Not Applicable" ? (
              <button
                type="button"
                onClick={publish}
                disabled={loading || !state}
                className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-bold rounded-md text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Save size={16} /> Save Data
              </button>
            ) : (
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleUpload}
                disabled={!state || !period || loading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 rounded-md cursor-pointer bg-white"
              />
            )}
          </div>
        </div>

        <div className="w-full mt-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Compliance Notes / Remarks</label>
          <div className="relative">
            <StickyNote className="absolute left-3 top-3 text-gray-400" size={18} />
            <textarea
              rows={3}
              placeholder="Add specific exemptions, registration limits, or custom notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-y font-mono"
            />
          </div>
        </div>
      </div>

      {preview && status === "Applicable" && headers.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-gray-700">Modifying PT Layout: {state} ({period})</h3>
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

      {loading && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-100 flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <p className="text-sm font-bold text-gray-700">Saving & Publishing to Database...</p>
          </div>
        </div>
      )}
    </div>
  );
}