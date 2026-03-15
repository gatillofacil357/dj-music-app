"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Song } from "../../data/songs";

export default function DjDashboard() {
    const [playlist, setPlaylist] = useState<Song[]>([]);
    const [requestsPaused, setRequestsPaused] = useState(false);

    // Fetch playlist continuously for multi-device sync
    useEffect(() => {
        const fetchPlaylist = async () => {
            try {
                const [resPlaylist, resSettings] = await Promise.all([
                    fetch("/api/playlist").catch(() => null),
                    fetch("/api/settings").catch(() => null)
                ]);

                if (resPlaylist && resPlaylist.ok) {
                    const data = await resPlaylist.json();
                    setPlaylist(data.filter((s: Song) => s.id !== 'SYSTEM_SETTINGS'));
                }
                if (resSettings && resSettings.ok) {
                    const settings = await resSettings.json();
                    setRequestsPaused(settings.requestsPaused);
                }
            } catch (e) {
                console.error("Failed to fetch playlist", e);
            }
        };

        fetchPlaylist();
        const interval = setInterval(fetchPlaylist, 3000); // Sync every 3 seconds
        return () => clearInterval(interval);
    }, []);

    const updateSongStatus = async (songId: string, status: 'queued' | 'playing' | 'played') => {
        // Optimistic UI update
        setPlaylist(playlist.map((s) => s.id === songId ? { ...s, status } : s));
        try {
            await fetch("/api/playlist", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: songId, status }),
            });
        } catch (e) {
            console.error("Failed to sync update song", e);
        }
    };

    const removeSong = async (songId: string) => {
        // Optimistic UI update
        setPlaylist(playlist.filter((s) => s.id !== songId));
        try {
            await fetch("/api/playlist", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: songId }),
            });
        } catch (e) {
            console.error("Failed to sync remove song", e);
        }
    };

    const clearPlaylist = async () => {
        // We can clear the playlist by deleting all songs one by one or implementing a bulk delete
        // For now, let's delete them one by one for simplicity
        const currentPlaylist = [...playlist];
        setPlaylist([]);
        for (const song of currentPlaylist) {
            await fetch("/api/playlist", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: song.id }),
            });
        }
    };

    const toggleRequests = async () => {
        const newState = !requestsPaused;
        setRequestsPaused(newState);
        try {
            await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requestsPaused: newState })
            });
        } catch (e) {
            console.error("Failed to toggle settings", e);
        }
    };

    return (
        <div className="min-h-screen bg-[#121212] text-zinc-300 font-sans selection:bg-emerald-500/30">
            {/* Professional DJ Background Effect */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-[30vh] bg-gradient-to-b from-[#1a1a1a] to-transparent" />
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-900/5 blur-[150px]" />
                <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] rounded-full bg-blue-900/5 blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto p-4 md:p-8">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 bg-[#18181b] border border-[#27272a] p-6 rounded-2xl shadow-2xl">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="bg-emerald-500 text-black text-xs font-bold px-3 py-1 rounded-sm uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-black animate-pulse" /> LIVE
                            </span>
                            {requestsPaused && (
                                <span className="bg-red-500/20 text-red-500 border border-red-500/50 text-xs font-bold px-3 py-1 rounded-sm uppercase tracking-widest flex items-center gap-2">
                                    PAUSED
                                </span>
                            )}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2 uppercase font-mono">
                            Control DJ
                        </h1>
                        <p className="text-zinc-500 text-lg font-mono">Gestor de Cola v2</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={toggleRequests}
                            className={`px-5 py-3 rounded-lg font-bold flex items-center gap-2 transition-all border ${requestsPaused ? 'bg-red-500/10 text-red-500 border-red-500/50 hover:bg-red-500/20' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border-zinc-700'}`}
                        >
                            {requestsPaused ? 'Reanudar Pedidos' : 'Pausar Pedidos'}
                        </button>
                        <button onClick={clearPlaylist} className="px-5 py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors font-bold flex items-center gap-2">
                            Limpiar Todo
                        </button>
                    </div>
                </header>

                <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-4 md:p-6 shadow-2xl">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#27272a]">
                        <h2 className="text-2xl font-bold font-mono text-white">COLA</h2>
                        <div className="bg-[#09090b] px-4 py-2 rounded font-mono text-emerald-400 border border-[#27272a]">
                            TOTAL: <span className="font-bold text-lg">{playlist.length}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        {playlist.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center text-zinc-500 border-2 border-dashed border-white/10 rounded-2xl">
                                <svg className="w-20 h-20 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                </svg>
                                <p className="text-2xl font-medium text-zinc-400">La cola está vacía</p>
                                <p className="text-lg">Esperando que la gente pida canciones...</p>
                            </div>
                        ) : (
                            [...playlist].sort((a, b) => {
                                const order = { 'playing': 0, 'queued': 1, 'played': 2 };
                                const aStatus = a.status || 'queued';
                                const bStatus = b.status || 'queued';
                                if (order[aStatus] !== order[bStatus]) return order[aStatus] - order[bStatus];
                                return (b.requests_count || 1) - (a.requests_count || 1);
                            }).map((song, index) => (
                                <div
                                    key={song.id}
                                    className={`group hover:bg-[#121212] border hover:border-emerald-500/30 rounded-xl p-3 md:p-4 flex flex-col md:flex-row md:items-center gap-4 transition-all duration-300 ${
                                        song.status === 'playing' ? 'bg-emerald-500/5 border-emerald-500/50 ring-1 ring-emerald-500/30' : 
                                        song.status === 'played' ? 'bg-[#09090b] border-[#27272a] opacity-50 grayscale-[50%]' : 
                                        'bg-[#09090b] border-[#27272a]'
                                    }`}
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="text-4xl font-black text-[#27272a] w-12 text-center font-mono">
                                            {index + 1}
                                        </div>
                                        <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden shrink-0 shadow-lg">
                                            <Image
                                                src={song.coverUrl}
                                                alt={song.album}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-lg md:text-xl text-white truncate max-w-[90%] font-mono">{song.title}</h3>
                                            <p className="text-zinc-500 text-sm mt-1 truncate max-w-[90%] font-mono">{song.artist}</p>
                                            <div className="flex items-center gap-3 mt-2 text-xs font-mono text-zinc-500">
                                                <span className="bg-[#18181b] px-2 py-1 rounded border border-[#27272a]">{song.duration}</span>
                                                {song.requests_count && song.requests_count > 1 && (
                                                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 flex items-center gap-1 font-bold rounded">
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                                        </svg>
                                                        {song.requests_count} VOTOS
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4 md:pt-0 shrink-0 gap-2">
                                        {(!song.status || song.status === 'queued') && (
                                            <button
                                                onClick={() => updateSongStatus(song.id, 'playing')}
                                                className="w-full md:w-auto px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black font-bold font-mono rounded-lg transition-all duration-300 active:scale-95 border border-emerald-500/30 hover:border-emerald-500 flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                PLAY
                                            </button>
                                        )}
                                        
                                        {song.status !== 'played' && (
                                            <button
                                                onClick={() => updateSongStatus(song.id, 'played')}
                                                className="w-full md:w-auto px-4 py-2 bg-[#09090b] hover:bg-zinc-700 text-zinc-300 font-bold font-mono rounded-lg transition-all duration-300 active:scale-95 border border-[#27272a] hover:border-zinc-500 flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                TOCADA
                                            </button>
                                        )}

                                        {song.status === 'played' && (
                                            <button
                                                onClick={() => updateSongStatus(song.id, 'queued')}
                                                className="w-full md:w-auto px-4 py-2 bg-[#09090b] hover:bg-zinc-700 text-zinc-500 hover:text-zinc-300 font-bold font-mono rounded-lg transition-all duration-300 active:scale-95 border border-[#27272a] hover:border-zinc-500 flex items-center justify-center gap-2"
                                            >
                                                RESTAURAR
                                            </button>
                                        )}
                                        
                                        <button
                                            onClick={() => removeSong(song.id)}
                                            className="w-full md:w-auto p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all duration-300 active:scale-95 border border-red-500/30 hover:border-red-500 flex items-center justify-center"
                                            title="Eliminar de la lista"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
