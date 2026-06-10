import React from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import RegisterForm from '@/components/auth/RegisterForm';
import { Plane } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/dashboard');
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
            Start mapping your next destination.
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Create an account to unlock VoyageHub's premium tools. Generate custom AI schedules, verify routes with interactive Leaflet maps, and share them.
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
              Create an account
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign up today and start organizing your trips
            </p>
          </div>

          <RegisterForm onSuccess={handleSuccess} />

          <p className="text-xs text-center text-muted-foreground">
            Already have an account?{' '}
            <NavLink to="/login" className="text-primary hover:underline font-semibold">
              Sign in
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  );
}
