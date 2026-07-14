import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  arrayUnion,
  serverTimestamp 
} from "firebase/firestore";
import { 
  Search, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  ChevronRight, 
  Send, 
  Clock, 
  Filter,
  Loader2,
  Mail,
  User
} from "lucide-react";
import emailjs from "@emailjs/browser";

export default function ManageQueries() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Real-time listener updates dynamically when a reply is pushed
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "queries"), (snapshot) => {
      const queryData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setQueries(queryData);

      // Keep active panel focus context synced with incoming history data
      if (selectedQuery) {
        const updated = queryData.find(q => q.id === selectedQuery.id);
        if (updated) setSelectedQuery(updated);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching queries: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedQuery?.id]);

  const toggleStatus = async (queryId, currentStatus) => {
    try {
      const nextStatus = currentStatus === "solved" ? "pending" : "solved";
      await updateDoc(doc(db, "queries", queryId), { status: nextStatus });
    } catch (err) {
      console.error("Failed to update status: ", err);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedQuery) return;

    try {
      setSendingReply(true);

      // 1. Dispatch Actual Email via EmailJS Engine Client
      await emailjs.send(
        "service_xnsgpwg",     // REPLACE WITH YOUR SERVICE ID
        "template_pwlz53x",    // REPLACE WITH YOUR TEMPLATE ID
        {
          to_name: selectedQuery.representativeName,
          email: selectedQuery.corporateEmail,
          matter: selectedQuery.matterSpecification,
          reply_message: replyText,
        },
        "rGeGpxwsOqwsnv8Ib"      // REPLACE WITH YOUR PUBLIC KEY
      );

      // 2. Build explicit history tracking payload block
      const newReplyPayload = {
        message: replyText,
        sentBy: "Super Admin",
        timestamp: new Date().toISOString() // Client-readable string representation
      };

      // 3. Commit tracking block inside document array history atomic log
      const targetDocRef = doc(db, "queries", selectedQuery.id);
      await updateDoc(targetDocRef, {
        status: "solved",
        lastRepliedAt: new Date().toISOString(),
        replyHistory: arrayUnion(newReplyPayload) // Appends directly into array array
      });

      setReplyText("");
      alert("Email sent successfully and recorded in history log.");
    } catch (err) {
      console.error("Transmission or recording pipeline failure: ", err);
      alert("Failed to deliver or record response. Confirm template configurations.");
    } finally {
      setSendingReply(false);
    }
  };

  const processedQueries = queries
    .filter(q => {
      const matchSearch = 
        q.representativeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.corporateEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.caseBrief?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.matterSpecification?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchStatus = 
        statusFilter === "all" || 
        (statusFilter === "solved" && q.status === "solved") ||
        (statusFilter === "pending" && q.status !== "solved");

      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      const timeA = a.submittedAt?.toDate() ? a.submittedAt.toDate() : new Date(a.submittedAt || 0);
      const timeB = b.submittedAt?.toDate() ? b.submittedAt.toDate() : new Date(b.submittedAt || 0);
      return sortBy === "newest" ? timeB - timeA : timeA - timeB;
    });

  return (
    <div className="p-6 max-w-[1600px] mx-auto font-sans text-[#1e293b]">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manage Statutory Enquiries</h1>
        <p className="text-sm text-slate-500 mt-1">Review, filter, track, and send responses that route automatically to users.</p>
      </div>

      {/* Control Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="lg:col-span-5 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search by keyword, email context, or firm representative..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-11 pr-4 py-2.5 outline-none focus:border-blue-600 focus:bg-white transition-all text-sm"
          />
        </div>
        <div className="lg:col-span-3">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none font-bold text-xs uppercase text-slate-600">
            <option value="all">All Status Vectors</option>
            <option value="pending">Pending Review</option>
            <option value="solved">Resolved / Solved</option>
          </select>
        </div>
        <div className="lg:col-span-4 flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0">Sort:</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none font-bold text-xs uppercase text-slate-600">
            <option value="newest">Newest Submissions</option>
            <option value="oldest">Oldest Records First</option>
          </select>
        </div>
      </div>

      {/* Workspace Split Splitter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: QUERY QUEUE */}
        <div className="lg:col-span-5 space-y-3 max-h-[720px] overflow-y-auto pr-2">
          {processedQueries.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-400 text-sm">
              No matching statutory entries found.
            </div>
          ) : (
            processedQueries.map((query) => (
              <div 
                key={query.id}
                onClick={() => setSelectedQuery(query)}
                className={`p-4 bg-white border-2 rounded-xl text-left cursor-pointer transition-all relative ${
                  selectedQuery?.id === query.id ? "border-blue-600 shadow-md bg-blue-50/10" : "border-slate-200/60 hover:border-slate-300 shadow-sm"
                }`}
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    query.status === "solved" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}>
                    {query.status === "solved" ? "Resolved" : "Pending"}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm truncate">{query.representativeName}</h4>
                <p className="text-xs font-semibold text-blue-600 truncate">{query.matterSpecification}</p>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 font-light">{query.caseBrief}</p>
              </div>
            ))
          )}
        </div>

        {/* RIGHT COLUMN: DETAIL ENGINE & HISTORY CARD */}
        <div className="lg:col-span-7">
          {selectedQuery ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
              
              <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">{selectedQuery.representativeName}</h3>
                  <p className="text-xs text-slate-500 font-medium">{selectedQuery.corporateEmail} • {selectedQuery.contactPhone}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleStatus(selectedQuery.id, selectedQuery.status)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase border transition-all cursor-pointer ${
                    selectedQuery.status === "solved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {selectedQuery.status === "solved" ? <><CheckCircle size={14} className="inline mr-1" /> Resolved</> : "Mark Solved"}
                </button>
              </div>

              {/* The Original Submission Brief */}
              <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Practice Area Vector</p>
                <p className="text-sm font-bold text-slate-900 mb-3">{selectedQuery.matterSpecification}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Initial Brief Details</p>
                <p className="text-xs text-slate-600 font-light leading-relaxed whitespace-pre-wrap">{selectedQuery.caseBrief}</p>
              </div>

              {/* LIVE CONVERSATION HISTORY LOG CARD */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Historical Communication Thread
                </label>
                <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/30 max-h-[250px] overflow-y-auto space-y-3">
                  {selectedQuery.replyHistory && selectedQuery.replyHistory.length > 0 ? (
                    selectedQuery.replyHistory.map((historyItem, idx) => (
                      <div key={idx} className="flex gap-3 text-left bg-white border border-slate-200/60 p-3 rounded-xl shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                          LF
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-xs font-black text-slate-900">{historyItem.sentBy}</span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {new Date(historyItem.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-light leading-relaxed whitespace-pre-wrap">{historyItem.message}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-xs text-slate-400 py-6 font-medium">No prior outbound correspondence recorded for this ledger document.</p>
                  )}
                </div>
              </div>

              {/* Outbound Editor Input Panel */}
              <form onSubmit={handleSendReply} className="space-y-3 pt-2">
                <textarea
                  rows="4"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Draft your response advice loop here..."
                  className="w-full border-2 border-slate-200 rounded-xl p-4 outline-none focus:border-blue-600 transition-all font-light text-sm resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={sendingReply || !replyText.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white disabled:text-slate-400 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
                  >
                    {sendingReply ? <><Loader2 className="animate-spin" size={14} /> Delivering...</> : <><Send size={14} /> Send & Archive Log</>}
                  </button>
                </div>
              </form>

            </div>
          ) : (
            <div className="h-full min-h-[400px] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 text-center text-slate-400 bg-slate-50/50">
              <MessageSquare size={36} className="text-slate-300 mb-3" />
              <h3 className="font-bold text-sm text-slate-700">No Query Isolated</h3>
              <p className="text-xs max-w-xs mt-1 font-light">Select a file record from the side navigation list view space to track records.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}