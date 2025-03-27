// src/components/Layout.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store.ts'; // Adjust path if needed
import { logout } from '../store/slices/authSlice.ts';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login'); // Redirect to login after logout
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Basic Navigation Bar */}
      <nav className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold hover:text-blue-200">
            Recipe App
          </Link>
          <div>
            {isAuthenticated ? (
              <>
                <span className="mr-4">Welcome, {user?.email}!</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-200 mr-4">Login</Link>
                <Link to="/signup" className="hover:text-blue-200">Signup</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Basic Footer (Optional) */}
      <footer className="bg-gray-200 text-center py-4 mt-auto">
        <p>© {new Date().getFullYear()} Recipe App</p>
      </footer>
    </div>
  );
};

export default Layout;