import React from 'react';
import { NavLink } from 'react-router-dom';
import { Plane, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Logo & Description */}
          <div className="space-y-4 col-span-1 md:col-span-2">
            <NavLink to="/" className="flex items-center gap-2.5 font-sans font-extrabold text-xl text-white">
              <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-tr from-teal-400 to-blue-600 text-white shadow-md shadow-teal-500/20">
                VH
              </span>
              <span>VoyageHub</span>
            </NavLink>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              VoyageHub is an AI-powered travel planner that helps you create personalized itineraries in seconds. Explore, optimize, and travel smarter.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Product</h3>
            <ul className="space-y-2.5 text-sm">
              <li><NavLink to="/plan" className="hover:text-white transition-colors">Plan Trip</NavLink></li>
              <li><NavLink to="/explore" className="hover:text-white transition-colors">Explore Places</NavLink></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Connect</h3>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 text-white transition-colors"
                aria-label="GitHub"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-github">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </a>
            </div>
          </div>
        </div>


        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>&copy; {new Date().getFullYear()} VoyageHub. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart size={12} className="text-rose-500 fill-rose-500" /> for travelers worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
}
