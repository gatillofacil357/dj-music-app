"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { songs, Song } from "../data/songs";

export default function Home() {
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [discoverSongs, setDiscoverSongs] = useState<Song[]>(songs);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

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

  const addToPlaylist = async (song: Song) => {
    // Optimistic UI update
    if (!playlist.find((s) => s.id === song.id)) {
      setPlaylist([...playlist, song]);
      showNotification(`✔️ Añadida: ${song.title}`);
      try {
        await fetch("/api/playlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(song),
        });
      } catch (e) {
        console.error("Failed to sync add song", e);
      }
    }
  };

  const removeFromPlaylist = async (songId: string) => {
    // Optimistic UI update
    const songToRemove = playlist.find((s) => s.id === songId);
    setPlaylist(playlist.filter((s) => s.id !== songId));
    if (songToRemove) showNotification(`❌ Eliminada: ${songToRemove.title}`);
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

  // Debounced search fetching from iTunes API
  useEffect(() => {
    if (!searchTerm.trim()) {
      setDiscoverSongs(songs); // Reset to mock defaults
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://itunes.apple.com/search?term=${encodeURIComponent(
            searchTerm
          )}&entity=song&limit=15`
        );
        const data = await response.json();

        // Map iTunes results to our Song interface
        const fetchedSongs: Song[] = data.results.map((track: any) => ({
          id: track.trackId?.toString() || Math.random().toString(),
          title: track.trackName || "Unknown Title",
          artist: track.artistName || "Unknown Artist",
          album: track.collectionName || "Unknown Album",
          coverUrl: track.artworkUrl100
            ? track.artworkUrl100.replace("100x100bb", "600x600bb")
            : "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=200&auto=format&fit=crop",
          duration: track.trackTimeMillis
            ? `${Math.floor(track.trackTimeMillis / 60000)}:${Math.floor(
              (track.trackTimeMillis % 60000) / 1000
            )
              .toString()
              .padStart(2, "0")}`
            : "0:00",
        }));

        setDiscoverSongs(fetchedSongs);
      } catch (error) {
        console.error("Error fetching from iTunes API:", error);
      } finally {
        setLoading(false);
      }
    }, 600); // 600ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-purple-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row min-h-screen max-w-7xl mx-auto p-4 md:p-6 gap-6 md:gap-8">
        {/* Left Column: Music Library */}
        <div className="flex-1 flex flex-col gap-6">
          <header className="flex flex-col gap-4 pt-4 mb-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                  Discover
                </h1>
                <p className="text-zinc-400 text-lg mt-1">Find your next favorite track.</p>
              </div>
              <div className="flex items-center gap-3">

              </div>
            </div>
          </header>

          {/* Search Bar */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-zinc-500 group-focus-within:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search ANY song or artist globally..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all backdrop-blur-md"
            />
          </div>

          {/* Song Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20 text-purple-400">
              <svg className="animate-spin h-10 w-10" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-20 md:pb-0">
              {discoverSongs.length > 0 ? (
                discoverSongs.map((song) => {
                  const isInPlaylist = playlist.some((s) => s.id === song.id);
                  return (
                    <div
                      key={song.id}
                      className="group relative bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-4 hover:bg-white/10 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 backdrop-blur-sm"
                    >
                      <div className="relative aspect-square w-full rounded-xl overflow-hidden shadow-lg">
                        <Image
                          src={song.coverUrl}
                          alt={song.album}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          unoptimized
                        />
                      </div>
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg truncate text-zinc-100 group-hover:text-purple-300 transition-colors">
                            {song.title}
                          </h3>
                          <p className="text-zinc-400 text-sm truncate">{song.artist}</p>
                        </div>
                        <button
                          onClick={() => isInPlaylist ? removeFromPlaylist(song.id) : addToPlaylist(song)}
                          className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center shadow-lg transform transition-transform duration-300 active:scale-95 ${isInPlaylist
                            ? "bg-red-500 text-white hover:bg-red-600"
                            : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                            }`}
                        >
                          {isInPlaylist ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-12 text-center text-zinc-500">
                  No songs found matching "{searchTerm}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Playlist */}
        <div className="w-full md:w-[380px] shrink-0">
          <div className="sticky top-6 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl h-[calc(100vh-48px)] flex flex-col">
            <header className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                My Playlist
              </h2>
              <span className="bg-purple-500/20 text-purple-300 text-xs font-bold px-3 py-1 rounded-full">
                {playlist.length} track{playlist.length !== 1 && 's'}
              </span>
            </header>

            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3">
              {playlist.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-4 opacity-50">
                  <svg className="w-16 h-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-center font-medium">Your playlist is empty.</p>
                  <p className="text-sm text-center">Add some tracks from the library!</p>
                </div>
              ) : (
                playlist.map((song, index) => (
                  <div
                    key={song.id}
                    className="group bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-3 flex items-center gap-4 transition-all duration-300"
                  >
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 shadow-md">
                      <Image
                        src={song.coverUrl}
                        alt={song.album}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-zinc-100 truncate">{song.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <span className="truncate">{song.artist}</span>
                        <span>•</span>
                        <span>{song.duration}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromPlaylist(song.id)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-red-400 hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Remove from playlist"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>



            {/* Sponsor Banner / QR Section */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <p className="text-[11px] text-zinc-400 uppercase tracking-widest font-bold mb-6 text-center">Follow on Instagram</p>
              <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 flex flex-col items-center justify-center gap-6 hover:bg-white/10 transition-all duration-500 backdrop-blur-md group cursor-pointer shadow-2xl">
                <div className="w-full relative aspect-square max-w-[280px] bg-white rounded-3xl flex items-center justify-center overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.15)] group-hover:shadow-[0_0_60px_rgba(255,255,255,0.25)] transition-all duration-500 ring-8 ring-white/5">
                  <Image
                    src="/instagram-qr.png"
                    alt="Instagram QR Code"
                    fill
                    className="object-contain p-6 group-hover:scale-105 transition-transform duration-700"
                    unoptimized
                  />
                </div>
                <div className="text-center">
                  <h4 className="font-bold text-xl text-zinc-100 group-hover:text-purple-300 transition-colors tracking-tight">Scan to Follow</h4>
                  <p className="text-sm text-zinc-400 mt-2 font-medium">@marcos_dj.uy</p>
                  <p className="text-[10px] text-zinc-500 mt-4 italic">Tip: If it doesn't scan, try lowering your screen brightness slightly.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 text-white px-6 py-3 rounded-full shadow-2xl font-medium flex items-center gap-2">
            {notification}
          </div>
        </div>
      )}
    </div>
  );
}
