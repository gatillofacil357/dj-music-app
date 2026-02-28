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
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-[#E1306C]/20 text-zinc-400 hover:text-[#E1306C] rounded-full transition-colors backdrop-blur-sm border border-white/5">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-[#00f2fe]/20 text-zinc-400 hover:text-[#00f2fe] rounded-full transition-colors backdrop-blur-sm border border-white/5">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.04-.1z" />
                  </svg>
                </a>
                <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-[#25D366]/20 text-zinc-400 hover:text-[#25D366] rounded-full transition-colors backdrop-blur-sm border border-white/5">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </a>
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

            {playlist.length > 0 && (
              <div className="pt-6 mt-4 border-t border-white/10">
                <button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-400 hover:to-blue-400 text-white font-semibold py-4 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Play All Track{playlist.length !== 1 && 's'}
                </button>
              </div>
            )}

            {/* Sponsor Banner / QR Section */}
            <div className="mt-10 pt-8 border-t border-white/10">
              <p className="text-[11px] text-zinc-400 uppercase tracking-widest font-bold mb-5 text-center">Follow on Instagram</p>
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 flex flex-col items-center justify-center gap-6 hover:bg-white/10 transition-all duration-500 backdrop-blur-md group cursor-pointer shadow-2xl">
                <div className="w-full relative aspect-square max-w-[260px] bg-white rounded-2xl flex items-center justify-center overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_50px_rgba(255,255,255,0.2)] transition-all duration-500">
                  <Image
                    src="/instagram-qr.png"
                    alt="Instagram QR Code"
                    fill
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-700"
                    unoptimized
                  />
                </div>
                <div className="text-center">
                  <h4 className="font-bold text-lg text-zinc-100 group-hover:text-purple-300 transition-colors tracking-tight">Scan to Follow</h4>
                  <p className="text-sm text-zinc-400 mt-1 font-medium italic">@marcos_dj.uy</p>
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
