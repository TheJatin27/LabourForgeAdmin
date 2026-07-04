import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import ReactQuill, { Quill } from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

import {
  Loader2,
  CheckCircle,
  Plus,
  Trash2,
  Gavel
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

// 1. REGISTER CUSTOM SIZES (Numeric Options like Word)
const sizeWhitelist = ["10px", "12px", "14px", "16px", "18px", "20px", "24px", "32px"];
const Size = Quill.import("attributors/style/size");
Size.whitelist = sizeWhitelist;
Quill.register(Size, true);

// 2. REGISTER ALL STANDARD WEB-SAFE FONTS
const fontWhitelist = [
  "arial", 
  "arial-black",
  "comic-sans",
  "courier-new",
  "georgia", 
  "impact", 
  "lucida-sans",
  "tahoma", 
  "times-new-roman", 
  "trebuchet",
  "verdana"
];
const Font = Quill.import("attributors/style/font");
Font.whitelist = fontWhitelist;
Quill.register(Font, true);

// 3. EXPANDED MODULES CONFIGURATION
const modules = {
  toolbar: [
    // Custom Font Selection & Custom Numeric Sizes
    [
      { font: fontWhitelist }, 
      { size: sizeWhitelist }
    ],
    
    // Core Inline Text Emphasis Markup Options
    ["bold", "italic", "underline", "strike", "blockquote"],
    
    // Text Colors & Background Highlights
    [{ color: [] }, { background: [] }], 
    
    // Paragraph Structures and Structural Indentation Controls
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }, { indent: "-1" }, { indent: "+1" }],
    
    // External Elements & Sanitization
    ["link", "clean"],
  ],
};

const EditELibrary = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  // AUTOMATED TEXT SANITIZATION UTILITY
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

  // FETCH EXISTING DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const ref = doc(db, "eLibraryPages", id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          setForm({
            ...data,
            includedActs: data.includedActs || [{ actTitle: "", actContent: "" }],
            practicalNotes: data.practicalNotes || [""],
            complianceChecklist: data.complianceChecklist || [""],
            faqs: data.faqs || [{ question: "", answer: "" }],
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // UPDATE FIELD
  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // INCLUDED ACTS LOGIC
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

  // PRACTICAL NOTES
  const updatePracticalNote = (index, value) => {
    const copy = [...form.practicalNotes];
    copy[index] = value;
    setForm((prev) => ({
      ...prev,
      practicalNotes: copy,
    }));
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
    setForm((prev) => ({
      ...prev,
      practicalNotes: copy,
    }));
  };

  // CHECKLIST
  const updateChecklist = (index, value) => {
    const copy = [...form.complianceChecklist];
    copy[index] = value;
    setForm((prev) => ({
      ...prev,
      complianceChecklist: copy,
    }));
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
    setForm((prev) => ({
      ...prev,
      complianceChecklist: copy,
    }));
  };

  // FAQ
  const updateFaq = (index, field, value) => {
    const copy = [...form.faqs];
    copy[index][field] = value;
    setForm((prev) => ({
      ...prev,
      faqs: copy,
    }));
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
    setForm((prev) => ({
      ...prev,
      faqs: copy,
    }));
  };

  // UPDATE FIREBASE WITH CLEANED DATA OBJECT
  const updatePage = async () => {
    try {
      setSaving(true);

      const cleanedForm = {
        title: sanitizeContent(form.title),
        slug: sanitizeContent(form.slug).trim().toLowerCase(),
        cardPoints: sanitizeContent(form.cardPoints),
        shortDescription: sanitizeContent(form.shortDescription),
        overview: sanitizeContent(form.overview),
        bareActDescription: sanitizeContent(form.bareActDescription),
        bareActPdf: form.bareActPdf ? form.bareActPdf.trim() : "",
        amendments: sanitizeContent(form.amendments),
        rules: sanitizeContent(form.rules),
        
        practicalNotes: (form.practicalNotes || []).map(note => sanitizeContent(note)),
        complianceChecklist: (form.complianceChecklist || []).map(item => sanitizeContent(item)),
        
        includedActs: (form.includedActs || []).map(act => ({
          actTitle: sanitizeContent(act.actTitle),
          actContent: sanitizeContent(act.actContent)
        })),
        faqs: (form.faqs || []).map(faq => ({
          question: sanitizeContent(faq.question),
          answer: sanitizeContent(faq.answer)
        }))
      };

      const ref = doc(db, "eLibraryPages", id);
      await updateDoc(ref, {
        ...cleanedForm,
        updatedAt: new Date(),
      });

      alert("Page updated successfully");
      navigate("/admin/e-library/manage");
    } catch (err) {
      console.error(err);
      alert("Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#0B1538]" size={40} />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-[#1E293B]">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Edit E-Library Page</h2>
        <p className="text-slate-500 mt-1">Update labour law content dynamically.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-10">
        
        {/* TITLE & SLUG */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold mb-2">Page Title</label>
            <input
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-4 outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Slug</label>
            <input
              value={form.slug}
              onChange={(e) => updateField("slug", e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-4 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* DETAILED ACTS SECTION */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Gavel className="text-orange-500" size={20} />
              <label className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Acts Covered (Sidebar Inter-linking)
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
                    placeholder="Act Title"
                    className="flex-1 border border-slate-300 rounded-xl p-3 outline-none focus:border-orange-400"
                  />
                  <button onClick={() => removeIncludedAct(index)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg">
                    <Trash2 size={20} />
                  </button>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-2">Act Content</label>
                  <ReactQuill theme="snow" modules={modules} value={act.actContent} onChange={(val) => updateIncludedAct(index, "actContent", val)} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CARD POINTS */}
        <div>
          <label className="block text-sm font-bold mb-2 text-indigo-600">Card Preview Points</label>
          <ReactQuill theme="snow" modules={modules} value={form.cardPoints} onChange={(val) => updateField("cardPoints", val)} />
        </div>

        {/* RICH TEXT FIELDS */}
        <div>
          <label className="block text-sm font-bold mb-2">Banner Description</label>
          <ReactQuill theme="snow" modules={modules} value={form.shortDescription} onChange={(val) => updateField("shortDescription", val)} />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Overview</label>
          <ReactQuill theme="snow" modules={modules} value={form.overview} onChange={(val) => updateField("overview", val)} />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Bare Act Description</label>
          <ReactQuill theme="snow" modules={modules} value={form.bareActDescription} onChange={(val) => updateField("bareActDescription", val)} />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Bare Act PDF Link</label>
          <input
            value={form.bareActPdf}
            onChange={(e) => updateField("bareActPdf", e.target.value)}
            className="w-full border border-slate-300 rounded-xl p-4 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Amendments</label>
          <ReactQuill theme="snow" modules={modules} value={form.amendments} onChange={(val) => updateField("amendments", val)} />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Rules</label>
          <ReactQuill theme="snow" modules={modules} value={form.rules} onChange={(val) => updateField("rules", val)} />
        </div>

        {/* PRACTICAL NOTES */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="text-sm font-bold text-slate-800">Practical Notes</label>
            <button onClick={addPracticalNote} className="flex items-center gap-2 text-blue-600 text-sm font-bold"><Plus size={16} /> Add</button>
          </div>
          <div className="space-y-4">
            {form.practicalNotes?.map((note, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="flex-1">
                  <ReactQuill theme="snow" modules={modules} value={note} onChange={(val) => updatePracticalNote(index, val)} />
                </div>
                <button onClick={() => removePracticalNote(index)} className="text-red-500 mt-2 p-2"><Trash2 size={18} /></button>
              </div>
            ))}
          </div>
        </div>

        {/* CHECKLIST */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="text-sm font-bold text-slate-800">Compliance Checklist</label>
            <button onClick={addChecklist} className="flex items-center gap-2 text-blue-600 text-sm font-bold"><Plus size={16} /> Add</button>
          </div>
          <div className="space-y-4">
            {form.complianceChecklist?.map((item, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="flex-1">
                  <ReactQuill theme="snow" modules={modules} value={item} onChange={(val) => updateChecklist(index, val)} />
                </div>
                <button onClick={() => removeChecklist(index)} className="text-red-500 mt-2 p-2"><Trash2 size={18} /></button>
              </div>
            ))}
          </div>
        </div>

        {/* FAQS */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="text-sm font-bold text-slate-800">FAQs</label>
            <button onClick={addFaq} className="flex items-center gap-2 text-blue-600 text-sm font-bold"><Plus size={16} /> Add FAQ</button>
          </div>
          <div className="space-y-6">
            {form.faqs?.map((faq, index) => (
              <div key={index} className="border border-slate-200 rounded-2xl p-6 space-y-4 bg-slate-50/30">
                <input
                  placeholder="Question"
                  value={faq.question}
                  onChange={(e) => updateFaq(index, "question", e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-3 outline-none"
                />
                <ReactQuill theme="snow" modules={modules} value={faq.answer} onChange={(val) => updateFaq(index, "answer", val)} />
                <button onClick={() => removeFaq(index)} className="text-red-500 text-sm font-bold">Remove FAQ</button>
              </div>
            ))}
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="flex justify-end pt-6 border-t border-slate-200">
          <button
            onClick={updatePage}
            disabled={saving}
            className="px-10 py-3 bg-[#0B1538] text-white rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 transition-all hover:bg-black shadow-lg"
          >
            {saving ? (
              <><Loader2 className="animate-spin" size={18} /> Updating...</>
            ) : (
              <><CheckCircle size={18} /> Save Changes</>
            )}
          </button>
        </div>
      </div>

      {/* --- CSS Overrides for Editor Custom Fonts & Numeric Sizes UI Labels --- */}
      <style>{`
        .quill { background: white; border-radius: 0.75rem; border: 1px solid #cbd5e1 !important; }
        .ql-toolbar { border: none !important; border-bottom: 1px solid #cbd5e1 !important; background: #f8fafc; z-index: 10; position: relative; }
        .ql-container { border: none !important; min-height: 140px; font-size: 1rem; }

        /* Setup Text-Labels inside Size Picker Dropdowns */
        .ql-snow .ql-picker.ql-size .ql-picker-label::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item::before { content: attr(data-value) !important; }
        .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="14px"]::before { content: "14px" !important; }

        /* Render Fonts styling layout internally inside picker dropdown */
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="arial"]::before, .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="arial"]::before { content: 'Arial'; font-family: Arial; }
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="arial-black"]::before, .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="arial-black"]::before { content: 'Arial Black'; font-family: 'Arial Black'; }
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="comic-sans"]::before, .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="comic-sans"]::before { content: 'Comic Sans'; font-family: 'Comic Sans MS'; }
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="courier-new"]::before, .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="courier-new"]::before { content: 'Courier New'; font-family: 'Courier New'; }
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="georgia"]::before, .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="georgia"]::before { content: 'Georgia'; font-family: Georgia; }
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="impact"]::before, .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="impact"]::before { content: 'Impact'; font-family: Impact; }
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="lucida-sans"]::before, .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="lucida-sans"]::before { content: 'Lucida Sans'; font-family: 'Lucida Sans Unicode'; }
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="tahoma"]::before, .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="tahoma"]::before { content: 'Tahoma'; font-family: Tahoma; }
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="times-new-roman"]::before, .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="times-new-roman"]::before { content: 'Times New Roman'; font-family: "Times New Roman"; }
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="trebuchet"]::before, .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="trebuchet"]::before { content: 'Trebuchet MS'; font-family: 'Trebuchet MS'; }
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="verdana"]::before, .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="verdana"]::before { content: 'Verdana'; font-family: Verdana; }
        
        /* Map Content container font-family fallbacks */
        .ql-container .ql-editor .ql-font-arial { font-family: Arial, sans-serif; }
        .ql-container .ql-editor .ql-font-arial-black { font-family: "Arial Black", Gadget, sans-serif; }
        .ql-container .ql-editor .ql-font-comic-sans { font-family: "Comic Sans MS", cursive, sans-serif; }
        .ql-container .ql-editor .ql-font-courier-new { font-family: "Courier New", Courier, monospace; }
        .ql-container .ql-editor .ql-font-georgia { font-family: Georgia, serif; }
        .ql-container .ql-editor .ql-font-impact { font-family: Impact, Charcoal, sans-serif; }
        .ql-container .ql-editor .ql-font-lucida-sans { font-family: "Lucida Sans Unicode", "Lucida Grande", sans-serif; }
        .ql-container .ql-editor .ql-font-tahoma { font-family: Tahoma, Geneva, sans-serif; }
        .ql-container .ql-editor .ql-font-times-new-roman { font-family: "Times New Roman", Times, serif; }
        .ql-container .ql-editor .ql-font-trebuchet { font-family: "Trebuchet MS", Helvetica, sans-serif; }
        .ql-container .ql-editor .ql-font-verdana { font-family: Verdana, Geneva, sans-serif; }

        /* Font Sizes Mapping styles */
        .ql-container .ql-editor .ql-size-10px { font-size: 10px; }
        .ql-container .ql-editor .ql-size-12px { font-size: 12px; }
        .ql-container .ql-editor .ql-size-14px { font-size: 14px; }
        .ql-container .ql-editor .ql-size-16px { font-size: 16px; }
        .ql-container .ql-editor .ql-size-18px { font-size: 18px; }
        .ql-container .ql-editor .ql-size-20px { font-size: 20px; }
        .ql-container .ql-editor .ql-size-24px { font-size: 24px; }
        .ql-container .ql-editor .ql-size-32px { font-size: 32px; }
      `}</style>
    </div>
  );
};

export default EditELibrary;