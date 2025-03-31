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
    <div className="min-h-screen flex flex-col bg-white">
      {/* Basic Navigation Bar */}
      <nav className="bg-gray-800 text-gray-100 shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold hover:text-white">
            Recipe App
          </Link>
          <div>
            {isAuthenticated ? (
              <>
                <span className="mr-4 text-sm">Welcome, {user?.email}!</span>
                <button
                  onClick={handleLogout}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-white mr-4 text-sm">Login</Link>
                <Link to="/signup" className="hover:text-white text-sm">Signup</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow container mx-auto px-4 py-6 bg-gray-50">
        {children}
      </main>

      {/* Basic Footer (Optional) */}
      <footer className="bg-gray-200 text-center py-4 text-gray-600 text-sm">
        <p>© {new Date().getFullYear()} Recipe App</p>
      </footer>
    </div>
  );
};

export default Layout;