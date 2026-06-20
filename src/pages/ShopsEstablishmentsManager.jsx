import { useState } from "react";
import { db } from "../firebase"; // Adjusted path to pull standard db reference configuration
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
  MapPin,
  HelpCircle,
  AlertCircle
} from "lucide-react";

// Toolbar configuration for the Rich Text Editor
const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "clean"],
  ],
};

export default function ShopsEstablishmentsManager() {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    shortDescription: "",
    overview: "",
    bareActDescription: "",
    bareActPdf: "",
    amendments: "",
    rules: "",
    includedActs: [{ actTitle: "", actContent: "" }],
    practicalNotes: [""],
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
        shortDescription: sanitizeContent(form.shortDescription),
        overview: sanitizeContent(form.overview),
        bareActDescription: sanitizeContent(form.bareActDescription),
        bareActPdf: form.bareActPdf.trim(),
        amendments: sanitizeContent(form.amendments),
        rules: sanitizeContent(form.rules),
        
        practicalNotes: form.practicalNotes.map(note => sanitizeContent(note)),
        
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

      alert("Shops & Establishments Page Added Successfully");
      setForm({
        title: "",
        slug: "",
        shortDescription: "",
        overview: "",
        bareActDescription: "",
        bareActPdf: "",
        amendments: "",
        rules: "",
        includedActs: [{ actTitle: "", actContent: "" }],
        practicalNotes: [""],
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
          Shops & Establishments Content Manager
        </h2>
        <p className="text-slate-500 mt-1">
          Configure dynamic legislation details layout structures, sub-acts breakdowns, and state specific portals.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-10">
        
        {/* TITLE & SLUG */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold mb-2">Act Page Title</label>
            <input
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Delhi Shops & Establishments Act, 1954"
              className="w-full border border-slate-300 rounded-xl p-4 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Routing Route Slug</label>
            <input
              value={form.slug}
              onChange={(e) => updateField("slug", e.target.value)}
              placeholder="delhi-shops-establishments-act-1954"
              className="w-full border border-slate-300 rounded-xl p-4 outline-none"
            />
          </div>
        </div>

        {/* HEADER SUMMARY SHORT DESCRIPTION */}
        <div>
          <label className="block text-sm font-bold mb-2 text-[#0B1538]">
            Header Short Description (Banner Context Area)
          </label>
          <ReactQuill 
            theme="snow" 
            modules={modules}
            value={form.shortDescription} 
            onChange={(val) => updateField("shortDescription", val)} 
          />
        </div>

        {/* 01. OVERVIEW */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="text-blue-600" size={18} />
            <label className="text-sm font-bold text-slate-800">01. Overview Section Content</label>
          </div>
          <ReactQuill 
            theme="snow" 
            modules={modules}
            value={form.overview} 
            onChange={(val) => updateField("overview", val)} 
          />
        </div>

        {/* ACTS & CODES BREAKDOWN PANEL */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Gavel className="text-orange-600" size={20} />
              <label className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Sub-Acts & Section Codes Breakdown List
              </label>
            </div>
            <button 
              onClick={addIncludedAct} 
              className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-orange-200 text-orange-600 text-xs font-bold shadow-sm hover:bg-orange-50 transition-all"
            >
              <Plus size={14} /> Add Act Segment
            </button>
          </div>
          <div className="space-y-6">
            {form.includedActs.map((act, index) => (
              <div key={index} className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 shadow-sm">
                <div className="flex gap-3">
                  <input
                    value={act.actTitle}
                    onChange={(e) => updateIncludedAct(index, "actTitle", e.target.value)}
                    placeholder="Segment Title (e.g. Registration of Establishments)"
                    className="flex-1 border border-slate-300 rounded-xl p-3 outline-none focus:border-orange-400"
                  />
                  <button onClick={() => removeIncludedAct(index)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg">
                    <Trash2 size={20} />
                  </button>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-2">Segment Content Body</label>
                  <ReactQuill 
                    placeholder="Enter compliance terms, details and parameters rules details..."
                    theme="snow" 
                    value={act.actContent} 
                    onChange={(val) => updateIncludedAct(index, "actContent", val)} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BARE ACT CONFIGURATION */}
        <div className="p-6 bg-blue-50/40 rounded-2xl border border-blue-100/60 space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="text-orange-600" size={18} />
            <h4 className="text-sm font-bold text-slate-800">02. Official Bare Act Framework</h4>
          </div>
          <div>
            <label className="block text-xs font-bold mb-2 text-slate-600">Bare Act Paragraph Note</label>
            <ReactQuill 
              theme="snow" 
              modules={modules}
              value={form.bareActDescription} 
              onChange={(val) => updateField("bareActDescription", val)} 
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-2 text-slate-600">Downloadable PDF Link URL</label>
            <input
              value={form.bareActPdf}
              onChange={(e) => updateField("bareActPdf", e.target.value)}
              placeholder="https://example.gov.in/acts/pdf/delhi-shops-act.pdf"
              className="w-full border border-slate-300 rounded-xl p-4 bg-white outline-none"
            />
          </div>
        </div>

        {/* AMENDMENTS AND STATUTORY RULES ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border-l-4 border-purple-200 pl-4">
            <label className="block text-sm font-bold mb-2 text-purple-900">03. Amendments Content</label>
            <ReactQuill 
              theme="snow" 
              modules={modules}
              value={form.amendments} 
              onChange={(val) => updateField("amendments", val)} 
            />
          </div>
          <div className="border-l-4 border-emerald-200 pl-4">
            <label className="block text-sm font-bold mb-2 text-emerald-900">04. Statutory Rules Content</label>
            <ReactQuill 
              theme="snow" 
              modules={modules}
              value={form.rules} 
              onChange={(val) => updateField("rules", val)} 
            />
          </div>
        </div>

        {/* 05. PRACTICAL IMPLEMENTATION LIST */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-amber-600" size={18} />
              <label className="text-sm font-bold text-slate-800">05. Practical Implementation Notes</label>
            </div>
            <button onClick={addPracticalNote} className="flex items-center gap-2 text-blue-600 text-sm font-bold">
              <Plus size={16} /> Add Bullet Note
            </button>
          </div>
          <div className="space-y-4">
            {form.practicalNotes.map((note, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="flex-1">
                  <ReactQuill theme="snow" value={note} onChange={(val) => updatePracticalNote(index, val)} />
                </div>
                <button onClick={() => removePracticalNote(index)} className="text-red-500 mt-2 p-2 hover:bg-red-50 rounded-lg">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ASIDE SIDEBAR CARD QUESTIONS (FAQS) */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="text-blue-600" size={18} />
              <label className="text-sm font-bold text-slate-800">Frequently Asked Questions Module</label>
            </div>
            <button onClick={addFaq} className="flex items-center gap-2 text-blue-600 text-sm font-bold">
              <Plus size={16} /> Add FAQ Item
            </button>
          </div>
          <div className="space-y-6">
            {form.faqs.map((faq, index) => (
              <div key={index} className="border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm bg-slate-50/30">
                <input
                  placeholder="Question text title context..."
                  value={faq.question}
                  onChange={(e) => updateFaq(index, "question", e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:border-blue-500"
                />
                <ReactQuill 
                  placeholder="Answer entry detail body parameters..."
                  theme="snow" 
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

        {/* BOTTOM DASHBOARD ACTION CONTROLS */}
        <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
          <button type="button" className="px-6 py-3 border border-slate-300 rounded-xl font-bold text-slate-600 flex items-center gap-2 hover:bg-gray-50">
            <XCircle size={18} /> Cancel Reset
          </button>
          <button
            onClick={publish}
            disabled={loading}
            className="px-10 py-3 bg-[#0B1538] text-white rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 transition-all hover:bg-black shadow-lg"
          >
            {loading ? (
              <><Loader2 className="animate-spin" size={18} /> Uploading Sync...</>
            ) : (
              <><CheckCircle size={18} /> Save & Publish Act</>
            )}
          </button>
        </div>
      </div>
      
      {/* Dynamic Global Custom Quill Editor Overrides */}
      <style>{`
        .quill { background: white; border-radius: 0.75rem; border: 1px solid #cbd5e1 !important; }
        .ql-toolbar { border: none !important; border-bottom: 1px solid #cbd5e1 !important; background: #f8fafc; border-top-left-radius: 0.75rem; border-top-right-radius: 0.75rem; }
        .ql-container { border: none !important; min-height: 120px; font-size: 0.95rem; border-bottom-left-radius: 0.75rem; border-bottom-right-radius: 0.75rem; }
      `}</style>
    </div>
  );
}