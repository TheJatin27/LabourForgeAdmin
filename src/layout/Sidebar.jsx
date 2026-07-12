import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  Map,
  IndianRupee,
  Settings,
  ChevronRight,
  BookOpen,
  FolderKanban,
  Building2,
  FileSpreadsheet
} from "lucide-react";

export default function Sidebar() {

  const navItems = [
    // MAIN
    {
      section: "MAIN",
      items: [
        {
          to: "/",
          label: "Dashboard",
          icon: <LayoutDashboard size={20} />
        }
      ]
    },


    //News
    {
      section: "NEWS",
      items: [
        {
          to: "/admin/add-news",
          label: "Add News",
          icon: <FileSpreadsheet size={20} />
        },

        {
          to: "/admin/news/manage",
          label: "Manage News",
          icon: <FolderKanban size={20} />
        }

      ]
    },


    //PROFESSIONAL TAX
    {
      section: "PROFESSIONAL TAX",
      items: [
        {
          to: "/professional-tax",
          label: "Professional Tax",
          icon: <IndianRupee size={20} />
        },

        {
          to: "/admin/professional-taxes/manage",
          label: "Manage Professional Taxes",
          icon: <FolderKanban size={20} />
        }
      

      ]
    },


    // LABOUR WELFARE FUNDS
    {
      section: "LABOUR WELFARE FUNDS",
      items: [
        {
          to: "/admin/labour-welfare-funds",
          label: "Manage Labour Welfare Funds",
          icon: <FolderKanban size={20} />
        },

        {
          to: "/admin/labour-welfare-funds/manage",
          label: "Manage Labour Welfare Funds",
          icon: <FolderKanban size={20} />
        
        }



      ]
    },

    // LABOUR
    {
      section: "LABOUR",
      items: [
        {
          to: "/states",
          label: "States",
          icon: <Map size={20} />
        },
        {
          to: "/labour-wages",
          label: "Labour Wages",
          icon: <IndianRupee size={20} />
        },
        {
          to: "/admin/labour-wages/manage",
          label: "Manage Wages",
          icon: <FolderKanban size={20} />
        }
      ]
    },

    // SHOPS & ESTABLISHMENTS CMS
    {
      section: "SHOPS & ESTABLISHMENTS",
      items: [
        {
          to: "/admin/shops-establishments",
          label: "Add Shops Act Page",
          icon: <Building2 size={20} />
        },
        {
          to: "/admin/shops-establishments/state-grid",
          label: "Add State Grid Rules",
          icon: <FileSpreadsheet size={20} /> // Styled icon matching your excel spreadsheet dynamic tables context
        },
        {
          to: "/admin/shops-establishments/manage",
          label: "Manage Shops Act",
          icon: <FolderKanban size={20} />
        }
      ]
    },

    // E-LIBRARY
    {
      section: "E-LIBRARY CMS",
      items: [
        {
          to: "/admin/e-library",
          label: "Add E-Library",
          icon: <BookOpen size={20} />
        },
        {
          to: "/admin/e-library/manage",
          label: "Manage E-Library",
          icon: <FolderKanban size={20} />
        }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-full transition-all duration-300">

      {/* LOGO */}
      <div className="p-6">
        <div className="flex items-center gap-3 px-3 py-2 bg-blue-50 rounded-2xl">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg">
            A
          </div>
          <div>
            <p className="font-black text-gray-800 tracking-tight text-sm">
              Admin Panel
            </p>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">
              Management
            </p>
          </div>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-4 overflow-y-auto">
        {navItems.map((section) => (
          <div
            key={section.section}
            className="mb-7"
          >
            {/* SECTION TITLE */}
            <div className="px-4 mb-3">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.25em]">
                {section.section}
              </p>
            </div>

            {/* ITEMS */}
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between group px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                        : "text-gray-500 hover:bg-gray-50 hover:text-blue-600"
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>
                      {item.label}
                    </span>
                  </div>

                  <ChevronRight
                    size={14}
                    className="transition-transform duration-200 opacity-0 group-hover:opacity-100 group-hover:translate-x-1"
                  />
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* FOOTER */}
      <div className="p-4 border-t border-gray-100">
        <NavLink
          to="/settings"
          className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-800 rounded-2xl transition-all"
        >
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </div>

    </aside>
  );
}