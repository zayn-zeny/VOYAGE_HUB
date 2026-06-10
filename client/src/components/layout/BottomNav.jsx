import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Compass, 
  Map, 
  Plane, 
  User, 
  LayoutDashboard 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BottomNav() {
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Plan', path: '/plan', icon: Plane },
    { name: 'Trips', path: '/trips', icon: Map },
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-lg border-t border-border/80 flex items-center justify-around z-30 pb-safe shadow-lg select-none">
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center flex-1 h-full text-muted-foreground transition-all duration-200 gap-0.5',
                isActive ? 'text-primary scale-105' : 'hover:text-foreground'
              )
            }
          >
            <Icon size={19} className="transition-transform duration-200" />
            <span className="text-[10px] font-bold tracking-tight">{item.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
