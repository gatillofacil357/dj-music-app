"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Song } from "../../data/songs";

export default function DjDashboard() {
    const [playlist, setPlaylist] = useState<Song[]>([]);

    // Fetch playlist continuously for multi-device sync
    useEffect(() => {
        const fetchPlaylist = async () => {
            try {
                const res = await fetch("/api/playlist");
                if (res.ok) {
                    const data = await res.json();
                    setPlaylist(data);
                }
            } catch (e) {
                console.error("Failed to fetch playlist", e);
            }
        };

        fetchPlaylist();
        const interval = setInterval(fetchPlaylist, 3000); // Sync every 3 seconds
        return () => clearInterval(interval);
    }, []);

    const markAsPlayed = async (songId: string) => {
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

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-purple-500/30">
            {/* Background Effect */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-red-900/10 blur-[150px]" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto p-6 md:p-12">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/10 pb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> Live System
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-2">
                            DJ Control Panel
                        </h1>
                        <p className="text-zinc-400 text-xl">Manage incoming client requests in real-time.</p>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={clearPlaylist} className="px-6 py-3 rounded-xl bg-white/5 hover:bg-red-500/20 text-zinc-300 hover:text-red-400 border border-white/10 transition-colors font-semibold flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Clear All
                        </button>
                        <button className="px-6 py-3 rounded-xl bg-white text-black hover:bg-zinc-200 transition-colors font-bold shadow-xl">
                            Refresh Now
                        </button>
                    </div>
                </header>

                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-10 backdrop-blur-xl shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold">Requested Tracks</h2>
                        <div className="bg-white/10 px-4 py-2 rounded-lg font-mono text-zinc-300">
                            Queue: <span className="text-white font-bold text-lg">{playlist.length}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        {playlist.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center text-zinc-500 border-2 border-dashed border-white/10 rounded-2xl">
                                <svg className="w-20 h-20 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                </svg>
                                <p className="text-2xl font-medium text-zinc-400">Queue is empty</p>
                                <p className="text-lg">Waiting for clients to request songs...</p>
                            </div>
                        ) : (
                            playlist.map((song, index) => (
                                <div
                                    key={song.id}
                                    className="group bg-black/40 hover:bg-white/10 border border-white/5 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row md:items-center gap-6 transition-all duration-300"
                                >
                                    <div className="flex items-center gap-6 flex-1">
                                        <div className="text-3xl font-bold text-zinc-700 w-12 text-center group-hover:text-zinc-500 transition-colors">
                                            {index + 1}
                                        </div>
                                        <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden shrink-0 shadow-lg">
                                            <Image
                                                src={song.coverUrl}
                                                alt={song.album}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-xl md:text-2xl text-white truncate max-w-[90%]">{song.title}</h3>
                                            <p className="text-zinc-400 text-lg mt-1 truncate max-w-[90%]">{song.artist}</p>
                                            <div className="flex items-center gap-3 mt-2 text-sm text-zinc-500">
                                                <span className="bg-white/5 px-2 py-1 rounded">{song.duration}</span>
                                                <span>Added just now</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4 md:pt-0 border-t border-white/5 md:border-t-0 shrink-0">
                                        <button
                                            onClick={() => markAsPlayed(song.id)}
                                            className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all duration-300 active:scale-95 flex items-center justify-center gap-3"
                                        >
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Mark as Played
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
