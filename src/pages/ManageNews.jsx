import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { Newspaper, Edit2, Trash2, Loader2, Plus, Calendar, Tag, User } from "lucide-react";

export default function ManageNews() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "news"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setArticles(data);
    } catch (err) {
      console.error("Error fetching news records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this news article?")) return;
    try {
      await deleteDoc(doc(db, "news", id));
      setArticles((prev) => prev.filter((item) => item.id !== id));
      alert("News article removed successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to complete removal request.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-[#0B1538]" size={40} />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-[#1E293B]">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Newsroom Press Matrix</h2>
          <p className="text-slate-500 mt-1">Manage, update, or clear structural reporting assets and statutory alerts live.</p>
        </div>
        <button
          onClick={() => navigate("/admin/news/add")}
          className="flex items-center gap-2 bg-[#0B1538] text-white px-5 py-3 rounded-xl font-bold shadow-md hover:bg-black transition-all"
        >
          <Plus size={18} /> Add News Article
        </button>
      </div>

      <div className="space-y-4">
        {articles.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <Newspaper className="mx-auto text-slate-300 mb-2" size={48} />
            <p className="text-slate-500 font-medium">No published news items detected within the active instance database.</p>
          </div>
        ) : (
          articles.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-blue-600 shrink-0">
                  <Newspaper size={24} />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                    <span className="px-2.5 py-1 bg-slate-100 rounded-md text-slate-600 flex items-center gap-1">
                      <Tag size={12} /> {article.category || "General News"}
                    </span>
                    {article.author && (
                      <span className="text-slate-400 flex items-center gap-1">
                        <User size={12} /> {article.author}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-800 pt-1">{article.title}</h3>
                  <span className="text-xs font-semibold text-blue-600 block tracking-wide uppercase">
                    /news/{article.slug || "no-slug"}
                  </span>
                  
                  {article.shortDescription && (
                    <div 
                      className="text-slate-500 text-sm mt-2 line-clamp-2 ql-editor-preview"
                      dangerouslySetInnerHTML={{ __html: article.shortDescription }}
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0">
                <button
                  onClick={() => navigate(`/admin/news/edit/${article.id}`)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
                >
                  <Edit2 size={16} className="text-slate-500" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(article.id)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-50 border border-red-100 rounded-xl text-sm font-bold text-red-600 hover:bg-red-100/70 transition-all shadow-sm"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}