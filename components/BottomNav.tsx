"use client";

import React from 'react';
import { LayoutDashboard, Calendar, BarChart2, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const BottomNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Início', href: '/dashboard' },
    { id: 'calendar', icon: Calendar, label: 'Calendário', href: '/calendar' },
    { id: 'stats', icon: BarChart2, label: 'Stats', href: '/stats' },
    { id: 'log', icon: PlusCircle, label: 'Registrar', isAction: true, href: '/log' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-card/80 backdrop-blur-lg border-t border-border px-6 py-3 pb-4 shadow-[0_-4px_20px_rgba(0,0,0,0.2)] z-50">
      <div className="flex justify-between items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.id === 'log' && pathname.startsWith('/log'));
          
          if (item.isAction) {
             return (
               <Link
                 key={item.id}
                 href={item.href}
                 className="bg-primary text-primary-foreground p-3 rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-90"
               >
                 <item.icon size={28} />
               </Link>
             );
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center space-y-1 transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
