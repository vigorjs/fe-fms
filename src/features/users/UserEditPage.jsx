import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import userService from "../../shared/api/user-service";
import { useAuth } from "../../shared/hooks/useAuth";

const UserEditPage = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "", // Optional - will only be updated if provided
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await userService.getUserById(id);
        setUser(userData);
        setFormData({
          name: userData.name || "",
          email: userData.email,
          password: "",
        });
      } catch (error) {
        setError("Failed to load user data");
        console.error("Error loading user:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [id]);

  // Check if current user has permission to edit this user
  const canEdit = () => {
    if (!user || !currentUser) return false;
    
    // Super admins can edit anyone except other super admins (unless it's themselves)
    if (currentUser.role === "SUPER_ADMIN") {
      if (user.role === "SUPER_ADMIN" && user.id !== currentUser.id) {
        return false;
      }
      return true;
    }
    
    // Admins can only edit users
    if (currentUser.role === "ADMIN") {
      return user.role === "USER";
    }
    
    // Regular users can't edit other users
    return false;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!canEdit()) {
      setError("You don't have permission to edit this user");
      return;
    }
    
    // Only include password in update if it's not empty
    const updateData = { ...formData };
    if (!updateData.password) {
      delete updateData.password;
    }
    
    try {
      setSaving(true);
      await userService.updateUser(user.id, updateData);
      navigate(`/users/${user.id}`);
    } catch (error) {
      setError("Failed to update user");
      console.error("Error updating user:", error);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading user data...</p>
      </div>
    );
  }

  if (!canEdit()) {
    return (
      <div className="bg-red-100 text-red-800 p-4 rounded">
        <p>You don't have permission to edit this user</p>
        <Link 
          to={`/users/${id}`} 
          className="text-blue-600 hover:underline mt-2 inline-block"
        >
          Back to User Details
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit User</h1>
        <Link
          to={`/users/${id}`}
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
              Password (leave empty to keep current password)
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              minLength={6}
            />
            <p className="text-sm text-gray-500 mt-1">
              Password must be at least 6 characters long if changing
            </p>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                saving ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEditPage;