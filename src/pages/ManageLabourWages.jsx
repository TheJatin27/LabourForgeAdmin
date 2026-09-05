import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { 
  Loader2, 
  Trash2, 
  ExternalLink, 
  Search, 
  MapPin, 
  Calendar, 
  Layers,
  Edit2,
  Building2,
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ManageLabourWages() {
  const navigate = useNavigate();
  const [wageEntries, setWageEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // FETCH ENTRIES FROM FIRESTORE
  const fetchEntries = async () => {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, "minimumWages"));
      const docs = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      // Sort by creation date or fallback state name
      docs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setWageEntries(docs);
    } catch (err) {
      console.error("Error pulling datasets:", err);
      alert("Failed to load minimum wages datasets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  // DELETE ENTRY PIPELINE
  const handleDelete = async (id, stateName, month, year) => {
    const periodLabel = [month, year].filter(Boolean).join(" ") || "N/A";
    if (!window.confirm(`Are you sure you want to permanently delete the wage data for ${stateName} (${periodLabel})?`)) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteDoc(doc(db, "minimumWages", id));
      alert(`${stateName} (${periodLabel}) entry deleted successfully.`);
      setWageEntries((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to remove data structure from Firestore.");
    } finally {
      setDeletingId(null);
    }
  };

  // GROUP ENTRIES BY STATE NAME
  const groupedStates = wageEntries.reduce((acc, entry) => {
    const stateName = (entry.state || "Unknown State").trim().toUpperCase();
    if (!acc[stateName]) {
      acc[stateName] = {
        stateName,
        records: []
      };
    }
    acc[stateName].records.push(entry);
    return acc;
  }, {});

  // Convert grouped object back to array and filter by State, Month, or Year
  const filteredStateGroups = Object.values(groupedStates).filter((group) => {
    const query = searchTerm.toLowerCase();
    const stateMatches = group.stateName.toLowerCase().includes(query);
    const recordMatches = group.records.some((r) => {
      const entryYear = (r.year || r.period || "").toLowerCase();
      const entryMonth = (r.month || "").toLowerCase();
      const combinedPeriod = `${entryMonth} ${entryYear}`;
      return entryYear.includes(query) || entryMonth.includes(query) || combinedPeriod.includes(query);
    });
    return stateMatches || recordMatches;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-slate-800">
      
      {/* HEADER BLOCK */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Manage Minimum Wages</h2>
          <p className="text-slate-500 mt-1">Review, track or manage regional statutory scale entries grouped by State.</p>
        </div>
        
        {/* Dynamic Search Controller */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Filter by State, Month, or Year..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none shadow-sm focus:border-blue-500 transition-all text-sm"
          />
        </div>
      </div>

      {/* RENDER LOGIC */}
      {loading ? (
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-[#0B1538]" size={40} />
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Syncing Datasets...</p>
          </div>
        </div>
      ) : filteredStateGroups.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm">
          <MapPin className="mx-auto text-slate-300 mb-4" size={48} />
          <h3 className="text-lg font-bold text-slate-700">No Datasets Found</h3>
          <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
            {searchTerm ? "No matching records found for this search filter." : "Get started by importing standard data structures from the Labour Wages tab."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredStateGroups.map((group) => {
            return (
              <div 
                key={group.stateName} 
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all group"
              >
                {/* State Card Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="p-3.5 bg-orange-50 rounded-xl text-orange-600 shadow-sm flex-shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-all">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 tracking-tight uppercase">
                        {group.stateName}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        {group.records.length} Scheduled Record{group.records.length > 1 ? "s" : ""} Available
                      </p>
                    </div>
                  </div>
                </div>

                {/* Periods Breakdown List inside State Card */}
                <div className="divide-y divide-slate-100 mt-2">
                  {group.records.map((entry) => {
                    const entryYear = entry.year || entry.period || "";
                    const entryMonth = entry.month || "";
                    const displayPeriod = [entryMonth, entryYear].filter(Boolean).join(" ") || "N/A";

                    return (
                      <div key={entry.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-2 last:pb-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="bg-blue-50 text-blue-700 font-extrabold text-xs px-3 py-1 rounded-lg border border-blue-100 flex items-center gap-1.5">
                            <Calendar size={13} /> {displayPeriod}
                          </span>
                          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                            <Layers size={13} className="text-slate-300" /> {entry.wages?.length || 0} Labour Classes
                          </span>
                          <span className="text-slate-200 hidden md:inline">•</span>
                          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                            <Building2 size={13} className="text-emerald-500" /> {entry.districts?.length || 0} Districts
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2.5 justify-end">
                          {entry.documentUrl && (
                            <a
                              href={entry.documentUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-400 bg-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1"
                              title="Open Official Act URL"
                            >
                              <ExternalLink size={13} /> <span className="hidden xl:inline">Act URL</span>
                            </a>
                          )}

                          <button
                            onClick={() => navigate(`/admin/labour-wages/edit/${entry.id}`)}
                            className="flex items-center gap-1.5 border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-400 bg-white px-3.5 py-2 rounded-lg font-bold text-xs shadow-sm transition-all"
                          >
                            <Edit2 size={13} /> Edit ({displayPeriod})
                          </button>

                          <button
                            onClick={() => handleDelete(entry.id, group.stateName, entryMonth, entryYear)}
                            disabled={deletingId === entry.id}
                            className="flex items-center gap-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-3.5 py-2 rounded-lg font-bold text-xs transition-all disabled:opacity-50"
                          >
                            {deletingId === entry.id ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Trash2 size={13} />
                            )}
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}