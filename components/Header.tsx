import React from 'react';
import { NavLink } from 'react-router-dom';

interface HeaderProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ isAuthenticated, onLogout }) => {
  const activeLinkClass = 'text-cyan-400 border-cyan-400';
  const inactiveLinkClass = 'text-gray-400 border-transparent hover:text-white hover:border-gray-500';

  return (
    <header className="sticky top-0 z-50 bg-gray-900/50 backdrop-blur-lg border-b border-gray-700/50">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <NavLink to="/" className="text-2xl font-bold tracking-wider">
          <span className="text-white">Robo </span>
          <span className="text-cyan-400">AI</span>
          <span className="text-white"> - Toolshed</span>
        </NavLink>
        <div className="flex items-center space-x-6 text-sm font-medium">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `transition-colors duration-300 border-b-2 pb-1 ${isActive ? activeLinkClass : inactiveLinkClass}`
            }
          >
            HOME
          </NavLink>
          {isAuthenticated ? (
            <button
              onClick={onLogout}
              className={`transition-colors duration-300 border-b-2 pb-1 ${inactiveLinkClass}`}
            >
              LOGOUT
            </button>
          ) : (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `transition-colors duration-300 border-b-2 pb-1 ${isActive ? activeLinkClass : inactiveLinkClass}`
              }
            >
              ADMIN
            </NavLink>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;