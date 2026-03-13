import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://uzecgrofzvbnuvzjtabn.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6ZWNncm9menZibnV2emp0YWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MzA3OTEsImV4cCI6MjA4MjUwNjc5MX0.FrsJl-J6hDQhRCqj8-1vf9cUMZ9B73-7KyoG3KUX8ZM";
const SUPABASE_PROJECT_REF = "uzecgrofzvbnuvzjtabn";

const safeFetch: typeof fetch = async (input, init) => {
	try {
		return await fetch(input, init);
	} catch {
		return new Response(
			JSON.stringify({ message: "Network error while reaching Supabase" }),
			{
				status: 503,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
};

const noSessionStorage = {
	getItem: (_key: string) => null,
	setItem: (_key: string, _value: string) => {},
	removeItem: (_key: string) => {},
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
	auth: {
		persistSession: false,
		autoRefreshToken: false,
		detectSessionInUrl: true,
		storageKey: `sb-${SUPABASE_PROJECT_REF}-auth-token`,
		storage: noSessionStorage,
	},
	global: {
		fetch: safeFetch,
	},
});