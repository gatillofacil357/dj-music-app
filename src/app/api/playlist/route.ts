import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

// This API route acts as a secure middleware to Supabase
// to avoid exposing client-side inserts directly if RLS is not fully configured by the user

export async function GET() {
    try {
        const { data: playlist, error } = await supabase
            .from('playlist')
            .select('*')
            .order('created_at', { ascending: true }); // Keep them in order they were added

        if (error) {
            // If table doesn't exist yet, we just return empty
            if (error.code === '42P01') {
                return NextResponse.json([]);
            }
            console.error("Supabase GET Error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(playlist || []);
    } catch (error) {
        console.error("GET Exception:", error);
        return NextResponse.json([]);
    }
}

export async function POST(request: Request) {
    try {
        const song = await request.json();

        // Check if song already exists
        const { data: existing } = await supabase
            .from('playlist')
            .select('id')
            .eq('id', song.id)
            .single();

        if (existing) {
            return NextResponse.json({ message: 'Song already in playlist' }, { status: 200 });
        }

        // Prepare data for Supabase
        const songData = {
            id: song.id,
            title: song.title,
            artist: song.artist,
            coverUrl: song.coverUrl,
            duration: song.duration,
            // Let Supabase handle created_at
        };

        const { data, error } = await supabase
            .from('playlist')
            .insert([songData])
            .select();

        if (error) {
            console.error("Supabase POST Error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("POST Exception:", error);
        return NextResponse.json({ error: 'Failed to add song' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();

        const { error } = await supabase
            .from('playlist')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Supabase DELETE Error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error("DELETE Exception:", error);
        return NextResponse.json({ error: 'Failed to delete song' }, { status: 500 });
    }
}
