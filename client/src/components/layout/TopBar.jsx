import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { useNotification } from '@/contexts/NotificationContext';
import { 
  Bell, 
  User, 
  LogOut, 
  Settings, 
  Menu,
  ChevronDown,
  Trash2,
  Plane
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { formatRelativeDate } from '@/lib/utils';

export default function TopBar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { notifications, clearNotifications, markAsRead } = useNotification();
  const navigate = useNavigate();

  const unreadCount = notifications.length;

  const handleNotificationClick = (item, idx) => {
    markAsRead(idx);
    if (item.tripId) {
      navigate(`/trips/${item.tripId}`);
    }
  };

  return (
    <header className="flex items-center justify-between h-16 px-6 border-b border-border/80 bg-background/55 backdrop-blur-lg sticky top-0 z-20">
      {/* Mobile Menu Trigger */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          onClick={onMenuClick}
          className="p-1 text-muted-foreground hover:text-foreground focus:outline-none"
        >
          <Menu size={22} />
        </button>
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-400 to-blue-600 text-white text-sm font-bold shadow-md shadow-teal-500/20">
          VH
        </span>
      </div>

      <div className="hidden md:flex items-center gap-2">
        <h1 className="text-sm font-semibold text-muted-foreground font-sans">
          Travel Smarter, Generate Faster
        </h1>
      </div>

      {/* Action Icons & Profile */}
      <div className="flex items-center gap-4">
        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-full focus:outline-none transition-colors">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80 mr-2" sideOffset={8}>
            <div className="flex items-center justify-between px-4 py-2.5">
              <span className="text-sm font-bold text-foreground">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={clearNotifications}
                  className="text-xs text-primary hover:underline font-semibold flex items-center gap-1 focus:outline-none"
                >
                  Clear all
                </button>
              )}
            </div>
            <DropdownMenuSeparator />
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                  <Plane className="h-8 w-8 text-muted-foreground/45 mb-2 rotate-45" />
                  <p className="text-xs font-semibold text-muted-foreground">No new updates</p>
                  <p className="text-[10px] text-muted-foreground/80 mt-0.5">We'll notify you when your trip planning is ready!</p>
                </div>
              ) : (
                notifications.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleNotificationClick(item, idx)}
                    className="flex flex-col gap-1 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer border-b border-border/40 last:border-0 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs text-foreground/90 font-medium leading-relaxed">
                        {item.message}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(idx);
                        }}
                        className="text-muted-foreground hover:text-destructive p-0.5"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {formatRelativeDate(item.timestamp)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile Menu */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 focus:outline-none py-1.5 px-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors select-none">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-teal-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline text-xs font-semibold text-foreground truncate max-w-[100px]">
                  {user.name}
                </span>
                <ChevronDown size={14} className="opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mr-2" sideOffset={8}>
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-bold truncate">{user.name}</span>
                  <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive focus:bg-destructive/10">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
