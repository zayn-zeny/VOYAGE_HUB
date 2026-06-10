import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import useAuth from '@/hooks/useAuth';
import { 
  Compass, 
  Map, 
  Plane, 
  User, 
  LayoutDashboard, 
  LogOut, 
  Moon, 
  Sun,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Plan a Trip', path: '/plan', icon: Plane },
    { name: 'My Trips', path: '/trips', icon: Map },
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col h-screen sticky top-0 bg-card/65 backdrop-blur-lg border-r border-border/80 text-foreground transition-all duration-300 z-30 select-none',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Logo / Header */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-border/60">
        <NavLink to="/dashboard" className="flex items-center gap-3 font-sans font-extrabold text-lg text-primary tracking-wide">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-400 to-blue-600 text-white shadow-md shadow-teal-500/20">
            VH
          </span>
          {!isCollapsed && <span className="bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent font-sans">VoyageHub</span>}
        </NavLink>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-muted-foreground hover:text-foreground focus:outline-none hidden md:block rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 group relative',
                  isActive
                    ? 'bg-primary/10 text-primary border-l-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800/60'
                )
              }
            >
              <Icon size={19} className="shrink-0 transition-transform duration-200 group-hover:scale-105" />
              {!isCollapsed && <span>{item.name}</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-md z-50">
                  {item.name}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer (Theme Toggle + Profile & Logout) */}
      <div className="p-3 border-t border-border/60 space-y-3">
        {/* Theme Toggle Button */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full flex items-center justify-start gap-3.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800/60"
          onClick={toggleTheme}
        >
          {theme === 'dark' ? (
            <>
              <Sun size={19} className="text-amber-500" />
              {!isCollapsed && <span>Light Mode</span>}
            </>
          ) : (
            <>
              <Moon size={19} className="text-teal-600" />
              {!isCollapsed && <span>Dark Mode</span>}
            </>
          )}
        </Button>

        {/* Logout Button */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full flex items-center justify-start gap-3.5 px-3 py-2 text-sm text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={logout}
        >
          <LogOut size={19} />
          {!isCollapsed && <span>Sign Out</span>}
        </Button>

        {/* User Profile Info */}
        {!isCollapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-border/40">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
