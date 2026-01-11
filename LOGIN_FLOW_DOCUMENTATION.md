# Login Flow Documentation

This document describes the complete authentication flow implementation using **Supabase Auth** with **Next.js 14 App Router**.

---

## Overview

- **Auth Provider**: Supabase Auth
- **Framework**: Next.js 14 (App Router)
- **Auth Method**: Email/Password authentication
- **Session Management**: Cookie-based via `@supabase/ssr`

---

## Required Dependencies

```json
{
  "dependencies": {
    "@supabase/ssr": "^0.8.0",
    "@supabase/supabase-js": "^2.89.0",
    "next": "14.2.28"
  }
}
```

Install with:
```bash
npm install @supabase/ssr @supabase/supabase-js
```

---

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## File Structure

```
├── app/
│   ├── login/
│   │   └── page.tsx          # Login page component
│   └── layout.tsx            # Root layout
├── components/
│   └── UserMenu.tsx          # User menu with auth state & sign out
├── lib/
│   └── supabase/
│       ├── client.ts         # Browser client
│       ├── server.ts         # Server client
│       └── middleware.ts     # Middleware session handler
└── middleware.ts             # Next.js middleware
```

---

## Implementation Files

### 1. Browser Supabase Client (`lib/supabase/client.ts`)

Creates a Supabase client for use in Client Components.

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Optional: specify a custom database schema
      // db: {
      //   schema: 'your_schema'
      // },
      // Optional: custom cookie options for cross-subdomain auth
      // cookieOptions: {
      //   domain: '.yourdomain.com',
      //   path: '/',
      //   sameSite: 'lax',
      //   secure: true
      // }
    }
  );
}
```

---

### 2. Server Supabase Client (`lib/supabase/server.ts`)

Creates a Supabase client for use in Server Components and Route Handlers.

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Optional: custom cookie options
const cookieOptions = {
  // domain: '.yourdomain.com',
  path: '/',
  sameSite: 'lax' as const,
  secure: true
};

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, { ...options, ...cookieOptions })
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
}
```

---

### 3. Middleware Session Handler (`lib/supabase/middleware.ts`)

Handles session refresh and route protection.

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Optional: custom cookie options
const cookieOptions = {
  // domain: '.yourdomain.com',
  path: '/',
  sameSite: 'lax' as const,
  secure: true
};

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, { ...options, ...cookieOptions })
          );
        },
      },
    }
  );

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes - redirect to login if not authenticated
  const protectedPaths = ["/settings", "/dashboard", "/profile"]; // Add your protected routes
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from login page
  if (request.nextUrl.pathname === "/login" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
```

---

### 4. Next.js Middleware (`middleware.ts`)

Root middleware file that calls the session updater.

```typescript
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

---

### 5. Login Page (`app/login/page.tsx`)

Complete login page with email/password authentication.

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
              {/* Your logo/icon here */}
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <path
                  strokeWidth="2"
                  d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Welcome back</h1>
            <p className="text-slate-500 mt-2">Sign in to your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          Contact your administrator for account access
        </p>
      </div>
    </div>
  );
}
```

---

### 6. User Menu Component (`components/UserMenu.tsx`)

Displays user avatar, handles sign out, and shows auth state.

```typescript
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function UserMenu() {
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
      <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse" />
    );
  }

  // Not logged in state
  if (!user) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-8 h-8 bg-slate-200 hover:bg-slate-300 rounded-full flex items-center justify-center text-slate-500 transition-colors"
          title="Sign in"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
            <Link
              href="/login"
              onClick={() => setDropdownOpen(false)}
              className="block px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              Sign in
            </Link>
          </div>
        )}
      </div>
    );
  }

  // Logged in state
  const initials = user.email
    ? user.email.substring(0, 2).toUpperCase()
    : "??";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="w-8 h-8 bg-indigo-500 hover:bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-semibold transition-colors"
        title={user.email || "User menu"}
      >
        {initials}
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
          {/* User info */}
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-medium text-slate-800 truncate">
              {user.email}
            </p>
          </div>

          {/* Menu items */}
          <Link
            href="/settings"
            onClick={() => setDropdownOpen(false)}
            className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <svg
              className="w-4 h-4 text-slate-400"
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
            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <svg
              className="w-4 h-4 text-slate-400"
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
        </div>
      )}
    </div>
  );
}
```

---

## Using Auth State in Components/Hooks

Example of how to track auth state in a custom hook:

```typescript
"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Memoize the Supabase client to prevent recreation on every render
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  // Track current user ID to prevent unnecessary state updates
  const currentUserIdRef = useRef<string | null>(null);
  const authInitializedRef = useRef(false);

  useEffect(() => {
    // Prevent double initialization in React Strict Mode
    if (authInitializedRef.current) return;
    authInitializedRef.current = true;

    const initAuth = async () => {
      const { data: { user: fetchedUser } } = await supabase.auth.getUser();
      const userId = fetchedUser?.id ?? null;

      // Only update if different from current
      if (userId !== currentUserIdRef.current) {
        currentUserIdRef.current = userId;
        setUser(fetchedUser);
      }
      setLoading(false);
    };
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUserId = session?.user?.id ?? null;
      // Only update user state when the user ID actually changes
      // This prevents re-renders on TOKEN_REFRESHED events
      if (newUserId !== currentUserIdRef.current) {
        currentUserIdRef.current = newUserId;
        setUser(session?.user ?? null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading, supabase };
}
```

---

## Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Request                             │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    middleware.ts                                 │
│                                                                  │
│  1. Intercepts all requests (except static files)               │
│  2. Calls updateSession() from lib/supabase/middleware.ts       │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│               lib/supabase/middleware.ts                         │
│                                                                  │
│  1. Creates Supabase server client with cookie handling         │
│  2. Calls supabase.auth.getUser() to refresh session            │
│  3. Checks if route is protected                                │
│  4. Redirects to /login if protected & not authenticated        │
│  5. Redirects to / if on /login & already authenticated         │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Page Component                             │
│                                                                  │
│  Uses lib/supabase/client.ts (browser client) for:              │
│  - Sign in: supabase.auth.signInWithPassword()                  │
│  - Sign out: supabase.auth.signOut()                            │
│  - Get user: supabase.auth.getUser()                            │
│  - Listen to changes: supabase.auth.onAuthStateChange()         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Concepts

### Session Refresh
The middleware automatically refreshes the Supabase session on every request by calling `supabase.auth.getUser()`. This keeps the session alive and updates cookies.

### Protected Routes
Add routes to the `protectedPaths` array in `lib/supabase/middleware.ts` to protect them. Unauthenticated users will be redirected to `/login`.

### Auth State Changes
Use `supabase.auth.onAuthStateChange()` to listen for login/logout events and update your UI accordingly.

### Cookie Handling
The `@supabase/ssr` package handles cookies automatically. Custom cookie options (domain, sameSite, secure) can be configured for cross-subdomain authentication.

---

## Supabase Dashboard Setup

1. Create a new Supabase project
2. Go to **Authentication > Providers** and ensure Email provider is enabled
3. Go to **Authentication > Users** to create users manually, or enable Sign Up
4. Copy your project URL and anon key from **Settings > API**

---

## TypeScript Types

Import types from `@supabase/supabase-js`:

```typescript
import type { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
```

---

## Common Patterns

### Check if User is Logged In (Server Component)

```typescript
import { createClient } from "@/lib/supabase/server";

export default async function ProtectedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Handle not logged in
    return <div>Please log in</div>;
  }

  return <div>Welcome, {user.email}!</div>;
}
```

### Conditional Rendering Based on Auth

```typescript
const { user, loading } = useAuth();

if (loading) return <Skeleton />;
if (!user) return <LoginPrompt />;
return <AuthenticatedContent user={user} />;
```

---

## Notes

- Users are created manually in Supabase Dashboard (no sign-up flow in this implementation)
- Session is cookie-based and works across server and client components
- Middleware handles all route protection automatically
- The `router.refresh()` call after login/logout ensures server components re-render with new auth state
