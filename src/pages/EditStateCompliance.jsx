import { useEffect, useState } from "react";
import { db } from "../firebase"; // Adjusted step-back reference for single pages directory layout
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Loader2, 
  CheckCircle,
  FileSpreadsheet,
  ArrowLeft
} from "lucide-react";

export default function EditStateCompliance() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stateName, setStateName] = useState("");
  const [actTitle, setActTitle] = useState("");
  const [stateSlug, setStateSlug] = useState("");
  const [complianceGrid, setComplianceGrid] = useState([]);

  // --- FETCH EXISTING DOCUMENT DETAILS ---
  useEffect(() => {
    const fetchStateDetails = async () => {
      try {
        const docRef = doc(db, "shop-state-compliance", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setStateName(data.stateName || "");
          setActTitle(data.actTitle || "");
          setStateSlug(data.stateSlug || "");
          setComplianceGrid(data.complianceGrid || []);
        } else {
          alert("No such compliance matrix document found!");
          navigate("/admin/shops-establishments/manage-states");
        }
      } catch (err) {
        console.error("Error loading document data matrix:", err);
        alert("Failed to load state matrix details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchStateDetails();
  }, [id, navigate]);

  // --- GRID ROW MUTATORS ---
  const handleGridChange = (index, field, value) => {
    const updatedGrid = [...complianceGrid];
    updatedGrid[index][field] = value;
    setComplianceGrid(updatedGrid);
  };

  const addGridRow = () => {
    setComplianceGrid([...complianceGrid, { item: "", requirement: "" }]);
  };

  const removeGridRow = (index) => {
    const updatedGrid = complianceGrid.filter((_, i) => i !== index);
    setComplianceGrid(updatedGrid);
  };

  // --- UPDATE TO FIRESTORE ---
  const handleUpdateCompliance = async (e) => {
    e.preventDefault();
    if (!stateName || !actTitle || !stateSlug) {
      alert("Please fill in all state metadata fields.");
      return;
    }

    try {
      setSaving(true);
      const docRef = doc(db, "shop-state-compliance", id);

      const updatedDocument = {
        stateName: stateName.trim(),
        actTitle: actTitle.trim(),
        stateSlug: stateSlug.trim().toLowerCase(),
        complianceGrid: complianceGrid.filter(row => row.item.trim() !== ""),
        updatedAt: new Date()
      };

      await updateDoc(docRef, updatedDocument);
      alert(`${stateName} Compliance Matrix Updated Successfully!`);
      navigate("/admin/shops-establishments/manage-states");
    } catch (err) {
      console.error("Firestore Update Error:", err);
      alert("Something went wrong updating the data matrix.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[#0B1538]" size={40} />
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Fetching Matrix Details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      
      {/* HEADER ROW */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline mb-2"
          >
            <ArrowLeft size={14} /> Back to State Management
          </button>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <FileSpreadsheet className="text-blue-600" size={32} /> Edit State Grid Reference
          </h2>
          <p className="text-slate-500 mt-1">
            Modify structural key-value fields and instantly update the system data tables.
          </p>
        </div>
      </div>

      <form onSubmit={handleUpdateCompliance} className="space-y-8">
        
        {/* SECTION 1: STATE METADATA CONFIG */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              State Identifier Name
            </label>
            <input
              type="text"
              required
              value={stateName}
              onChange={(e) => setStateName(e.target.value)}
              placeholder="e.g. Delhi"
              className="w-full border border-slate-300 rounded-xl p-3.5 outline-none focus:border-blue-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Official Act Legal Title
            </label>
            <input
              type="text"
              required
              value={actTitle}
              onChange={(e) => setActTitle(e.target.value)}
              placeholder="e.g. Delhi Shops & Establishments Act, 1954"
              className="w-full border border-slate-300 rounded-xl p-3.5 outline-none focus:border-blue-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Routing Target Slug Link
            </label>
            <input
              type="text"
              required
              value={stateSlug}
              onChange={(e) => setStateSlug(e.target.value)}
              placeholder="delhi-shops-establishments-act"
              className="w-full border border-slate-300 rounded-xl p-3.5 outline-none focus:border-blue-500 font-mono text-sm bg-slate-50 text-slate-600"
            />
          </div>
        </div>

        {/* SECTION 2: DYNAMIC GRID WRAPPER */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-blue-400" />
              <span className="text-xs font-black uppercase tracking-widest">Compliance Field Parameters Config Table</span>
            </div>
            <button
              type="button"
              onClick={addGridRow}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-xs font-bold transition-all shadow-md"
            >
              <Plus size={14} /> Add Parameter Row
            </button>
          </div>

          <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto bg-slate-50/50">
            {complianceGrid.map((row, index) => (
              <div key={index} className="flex gap-4 items-center bg-white p-3 rounded-xl border border-slate-200/70 shadow-sm group">
                <span className="text-xs font-bold text-slate-400 w-8 text-center">{index + 1}</span>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="Compliance Parameter Item..."
                    value={row.item}
                    onChange={(e) => handleGridChange(index, "item", e.target.value)}
                    className="border border-slate-200 rounded-lg p-2.5 outline-none focus:border-blue-500 font-bold text-sm text-slate-700 bg-slate-50/30"
                  />
                  <input
                    type="text"
                    placeholder="Enter Entitlement Limit/Requirement Rules context..."
                    value={row.requirement}
                    onChange={(e) => handleGridChange(index, "requirement", e.target.value)}
                    className="border border-slate-200 rounded-lg p-2.5 outline-none focus:border-blue-500 text-sm text-slate-600"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeGridRow(index)}
                  className="text-slate-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors md:opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* CONTROLS BAR */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-12 py-4 bg-blue-600 hover:bg-black text-white font-black text-sm uppercase tracking-widest rounded-xl shadow-xl transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <><Loader2 className="animate-spin" size={18} /> Updating Matrix Records...</>
            ) : (
              <><CheckCircle size={18} /> Save Changes & Update</>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}