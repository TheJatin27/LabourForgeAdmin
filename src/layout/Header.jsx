import { Bell, UserCircle, Menu, LogOut } from "lucide-react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";

export default function Header() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-40 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 shadow-sm">
      
      {/* LEFT */}
      <div className="flex items-center gap-4">
        <button className="p-2 -ml-2 text-gray-400 hover:text-gray-600 lg:hidden">
          <Menu size={20} />
        </button>

        <div className="flex items-baseline gap-2">
          <h1 className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <span className="hidden sm:block text-xs font-medium text-gray-400 uppercase tracking-widest border-l pl-3 border-gray-200">
            v2.0
          </span>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-5">
        
        {/* Notification */}
        <button className="text-gray-400 hover:text-blue-600 transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-[1px] bg-gray-100 mx-1"></div>

        {/* USER */}
        <div className="flex items-center gap-3 group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
              {user?.email || "Guest"}
            </p>
            <p className="text-[10px] text-gray-400 font-medium uppercase">
              Super Admin
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-0.5 rounded-full ring-2 ring-transparent group-hover:ring-blue-100 transition-all">
            <UserCircle size={32} className="text-gray-600" />
          </div>
        </div>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600"
        >
          <LogOut size={16} />
          Logout
        </button>

      </div>
    </header>
  );
}