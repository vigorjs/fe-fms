import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import userService from "../../shared/api/user-service";
import { useAuth } from "../../shared/hooks/useAuth";

const UserDetailPage = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [changingRole, setChangingRole] = useState(false);
  const [newRole, setNewRole] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await userService.getUserById(id);
        setUser(userData);
        setNewRole(userData.role);
      } catch (error) {
        setError("Failed to load user data");
        console.error("Error loading user:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [id]);

  const handleRoleChange = async () => {
    if (!newRole || newRole === user.role) return;

    try {
      setChangingRole(true);
      await userService.updateUserRole(user.id, newRole);
      // Update the user data in state
      setUser({ ...user, role: newRole });
      alert("User role updated successfully");
    } catch (error) {
      setError("Failed to update user role");
      console.error("Error updating user role:", error);
    } finally {
      setChangingRole(false);
    }
  };

  const handleDeleteUser = async () => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await userService.deleteUser(user.id);
        navigate("/users");
      } catch (error) {
        setError("Failed to delete user");
        console.error("Error deleting user:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading user data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-800 p-4 rounded">
        <p>{error}</p>
        <Link to="/users" className="text-blue-600 hover:underline mt-2 inline-block">
          Back to Users
        </Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-yellow-100 text-yellow-800 p-4 rounded">
        <p>User not found</p>
        <Link to="/users" className="text-blue-600 hover:underline mt-2 inline-block">
          Back to Users
        </Link>
      </div>
    );
  }

  const canChangeRole = (
    currentUser.role === "SUPER_ADMIN" ||
    (currentUser.role === "ADMIN" && user.role === "USER")
  );

  const canDeleteUser = (
    (currentUser.role === "SUPER_ADMIN" && user.role !== "SUPER_ADMIN") ||
    (currentUser.role === "ADMIN" && user.role === "USER")
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Details</h1>
        <div className="space-x-2">
          <Link
            to="/users"
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Back to Users
          </Link>
          <Link
            to={`/users/edit/${user.id}`}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Edit User
          </Link>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 mb-1">ID</p>
              <p className="font-medium">{user.id}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Name</p>
              <p className="font-medium">{user.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Role</p>
              <p className="font-medium">{user.role}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Created At</p>
              <p className="font-medium">{new Date(user.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Last Updated</p>
              <p className="font-medium">{new Date(user.updatedAt).toLocaleString()}</p>
            </div>
          </div>

          {/* Role Management Section - only shown if the current user has permission */}
          {canChangeRole && (
            <div className="mt-8 border-t pt-6">
              <h2 className="text-lg font-semibold mb-4">Role Management</h2>
              <div className="flex items-center">
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="mr-2 border rounded px-3 py-2"
                  disabled={changingRole}
                >
                  <option value="USER">User</option>
                  {currentUser.role === "SUPER_ADMIN" && (
                    <>
                      <option value="ADMIN">Admin</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                    </>
                  )}
                </select>
                <button
                  onClick={handleRoleChange}
                  disabled={changingRole || newRole === user.role}
                  className={`px-4 py-2 rounded font-medium ${
                    changingRole || newRole === user.role
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600 text-white"
                  }`}
                >
                  {changingRole ? "Updating..." : "Update Role"}
                </button>
              </div>
            </div>
          )}

          {/* Danger Zone */}
          {canDeleteUser && (
            <div className="mt-8 border-t pt-6">
              <h2 className="text-lg font-semibold mb-4 text-red-600">Danger Zone</h2>
              <button
                onClick={handleDeleteUser}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Delete User
              </button>
              <p className="text-sm text-gray-500 mt-2">
                This action cannot be undone. This will permanently delete the user
                and all data associated with them.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetailPage;