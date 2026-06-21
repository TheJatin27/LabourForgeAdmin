import React, { useEffect, useState } from "react";
import { db } from "../../firebase"; // Path steps back to root configuration location
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

export default function ManageShopsEstablishments() {
  const navigate = useNavigate();
  const [shopEntries, setShopEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // FETCH ENTRIES FROM FIRESTORE
  const fetchEntries = async () => {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, "shop-and-establishment"));
      const docs = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      // Sort by creation date descending (latest first)
      docs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setShopEntries(docs);
    } catch (err) {
      console.error("Error pulling datasets:", err);
      alert("Failed to load shops & establishments data structures.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  // DELETE ENTRY PIPELINE
  const handleDelete = async (id, titleName) => {
    if (!window.confirm(`Are you sure you want to permanently delete the content manager page for "${titleName}"?`)) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteDoc(doc(db, "shop-and-establishment", id));
      alert(`"${titleName}" page deleted successfully.`);
      // Update local state array directly to bypass manual layout network refetches
      setShopEntries((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to remove data structure from Firestore.");
    } finally {
      setDeletingId(null);
    }
  };

  // SEARCH FILTER LOGIC
  const filteredEntries = shopEntries.filter((entry) =>
    entry.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[#0B1538]" size={40} />
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Syncing Pages Datasets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-slate-800">
      
      {/* HEADER BLOCK */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Manage Shops & Establishments Pages</h2>
          <p className="text-slate-500 mt-1">Review, track, or delete published regional statutory legislation layouts.</p>
        </div>
        
        {/* Dynamic Search Controller */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Filter by Page Title..."
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
          <h3 className="text-lg font-bold text-slate-700">No Pages Found</h3>
          <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
            {searchTerm ? "No matching layout structures found for this search string filter." : "Get started by creating a new regional portal page via the Add Shops Act tab."}
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
                  <div className="p-3.5 bg-blue-50 rounded-xl text-blue-600 shadow-sm flex-shrink-0 group-hover:bg-[#0B1538] group-hover:text-white transition-all">
                    <MapPin size={24} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-800 tracking-tight uppercase">
                      {entry.title}
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Layers size={14} className="text-slate-300" />
                        {entry.includedActs?.length || 0} Sub-Act Segments Defined
                      </span>
                      <span className="hidden sm:inline text-slate-200">•</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} className="text-slate-300" />
                        Published on {formattedDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Links and Actions Panel */}
                <div className="flex items-center justify-end gap-3 border-t border-slate-50 pt-4 md:pt-0 md:border-none">
                  
                  {/* EDIT ROUTE RE-DIRECTION */}
                  <button
                    onClick={() => navigate(`/admin/shops-establishments/edit/${entry.id}`)}
                    className="flex items-center gap-2 border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-400 bg-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all"
                  >
                    <Edit2 size={14} /> Edit Content
                  </button>

                  {entry.bareActPdf ? (
                    <a
                      href={entry.bareActPdf}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-400 bg-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all"
                    >
                      <ExternalLink size={14} /> Open Bare Act PDF
                    </a>
                  ) : (
                    <span className="text-slate-300 text-xs font-semibold select-none px-2">
                      No Document PDF Linked
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(entry.id, entry.title)}
                    disabled={deletingId === entry.id}
                    className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all disabled:opacity-50"
                  >
                    {deletingId === entry.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                    Remove Page
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