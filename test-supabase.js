const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gptosiozumvqjglfxjdi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwdG9zaW96dW12cWpnbGZ4amRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNDkzMjAsImV4cCI6MjA4NzgyNTMyMH0.uA-M3EGiqgDHG_tve8tRvui-Sw0qTNklsvurtUvWt6I';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
    console.log("Testing insert...");
    const { data, error } = await supabase
        .from('playlist')
        .insert([
            {
                id: 'test-' + Date.now(),
                title: 'Test',
                artist: 'Test',
                coverUrl: 'https://example.com',
                duration: '3:00'
            }
        ])
        .select();

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Success:", data);
    }
}

test();
