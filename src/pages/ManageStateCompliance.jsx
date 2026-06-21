import React, { useEffect, useState } from "react";
import { db } from "../firebase"; // Adjusted step-back reference for single pages directory layout
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { 
  Loader2, 
  Trash2, 
  Search, 
  MapPin, 
  Calendar, 
  Layers,
  Edit2,
  Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ManageStateCompliance() {
  const navigate = useNavigate();
  const [statesList, setStatesList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // FETCH STATE MATRICES FROM FIRESTORE
  const fetchStates = async () => {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, "shop-state-compliance"));
      const records = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      // Sort descending (latest created first)
      records.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setStatesList(records);
    } catch (err) {
      console.error("Error fetching state compliance grids list:", err);
      alert("Failed to load state compliance records data metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStates();
  }, []);

  // DELETE ENTRY PIPELINE
  const handleDeleteState = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete the compliance data matrix for ${name}?`)) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteDoc(doc(db, "shop-state-compliance", id));
      alert(`${name} compliance grid matrix removed successfully.`);
      
      // Update local state list arrays smoothly to drop extra network read request calls
      setStatesList((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Firestore Delete Error:", err);
      alert("Failed to remove target configuration data framework from database.");
    } finally {
      setDeletingId(null);
    }
  };

  // CLIENT-SIDE SEARCH FILTER LOGIC
  const filteredStates = statesList.filter((entry) =>
    entry.stateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.actTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[#0B1538]" size={40} />
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Syncing State Data Blocks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-50/50 min-h-screen font-sans text-slate-800">
      
      {/* HEADER SECTION LAYOUT */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">
            Manage State Compliance
          </h2>
          <p className="text-sm font-medium text-slate-400 mt-1">
            Edit, delete, and manage state-specific rule parameter matrices.
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Search Bar Input */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search states..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none shadow-sm focus:border-blue-500 transition-all text-xs font-semibold"
            />
          </div>

          {/* Action Route Redirect Button */}
          <button
            onClick={() => navigate("/admin/shops-establishments/state-grid")}
            className="flex items-center gap-2 bg-[#0B1538] hover:bg-black text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-lg flex-shrink-0"
          >
            <Plus size={16} strokeWidth={3} /> Add New State
          </button>
        </div>
      </div>

      {/* RENDER ROW MATRIX CARDS LIST */}
      {filteredStates.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-slate-200 p-16 text-center shadow-sm max-w-xl mx-auto">
          <MapPin className="mx-auto text-slate-300 mb-4" size={48} />
          <h3 className="text-lg font-bold text-slate-700">No State Matrices Found</h3>
          <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
            {searchTerm 
              ? "No matching state data sets lookups match your filter string criteria." 
              : "Get started by building a fresh data structure layout framework inside the Add State Grid tab."}
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-w-6xl">
          {filteredStates.map((state) => {
            const formattedDate = state.createdAt?.seconds 
              ? new Date(state.createdAt.seconds * 1000).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric"
                })
              : "N/A";

            return (
              <div 
                key={state.id} 
                className="bg-white rounded-[2rem] border border-slate-200/80 p-6 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.02)] flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:shadow-xl hover:border-slate-300 transition-all duration-300 group"
              >
                {/* Meta description text area layout */}
                <div className="flex items-start gap-4">
                  <div className="p-4 bg-orange-50 rounded-2xl text-orange-500 shadow-sm flex-shrink-0 group-hover:bg-[#0B1538] group-hover:text-white transition-all duration-300">
                    <MapPin size={22} strokeWidth={2.5} />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-xl font-extrabold text-slate-800 tracking-tight leading-tight">
                      {state.actTitle || `${state.stateName} Shops & Establishments Act`}
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <span className="text-blue-600 font-mono bg-blue-50/50 px-2 py-0.5 rounded-md text-[10px]">
                        /compliance/state/{state.stateSlug}
                      </span>
                      <span className="hidden sm:inline text-slate-200">•</span>
                      <span className="flex items-center gap-1">
                        <Layers size={14} className="text-slate-300" />
                        {state.complianceGrid?.length || 0} Compliance Items
                      </span>
                      <span className="hidden sm:inline text-slate-200">•</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} className="text-slate-300" />
                        Configured {formattedDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dashboard Action Trigger Buttons matching panel specs perfectly */}
                <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 lg:pt-0 lg:border-none flex-shrink-0">
                  <button
                    onClick={() => navigate(`/admin/shops-establishments/state-grid/edit/${state.id}`)}
                    className="flex items-center gap-2 border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-400 bg-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all"
                  >
                    <Edit2 size={14} /> Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteState(state.id, state.stateName)}
                    disabled={deletingId === state.id}
                    className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all disabled:opacity-50"
                  >
                    {deletingId === state.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                    Delete
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}