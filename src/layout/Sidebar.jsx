import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Map, 
  IndianRupee, 
  Settings, 
  ChevronRight 
} from "lucide-react"; // Matching icons

export default function Sidebar() {
  const navItems = [
    { to: "/", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { to: "/states", label: "States", icon: <Map size={20} /> },
    { to: "/labour-wages", label: "Labour Wages", icon: <IndianRupee size={20} /> },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-full transition-all duration-300">
      {/* Sidebar Header/Logo Area - Optional if not in Top Header */}
      <div className="p-6">
        <div className="flex items-center gap-3 px-2 py-1 bg-blue-50 rounded-lg">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">
            A
          </div>
          <span className="font-bold text-gray-800 tracking-tight">Management</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center justify-between group px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                  : "text-gray-500 hover:bg-gray-50 hover:text-blue-600"
              }`
            }
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span>{item.label}</span>
            </div>
            <ChevronRight 
              size={14} 
              className={`transition-transform duration-200 opacity-0 group-hover:opacity-100 group-hover:translate-x-1`} 
            />
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-50">
        <NavLink 
          to="/settings" 
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800 rounded-xl transition-all"
        >
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
}