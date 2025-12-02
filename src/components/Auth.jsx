import React from "react";
import { supabase } from "../supabaseClient";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

export function Auth() {
  return (
    <div className="min-h-screen w-full bg-slate-900 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1
              className="text-4xl font-bold tracking-widest text-white drop-shadow-lg"
              style={{ fontFamily: "serif" }}
            >
              OUR PLACE
            </h1>
            <p className="text-xs uppercase tracking-[0.4em] opacity-80 mt-2 text-slate-400">
              Please Sign In
            </p>
          </div>
          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={[]}
            theme="dark"
          />
        </div>
      </div>
    </div>
  );
}
