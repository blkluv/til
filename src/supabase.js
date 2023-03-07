import {createClient} from '@supabase/supabase-js';

const supabaseUrl = 'https://jixkwpgwbrzsliyprmje.supabase.co/rest/v1/ai';
const supabaseKey = process.env.SUPABASE_KEY
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppeGt3cGd3YnJ6c2xpeXBybWplIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzgxOTYyNDQsImV4cCI6MTk5Mzc3MjI0NH0.laRIX2zvrfqH-_-t1RzGc230fATv_b4ihu9r1hxzQ9Q';
// eslint-disable-next-line no-unused-vars
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
