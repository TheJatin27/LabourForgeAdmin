import { useState } from "react";
import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

import {
  BookOpen,
  Loader2,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Gavel,
  FileText,
  Scale,
  ShieldCheck,
  HardHat,
  Users
} from "lucide-react";

// --- EXPANDED GLOBAL TOOLBAR CONFIGURATION FOR ALL TEXT FORMATS ---
const modules = {
  toolbar: [
    // Font Family Selector & Sizing Array Droplist Matrix
    [{ font: [] }, { size: ["small", false, "large", "huge"] }],
    
    // Semantic Structure Headings
    [{ header: [1, 2, 3, false] }],
    
    // Structural Inline Emphasis Formats
    ["bold", "italic", "underline", "strike", "blockquote"],
    
    // TEXT COLOR PICKERS AND HIGHLIGHT COLOR ARRAYS
    [{ color: [] }, { background: [] }], 
    
    // Lists, Line Indentations, Alignment Structures
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }, { indent: "-1" }, { indent: "+1" }],
    
    // Hyperlinks & Format Reset Core
    ["link", "clean"],
  ],
};

export default function ELibraryManager() {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    cardPoints: "", 
    includedActs: [{ actTitle: "", actContent: "" }], 
    shortDescription: "",
    overview: "",
    bareActDescription: "",
    bareActPdf: "",
    amendments: "",
    rules: "",
    practicalNotes: [""],
    complianceChecklist: [""],
    faqs: [{ question: "", answer: "" }],
  });

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // --- INCLUDED ACTS LOGIC ---
  const updateIncludedAct = (index, field, value) => {
    const copy = [...form.includedActs];
    copy[index][field] = value;
    setForm((prev) => ({ ...prev, includedActs: copy }));
  };

  const addIncludedAct = () => {
    setForm((prev) => ({
      ...prev,
      includedActs: [...prev.includedActs, { actTitle: "", actContent: "" }],
    }));
  };

  const removeIncludedAct = (index) => {
    const copy = [...form.includedActs];
    copy.splice(index, 1);
    setForm((prev) => ({ ...prev, includedActs: copy }));
  };

  // --- PRACTICAL NOTES LOGIC ---
  const updatePracticalNote = (index, value) => {
    const copy = [...form.practicalNotes];
    copy[index] = value;
    setForm((prev) => ({ ...prev, practicalNotes: copy }));
  };

  const addPracticalNote = () => {
    setForm((prev) => ({
      ...prev,
      practicalNotes: [...prev.practicalNotes, ""],
    }));
  };

  const removePracticalNote = (index) => {
    const copy = [...form.practicalNotes];
    copy.splice(index, 1);
    setForm((prev) => ({ ...prev, practicalNotes: copy }));
  };

  // --- CHECKLIST LOGIC ---
  const updateChecklist = (index, value) => {
    const copy = [...form.complianceChecklist];
    copy[index] = value;
    setForm((prev) => ({ ...prev, complianceChecklist: copy }));
  };

  const addChecklist = () => {
    setForm((prev) => ({
      ...prev,
      complianceChecklist: [...prev.complianceChecklist, ""],
    }));
  };

  const removeChecklist = (index) => {
    const copy = [...form.complianceChecklist];
    copy.splice(index, 1);
    setForm((prev) => ({ ...prev, complianceChecklist: copy }));
  };

  // --- FAQS LOGIC ---
  const updateFaq = (index, field, value) => {
    const copy = [...form.faqs];
    copy[index][field] = value;
    setForm((prev) => ({ ...prev, faqs: copy }));
  };

  const addFaq = () => {
    setForm((prev) => ({
      ...prev,
      faqs: [...prev.faqs, { question: "", answer: "" }],
    }));
  };

  const removeFaq = (index) => {
    const copy = [...form.faqs];
    copy.splice(index, 1);
    setForm((prev) => ({ ...prev, faqs: copy }));
  };

  // --- AUTOMATED TEXT SANITIZATION UTILITY ---
  const sanitizeContent = (content) => {
    if (typeof content !== "string") return content;
    
    return content
      .replace(/&nbsp;/g, " ")
      .replace(/[\u00AD\u200B]/g, "")
      .replace(/Paym\s+ent/gi, "Payment")
      .replace(/Payme\s*-\s*nt/gi, "Payment")
      .replace(/princi\s+ple/gi, "principle")
      .replace(/princi\s*-\s*ple/gi, "principle")
      .replace(/C\s+entral/gi, "Central")
      .replace(/C\s*-\s*entral/gi, "Central")
      .replace(/I\s*-\s*t/g, "It")
      .replace(/\r?\n|\r/g, " ");
  };

  // --- SUBMIT LOGIC ---
  const publish = async () => {
    try {
      setLoading(true);

      const cleanedForm = {
        title: sanitizeContent(form.title),
        slug: sanitizeContent(form.slug).trim().toLowerCase(),
        cardPoints: sanitizeContent(form.cardPoints),
        shortDescription: sanitizeContent(form.shortDescription),
        overview: sanitizeContent(form.overview),
        bareActDescription: sanitizeContent(form.bareActDescription),
        bareActPdf: form.bareActPdf.trim(),
        amendments: sanitizeContent(form.amendments),
        rules: sanitizeContent(form.rules),
        
        practicalNotes: form.practicalNotes.map(note => sanitizeContent(note)),
        complianceChecklist: form.complianceChecklist.map(item => sanitizeContent(item)),
        
        includedActs: form.includedActs.map(act => ({
          actTitle: sanitizeContent(act.actTitle),
          actContent: sanitizeContent(act.actContent)
        })),
        faqs: form.faqs.map(faq => ({
          question: sanitizeContent(faq.question),
          answer: sanitizeContent(faq.answer)
        }))
      };

      await addDoc(collection(db, "eLibraryPages"), {
        ...cleanedForm,
        createdAt: new Date(),
      });

      alert("E-Library Page Added Successfully");
      setForm({
        title: "",
        slug: "",
        cardPoints: "",
        includedActs: [{ actTitle: "", actContent: "" }],
        shortDescription: "",
        overview: "",
        bareActDescription: "",
        bareActPdf: "",
        amendments: "",
        rules: "",
        practicalNotes: [""],
        complianceChecklist: [""],
        faqs: [{ question: "", answer: "" }],
      });
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">
          E-Library Management
        </h2>
        <p className="text-slate-500 mt-1">
          Add and manage labour code pages dynamically.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-10">
        
        {/* TITLE & SLUG */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold mb-2">Page Title</label>
            <input
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Code on Wages, 2019"
              className="w-full border border-slate-300 rounded-xl p-4 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Slug</label>
            <input
              value={form.slug}
              onChange={(e) => updateField("slug", e.target.value)}
              placeholder="code-on-wages-2019"
              className="w-full border border-slate-300 rounded-xl p-4 outline-none"
            />
          </div>
        </div>

        {/* 1. DETAILED ACTS SECTION */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Gavel className="text-orange-500" size={20} />
              <label className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Acts Covered (Sidebar & Card List)
              </label>
            </div>
            <button 
              onClick={addIncludedAct} 
              className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-orange-200 text-orange-600 text-xs font-bold shadow-sm hover:bg-orange-50 transition-all"
            >
              <Plus size={14} /> Add Act Point
            </button>
          </div>
          <div className="space-y-6">
            {form.includedActs.map((act, index) => (
              <div key={index} className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 shadow-sm">
                <div className="flex gap-3">
                  <input
                    value={act.actTitle}
                    onChange={(e) => updateIncludedAct(index, "actTitle", e.target.value)}
                    placeholder="Act Title (e.g. Minimum Wages Act, 1948)"
                    className="flex-1 border border-slate-300 rounded-xl p-3 outline-none focus:border-orange-400"
                  />
                  <button onClick={() => removeIncludedAct(index)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg">
                    <Trash2 size={20} />
                  </button>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-2">Detailed Content for this Act</label>
                  {/* INJECTED GLOBAL EXTENDED TOOLBAR */}
                  <ReactQuill 
                    placeholder="Enter detailed law content here..."
                    theme="snow" 
                    modules={modules}
                    value={act.actContent} 
                    onChange={(val) => updateIncludedAct(index, "actContent", val)} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CARD PREVIEW POINTS */}
        <div>
          <label className="block text-sm font-bold mb-2 text-indigo-600">
            Card Preview Points (Brief Highlights)
          </label>
          <ReactQuill 
            theme="snow" 
            modules={modules}
            value={form.cardPoints} 
            onChange={(val) => updateField("cardPoints", val)} 
          />
        </div>

        {/* DYNAMIC TEXT BOXES */}
        <div>
          <label className="block text-sm font-bold mb-2">Banner Description</label>
          <ReactQuill 
            theme="snow" 
            modules={modules}
            value={form.shortDescription} 
            onChange={(val) => updateField("shortDescription", val)} 
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Overview</label>
          <ReactQuill 
            theme="snow" 
            modules={modules}
            value={form.overview} 
            onChange={(val) => updateField("overview", val)} 
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Bare Act Description</label>
          <ReactQuill 
            theme="snow" 
            modules={modules}
            value={form.bareActDescription} 
            onChange={(val) => updateField("bareActDescription", val)} 
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Bare Act PDF Link</label>
          <input
            value={form.bareActPdf}
            onChange={(e) => updateField("bareActPdf", e.target.value)}
            placeholder="https://..."
            className="w-full border border-slate-300 rounded-xl p-4 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Amendments</label>
          <ReactQuill 
            theme="snow" 
            modules={modules}
            value={form.amendments} 
            onChange={(val) => updateField("amendments", val)} 
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Rules</label>
          <ReactQuill 
            theme="snow" 
            modules={modules}
            value={form.rules} 
            onChange={(val) => updateField("rules", val)} 
          />
        </div>

        {/* PRACTICAL NOTES */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="text-sm font-bold text-slate-800">Practical Notes</label>
            <button onClick={addPracticalNote} className="flex items-center gap-2 text-blue-600 text-sm font-bold">
              <Plus size={16} /> Add Note
            </button>
          </div>
          <div className="space-y-4">
            {form.practicalNotes.map((note, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="flex-1">
                  {/* INJECTED GLOBAL EXTENDED TOOLBAR */}
                  <ReactQuill theme="snow" modules={modules} value={note} onChange={(val) => updatePracticalNote(index, val)} />
                </div>
                <button onClick={() => removePracticalNote(index)} className="text-red-500 mt-2 p-2 hover:bg-red-50 rounded-lg">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* COMPLIANCE CHECKLIST */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="text-sm font-bold text-slate-800">Compliance Checklist</label>
            <button onClick={addChecklist} className="flex items-center gap-2 text-blue-600 text-sm font-bold">
              <Plus size={16} /> Add Item
            </button>
          </div>
          <div className="space-y-4">
            {form.complianceChecklist.map((item, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="flex-1">
                  {/* INJECTED GLOBAL EXTENDED TOOLBAR */}
                  <ReactQuill theme="snow" modules={modules} value={item} onChange={(val) => updateChecklist(index, val)} />
                </div>
                <button onClick={() => removeChecklist(index)} className="text-red-500 mt-2 p-2 hover:bg-red-50 rounded-lg">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* FAQS */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="text-sm font-bold text-slate-800">FAQs</label>
            <button onClick={addFaq} className="flex items-center gap-2 text-blue-600 text-sm font-bold">
              <Plus size={16} /> Add FAQ
            </button>
          </div>
          <div className="space-y-6">
            {form.faqs.map((faq, index) => (
              <div key={index} className="border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm bg-slate-50/30">
                <input
                  placeholder="Question"
                  value={faq.question}
                  onChange={(e) => updateFaq(index, "question", e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:border-blue-500"
                />
                {/* INJECTED GLOBAL EXTENDED TOOLBAR */}
                <ReactQuill 
                  placeholder="Answer"
                  theme="snow" 
                  modules={modules}
                  value={faq.answer} 
                  onChange={(val) => updateFaq(index, "answer", val)} 
                />
                <button onClick={() => removeFaq(index)} className="text-red-500 text-sm font-bold flex items-center gap-1 hover:underline">
                  Remove FAQ
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
          <button className="px-6 py-3 border border-slate-300 rounded-xl font-bold text-slate-600 flex items-center gap-2 hover:bg-gray-50">
            <XCircle size={18} /> Cancel
          </button>
          <button
            onClick={publish}
            disabled={loading}
            className="px-10 py-3 bg-[#0B1538] text-white rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 transition-all hover:bg-black shadow-lg"
          >
            {loading ? (
              <><Loader2 className="animate-spin" size={18} /> Publishing...</>
            ) : (
              <><CheckCircle size={18} /> Publish Page</>
            )}
          </button>
        </div>
      </div>
      
      {/* Dynamic Layer Stack Z-Index Adjustment Override */}
      <style>{`
        .quill { background: white; border-radius: 0.75rem; border: 1px solid #cbd5e1 !important; }
        .ql-toolbar { border: none !important; border-bottom: 1px solid #cbd5e1 !important; background: #f8fafc; z-index: 20 !important; position: relative !important; }
        .ql-container { border: none !important; min-height: 140px; font-size: 1rem; }
      `}</style>
    </div>
  );
}