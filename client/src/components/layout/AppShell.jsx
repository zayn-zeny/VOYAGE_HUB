import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AppShell() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <div
        className={cn(
          'md:hidden fixed inset-y-0 left-0 w-64 z-50 bg-card border-r border-border/80 flex flex-col transition-transform duration-300 ease-in-out',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-16 px-5 border-b border-border/60">
          <span className="flex items-center gap-3 font-sans font-extrabold text-lg text-primary tracking-wide">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-400 to-blue-600 text-white shadow-md shadow-teal-500/20">
              VH
            </span>
            <span className="bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">VoyageHub</span>
          </span>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/80 text-muted-foreground focus:outline-none"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto" onClick={() => setIsMobileMenuOpen(false)}>
          <Sidebar />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onMenuClick={() => setIsMobileMenuOpen(true)} />
        
        {/* Main Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6 relative bg-slate-50/40 dark:bg-slate-950/20">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </main>

        {/* Mobile Navigation */}
        <BottomNav />
      </div>
    </div>
  );
}
