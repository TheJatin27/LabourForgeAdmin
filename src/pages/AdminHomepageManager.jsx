import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import ReactQuill, { Quill } from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

import { 
  Calendar, Shield, Scale, Users, Search, Calculator, BookOpen,
  CheckCircle, Save, Loader2, Edit3, Check, Plus, Trash2
} from "lucide-react";

// 1. REGISTER CUSTOM QUILL ATTRIBUTORS
const sizeWhitelist = ["10px", "12px", "14px", "16px", "18px", "20px", "24px", "32px", "40px", "48px"];
const Size = Quill.import("attributors/style/size");
Size.whitelist = sizeWhitelist;
Quill.register(Size, true);

const fontWhitelist = ["inter", "poppins", "roboto", "open-sans", "arial", "georgia", "impact", "times-new-roman", "verdana"];
const Font = Quill.import("attributors/style/font");
Font.whitelist = fontWhitelist;
Quill.register(Font, true);

// VERSION-SAFE LINE HEIGHT ATTRIBUTOR REGISTRATION
const Parchment = Quill.import("parchment");
const AttributorStyle = Parchment.StyleAttributor || Parchment.Attributor?.Style;

if (AttributorStyle) {
  const LineHeight = new AttributorStyle("lineheight", "line-height", {
    scope: Parchment.Scope.INLINE || 3,
    whitelist: ["1.0", "1.2", "1.5", "1.8", "2.0"]
  });
  Quill.register(LineHeight, true);
}

const iconMap = {
  Calculator: Calculator,
  Shield: Shield,
  Scale: Scale,
  Users: Users,
  Search: Search,
  BookOpen: BookOpen
};

const modules = {
  toolbar: [
    [{ font: fontWhitelist }, { size: sizeWhitelist }],
    [{ lineheight: ["1.0", "1.2", "1.5", "1.8", "2.0"] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["clean"]
  ]
};

const initialHomeData = {
  heroTitle: "Designing Compliant Payroll Structures for a Changing Labour Law Landscape",
  heroSubtitle: "Supporting organizations in aligning payroll, contracts, and statutory compliance with evolving labour regulations.",
  quoteStrip: "“Most compliance issues don't arise from intent they arise from incorrect structuring.”",
  servicesHeading: "Our Services",
  servicesList: [
    { iconKey: "Calculator", title: "Payroll Structuring", desc: "Designing and managing payroll aligned with statutory requirements" },
    { iconKey: "Shield", title: "PF & ESIC Compliance", desc: "Ensuring accurate PF and ESIC compliance and advisory" },
    { iconKey: "Scale", title: "Labour Law Advisory", desc: "Advisory on labour laws and policy documentation" }
  ],
  struggleHeading: "Where Organizations Struggle",
  struggleItems: [
    "Incorrect salary structuring leading to compliance risk",
    "PF/ESIC exposure due to incorrect classification",
    "Weak documentation during inspections"
  ],
  labourHeading: "Getting Ready for Labour Codes",
  labourSub: "With labour codes expected to be implemented soon, start aligning your systems today.",
  aboutHeading: "About Labourforge",
  aboutSub: "Bringing structure and clarity to payroll & labour law compliance",
  aboutDesc: "Labourforge was established with a clear objective to bring structure, clarity, and practical understanding to payroll and labour law compliance.",
  aboutCardsList: [
    { title: "The Reality", desc: "Compliance challenges don't arise from intent—they come from gaps in structuring, interpretation, and execution.", callout: "Payroll is not just an administrative task; it's a critical compliance and risk management function." }
  ],
  servicesBannerHeading: "Our Services",
  servicesBannerSub: "Payroll & Compliance Solutions Built for Clarity, Control & Confidence.",
  servicesBannerDesc: "Payroll and compliance are not isolated functions they are interconnected systems that directly impact risk, cost, and operational stability."
};

export default function AdminHomepageManager() {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [activeKey, setActiveKey] = useState(null);
  const [editorContent, setEditorContent] = useState("");
  const [isListEdit, setIsListEdit] = useState(false);
  const [listIndex, setListIndex] = useState(null);
  const [nestedField, setNestedField] = useState(null);

  useEffect(() => {
    const linkId = "google-fonts-quill-admin";
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Open+Sans:wght@300;400;600;700&family=Poppins:wght@300;400;600;700&family=Roboto:wght@300;400;500;700&display=swap";
      document.head.appendChild(link);
    }

    const fetchHomeData = async () => {
      try {
        const ref = doc(db, "homepage", "data");
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setPageData({
            ...initialHomeData,
            ...data,
            servicesList: data.servicesList || initialHomeData.servicesList,
            struggleItems: data.struggleItems || initialHomeData.struggleItems,
            aboutCardsList: data.aboutCardsList || initialHomeData.aboutCardsList
          });
        } else {
          setPageData(initialHomeData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const openEditor = (key, currentVal, isList = false, index = null, nested = null) => {
    setActiveKey(key);
    setEditorContent(currentVal || "");
    setIsListEdit(isList);
    setListIndex(index);
    setNestedField(nested);
  };

  const saveBlockChange = () => {
    if (isListEdit && listIndex !== null) {
      const updatedList = [...pageData[activeKey]];
      if (nestedField) {
        updatedList[listIndex] = { ...updatedList[listIndex], [nestedField]: editorContent };
      } else {
        updatedList[listIndex] = editorContent;
      }
      setPageData(prev => ({ ...prev, [activeKey]: updatedList }));
    } else {
      setPageData(prev => ({ ...prev, [activeKey]: editorContent }));
    }
    setActiveKey(null);
    setNestedField(null);
  };

  const addNewServiceCard = () => {
    setPageData(prev => ({
      ...prev,
      servicesList: [...prev.servicesList, { iconKey: "Calculator", title: "New Service Title", desc: "Description here." }]
    }));
  };

  const removeServiceCard = (index, e) => {
    e.stopPropagation();
    const copy = [...pageData.servicesList];
    copy.splice(index, 1);
    setPageData(prev => ({ ...prev, servicesList: copy }));
  };

  const cycleIconKey = (index, e) => {
    e.stopPropagation();
    const icons = Object.keys(iconMap);
    const currentIcon = pageData.servicesList[index].iconKey;
    const nextIndex = (icons.indexOf(currentIcon) + 1) % icons.length;
    const copy = [...pageData.servicesList];
    copy[index].iconKey = icons[nextIndex];
    setPageData(prev => ({ ...prev, servicesList: copy }));
  };

  const addNewAboutCard = () => {
    setPageData(prev => ({
      ...prev,
      aboutCardsList: [...prev.aboutCardsList, { title: "New About Title", desc: "Details...", callout: "Emphasis..." }]
    }));
  };

  const removeAboutCard = (index, e) => {
    e.stopPropagation();
    const copy = [...pageData.aboutCardsList];
    copy.splice(index, 1);
    setPageData(prev => ({ ...prev, aboutCardsList: copy }));
  };

  const handleGlobalPublish = async () => {
    try {
      setSaving(true);
      await setDoc(doc(db, "homepage", "data"), { ...pageData, updatedAt: new Date() });
      alert("Homepage changes published successfully!");
    } catch (err) {
      console.error(err);
      alert("Publish failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-900" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fbff] text-slate-800 font-['Inter',sans-serif] relative">
      
      {/* ACTION HEADER */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Edit3 size={20} className="text-blue-600" /> Live Homepage Editor
          </h1>
          <p className="text-xs text-slate-500">Click elements directly below to edit.</p>
        </div>
        <button onClick={handleGlobalPublish} disabled={saving} className="bg-blue-900 hover:bg-black text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md flex items-center gap-2 transition-all">
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Publish Live Changes
        </button>
      </div>

      {/* EDIT MODAL */}
      {activeKey && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl p-6 shadow-2xl flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-md font-bold text-slate-800 uppercase">Edit Content Block</h3>
              <button onClick={() => setActiveKey(null)} className="text-slate-400 hover:text-slate-600">Cancel</button>
            </div>
            <div className="bg-white rounded-xl border border-slate-200">
              <ReactQuill theme="snow" modules={modules} value={editorContent} onChange={setEditorContent} />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setActiveKey(null)} className="px-5 py-2 border rounded-xl text-slate-500">Discard</button>
              <button onClick={saveBlockChange} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl flex items-center gap-1.5 shadow"><Check size={16} /> Save Component</button>
            </div>
          </div>
        </div>
      )}

      {/* WORKSPACE PREVIEW */}
      <div className="pointer-events-auto visual-editor-preview">
        {/* HERO */}
        <section className="max-w-7xl mx-auto px-5 pt-12 pb-8 flex flex-col lg:flex-row items-center gap-8">
          <div className="lg:w-1/2 space-y-4 text-center lg:text-left">
            <div onClick={() => openEditor("heroTitle", pageData.heroTitle)} className="cursor-pointer hover:bg-amber-50 p-2 rounded-xl border border-dashed border-transparent hover:border-amber-400">
              <div dangerouslySetInnerHTML={{ __html: pageData.heroTitle }} className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 leading-tight edit-h1" />
            </div>
            <div onClick={() => openEditor("heroSubtitle", pageData.heroSubtitle)} className="cursor-pointer hover:bg-amber-50 p-2 rounded-xl border border-dashed border-transparent hover:border-amber-400">
              <div dangerouslySetInnerHTML={{ __html: pageData.heroSubtitle }} className="text-slate-500 text-base" />
            </div>
          </div>
        </section>

        {/* Quote Strip */}
        <div className="w-full bg-white border-y py-4 text-center cursor-pointer hover:bg-amber-50" onClick={() => openEditor("quoteStrip", pageData.quoteStrip)}>
          <div dangerouslySetInnerHTML={{ __html: pageData.quoteStrip }} className="text-slate-700 italic" />
        </div>

        {/* SERVICES */}
        <section className="max-w-7xl mx-auto px-5 py-10">
          <div className="flex justify-between items-center border-b pb-4 mb-8">
            <div onClick={() => openEditor("servicesHeading", pageData.servicesHeading)} className="cursor-pointer hover:bg-amber-50 p-2 rounded-xl">
              <div dangerouslySetInnerHTML={{ __html: pageData.servicesHeading }} className="text-3xl font-semibold edit-h2" />
            </div>
            <button onClick={addNewServiceCard} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-bold text-xs"><Plus size={14} /> Add Service</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pageData.servicesList.map((srv, idx) => {
              const IconComponent = iconMap[srv.iconKey] || Calculator;
              return (
                <div key={idx} className="bg-white p-6 rounded-2xl border flex flex-col justify-between group relative border-l-4 border-l-blue-600">
                  <button onClick={(e) => removeServiceCard(idx, e)} className="absolute top-3 right-3 p-1.5 bg-red-50 text-red-500 rounded-lg opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                  <div className="space-y-4">
                    <div onClick={(e) => cycleIconKey(idx, e)} className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><IconComponent size={20} /></div>
                    <div className="space-y-1.5">
                      <div onClick={() => openEditor("servicesList", srv.title, true, idx, "title")} className="cursor-pointer hover:bg-amber-50 p-1 rounded"><div dangerouslySetInnerHTML={{ __html: srv.title }} className="font-bold text-slate-800 text-base" /></div>
                      <div onClick={() => openEditor("servicesList", srv.desc, true, idx, "desc")} className="cursor-pointer hover:bg-amber-50 p-1 rounded"><div dangerouslySetInnerHTML={{ __html: srv.desc }} className="text-xs text-slate-500" /></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* STRUGGLES */}
        <section className="bg-slate-100 border-y py-10 px-5">
          <div className="max-w-7xl mx-auto space-y-4">
            <div onClick={() => openEditor("struggleHeading", pageData.struggleHeading)} className="cursor-pointer hover:bg-amber-50 p-2 rounded-xl inline-block">
              <div dangerouslySetInnerHTML={{ __html: pageData.struggleHeading }} className="text-2xl font-semibold text-slate-800 edit-h2" />
            </div>
            <ul className="space-y-2 max-w-xl">
              {pageData.struggleItems.map((item, idx) => (
                <li key={idx} onClick={() => openEditor("struggleItems", item, true, idx)} className="flex items-center gap-3 bg-white p-2.5 rounded-lg shadow-sm cursor-pointer hover:bg-amber-50">
                  <CheckCircle size={16} className="text-blue-600 shrink-0" />
                  <div dangerouslySetInnerHTML={{ __html: item }} className="text-sm font-medium" />
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* LABOUR CODE SECTION */}
        <section className="bg-[#0f2b3f] text-white py-12 border-b-8 border-[#d59b3f] text-center px-5">
          <div onClick={() => openEditor("labourHeading", pageData.labourHeading)} className="cursor-pointer hover:bg-white/10 p-2 rounded-xl inline-block"><div dangerouslySetInnerHTML={{ __html: pageData.labourHeading }} className="text-2xl md:text-4xl text-white font-bold" /></div>
          <div onClick={() => openEditor("labourSub", pageData.labourSub)} className="cursor-pointer hover:bg-white/10 p-2 rounded-xl max-w-2xl mx-auto"><div dangerouslySetInnerHTML={{ __html: pageData.labourSub }} className="text-blue-200 text-sm" /></div>
        </section>

        {/* ABOUT DYNAMIC BLOCK */}
        <section className="bg-white py-10 px-5 max-w-6xl mx-auto space-y-6">
          <div className="flex justify-between items-center border-b pb-2">
            <div onClick={() => openEditor("aboutHeading", pageData.aboutHeading)} className="cursor-pointer hover:bg-amber-50 p-2 rounded-xl"><div dangerouslySetInnerHTML={{ __html: pageData.aboutHeading }} className="text-3xl text-blue-900 font-bold edit-h2" /></div>
            <button onClick={addNewAboutCard} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-bold text-xs"><Plus size={14} /> Add About Block</button>
          </div>
          <div onClick={() => openEditor("aboutSub", pageData.aboutSub)} className="cursor-pointer hover:bg-amber-50 p-2 rounded-xl text-center"><div dangerouslySetInnerHTML={{ __html: pageData.aboutSub }} className="text-slate-600 font-medium" /></div>
          <div onClick={() => openEditor("aboutDesc", pageData.aboutDesc)} className="cursor-pointer hover:bg-amber-50 p-2 rounded-xl text-center"><div dangerouslySetInnerHTML={{ __html: pageData.aboutDesc }} className="text-slate-700 text-base" /></div>

          <div className="grid md:grid-cols-2 gap-6 pt-6">
            {pageData.aboutCardsList.map((card, idx) => (
              <div key={idx} className="bg-slate-50 p-6 rounded-2xl border relative group">
                <button onClick={(e) => removeAboutCard(idx, e)} className="absolute top-3 right-3 p-1.5 bg-red-50 text-red-500 rounded-lg opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                <div className="space-y-3">
                  <div onClick={() => openEditor("aboutCardsList", card.title, true, idx, "title")} className="cursor-pointer hover:bg-amber-50 p-1 rounded"><div dangerouslySetInnerHTML={{ __html: card.title }} className="text-xl text-blue-900 font-bold" /></div>
                  <div onClick={() => openEditor("aboutCardsList", card.desc, true, idx, "desc")} className="cursor-pointer hover:bg-amber-50 p-1 rounded"><div dangerouslySetInnerHTML={{ __html: card.desc }} className="text-slate-600 text-sm" /></div>
                  <div onClick={() => openEditor("aboutCardsList", card.callout, true, idx, "callout")} className="cursor-pointer hover:bg-amber-50 p-2 rounded bg-blue-50 border-l-4 border-blue-600"><div dangerouslySetInnerHTML={{ __html: card.callout }} className="text-sm text-slate-800" /></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* STYLING CONFIG RULES PANEL */}
      <style>{`
        .quill { background: white; border-radius: 0.75rem; }
        .ql-toolbar { background: #f8fafc; border-top-left-radius: 0.75rem; border-top-right-radius: 0.75rem; }
        .ql-container { min-height: 200px; font-size: 1rem; border-bottom-left-radius: 0.75rem; border-bottom-right-radius: 0.75rem; }

        .ql-snow .ql-picker.ql-size .ql-picker-label::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item::before { content: attr(data-value) !important; }
        .ql-snow .ql-picker.ql-font .ql-picker-label::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item::before { content: attr(data-value) !important; text-transform: capitalize; }
        .ql-snow .ql-picker.ql-lineheight .ql-picker-label::before,
        .ql-snow .ql-picker.ql-lineheight .ql-picker-item::before { content: attr(data-value) !important; }

        /* LINE HEIGHT AND SIZES DEFINITIONS MAPS */
        .ql-container .ql-editor *[style*="line-height: 1.0"] { line-height: 1.0 !important; }
        .ql-container .ql-editor *[style*="line-height: 1.2"] { line-height: 1.2 !important; }
        .ql-container .ql-editor *[style*="line-height: 1.5"] { line-height: 1.5 !important; }
        .ql-container .ql-editor *[style*="line-height: 1.8"] { line-height: 1.8 !important; }
        .ql-container .ql-editor *[style*="line-height: 2.0"] { line-height: 2.0 !important; }

        .ql-container .ql-editor .ql-font-inter { font-family: 'Inter', sans-serif; }
        .ql-container .ql-editor .ql-font-poppins { font-family: 'Poppins', sans-serif; }
        .ql-container .ql-editor .ql-font-roboto { font-family: 'Roboto', sans-serif; }
        .ql-container .ql-editor .ql-font-open-sans { font-family: 'Open Sans', sans-serif; }

        .ql-container .ql-editor .ql-size-10px { font-size: 10px; }
        .ql-container .ql-editor .ql-size-12px { font-size: 12px; }
        .ql-container .ql-editor .ql-size-14px { font-size: 14px; }
        .ql-container .ql-editor .ql-size-16px { font-size: 16px; }
        .ql-container .ql-editor .ql-size-18px { font-size: 18px; }
        .ql-container .ql-editor .ql-size-24px { font-size: 24px; }
        .ql-container .ql-editor .ql-size-32px { font-size: 32px; }
        .ql-container .ql-editor .ql-size-40px { font-size: 40px; }
        .ql-container .ql-editor .ql-size-48px { font-size: 48px; }

        /* LINE SPACING FIXES TO PREVENT ELEMENT COLLAPSE STACKING */
        .visual-editor-preview p, .edit-h1 p, .edit-h2 p { display: inline !important; margin: 0 !important; padding: 0 !important; }
        .visual-editor-preview br, .edit-h1 br, .edit-h2 br { display: none !important; }
      `}</style>
    </div>
  );
}