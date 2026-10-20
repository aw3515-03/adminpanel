"use client";

import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";

export default function LoginForm() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const error = searchParams.get("error");

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  };

  return (
    <main className="min-h-screen bg-black flex items-center justify-center">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-8 w-full max-w-sm">
        <button
          onClick={handleLogin}
          className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded border border-zinc-600"
        >
          Log in with Google
        </button>
        {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
      </div>
    </main>
  );
}