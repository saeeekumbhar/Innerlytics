import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Shield, Download, Trash2 } from 'lucide-react';

const Settings = () => {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-serif font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-1">Manage your account and preferences.</p>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-serif font-bold text-slate-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-indigo-600" />
            Profile
          </h2>
          <div className="flex items-center">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || 'User'} className="w-16 h-16 rounded-full mr-4 object-cover border border-slate-200" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-4 font-bold text-xl">
                {user?.displayName?.[0] || 'U'}
              </div>
            )}
            <div>
              <p className="font-medium text-slate-900 text-lg">{user?.displayName || 'User'}</p>
              <p className="text-slate-500">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center">
              <Shield className="w-4 h-4 mr-2 text-slate-400" />
              Privacy & Data
            </h3>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-left transition-colors group">
                <span className="text-slate-700 font-medium group-hover:text-indigo-700">Export My Data</span>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-50 text-left transition-colors group">
                <span className="text-red-600 font-medium">Delete Account</span>
                <Trash2 className="w-4 h-4 text-red-400 group-hover:text-red-600" />
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center px-4 py-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-medium transition-colors"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
