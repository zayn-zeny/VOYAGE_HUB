import React from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plane, Sparkles, Compass, Map, Shield, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Footer from '@/components/layout/Footer';

export default function Landing() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const features = [
    {
      icon: Sparkles,
      title: 'Gemini AI Itinerary Creator',
      desc: 'Get highly personalized, day-by-day itineraries tailored to your budget, style, and interests in seconds.',
    },
    {
      icon: Compass,
      title: 'Interactive OSM Mapping',
      desc: 'Visualize your daily activities dynamically on high-fidelity, interactive OpenStreetMap-powered routes.',
    },
    {
      icon: Map,
      title: 'Nearby Places & Routing',
      desc: 'Calculate optimal routes between locations and discover local attractions, food joints, and hidden gems.',
    },
    {
      icon: Shield,
      title: 'Offline Notes & Customization',
      desc: 'Edit activities, add custom notes, check budget charts, and keep your travel plans updated on-the-go.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-x-hidden flex flex-col justify-between">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-slate-950/70 backdrop-blur-md border-b border-white/5 z-50 px-6 md:px-12 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2.5 font-sans font-extrabold text-xl">
          <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-tr from-teal-400 to-blue-600 text-white shadow-md shadow-teal-500/20">
            VH
          </span>
          <span>VoyageHub</span>
        </NavLink>
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="text-slate-300 hover:text-white" onClick={() => navigate('/login')}>
            Sign In
          </Button>
          <Button variant="gradient" size="sm" className="hidden sm:inline-flex" onClick={() => navigate('/register')}>
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-36 pb-20 md:pt-48 md:pb-32 px-6 flex flex-col items-center text-center max-w-5xl mx-auto">
        {/* Animated Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] md:w-[600px] h-[350px] md:h-[600px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none z-0" />
        <div className="absolute top-1/3 left-1/3 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none z-0" />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 space-y-6"
        >
          {/* Tagline Badge */}
          <motion.div variants={itemVariants} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles size={12} /> Powered by Gemini 1.5 Pro
          </motion.div>

          {/* Main Title */}
          <motion.h1 variants={itemVariants} className="text-4xl sm:text-6xl md:text-7xl font-extrabold font-serif tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Design Your Next <br className="hidden md:inline" />
            <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-blue-500 bg-clip-text text-transparent">
              Perfect Adventure
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={itemVariants} className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Stop spending hours copy-pasting itinerary spreadsheets. Generate, map, and customize complete day-by-day travel schedules in seconds with AI.
          </motion.p>

          {/* Call to Actions */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" variant="gradient" className="w-full sm:w-auto" onClick={() => navigate('/register')}>
              Start Planning Free <ChevronRight size={16} className="ml-1" />
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/10 hover:bg-white/5 hover:text-white" onClick={() => navigate('/login')}>
              Explore Features
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-slate-900/40 border-t border-white/5 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold font-serif">Smart Tools for the Modern Explorer</h2>
            <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
              Everything you need to plan, map, and navigate your vacation in a single web dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="p-6 rounded-xl border border-white/5 bg-slate-950/60 backdrop-blur-sm space-y-4 hover:border-teal-500/35 transition-all duration-300 group hover:translate-y-[-2px]">
                  <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/25 flex items-center justify-center text-teal-400 transition-colors group-hover:bg-teal-500 group-hover:text-white">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-base font-bold text-white">{feature.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 relative overflow-hidden px-6">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="max-w-4xl mx-auto rounded-2xl border border-white/10 bg-gradient-to-tr from-slate-950 to-slate-900 p-8 md:p-16 text-center space-y-6 relative z-10">
          <h2 className="text-2xl sm:text-4xl font-extrabold font-serif leading-snug">
            Ready to explore? <br />
            Create your AI travel plan today.
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto">
            Join thousands of travelers using VoyageHub to generate itineraries, customize routes, and discover local attractions.
          </p>
          <Button size="lg" variant="gradient" onClick={() => navigate('/register')}>
            Plan Your First Trip Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
