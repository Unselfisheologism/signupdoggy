import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xqhnjbbewoldwtndxfrm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxaG5qYmJld29sZHd0bmR4ZnJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwOTY4NDMsImV4cCI6MjA5NjY3Mjg0M30.9WHMU3utNiMGVyHrwYZs5ivGDT29SN8XFtQ5oSU76Lw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
});
