// server/supabaseClient.ts
//
// Server-only Supabase client. Uses the SERVICE ROLE key, which bypasses Row Level
// Security — this is safe here because this client is only ever imported by server.ts,
// never bundled into the browser build, and the client app always talks to OUR Express
// API, never to Supabase directly. Do not import this file from anything under src/.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "[Supabase] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
      "Set them in .env (local) or your Vercel project's Environment Variables (production)."
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
