import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import userService from "../../shared/api/user-service";
import { useAuth } from "../../shared/hooks/useAuth";

const CreateAdminPage = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);

  // Check if current user can create admins (SUPER_ADMIN only)
  const canCreateAdmin = currentUser && currentUser.role === "SUPER_ADMIN";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!canCreateAdmin) {
      setError("You don't have permission to create admin users");
      return;
    }
    
    try {
      setCreating(true);
      await userService.createAdmin(formData);
      navigate("/users");
    } catch (error) {
      setError("Failed to create admin user");
      console.error("Error creating admin:", error);
      setCreating(false);
    }
  };

  if (!canCreateAdmin) {
    return (
      <div className="bg-red-100 text-red-800 p-4 rounded">
        <p>You don't have permission to create admin users</p>
        <Link 
          to="/users" 
          className="text-blue-600 hover:underline mt-2 inline-block"
        >
          Back to Users
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Create Admin User</h1>
        <Link
          to="/users"
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          Cancel
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 text-red-800 p-4 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
              minLength={6}
            />
            <p className="text-sm text-gray-500 mt-1">
              Password must be at least 6 characters long
            </p>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={creating}
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                creating ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {creating ? "Creating..." : "Create Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAdminPage;