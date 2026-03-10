import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('playlist')
            .select('*')
            .eq('id', 'SYSTEM_SETTINGS')
            .single();

        if (error || !data) {
            return NextResponse.json({ requestsPaused: false });
        }

        return NextResponse.json({ requestsPaused: data.title === 'true' });
    } catch {
        return NextResponse.json({ requestsPaused: false });
    }
}

export async function POST(request: Request) {
    try {
        const { requestsPaused } = await request.json();

        const { data: existing } = await supabase
            .from('playlist')
            .select('id')
            .eq('id', 'SYSTEM_SETTINGS')
            .single();

        if (existing) {
            await supabase
                .from('playlist')
                .update({ title: requestsPaused ? 'true' : 'false' })
                .eq('id', 'SYSTEM_SETTINGS');
        } else {
            await supabase
                .from('playlist')
                .insert([{
                    id: 'SYSTEM_SETTINGS',
                    title: requestsPaused ? 'true' : 'false',
                    artist: 'system',
                    coverUrl: 'system',
                    duration: 'system',
                    requests_count: 0
                }]);
        }

        return NextResponse.json({ success: true, requestsPaused });
    } catch (error) {
        console.error("Settings POST Exception:", error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
