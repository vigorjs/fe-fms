import React, { useState } from "react";
import { Outlet } from "react-router";
import { useAuth } from "../hooks/useAuth";
import Navigation from "./Navigation";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";

const DashboardLayout = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navigation />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Mobile Toggle Button */}
        <div className="md:hidden fixed bottom-4 right-4 z-20">
          <button 
            onClick={toggleSidebar} 
            className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700"
          >
            <Menu size={24} />
          </button>
        </div>
        
        {/* Sidebar */}
        <div 
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          } fixed md:static md:w-64 z-10 h-[calc(100vh-4rem)] transition-transform duration-300 ease-in-out transform`}
        >
          <Sidebar user={user} />
        </div>
        
        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-0"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content area */}
        <div className={`flex-1 overflow-auto h-[calc(100vh-4rem)] transition-all duration-300 ease-in-out ${sidebarOpen ? 'md:ml-0' : 'ml-0'}`}>
          <div className="h-full">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;