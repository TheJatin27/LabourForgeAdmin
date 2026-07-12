import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
import ReactQuill, { Quill } from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

import {
  Newspaper,
  Loader2,
  CheckCircle,
  XCircle,
  User,
  Tag,
  Link2,
  FileText
} from "lucide-react";

// 1. REGISTER CUSTOM SIZES (Numeric Options like Word)
const sizeWhitelist = ["10px", "12px", "14px", "16px", "18px", "20px", "24px", "32px"];
const Size = Quill.import("attributors/style/size");
Size.whitelist = sizeWhitelist;
Quill.register(Size, true);

// 2. REGISTER ALL FONTS (Standard Web-Safe + Google Fonts)
const fontWhitelist = [
  "inter",
  "poppins",
  "roboto",
  "open-sans",
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

export default function AddNewsManager() {
  const [loading, setLoading] = useState(false);

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

  // DYNAMICALLY LOAD GOOGLE FONTS CDN ASSET STRINGS
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

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // --- AUTOMATED TEXT SANITIZATION UTILITY ---
  const sanitizeContent = (content) => {
    if (typeof content !== "string") return content;
    return content
      .replace(/&nbsp;/g, " ")
      .replace(/[\u00AD\u200B]/g, "")
      .replace(/\r?\n|\r/g, " ");
  };

  // --- SUBMIT LOGIC ---
  const publishNews = async () => {
    try {
      setLoading(true);

      const cleanedForm = {
        title: sanitizeContent(form.title || ""),
        slug: sanitizeContent(form.slug || "").trim().toLowerCase().replace(/\s+/g, '-'),
        author: sanitizeContent(form.author || ""),
        category: form.category,
        shortDescription: form.shortDescription || "", // Safe HTML retention
        content: form.content || "",                   // Safe HTML retention
        actionType: form.actionType,
        actionLink: (form.actionLink || "").trim(),
        actionLabel: sanitizeContent(form.actionLabel || ""),
      };

      // Publishes directly into the specified new "news" collection
      await addDoc(collection(db, "news"), {
        ...cleanedForm,
        createdAt: new Date(),
      });

      alert("News Article Published Successfully!");
      
      // Reset Form State
      setForm({
        title: "",
        slug: "",
        author: "",
        category: "Breaking News",
        shortDescription: "",
        content: "",
        actionType: "none",
        actionLink: "",
        actionLabel: "",
      });
    } catch (err) {
      console.error(err);
      alert(`Something went wrong: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-[#1E293B]">
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <Newspaper className="text-blue-600" size={28} />
          <h2 className="text-3xl font-bold text-slate-800">News Room Publisher</h2>
        </div>
        <p className="text-slate-500 mt-1">
          Draft and publish dynamic articles, notices, and press releases.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-10">
        
        {/* HEADLINE & SLUG */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold mb-2">News Article Headline</label>
            <input
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Breaking: New Statutory Updates Announced"
              className="w-full border border-slate-300 rounded-xl p-4 outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">URL Route Slug</label>
            <input
              value={form.slug}
              onChange={(e) => updateField("slug", e.target.value)}
              placeholder="new-statutory-updates-announced"
              className="w-full border border-slate-300 rounded-xl p-4 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* METADATA BLOCK: AUTHOR & CLASSIFICATION CATEGORY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div>
            <label className="text-xs font-bold mb-2 flex items-center gap-1 text-slate-600">
              <User size={14}/> Author / Publisher Desk
            </label>
            <input
              value={form.author}
              onChange={(e) => updateField("author", e.target.value)}
              placeholder="Media Operations Team"
              className="w-full border border-slate-300 bg-white rounded-xl p-3 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-bold mb-2 flex items-center gap-1 text-slate-600">
              <Tag size={14}/> Article Category
            </label>
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
          <label className="block text-sm font-bold mb-2 text-blue-600">
            Card Preview Short Description Summary
          </label>
          <ReactQuill 
            theme="snow" 
            placeholder="Write a brief, catchy summary for overview lists and search previews..."
            modules={modules}
            value={form.shortDescription} 
            onChange={(val) => updateField("shortDescription", val)} 
          />
        </div>

        {/* MAIN TEXT PANELS */}
        <div>
          <label className="block text-sm font-bold mb-2 text-slate-800">
            Full News Story Article Content
          </label>
          <ReactQuill 
            theme="snow" 
            placeholder="Compose your rich text document article body here..."
            modules={modules}
            value={form.content} 
            onChange={(val) => updateField("content", val)} 
          />
        </div>

        {/* DYNAMIC REFERENCE ACTION / LINK ATTACHMENT */}
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
                <input 
                  value={form.actionLink}
                  onChange={(e) => updateField("actionLink", e.target.value)}
                  placeholder={form.actionType === "internal" ? "/news/circulars/doc-1" : "https://example.com/file.pdf"}
                  className="w-full border border-slate-300 rounded-xl p-3 bg-white text-sm outline-none focus:border-blue-500"
                />
              </div>
            )}
          </div>

          {form.actionType !== "none" && (
            <div>
              <label className="block text-xs font-bold mb-2 text-slate-600">Action Button Display Label Text</label>
              <input 
                value={form.actionLabel}
                onChange={(e) => updateField("actionLabel", e.target.value)}
                placeholder="Download Official Notification PDF"
                className="w-full border border-slate-300 rounded-xl p-3 bg-white text-sm outline-none focus:border-blue-500"
              />
            </div>
          )}
        </div>

        {/* ACTION BUTTON CONTROL BAR */}
        <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
          <button 
            type="button"
            onClick={() => setForm({ title: "", slug: "", author: "", category: "Breaking News", shortDescription: "", content: "", actionType: "none", actionLink: "", actionLabel: "" })}
            className="px-6 py-3 border border-slate-300 rounded-xl font-bold text-slate-600 flex items-center gap-2 hover:bg-gray-50 transition-all"
          >
            <XCircle size={18} /> Clear Draft
          </button>
          <button
            onClick={publishNews}
            disabled={loading}
            className="px-10 py-3 bg-[#0B1538] text-white rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 transition-all hover:bg-black shadow-lg"
          >
            {loading ? (
              <><Loader2 className="animate-spin" size={18} /> Publishing Entry...</>
            ) : (
              <><CheckCircle size={18} /> Publish News</>
            )}
          </button>
        </div>
      </div>

      {/* --- CSS Overrides for Editor Custom Fonts & Sizes UI Labels --- */}
      <style>{`
        .quill { background: white; border-radius: 0.75rem; border: 1px solid #cbd5e1 !important; }
        .ql-toolbar { border: none !important; border-bottom: 1px solid #cbd5e1 !important; background: #f8fafc; z-index: 20 !important; position: relative !important; }
        .ql-container { border: none !important; min-height: 180px; font-size: 1rem; }

        .ql-snow .ql-picker.ql-size .ql-picker-label::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item::before { content: attr(data-value) !important; }
        .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="14px"]::before { content: "14px" !important; }

        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="inter"]::before, .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="inter"]::before { content: 'Inter'; font-family: 'Inter', sans-serif; }
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="poppins"]::before, .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="poppins"]::before { content: 'Poppins'; font-family: 'Poppins', sans-serif; }
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="roboto"]::before, .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="roboto"]::before { content: 'Roboto'; font-family: 'Roboto', sans-serif; }
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="open-sans"]::before, .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="open-sans"]::before { content: 'Open Sans'; font-family: 'Open Sans', sans-serif; }
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
        
        .ql-container .ql-editor .ql-font-inter { font-family: 'Inter', sans-serif; }
        .ql-container .ql-editor .ql-font-poppins { font-family: 'Poppins', sans-serif; }
        .ql-container .ql-editor .ql-font-roboto { font-family: 'Roboto', sans-serif; }
        .ql-container .ql-editor .ql-font-open-sans { font-family: 'Open Sans', sans-serif; }
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