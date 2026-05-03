import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { MapPin, Plus, List, Globe } from "lucide-react";

export default function States() {
  const [states, setStates] = useState([]);
  const [newState, setNewState] = useState("");

  const fetchStates = async () => {
    const snap = await getDocs(collection(db, "states"));
    setStates(snap.docs.map((d) => d.data().name));
  };

  const addState = async () => {
    if (!newState) return;
    await addDoc(collection(db, "states"), { name: newState });
    setNewState("");
    fetchStates();
  };

  useEffect(() => {
    fetchStates();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-gray-900">
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Globe className="text-blue-600" size={24} />
          Jurisdiction Management
        </h2>
        <p className="text-gray-500">Add and manage states for minimum wage calculations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Add New State */}
        <div className="md:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sticky top-6">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Plus size={16} className="text-blue-600" />
              Add New State
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">State Name</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    placeholder="e.g. Maharashtra"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <button 
                onClick={addState} 
                className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-md hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Register State
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: List of States */}
        <div className="md:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <List size={18} className="text-blue-600" />
                Existing States
              </h3>
              <span className="text-xs font-mono text-gray-500 bg-white border px-2 py-1 rounded">
                Total: {states.length}
              </span>
            </div>

            <div className="divide-y divide-gray-100">
              {states.length > 0 ? (
                states.map((s, i) => (
                  <div 
                    key={i} 
                    className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </div>
                      <span className="font-medium text-gray-700">{s}</span>
                    </div>
                    {/* Add management buttons here later if needed (e.g., Delete/Edit) */}
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-gray-400">
                  <p className="text-sm font-medium">No states registered yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}