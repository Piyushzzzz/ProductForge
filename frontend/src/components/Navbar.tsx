import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useNotifications } from '../context/NotificationContext.js';
import {
  Layers,
  Search,
  Bell,
  CheckCircle,
  LogOut,
  User as UserIcon,
  Sparkles,
  LayoutDashboard,
  FolderLock,
  PlusCircle,
  ChevronDown
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#0B1326]/80 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform duration-200">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-display font-bold text-xl tracking-tight text-white flex items-center gap-1.5">
              ProductForge
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Studio
              </span>
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-surface-card/60 p-1 rounded-xl border border-white/5">
          <Link
            to="/"
            className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all ${
              isActive('/')
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Marketplace
          </Link>

          {user?.role === 'CUSTOMER' && (
            <Link
              to="/library"
              className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                isActive('/library')
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <FolderLock className="w-4 h-4" />
              My Products
            </Link>
          )}

          {user?.role === 'CREATOR' && (
            <>
              <Link
                to="/creator"
                className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                  isActive('/creator')
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Lifecycle Studio
              </Link>
              <Link
                to="/creator/products/new"
                className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                  isActive('/creator/products/new')
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <PlusCircle className="w-4 h-4 text-cyan-400" />
                Create Product
              </Link>
            </>
          )}

          {user?.role === 'ADMIN' && (
            <Link
              to="/admin"
              className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                isActive('/admin')
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-amber-400" />
              Admin Portal
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Notifications Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifs(!showNotifs)}
                  className="relative p-2 rounded-xl text-slate-400 hover:text-white bg-surface-card hover:bg-white/10 border border-white/5 transition-all"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-cyan-500 text-[10px] font-bold text-slate-950 flex items-center justify-center shadow-cyanGlow">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifs && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-panel p-4 shadow-glass z-50 border border-white/10">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <span className="font-semibold text-sm text-white flex items-center gap-2">
                        <Bell className="w-4 h-4 text-indigo-400" /> Notifications
                      </span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto mt-2 space-y-2">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-6">No notifications yet.</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              markAsRead(n.id);
                              if (n.linkUrl) navigate(n.linkUrl);
                              setShowNotifs(false);
                            }}
                            className={`p-3 rounded-xl cursor-pointer text-xs transition-all ${
                              n.isRead
                                ? 'bg-slate-900/40 text-slate-400'
                                : 'bg-indigo-950/40 text-slate-200 border-l-2 border-cyan-400'
                            }`}
                          >
                            <p className="font-medium text-slate-200">{n.title}</p>
                            <p className="text-slate-400 mt-1">{n.message}</p>
                            <span className="text-[10px] text-slate-500 mt-1 block">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Pill */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-surface-card hover:bg-white/10 border border-white/5 transition-all"
                >
                  <img
                    src={user.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=' + user.name}
                    alt={user.name}
                    className="w-7 h-7 rounded-lg object-cover border border-white/20"
                  />
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-semibold text-white leading-tight">{user.name}</p>
                    <p className="text-[10px] font-mono text-cyan-400 leading-tight capitalize">{user.role.toLowerCase()}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel p-2 shadow-glass z-50 border border-white/10">
                    <div className="px-3 py-2 border-b border-white/10 mb-1">
                      <p className="text-xs font-medium text-white">{user.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                    </div>

                    {user.role === 'CUSTOMER' && (
                      <Link
                        to="/library"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-indigo-600/30 rounded-xl transition-all"
                      >
                        <FolderLock className="w-3.5 h-3.5 text-indigo-400" /> My Products
                      </Link>
                    )}

                    {user.role === 'CREATOR' && (
                      <Link
                        to="/creator"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-indigo-600/30 rounded-xl transition-all"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" /> Creator Studio
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-xl transition-all mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl hover:bg-white/5 transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-glow transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" /> Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
