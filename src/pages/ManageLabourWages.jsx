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
  Edit2
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
  const handleDelete = async (id, stateName) => {
    if (!window.confirm(`Are you sure you want to permanently delete the wage data for ${stateName}?`)) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteDoc(doc(db, "minimumWages", id));
      alert(`${stateName} entry deleted successfully.`);
      // Update local state filter array directly to skip extra fetch network request
      setWageEntries((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to remove data structure from Firestore.");
    } finally {
      setDeletingId(null);
    }
  };

  // SEARCH FILTER LOGIC
  const filteredEntries = wageEntries.filter((entry) =>
    entry.state?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[#0B1538]" size={40} />
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Syncing Datasets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-slate-800">
      
      {/* HEADER BLOCK */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Manage Minimum Wages</h2>
          <p className="text-slate-500 mt-1">Review, track or delete published regional statutory scale entries.</p>
        </div>
        
        {/* Dynamic Search Controller */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Filter by State Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none shadow-sm focus:border-blue-500 transition-all text-sm"
          />
        </div>
      </div>

      {/* RENDER LOGIC */}
      {filteredEntries.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm">
          <MapPin className="mx-auto text-slate-300 mb-4" size={48} />
          <h3 className="text-lg font-bold text-slate-700">No Datasets Found</h3>
          <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
            {searchTerm ? "No matching records found for this search string filter." : "Get started by importing standard data structures from the Labour Wages tab."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry) => {
            const formattedDate = entry.createdAt?.seconds 
              ? new Date(entry.createdAt.seconds * 1000).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric"
                })
              : "N/A";

            return (
              <div 
                key={entry.id} 
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all group"
              >
                {/* Meta details segment */}
                <div className="flex items-start gap-4">
                  <div className="p-3.5 bg-orange-50 rounded-xl text-orange-600 shadow-sm flex-shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-all">
                    <MapPin size={24} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-slate-800 tracking-tight uppercase">
                      {entry.state}
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Layers size={14} className="text-slate-300" />
                        {entry.wages?.length || 0} Labour Classes Listed
                      </span>
                      <span className="hidden sm:inline text-slate-200">•</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} className="text-slate-300" />
                        Imported on {formattedDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Document links and Actions Panel */}
                <div className="flex items-center justify-end gap-3 border-t border-slate-50 pt-4 md:pt-0 md:border-none">
                  
                  {/* EDIT BUTTON INTEGRATION */}
                  <button
                    onClick={() => navigate(`/admin/labour-wages/edit/${entry.id}`)}
                    className="flex items-center gap-2 border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-400 bg-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all"
                  >
                    <Edit2 size={14} /> Edit
                  </button>

                  {entry.documentUrl ? (
                    <a
                      href={entry.documentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-400 bg-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all"
                    >
                      <ExternalLink size={14} /> Open Official Act URL
                    </a>
                  ) : (
                    <span className="text-slate-300 text-xs font-semibold select-none px-2">
                      No URL Linked
                    </span>
                  )}

                  <button
                    onClick={() => handleDelete(entry.id, entry.state)}
                    disabled={deletingId === entry.id}
                    className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all disabled:opacity-50"
                  >
                    {deletingId === entry.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                    Delete Record
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