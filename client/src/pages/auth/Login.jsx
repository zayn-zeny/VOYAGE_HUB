import React from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';
import { Plane } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect back to the originally requested page or the dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSuccess = () => {
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen w-screen flex bg-background font-sans select-none">
      {/* Left Column: Visual panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-slate-900 text-white p-12 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 opacity-90 z-0" />
        <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px] z-0" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] z-0" />

        <div className="relative z-10 flex items-center gap-2.5 font-sans font-extrabold text-xl">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-400 to-blue-600 text-white shadow-md shadow-teal-500/20">
            VH
          </span>
          <span>VoyageHub</span>
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <h2 className="text-4xl font-bold font-serif leading-tight">
            Explore the world, planned in seconds.
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            "The world is a book and those who do not travel read only one page." Sign in to manage your travels, map your routes, and optimize your budget.
          </p>
        </div>

        <div className="relative z-10 text-xs text-slate-400">
          &copy; {new Date().getFullYear()} VoyageHub. Travel planner.
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 md:p-16 relative">
        <div className="absolute top-6 left-6 lg:hidden flex items-center gap-2.5 font-sans font-extrabold text-lg">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-400 to-blue-600 text-white shadow-md shadow-teal-500/20">
            VH
          </span>
          <span className="bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">VoyageHub</span>
        </div>

        <div className="w-full max-w-[400px] space-y-6">
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-2xl font-extrabold tracking-tight font-sans text-foreground">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access your dashboard
            </p>
          </div>

          <LoginForm onSuccess={handleSuccess} />

          <p className="text-xs text-center text-muted-foreground">
            Don't have an account?{' '}
            <NavLink to="/register" className="text-primary hover:underline font-semibold">
              Create one now
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  );
}
