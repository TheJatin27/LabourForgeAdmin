import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import ReactQuill, { Quill } from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { useNavigate, useParams } from "react-router-dom";

import {
  Loader2,
  CheckCircle,
  XCircle,
  Link2,
  User,
  Tag,
  AlertTriangle,
  Newspaper
} from "lucide-react";

// 1. REGISTER CUSTOM SIZES
const sizeWhitelist = ["10px", "12px", "14px", "16px", "18px", "20px", "24px", "32px"];
const Size = Quill.import("attributors/style/size");
Size.whitelist = sizeWhitelist;
Quill.register(Size, true);

// 2. REGISTER FONTS
const fontWhitelist = ["inter", "poppins", "roboto", "open-sans", "arial", "arial-black", "comic-sans", "courier-new", "georgia", "impact", "lucida-sans", "tahoma", "times-new-roman", "trebuchet", "verdana"];
const Font = Quill.import("attributors/style/font");
Font.whitelist = fontWhitelist;
Quill.register(Font, true);

// 3. EXPANDED GLOBAL TOOLBAR CONFIGURATION
const modules = {
  toolbar: [
    [{ font: fontWhitelist }, { size: sizeWhitelist }],
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ color: [] }, { background: [] }], 
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }, { indent: "-1" }, { indent: "+1" }],
    ["link", "clean"],
  ],
};

export default function EditNews() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorState, setErrorState] = useState(false);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    author: "",
    category: "Breaking News",
    shortDescription: "",
    content: "",
    actionType: "none", // none | internal | external | download
    actionLink: "",
    actionLabel: "",
  });

  // Dynamic asset loading protection checks
  useEffect(() => {
    const linkId = "google-fonts-quill";
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Open+Sans:wght@300;400;600;700&family=Poppins:wght@300;400;600;700&family=Roboto:wght@300;400;500;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  // Fetch record references safely
  useEffect(() => {
    const loadArticleData = async () => {
      if (!id) {
        setErrorState(true);
        setLoading(false);
        return;
      }
      try {
        const snap = await getDoc(doc(db, "news", id));
        if (snap.exists()) {
          const data = snap.data();
          setForm({
            title: data.title || "",
            slug: data.slug || "",
            author: data.author || "",
            category: data.category || "Breaking News",
            shortDescription: data.shortDescription || "",
            content: data.content || "",
            actionType: data.actionType || "none",
            actionLink: data.actionLink || "",
            actionLabel: data.actionLabel || "",
          });
        } else {
          setErrorState(true);
        }
      } catch (err) {
        console.error("Failed fetching database targets:", err);
        setErrorState(true);
      } finally {
        setLoading(false);
      }
    };
    loadArticleData();
  }, [id]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const sanitizeContent = (content) => {
    if (typeof content !== "string") return content;
    return content.replace(/&nbsp;/g, " ").replace(/[\u00AD\u200B]/g, "").replace(/\r?\n|\r/g, " ");
  };

  const saveChanges = async () => {
    if (!id) return;
    try {
      setSaving(true);
      const cleanedForm = {
        title: sanitizeContent(form.title || ""),
        slug: sanitizeContent(form.slug || "").trim().toLowerCase().replace(/\s+/g, '-'),
        author: sanitizeContent(form.author || ""),
        category: form.category,
        shortDescription: form.shortDescription || "", // Safe HTML raw payload parsing
        content: form.content || "",                   // Safe HTML raw payload parsing
        actionType: form.actionType,
        actionLink: (form.actionLink || "").trim(),
        actionLabel: sanitizeContent(form.actionLabel || "")
      };

      await updateDoc(doc(db, "news", id), {
        ...cleanedForm,
        updatedAt: new Date(),
      });

      alert("News post changes written successfully.");
      navigate("/admin/news/manage");
    } catch (err) {
      console.error(err);
      alert(`Update processing error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-[#0B1538]" size={40} /></div>;
  if (errorState) return <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50"><AlertTriangle className="text-red-500 mb-2" size={40} /><p className="font-bold">Specified article layout state reference was not resolved.</p></div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-[#1E293B]">
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <Newspaper className="text-blue-600" size={28} />
          <h2 className="text-3xl font-bold text-slate-800">Modify News Post</h2>
        </div>
        <p className="text-slate-500 mt-1">Amend live headlines, dynamic summary profiles, metadata classifications or attached file properties.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-10">
        
        {/* HEADLINE & SLUG */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold mb-2">News Article Headline</label>
            <input value={form.title} onChange={(e) => updateField("title", e.target.value)} className="w-full border border-slate-300 rounded-xl p-4 outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">URL Route Slug</label>
            <input value={form.slug} onChange={(e) => updateField("slug", e.target.value)} className="w-full border border-slate-300 rounded-xl p-4 outline-none focus:border-blue-500" />
          </div>
        </div>

        {/* AUTHOR & CATEGORIES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div>
            <label className="text-xs font-bold mb-2 flex items-center gap-1 text-slate-600"><User size={14}/> Author / Publisher Desk</label>
            <input value={form.author} onChange={(e) => updateField("author", e.target.value)} className="w-full border border-slate-300 bg-white rounded-xl p-3 text-sm outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="text-xs font-bold mb-2 flex items-center gap-1 text-slate-600"><Tag size={14}/> Article Category</label>
            <select
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
              className="w-full border border-slate-300 bg-white rounded-xl p-3 text-sm outline-none font-medium text-slate-700 shadow-sm"
            >
              <option value="Breaking News">🚨 Breaking News / Updates</option>
              <option value="Statutory Circulars">📜 Statutory Circulars & Notifications</option>
              <option value="Industry Insights">💡 Industry Insights & Case Studies</option>
              <option value="Corporate Press">🏢 Corporate Announcements</option>
            </select>
          </div>
        </div>

        {/* SHORT DESCRIPTION SUMMARY */}
        <div>
          <label className="block text-sm font-bold mb-2 text-blue-600">Card Preview Short Description Summary</label>
          <ReactQuill theme="snow" modules={modules} value={form.shortDescription} onChange={(val) => updateField("shortDescription", val)} />
        </div>

        {/* ARTICLE TEXT BODY */}
        <div>
          <label className="block text-sm font-bold mb-2 text-slate-800">Full News Story Article Content</label>
          <ReactQuill theme="snow" modules={modules} value={form.content} onChange={(val) => updateField("content", val)} />
        </div>

        {/* DYNAMIC REFERENCE HYPERLINK MATRIX ATTACHMENT */}
        <div className="p-6 bg-blue-50/40 rounded-2xl border border-blue-100 space-y-4">
          <div className="flex items-center gap-2">
            <Link2 className="text-blue-600" size={18} />
            <h4 className="text-sm font-bold text-slate-800">Primary Link Call-To-Action Attachment</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold mb-2 text-slate-600">Action Link Behavior</label>
              <select 
                value={form.actionType} 
                onChange={(e) => updateField("actionType", e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-3 bg-white font-medium text-sm text-slate-700"
              >
                <option value="none">No attached file or URL link</option>
                <option value="internal">Internal UI Router Route</option>
                <option value="external">External Source Hyperlink (New Tab)</option>
                <option value="download">File Document Download URL</option>
              </select>
            </div>
            {form.actionType !== "none" && (
              <div className="md:col-span-2">
                <label className="block text-xs font-bold mb-2 text-slate-600">Target URL Route or File Endpoint</label>
                <input value={form.actionLink} onChange={(e) => updateField("actionLink", e.target.value)} className="w-full border border-slate-300 rounded-xl p-3 bg-white text-sm outline-none focus:border-blue-500" />
              </div>
            )}
          </div>
          {form.actionType !== "none" && (
            <div>
              <label className="block text-xs font-bold mb-2 text-slate-600">Action Button Display Label Text</label>
              <input value={form.actionLabel} onChange={(e) => updateField("actionLabel", e.target.value)} className="w-full border border-slate-300 rounded-xl p-3 bg-white text-sm outline-none focus:border-blue-500" />
            </div>
          )}
        </div>

        {/* PANEL FOOTER TRIGGERS CONTROL ACTIONS */}
        <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
          <button type="button" onClick={() => navigate("/admin/news/manage")} className="px-6 py-3 border border-slate-300 rounded-xl font-bold text-slate-600 flex items-center gap-2 hover:bg-gray-50"><XCircle size={18} /> Cancel</button>
          <button onClick={saveChanges} disabled={saving} className="px-10 py-3 bg-[#0B1538] text-white rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 hover:bg-black shadow-lg">
            {saving ? <><Loader2 className="animate-spin" size={18} /> Syncing Updates...</> : <><CheckCircle size={18} /> Update News</>}
          </button>
        </div>
      </div>

      <style>{`
        .quill { background: white; border-radius: 0.75rem; border: 1px solid #cbd5e1 !important; }
        .ql-toolbar { border: none !important; border-bottom: 1px solid #cbd5e1 !important; background: #f8fafc; z-index: 20 !important; position: relative !important; }
        .ql-container { border: none !important; min-height: 160px; font-size: 1rem; }
        .ql-snow .ql-picker.ql-size .ql-picker-label::before, .ql-snow .ql-picker.ql-size .ql-picker-item::before { content: attr(data-value) !important; }
        .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="14px"]::before { content: "14px" !important; }
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
}