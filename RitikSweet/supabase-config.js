// supabase-config.js  –  loaded after the Supabase CDN <script>
const SUPABASE_URL = 'https://qhxinuleizxxfodhdant.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoeGludWxlaXp4eGZvZGhkYW50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMDI2MDYsImV4cCI6MjA5MTU3ODYwNn0.1gEVPCzkNs3tou1byCNTbb8bAS4PJj937Y8oH-d037w';

// window.supabase is injected by the CDN script
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
