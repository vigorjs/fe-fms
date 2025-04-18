import React from "react";
import { Outlet } from "react-router";
import { useAuth } from "../hooks/useAuth";
import Navigation from "./Navigation";
import Sidebar from "./Sidebar";

const DashboardLayout = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="md:w-64 flex-shrink-0">
            <Sidebar user={user} />
          </div>

          {/* Main content area */}
          <div className="flex-1 bg-white rounded-lg shadow-md overflow-hidden">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
