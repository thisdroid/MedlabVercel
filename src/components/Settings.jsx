import React, { useState } from 'react';
import { useAuth } from '../AuthContext';

const SettingsDropdown = () => {
  const { signOut, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="fixed top-4 right-4 p-2 bg-white rounded-full shadow-md focus:outline-none border-2 border-blue-400 hover:bg-gray-200 transition-colors z-50"
      >
        <img src="/logo.svg" alt="MedLab Pro Logo" className="w-6 h-8 mr-2 pl-2" />
      </button>

      {isOpen && (
        <div className="fixed top-16 right-4 w-48 bg-white rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-gray-200">
            <img
              src={user?.photoURL || "logo.svg"}
              alt="User"
              className="w-12 h-12 mx-auto rounded-full border-2 border-blue-500"
            />
            <p className="text-center mt-2 font-semibold">{user?.username || "MedLab"}</p>
          </div>
          <ul className="py-2">
            <li>
              <a
                href="/profile"
                className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
              >
                Profile Details
              </a>
            </li>
            <li>
              <a
                href="/security"
                className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
              >
                Security Settings
              </a>
            </li>
            <li>
              <button
                onClick={() => {
                  signOut();
                  window.location.href = '/signin';
                }}
                className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
              >
                Sign Out
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default SettingsDropdown;
