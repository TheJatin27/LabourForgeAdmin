import Header from "./Header";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
      {/* Fixed Sidebar */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Fixed Top Header */}
        <Header />

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <div className="p-8 max-w-[1600px] mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* The Outlet renders your pages (like LabourWages). 
               The 'animate-in' classes (if using tailwind-animate) 
               give a smooth entrance to new pages.
            */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}