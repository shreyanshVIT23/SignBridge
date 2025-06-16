import React, { useState, useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
  Link,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import SignLanguagePlayer from "./components/SignLanguagePlayer";
import SpeechToText from "./components/SpeechToText";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import { Hand, Mic, Moon, Sun, LogOut, User } from "lucide-react";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-purple-500 rounded-full border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

const NavBar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode ? JSON.parse(savedMode) : false;
  });
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  return (
    <nav className="bg-purple-200 dark:bg-blue-800 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
              <Hand className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              SignSpeak
            </span>
          </div>

          {/* Navigation Links - Fixed and centered */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-6">
            <Link
              to="/dashboard/sign-language"
              className={`relative px-5 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                isActive("/dashboard/sign-language")
                  ? "bg-white dark:bg-blue-700 text-purple-700 dark:text-white shadow-md"
                  : "text-purple-800 dark:text-gray-300 hover:text-purple-900 dark:hover:text-white"
              } group`}
            >
              Sign Language
              {/* Hover effect bar */}
              <span
                className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 w-0 bg-purple-600 dark:bg-blue-400 transition-all duration-300 group-hover:w-4/5 ${
                  isActive("/dashboard/sign-language") ? "w-4/5" : ""
                }`}
              ></span>
            </Link>
            <Link
              to="/dashboard/speech-to-text"
              className={`relative px-5 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                isActive("/dashboard/speech-to-text")
                  ? "bg-white dark:bg-blue-700 text-purple-700 dark:text-white shadow-md"
                  : "text-purple-800 dark:text-gray-300 hover:text-purple-900 dark:hover:text-white"
              } group`}
            >
              Speech to Text
              {/* Hover effect bar */}
              <span
                className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 w-0 bg-purple-600 dark:bg-blue-400 transition-all duration-300 group-hover:w-4/5 ${
                  isActive("/dashboard/speech-to-text") ? "w-4/5" : ""
                }`}
              ></span>
            </Link>
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-4">
            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-white dark:bg-blue-700 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-blue-600 transition-colors transform hover:scale-110"
              aria-label={
                darkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            {/* User email and logout */}
            <div className="flex items-center space-x-2">
              <div className="hidden md:block text-sm text-gray-700 dark:text-gray-300">
                {user?.email}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-2 rounded-lg text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-blue-700 transition-colors transform hover:scale-105"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <NavBar />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Outlet />
      </main>
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "login",
    element: <Login />,
  },
  {
    path: "register",
    element: <Register />,
  },
  {
    path: "dashboard",
    element: (
      <PrivateRoute>
        <DashboardLayout />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="sign-language" replace />,
      },
      {
        path: "sign-language",
        element: <SignLanguagePlayer />,
      },
      {
        path: "speech-to-text",
        element: <SpeechToText />,
      },
    ],
  },
]);

const App = () => {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default App;
