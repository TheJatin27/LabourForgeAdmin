import React, {
  useEffect,
  useState
} from "react";

import {
  collection,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";

import { db } from "../../firebase";

import {
  Trash2,
  Pencil,
  BookOpen,
  Loader2,
  Plus
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const ManageELibrary = () => {

  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // FETCH DATA
  const fetchPages = async () => {
    try {
      const snap = await getDocs(
        collection(db, "eLibraryPages")
      );

      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  // DELETE logic preserved
  const deletePage = async (id) => {
    const confirmDelete = window.confirm(
      "Delete this page?"
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(
        doc(db, "eLibraryPages", id)
      );

      setPages((prev) =>
        prev.filter((item) => item.id !== id)
      );

      alert("Page deleted");
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2
          className="animate-spin text-[#0B1538]"
          size={40}
        />
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#F8FAFC] min-h-screen font-sans">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight">
            Manage E-Library
          </h1>
          <p className="text-slate-500 mt-1">
            Edit, delete and manage labour law pages.
          </p>
        </div>

        <button
          onClick={() =>
            navigate("/admin/e-library")
          }
          className="bg-[#0B1538] text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-blue-900/10"
        >
          <Plus size={18} />
          Add New Page
        </button>
      </div>

      {/* EMPTY STATE */}
      {pages.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-20 text-center">
          <BookOpen
            size={50}
            className="mx-auto text-slate-300 mb-4"
          />
          <h3 className="text-xl font-bold text-slate-700">
            No Pages Found
          </h3>
          <p className="text-slate-400 mt-2">
            Add your first labour law page to see it here.
          </p>
        </div>
      )}

      {/* LIST */}
      <div className="grid gap-6">
        {pages.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-6 hover:shadow-md transition-all"
          >
            {/* LEFT - CONTENT PREVIEW */}
            <div className="flex-1 w-full">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <BookOpen
                    className="text-orange-500"
                    size={22}
                  />
                </div>

                <div className="overflow-hidden">
                  <h3 className="text-xl font-bold text-slate-800 truncate">
                    {item.title}
                  </h3>
                  <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mt-1 opacity-70">
                    /library/{item.slug}
                  </p>
                </div>
              </div>

              {/* MODIFIED: Properly render Rich Text preview instead of raw HTML strings */}
              <div 
                className="text-sm text-slate-500 leading-relaxed max-w-4xl line-clamp-2 manage-preview-content"
                dangerouslySetInnerHTML={{ __html: item.shortDescription }}
              />
            </div>

            {/* ACTIONS */}
            <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
              {/* EDIT */}
              <button
                onClick={() =>
                  navigate(`/admin/e-library/edit/${item.id}`)
                }
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-sm text-slate-700 transition-all flex-1 lg:flex-none justify-center"
              >
                <Pencil size={16} />
                Edit
              </button>

              {/* DELETE */}
              <button
                onClick={() =>
                  deletePage(item.id)
                }
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-bold text-sm transition-all flex-1 lg:flex-none justify-center"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Internal CSS to handle the preview appearance */}
      <style dangerouslySetInnerHTML={{ __html: `
        .manage-preview-content p { margin: 0; display: inline; }
        .manage-preview-content {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}} />

    </div>
  );
};

export default ManageELibrary;