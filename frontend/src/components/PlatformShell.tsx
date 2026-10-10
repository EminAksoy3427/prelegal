"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearSessionUser, useSessionUser } from "@/lib/session";

/**
 * Wraps the signed-in part of the app with a header, and sends anyone who
 * hasn't gone through the (fake) login screen back to it. This is a UX
 * convenience, not access control.
 */
export default function PlatformShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const user = useSessionUser();

  useEffect(() => {
    if (user === null) router.replace("/");
  }, [user, router]);

  if (!user) return null;

  const handleLogout = () => {
    clearSessionUser();
    router.replace("/");
  };

  return (
    <>
      <header className="border-b-2 border-brand-yellow bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <span className="text-sm font-semibold text-brand-navy">Prelegal</span>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Signed in as {user.name}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="font-medium text-brand-navy underline-offset-2 hover:underline"
            >
              Log out
            </button>
          </div>
        </div>
      </header>
      {children}
    </>
  );
}
