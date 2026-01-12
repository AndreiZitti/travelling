"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface UserMenuProps {
  darkMode?: boolean;
}

export default function UserMenu({ darkMode = false }: UserMenuProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setDropdownOpen(false);
    router.push("/login");
    router.refresh();
  };

  if (loading) {
    return (
      <div className={`w-8 h-8 rounded-full animate-pulse ${darkMode ? 'bg-been-card' : 'bg-slate-200'}`} />
    );
  }

  if (!user) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            darkMode
              ? 'bg-been-card hover:bg-been-card/80 text-been-muted'
              : 'bg-slate-200 hover:bg-slate-300 text-slate-500'
          }`}
          title="Sign in"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>

        {dropdownOpen && (
          <div className={`absolute right-0 mt-2 w-56 rounded-lg shadow-lg py-2 z-50 ${
            darkMode
              ? 'bg-been-card border border-been-bg/50'
              : 'bg-white border border-slate-200'
          }`}>
            <Link
              href="/login"
              onClick={() => setDropdownOpen(false)}
              className={`block px-4 py-2 text-sm font-medium transition-colors ${
                darkMode
                  ? 'text-been-accent hover:bg-been-bg/50'
                  : 'text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              Sign in
            </Link>
            <p className={`px-4 py-2 text-xs ${darkMode ? 'text-been-muted' : 'text-slate-400'}`}>
              Contact Zitti for an account
            </p>
            <div className={`border-t mt-1 pt-1 ${darkMode ? 'border-been-bg/50' : 'border-slate-100'}`}>
              <a
                href="https://zitti.ro"
                target="_blank"
                rel="noopener noreferrer"
                className={`block px-4 py-2 text-xs transition-colors ${
                  darkMode
                    ? 'text-been-muted hover:text-been-text'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                zitti.ro
              </a>
            </div>
          </div>
        )}
      </div>
    );
  }

  const initials = user.email
    ? user.email.substring(0, 2).toUpperCase()
    : "??";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
          darkMode
            ? 'bg-been-accent hover:bg-been-accent/80 text-been-bg'
            : 'bg-indigo-500 hover:bg-indigo-600 text-white'
        }`}
        title={user.email || "User menu"}
      >
        {initials}
      </button>

      {dropdownOpen && (
        <div className={`absolute right-0 mt-2 w-56 rounded-lg shadow-lg py-1 z-50 ${
          darkMode
            ? 'bg-been-card border border-been-bg/50'
            : 'bg-white border border-slate-200'
        }`}>
          {/* User info */}
          <div className={`px-4 py-3 border-b ${darkMode ? 'border-been-bg/50' : 'border-slate-100'}`}>
            <p className={`text-sm font-medium truncate ${darkMode ? 'text-been-text' : 'text-slate-800'}`}>
              {user.email}
            </p>
          </div>

          {/* Menu items */}
          <Link
            href="/settings"
            onClick={() => setDropdownOpen(false)}
            className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
              darkMode
                ? 'text-been-text hover:bg-been-bg/50'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <svg
              className={`w-4 h-4 ${darkMode ? 'text-been-muted' : 'text-slate-400'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Settings
          </Link>

          <button
            onClick={handleSignOut}
            className={`flex items-center gap-3 w-full px-4 py-2 text-sm transition-colors ${
              darkMode
                ? 'text-been-text hover:bg-been-bg/50'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <svg
              className={`w-4 h-4 ${darkMode ? 'text-been-muted' : 'text-slate-400'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Sign out
          </button>

          <div className={`border-t mt-1 pt-1 ${darkMode ? 'border-been-bg/50' : 'border-slate-100'}`}>
            <a
              href="https://zitti.ro"
              target="_blank"
              rel="noopener noreferrer"
              className={`block px-4 py-2 text-xs transition-colors ${
                darkMode
                  ? 'text-been-muted hover:text-been-text'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              zitti.ro
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
