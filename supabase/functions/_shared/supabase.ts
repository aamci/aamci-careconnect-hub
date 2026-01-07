import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export function createSupabaseClient(req: Request) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  // Get auth token from request
  const authHeader = req.headers.get('Authorization');
  
  // Create client with service role for admin operations
  const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
  
  // Create client with user context if auth header present
  const supabaseClient = authHeader 
    ? createClient(supabaseUrl, supabaseKey, {
        global: { headers: { Authorization: authHeader } }
      })
    : supabaseAdmin;
  
  return { supabaseClient, supabaseAdmin };
}

export async function getUserFromRequest(req: Request) {
  const { supabaseClient } = createSupabaseClient(req);
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader) {
    return null;
  }
  
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabaseClient.auth.getUser(token);
  
  if (error || !user) {
    return null;
  }
  
  return user;
}
