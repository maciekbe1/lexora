import { supabase } from '../../../lib/supabase';

export async function checkSupabaseHealth() {
  try {
    console.log('🔍 Checking Supabase connection...');
    
    // Test basic connection
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Supabase auth error:', authError);
      return { connected: false, error: authError.message };
    }
    
    console.log('✅ Supabase connection OK');
    console.log('👤 Current user:', user?.email || 'Not authenticated');
    
    // Test if decks table exists
    try {
      const { error: tableError } = await supabase
        .from('decks')
        .select('count', { count: 'exact', head: true });
      
      if (tableError) {
        if (tableError.code === 'PGRST205') {
          console.warn('⚠️  Table "decks" does not exist in Supabase');
          return { 
            connected: true, 
            tableExists: false, 
            error: 'Table "decks" not found. Please create it in Supabase Dashboard.' 
          };
        }
        console.error('❌ Table check error:', tableError);
        return { connected: true, tableExists: false, error: tableError.message };
      }
      
      console.log('✅ Table "decks" exists and is accessible');
      return { connected: true, tableExists: true };
      
    } catch (tableCheckError) {
      console.error('❌ Error checking table:', tableCheckError);
      return { 
        connected: true, 
        tableExists: false, 
        error: 'Could not verify table existence' 
      };
    }
    
  } catch (error) {
    console.error('❌ Supabase health check failed:', error);
    return { 
      connected: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export const SUPABASE_SETUP_SQL = `
-- Create decks table
CREATE TABLE IF NOT EXISTS public.decks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_decks_updated_at 
    BEFORE UPDATE ON public.decks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.decks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own decks" ON public.decks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own decks" ON public.decks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own decks" ON public.decks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own decks" ON public.decks
    FOR DELETE USING (auth.uid() = user_id);
`;