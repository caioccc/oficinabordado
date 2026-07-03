import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cliente padrão para o Frontend (opera com chaves públicas)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente administrativo para o Backend (Serverless Functions)
// Ele usa a service_role para burlar travas e rodar a RPC com segurança
export const getSupabaseAdmin = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};
