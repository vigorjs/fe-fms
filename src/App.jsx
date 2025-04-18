import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import { AuthProvider } from "./shared/contexts/AuthProvider";
import ProtectedRoute from "./shared/routes/ProtectedRoute";
import PublicRoute from "./shared/routes/PublicRoute";
import DashboardLayout from "./shared/components/DashboardLayout";
import LoginPage from "./features/auth/LoginPage";
import RegisterPage from "./features/auth/RegisterPage";
import DashboardHomePage from "./features/dashboard-home/DashboardHomePage";
import NotFoundPage from "./features/not-found/NotFoundPage";

// User management pages
import UsersListPage from "./features/users/UsersListPage";
import UserDetailPage from "./features/users/UserDetailPage";
import UserEditPage from "./features/users/UserEditPage";
import CreateAdminPage from "./features/users/CreateAdminPage";

// File management pages
import FileBrowserPage from "./features/file-browser/FileBrowserPage";
import PublicFileViewPage from "./features/file-browser/PublicFileViewPage";

// Search page
import SearchResultsPage from "./features/search/SearchResultsPage";

// Route configuration array
const routesConfig = [
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardHomePage />,
      },
      {
        path: "dashboard",
        element: <DashboardHomePage />,
      },
      {
        path: "users",
        element: <UsersListPage />,
      },
      {
        path: "users/create-admin",
        element: <CreateAdminPage />,
      },
      {
        path: "users/edit/:id",
        element: <UserEditPage />,
      },
      {
        path: "users/:id",
        element: <UserDetailPage />,
      },
      {
        path: "files",
        element: <FileBrowserPage />,
      },
      {
        path: "search",
        element: <SearchResultsPage />,
      },
    ],
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicRoute>
        <RegisterPage />
      </PublicRoute>
    ),
  },
  {
    path: "/view/:token",
    element: <PublicFileViewPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
];

// Create the router from the routes configuration
const router = createBrowserRouter(routesConfig);

const App = () => {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default App;