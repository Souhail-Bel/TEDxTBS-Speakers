// function requireEnv(name: string): string {
//   const value = process.env[name];
//   if (!value) {
//     throw new Error(
//       `Missing required environment variable "${name}". Check your .env.local (see README for setup).`
//     );
//   }
//   return value;
// }
//
// export const SUPABASE_URL = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
// export const SUPABASE_ANON_KEY = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
//
// // Server-only — never import this from a "use client" file.
// export function getServiceRoleKey(): string {
//   return requireEnv("SUPABASE_SERVICE_ROLE_KEY");
// }

function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `Missing required environment variable "${name}". Check your .env.local (see README for setup).`
    );
  }
  return value;
}

export const SUPABASE_URL = requireEnv(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL");
export const SUPABASE_ANON_KEY = requireEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, "NEXT_PUBLIC_SUPABASE_ANON_KEY");

// Server-only — never import this from a "use client" file.
export function getServiceRoleKey(): string {
  return requireEnv(process.env.SUPABASE_SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY");
}
