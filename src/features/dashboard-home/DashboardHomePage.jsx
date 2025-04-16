import React from "react";
import { Link } from "react-router";
import { useAuth } from "../../shared/hooks/useAuth";

const DashboardHomePage = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Dashboard</h1>
      <p className="text-gray-600 mb-6">
        Welcome to your dashboard, {user.name}!
      </p>

      <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 mb-6">
        <p className="font-bold">Quick Tips</p>
        <p>
          Use the sidebar to navigate between different sections of your
          dashboard.
        </p>
      </div>
    </div>
  );
};

export default DashboardHomePage;
