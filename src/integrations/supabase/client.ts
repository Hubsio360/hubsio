
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://izyqgnvwdjthnxhlamcv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6eXFnbnZ3ZGp0aG54aGxhbWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MzM3MDcsImV4cCI6MjA1ODQwOTcwN30.qWCkrHOgcmltKLHJfJ0s5YgqDXsM1pgi_5uRdGKMd0w";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'supabase-auth',
  },
  global: {
    headers: {
      'X-Client-Info': 'secu-reporter'
    }
  }
});

// Fonction utilitaire pour vérifier l'authentification
export const checkAuth = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Erreur de vérification d\'authentification:', error);
    return null;
  }
  return data.session;
};

// Type helper for audit_interviews table
export type AuditInterviewRow = Database['public']['Tables']['audit_interviews']['Row'];

// Function to select all audit interviews - with proper return type to support filtering methods like .eq()
export const selectAuditInterviews = () => {
  return supabase.from('audit_interviews').select('*');
};
