import React, {
  useEffect,
  useState
} from "react";

import {
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";

import { db } from "../../firebase";

import {
  Loader2,
  CheckCircle,
  Plus,
  Trash2
} from "lucide-react";

import {
  useNavigate,
  useParams
} from "react-router-dom";

const EditELibrary = () => {

  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    slug: "",
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
          setForm(snap.data());
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
      practicalNotes: [
        ...prev.practicalNotes,
        ""
      ],
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
      complianceChecklist: [
        ...prev.complianceChecklist,
        ""
      ],
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
      faqs: [
        ...prev.faqs,
        {
          question: "",
          answer: ""
        }
      ],
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

      const ref = doc(
        db,
        "eLibraryPages",
        id
      );

      await updateDoc(ref, {
        ...form,
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

  // LOADER
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
    <div className="p-6 bg-gray-50 min-h-screen font-sans">

      {/* HEADER */}
      <div className="mb-8">

        <h2 className="text-3xl font-bold text-slate-800">
          Edit E-Library Page
        </h2>

        <p className="text-slate-500 mt-1">
          Update labour law content dynamically.
        </p>

      </div>

      {/* FORM */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-10">

        {/* TITLE */}
        <div>

          <label className="block text-sm font-bold mb-2">
            Page Title
          </label>

          <input
            value={form.title}
            onChange={(e) =>
              updateField(
                "title",
                e.target.value
              )
            }
            className="w-full border border-slate-300 rounded-xl p-4 outline-none"
          />

        </div>

        {/* SLUG */}
        <div>

          <label className="block text-sm font-bold mb-2">
            Slug
          </label>

          <input
            value={form.slug}
            onChange={(e) =>
              updateField(
                "slug",
                e.target.value
              )
            }
            className="w-full border border-slate-300 rounded-xl p-4 outline-none"
          />

        </div>

        {/* SHORT DESC */}
        <div>

          <label className="block text-sm font-bold mb-2">
            Banner Description
          </label>

          <textarea
            rows={3}
            value={form.shortDescription}
            onChange={(e) =>
              updateField(
                "shortDescription",
                e.target.value
              )
            }
            className="w-full border border-slate-300 rounded-xl p-4 outline-none"
          />

        </div>

        {/* OVERVIEW */}
        <div>

          <label className="block text-sm font-bold mb-2">
            Overview
          </label>

          <textarea
            rows={6}
            value={form.overview}
            onChange={(e) =>
              updateField(
                "overview",
                e.target.value
              )
            }
            className="w-full border border-slate-300 rounded-xl p-4 outline-none"
          />

        </div>

        {/* BARE ACT */}
        <div>

          <label className="block text-sm font-bold mb-2">
            Bare Act Description
          </label>

          <textarea
            rows={3}
            value={form.bareActDescription}
            onChange={(e) =>
              updateField(
                "bareActDescription",
                e.target.value
              )
            }
            className="w-full border border-slate-300 rounded-xl p-4 outline-none"
          />

        </div>

        {/* PDF */}
        <div>

          <label className="block text-sm font-bold mb-2">
            Bare Act PDF Link
          </label>

          <input
            value={form.bareActPdf}
            onChange={(e) =>
              updateField(
                "bareActPdf",
                e.target.value
              )
            }
            className="w-full border border-slate-300 rounded-xl p-4 outline-none"
          />

        </div>

        {/* AMENDMENTS */}
        <div>

          <label className="block text-sm font-bold mb-2">
            Amendments
          </label>

          <textarea
            rows={4}
            value={form.amendments}
            onChange={(e) =>
              updateField(
                "amendments",
                e.target.value
              )
            }
            className="w-full border border-slate-300 rounded-xl p-4 outline-none"
          />

        </div>

        {/* RULES */}
        <div>

          <label className="block text-sm font-bold mb-2">
            Rules
          </label>

          <textarea
            rows={4}
            value={form.rules}
            onChange={(e) =>
              updateField(
                "rules",
                e.target.value
              )
            }
            className="w-full border border-slate-300 rounded-xl p-4 outline-none"
          />

        </div>

        {/* PRACTICAL NOTES */}
        <div>

          <div className="flex justify-between items-center mb-4">

            <label className="text-sm font-bold">
              Practical Notes
            </label>

            <button
              onClick={addPracticalNote}
              className="flex items-center gap-2 text-blue-600 text-sm font-bold"
            >
              <Plus size={16} />
              Add
            </button>

          </div>

          <div className="space-y-3">

            {form.practicalNotes?.map((note, index) => (

              <div
                key={index}
                className="flex gap-3"
              >

                <input
                  value={note}
                  onChange={(e) =>
                    updatePracticalNote(
                      index,
                      e.target.value
                    )
                  }
                  className="flex-1 border border-slate-300 rounded-xl p-3"
                />

                <button
                  onClick={() =>
                    removePracticalNote(index)
                  }
                  className="text-red-500"
                >
                  <Trash2 size={18} />
                </button>

              </div>

            ))}

          </div>

        </div>

        {/* CHECKLIST */}
        <div>

          <div className="flex justify-between items-center mb-4">

            <label className="text-sm font-bold">
              Compliance Checklist
            </label>

            <button
              onClick={addChecklist}
              className="flex items-center gap-2 text-blue-600 text-sm font-bold"
            >
              <Plus size={16} />
              Add
            </button>

          </div>

          <div className="space-y-3">

            {form.complianceChecklist?.map((item, index) => (

              <div
                key={index}
                className="flex gap-3"
              >

                <input
                  value={item}
                  onChange={(e) =>
                    updateChecklist(
                      index,
                      e.target.value
                    )
                  }
                  className="flex-1 border border-slate-300 rounded-xl p-3"
                />

                <button
                  onClick={() =>
                    removeChecklist(index)
                  }
                  className="text-red-500"
                >
                  <Trash2 size={18} />
                </button>

              </div>

            ))}

          </div>

        </div>

        {/* FAQ */}
        <div>

          <div className="flex justify-between items-center mb-4">

            <label className="text-sm font-bold">
              FAQs
            </label>

            <button
              onClick={addFaq}
              className="flex items-center gap-2 text-blue-600 text-sm font-bold"
            >
              <Plus size={16} />
              Add FAQ
            </button>

          </div>

          <div className="space-y-6">

            {form.faqs?.map((faq, index) => (

              <div
                key={index}
                className="border border-slate-200 rounded-2xl p-4 space-y-3"
              >

                <input
                  placeholder="Question"
                  value={faq.question}
                  onChange={(e) =>
                    updateFaq(
                      index,
                      "question",
                      e.target.value
                    )
                  }
                  className="w-full border border-slate-300 rounded-xl p-3"
                />

                <textarea
                  rows={3}
                  placeholder="Answer"
                  value={faq.answer}
                  onChange={(e) =>
                    updateFaq(
                      index,
                      "answer",
                      e.target.value
                    )
                  }
                  className="w-full border border-slate-300 rounded-xl p-3"
                />

                <button
                  onClick={() =>
                    removeFaq(index)
                  }
                  className="text-red-500 text-sm font-bold"
                >
                  Remove FAQ
                </button>

              </div>

            ))}

          </div>

        </div>

        {/* SAVE BUTTON */}
        <div className="flex justify-end pt-4 border-t border-slate-200">

          <button
            onClick={updatePage}
            disabled={saving}
            className="px-6 py-3 bg-[#0B1538] text-white rounded-xl font-bold flex items-center gap-2"
          >

            {saving ? (
              <>
                <Loader2
                  className="animate-spin"
                  size={18}
                />

                Updating...
              </>
            ) : (
              <>
                <CheckCircle size={18} />

                Save Changes
              </>
            )}

          </button>

        </div>

      </div>

    </div>
  );
};

export default EditELibrary;