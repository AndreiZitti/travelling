"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

// Preset accent colors (just Green and Gold as defaults)
const ACCENT_PRESETS = [
  { name: "Emerald", value: "#059669" },
  { name: "Gold", value: "#F5A623" },
];

const DEFAULT_ACCENT = "#059669";

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [accentColor, setAccentColor] = useState(DEFAULT_ACCENT);
  const router = useRouter();
  const supabase = createClient();

  // Load saved accent color
  useEffect(() => {
    const savedColor = localStorage.getItem("accentColor");
    if (savedColor) {
      setAccentColor(savedColor);
    }
  }, []);

  // Save and apply accent color
  const handleColorChange = (color: string) => {
    setAccentColor(color);
    localStorage.setItem("accentColor", color);
    // Apply to CSS variable
    document.documentElement.style.setProperty("--been-accent", color);
  };

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        setUser(user);
      }
    };
    getUser();
  }, [supabase, router]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess("Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="p-2 rounded-lg hover:bg-white transition-colors"
          >
            <svg
              className="w-6 h-6 text-slate-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Account</h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
              {user.email?.[0].toUpperCase() || "?"}
            </div>
            <div>
              <p className="font-medium text-slate-800">{user.email}</p>
              <p className="text-sm text-slate-500">
                Member since{" "}
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Appearance</h2>
          <p className="text-sm text-slate-500 mb-4">Choose your accent color</p>

          {/* Preset colors */}
          <div className="flex items-center gap-3 mb-4">
            {ACCENT_PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => handleColorChange(preset.value)}
                className={`w-12 h-12 rounded-full transition-all flex items-center justify-center ${
                  accentColor === preset.value
                    ? "ring-2 ring-offset-2 ring-slate-400 scale-110"
                    : "hover:scale-105"
                }`}
                style={{ backgroundColor: preset.value }}
                title={preset.name}
              >
                {accentColor === preset.value && (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}

            {/* Color wheel picker */}
            <div className="relative">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="absolute inset-0 w-12 h-12 opacity-0 cursor-pointer"
                title="Choose custom color"
              />
              <div
                className={`w-12 h-12 rounded-full transition-all flex items-center justify-center border-2 border-dashed border-slate-300 ${
                  !ACCENT_PRESETS.some(p => p.value === accentColor)
                    ? "ring-2 ring-offset-2 ring-slate-400 scale-110"
                    : "hover:scale-105 hover:border-slate-400"
                }`}
                style={{
                  backgroundColor: !ACCENT_PRESETS.some(p => p.value === accentColor)
                    ? accentColor
                    : "transparent"
                }}
              >
                {!ACCENT_PRESETS.some(p => p.value === accentColor) ? (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                )}
              </div>
            </div>
          </div>

          {/* Current color display */}
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Current:</span>
            <span className="font-mono uppercase">{accentColor}</span>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Change Password
          </h2>

          <form onSubmit={handleChangePassword} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                {success}
              </div>
            )}

            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                placeholder="Confirm new password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
