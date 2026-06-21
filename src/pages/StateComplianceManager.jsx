import { useState } from "react";
import { db } from "../firebase"; // Adjusted path to pull standard reference from your single pages configuration directory
import { collection, addDoc } from "firebase/firestore";
import { 
  MapPin, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Loader2, 
  CheckCircle,
  FileSpreadsheet,
  Link2
} from "lucide-react";

export default function StateComplianceManager() {
  const [loading, setLoading] = useState(false);
  const [stateName, setStateName] = useState("");
  const [actTitle, setActTitle] = useState("");
  const [stateSlug, setStateSlug] = useState("");
  const [bareActUrl, setBareActUrl] = useState(""); // State tracker hook for the PDF attachment URL

  // Baseline checklist matrix items with fully cleared requirement parameters
  const defaultGrid = [
    { item: "Casual Leave (CL)", requirement: "" },
    { item: "Sick Leave (SL)", requirement: "" },
    { item: "Total CL + SL", requirement: "" },
    { item: "Earned / Privilege Leave (EL/PL)", requirement: "" },
    { item: "EL Eligibility", requirement: "" },
    { item: "EL Carry Forward", requirement: "" },
    { item: "EL Encashment", requirement: "" },
    { item: "Maternity Benefit", requirement: "" },
    { item: "Maternity Benefit (3rd Child onwards)", requirement: "" },
    { item: "Adoption Leave", requirement: "" },
    { item: "Commissioning Mother Leave", requirement: "" },
    { item: "Work from Home", requirement: "" },
    { item: "Crèche Facility", requirement: "" },
    { item: "Weekly Off", requirement: "" },
    { item: "National Holidays", requirement: "" },
    { item: "Festival Holidays", requirement: "" },
    { item: "Working Hours", requirement: "" },
    { item: "Weekly Hours", requirement: "" },
    { item: "Spread Over", requirement: "" },
    { item: "Rest Interval", requirement: "" },
    { item: "Overtime Rate", requirement: "" },
    { item: "OT Eligibility", requirement: "" },
    { item: "OT Limit", requirement: "" },
    { item: "Women Night Shift Employment", requirement: "" },
    { item: "Employment of Young Persons", requirement: "" },
    { item: "Registration Certificate", requirement: "" },
    { item: "Registration Amendment", requirement: "" },
    { item: "Registration Renewal", requirement: "" }
  ];

  const [complianceGrid, setComplianceGrid] = useState(defaultGrid);

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

  const resetToDefault = () => {
    if (window.confirm("Are you sure you want to reset the grid to the blank baseline template checklist?")) {
      setComplianceGrid(defaultGrid);
    }
  };

  // --- SUBMIT TO FIRESTORE ---
  const saveStateCompliance = async (e) => {
    e.preventDefault();
    if (!stateName || !actTitle || !stateSlug) {
      alert("Please fill in all state metadata heading fields.");
      return;
    }

    try {
      setLoading(true);

      const targetDocument = {
        stateName: stateName.trim(),
        actTitle: actTitle.trim(),
        stateSlug: stateSlug.trim().toLowerCase(),
        bareActUrl: bareActUrl.trim(), // Composed URL string saved down to database fields context
        complianceGrid: complianceGrid.filter(row => row.item.trim() !== ""),
        createdAt: new Date()
      };

      await addDoc(collection(db, "shop-state-compliance"), targetDocument);

      alert(`${stateName} Compliance Grid Saved Successfully!`);
      
      // Reset inputs
      setStateName("");
      setActTitle("");
      setStateSlug("");
      setBareActUrl("");
      setComplianceGrid(defaultGrid);
    } catch (err) {
      console.error("Firestore Save Error:", err);
      alert("Something went wrong saving state record mapping matrix.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      
      {/* HEADER ROW */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <FileSpreadsheet className="text-orange-500" size={32} /> State Grid Reference Manager
          </h2>
          <p className="text-slate-500 mt-1">
            Build and populate structured key-value compliance matrices rendered on user data tables.
          </p>
        </div>
        <button
          type="button"
          onClick={resetToDefault}
          className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold shadow-sm hover:bg-slate-100 transition-all"
        >
          <RotateCcw size={14} /> Clear Requirements Fields
        </button>
      </div>

      <form onSubmit={saveStateCompliance} className="space-y-8">
        
        {/* SECTION 1: STATE METADATA CONFIG */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                State Identifier Name
              </label>
              <input
                type="text"
                required
                value={stateName}
                onChange={(e) => {
                  setStateName(e.target.value);
                  setStateSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-shops-establishments-act");
                }}
                placeholder="e.g. Delhi"
                className="w-full border border-slate-300 rounded-xl p-3.5 outline-none focus:border-orange-500 font-medium text-sm"
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
                className="w-full border border-slate-300 rounded-xl p-3.5 outline-none focus:border-orange-500 font-medium text-sm"
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
                className="w-full border border-slate-300 rounded-xl p-3.5 outline-none focus:border-orange-500 font-mono text-sm bg-slate-50 text-slate-600"
              />
            </div>
          </div>

          {/* NEW ROW ADDITION: BARE ACT DOWNLOAD DOWNLOAD URL FIELDS MAPPED */}
          <div className="border-t border-slate-100 pt-5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Link2 size={14} className="text-orange-500" /> Official State Bare Act PDF Link (Download Document URL)
            </label>
            <input
              type="url"
              value={bareActUrl}
              onChange={(e) => setBareActUrl(e.target.value)}
              placeholder="e.g. https://labour.delhi.gov.in/sites/default/files/delhi-shops-establishments-act-1954.pdf"
              className="w-full border border-slate-300 rounded-xl p-3.5 outline-none focus:border-orange-500 text-sm font-semibold tracking-tight text-slate-700"
            />
          </div>
        </div>

        {/* SECTION 2: DYNAMIC GRID WRAPPER */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-orange-400" />
              <span className="text-xs font-black uppercase tracking-widest">Compliance Field Parameters Config Table</span>
            </div>
            <button
              type="button"
              onClick={addGridRow}
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg text-white text-xs font-bold transition-all shadow-md"
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
                    className="border border-slate-200 rounded-lg p-2.5 outline-none focus:border-orange-400 font-bold text-sm text-slate-700 bg-slate-50/30"
                  />
                  <input
                    type="text"
                    placeholder="Enter Entitlement Limit/Requirement Rules context..."
                    value={row.requirement}
                    onChange={(e) => handleGridChange(index, "requirement", e.target.value)}
                    className="border border-slate-200 rounded-lg p-2.5 outline-none focus:border-orange-400 text-sm text-slate-600"
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
            disabled={loading}
            className="px-12 py-4 bg-[#0B1538] hover:bg-black text-white font-black text-sm uppercase tracking-widest rounded-xl shadow-xl transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <><Loader2 className="animate-spin" size={18} /> Processing Matrix Write...</>
            ) : (
              <><CheckCircle size={18} /> Commit State Matrix Data</>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}