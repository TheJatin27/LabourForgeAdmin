import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

import {
  Loader2,
  CheckCircle,
  Plus,
  Trash2,
  XCircle,
  Gavel
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

// Toolbar configuration for the Rich Text Editor
const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }],
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
    includedActs: [{ actTitle: "", actContent: "" }], // Array of objects logic preserved
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

  // FETCH EXISTING DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const ref = doc(db, "eLibraryPages", id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          // Ensure arrays/objects exist to prevent mapping errors
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

  // UPDATE FIREBASE
  const updatePage = async () => {
    try {
      setSaving(true);
      const ref = doc(db, "eLibraryPages", id);
      await updateDoc(ref, {
        ...form,
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
                  <ReactQuill theme="snow" value={act.actContent} onChange={(val) => updateIncludedAct(index, "actContent", val)} />
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
                  <ReactQuill theme="snow" value={note} onChange={(val) => updatePracticalNote(index, val)} />
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
                  <ReactQuill theme="snow" value={item} onChange={(val) => updateChecklist(index, val)} />
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
                <ReactQuill theme="snow" value={faq.answer} onChange={(val) => updateFaq(index, "answer", val)} />
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

      <style>{`
        .quill { background: white; border-radius: 0.75rem; border: 1px solid #cbd5e1 !important; }
        .ql-toolbar { border: none !important; border-bottom: 1px solid #cbd5e1 !important; background: #f8fafc; }
        .ql-container { border: none !important; min-height: 140px; font-size: 1rem; }
      `}</style>
    </div>
  );
};

export default EditELibrary;