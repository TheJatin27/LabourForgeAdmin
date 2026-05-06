import React, {
  useEffect,
  useState
} from "react";

import {
  collection,
  getDocs
} from "firebase/firestore";

import { db } from "../firebase";

import {
  BookOpen,
  IndianRupee,
  Map,
  FileText,
  ArrowUpRight,
  Loader2
} from "lucide-react";

export default function Dashboard() {

  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    states: 0,
    wages: 0,
    library: 0
  });

  const [recentPages, setRecentPages] = useState([]);

  useEffect(() => {

    const fetchDashboard = async () => {

      try {

        // STATES
        const statesSnap = await getDocs(
          collection(db, "states")
        );

        // WAGES
        const wagesSnap = await getDocs(
          collection(db, "minimumWages")
        );

        // LIBRARY
        const librarySnap = await getDocs(
          collection(db, "eLibraryPages")
        );

        const libraryData = librarySnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setStats({
          states: statesSnap.size,
          wages: wagesSnap.size,
          library: librarySnap.size
        });

        setRecentPages(
          libraryData.slice(0, 5)
        );

      } catch (err) {

        console.error(err);

      } finally {

        setLoading(false);
      }
    };

    fetchDashboard();

  }, []);

  // LOADING
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2
          className="animate-spin text-blue-600"
          size={40}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* PAGE HEADER */}
      <div>

        <h1 className="text-3xl font-black text-slate-800 tracking-tight">
          Dashboard
        </h1>

        <p className="text-slate-500 mt-1">
          Labour law management overview.
        </p>

      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {/* STATES */}
        <DashboardCard
          title="States"
          value={stats.states}
          icon={<Map size={24} />}
          color="blue"
        />

        {/* WAGES */}
        <DashboardCard
          title="Labour Wages"
          value={stats.wages}
          icon={<IndianRupee size={24} />}
          color="green"
        />

        {/* LIBRARY */}
        <DashboardCard
          title="E-Library Pages"
          value={stats.library}
          icon={<BookOpen size={24} />}
          color="orange"
        />

      </div>

      {/* RECENT PAGES */}
      <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">

        <div className="flex items-center justify-between mb-8">

          <div>

            <h3 className="text-xl font-black text-slate-800">
              Recent E-Library Pages
            </h3>

            <p className="text-slate-400 text-sm mt-1">
              Recently added labour law resources
            </p>

          </div>

          <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center">

            <FileText
              className="text-orange-500"
              size={22}
            />

          </div>

        </div>

        {/* EMPTY */}
        {recentPages.length === 0 ? (

          <div className="text-center py-12">

            <BookOpen
              size={50}
              className="mx-auto text-slate-200 mb-4"
            />

            <h4 className="text-lg font-bold text-slate-600">
              No Pages Yet
            </h4>

            <p className="text-slate-400 text-sm mt-1">
              Start adding E-Library content.
            </p>

          </div>

        ) : (

          <div className="space-y-4">

            {recentPages.map((item) => (

              <div
                key={item.id}
                className="flex items-center justify-between border border-slate-100 rounded-2xl p-5 hover:border-orange-100 hover:bg-orange-50/20 transition-all"
              >

                <div>

                  <h4 className="font-bold text-slate-800">
                    {item.title}
                  </h4>

                  <p className="text-xs text-slate-400 mt-1">
                    /library/{item.slug}
                  </p>

                </div>

                <div className="flex items-center gap-2 text-orange-500 font-bold text-sm">

                  View

                  <ArrowUpRight size={16} />

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

// CARD
const DashboardCard = ({
  title,
  value,
  icon,
  color
}) => {

  const themes = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      shadow: "shadow-blue-100"
    },

    green: {
      bg: "bg-green-50",
      text: "text-green-600",
      shadow: "shadow-green-100"
    },

    orange: {
      bg: "bg-orange-50",
      text: "text-orange-500",
      shadow: "shadow-orange-100"
    }
  };

  return (

    <div className={`bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all`}>

      <div className="flex items-center justify-between mb-8">

        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${themes[color].bg} ${themes[color].text}`}>

          {icon}

        </div>

        <ArrowUpRight
          size={18}
          className="text-slate-300"
        />

      </div>

      <h3 className="text-4xl font-black text-slate-800 tracking-tight">
        {value}
      </h3>

      <p className="text-slate-500 font-semibold mt-2 text-sm">
        {title}
      </p>

    </div>
  );
};