import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { parseWageTable } from "../utils/parseWageTable";
import { Upload, MapPin, FileText, CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function LabourWages() {
  const [state, setState] = useState("");
  const [wages, setWages] = useState([]);
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const parsed = await parseWageTable(file);
      setWages(parsed);
      setPreview(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateCell = (i, field, value) => {
    const copy = [...wages];
    copy[i][field] = Number(value);
    setWages(copy);
  };

  const publish = async () => {
    if (!state) {
      alert("Select state");
      return;
    }

    await addDoc(collection(db, "minimumWages"), {
      state,
      wages,
      createdAt: new Date(),
    });

    alert("Saved successfully");
    setPreview(false);
    setWages([]);
    setState("");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-gray-900">
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Labour Wages Management</h2>
        <p className="text-gray-500">Import and verify statutory minimum wage data.</p>
      </div>

      {/* Step 1: Input Controls */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-6 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-semibold text-gray-700 mb-2">State Name</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                placeholder="e.g. Karnataka"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex-1 w-full">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Excel Sheet</label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleUpload}
              disabled={!state || loading}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Step 2: Preview & Table */}
      {preview && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden animate-in fade-in duration-300">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-gray-700">Data Preview & Validation</h3>
            <span className="text-xs font-mono text-gray-500">{wages.length} Categories Loaded</span>
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

          {/* Action Footer */}
          <div className="p-4 border-t border-gray-200 flex justify-end gap-3 bg-white">
            <button 
              onClick={() => { setPreview(false); setWages([]); }}
              className="px-4 py-2 flex items-center gap-2 text-gray-600 font-semibold hover:bg-gray-100 rounded border border-gray-300 transition-all text-sm"
            >
              <XCircle size={16} /> Discard
            </button>
            <button 
              onClick={publish}
              className="px-6 py-2 flex items-center gap-2 bg-blue-600 text-white font-bold hover:bg-blue-700 rounded shadow-sm transition-all text-sm"
            >
              <CheckCircle size={16} /> Publish to Database
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-100 flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <p className="text-sm font-bold text-gray-700 tracking-wide">Processing Document...</p>
          </div>
        </div>
      )}
    </div>
  );
}