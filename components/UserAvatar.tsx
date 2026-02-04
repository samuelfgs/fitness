"use client";

import React, { useState, useRef, useEffect } from 'react';
import { LogOut, User } from 'lucide-react';
import { signOut } from '@/app/actions/auth';
import Link from 'next/link';

interface UserAvatarProps {
  userAvatar: string;
}

export function UserAvatar({ userAvatar }: UserAvatarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="h-12 w-12 bg-card rounded-2xl shadow-sm border border-border flex items-center justify-center overflow-hidden active:scale-95 transition-all"
      >
        <img src={userAvatar} alt="Avatar" className="h-full w-full object-cover" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-2xl shadow-xl z-[100] overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-2 space-y-1">
            <Link 
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-bold text-foreground hover:bg-accent rounded-xl transition-colors"
            >
              <User size={18} />
              <span>Meu Perfil</span>
            </Link>
            
            <button 
              onClick={() => {
                setIsOpen(false);
                signOut();
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-bold text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
            >
              <LogOut size={18} />
              <span>Sair</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
