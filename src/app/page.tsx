"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { songs, Song } from "../data/songs";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [discoverSongs, setDiscoverSongs] = useState<Song[]>(songs);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [requestsPaused, setRequestsPaused] = useState(false);

  const isVotingRef = useRef<boolean>(false);
  const votingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

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
          if (!isVotingRef.current) {
            setPlaylist(data.filter((s: Song) => s.id !== 'SYSTEM_SETTINGS'));
          }
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

  const addToPlaylist = async (song: Song) => {
    if (requestsPaused) {
      showNotification("❌ Pedidos pausados temporalmente por el DJ");
      return;
    }

    isVotingRef.current = true;
    if (votingTimeoutRef.current) {
      clearTimeout(votingTimeoutRef.current);
    }

    // Optimistic UI update
    const isAlreadyIn = playlist.find((s) => s.id === song.id);
    if (!isAlreadyIn) {
      setPlaylist(prev => [...prev, { ...song, requests_count: 1, status: 'queued' }]);
      showNotification(`✔️ Añadida a la cola: ${song.title}`);
    } else {
      setPlaylist(prev => prev.map(s => s.id === song.id ? { ...s, requests_count: (s.requests_count || 1) + 1, status: s.status === 'played' ? 'queued' : s.status } : s));
      showNotification(`🔥 ¡Votaste por: ${song.title}!`);
    }

    try {
      await fetch("/api/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(song),
      });
    } catch (e) {
      console.error("Failed to sync add song", e);
    } finally {
      votingTimeoutRef.current = setTimeout(() => {
        isVotingRef.current = false;
      }, 1500);
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
          coverUrl: (track.artworkUrl100 || track.artworkUrl60 || track.artworkUrl30)
            ? (track.artworkUrl100 || track.artworkUrl60 || track.artworkUrl30).replace("100x100bb", "600x600bb")
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
    <div className="h-screen w-screen overflow-hidden bg-[#0a0a0a] text-white font-sans selection:bg-purple-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row h-full w-full max-w-[1600px] xl:max-w-[1800px] mx-auto p-3 md:p-4 lg:p-6 gap-4 md:gap-6 overflow-hidden">
        {/* Left Column: Music Library */}
        <div className="flex-1 flex flex-col gap-4 h-full overflow-hidden">
          <header className="flex flex-col gap-4 pt-4 mb-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                  Descubrir
                </h1>
                <p className="text-zinc-400 text-lg mt-1">Encuentra tu próximo tema favorito.</p>
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
              placeholder="Busca CUALQUIER canción o artista mundialmente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={requestsPaused}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all backdrop-blur-md disabled:opacity-50"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {['Cumbia', 'RKT', 'Reggaeton', 'Electrónica', 'Pop', 'Rock'].map(genre => (
              <button
                key={genre}
                onClick={() => setSearchTerm(genre)}
                disabled={requestsPaused}
                className="whitespace-nowrap px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium transition-colors disabled:opacity-50"
              >
                {genre}
              </button>
            ))}
          </div>

          {/* Song Grid */}
          <div className="flex-1 overflow-y-auto pr-2 pb-4 scrollbar-hide relative">
            {loading ? (
              <div className="flex justify-center items-center h-full text-purple-400 min-h-[50vh]">
                <svg className="animate-spin h-10 w-10" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 h-max content-start">
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
                          onClick={() => addToPlaylist(song)}
                          disabled={requestsPaused}
                          className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center shadow-lg transform transition-transform duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${isInPlaylist
                            ? "bg-purple-500 text-white hover:bg-purple-600"
                            : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                            }`}
                        >
                          {isInPlaylist ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
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
                  No se encontraron canciones para &quot;{searchTerm}&quot;
                </div>
              )}
              </div>
            )}
          </div>

          {requestsPaused && (
            <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-sm rounded-3xl flex items-center justify-center">
              <div className="bg-white/10 border border-white/20 p-8 rounded-2xl flex flex-col items-center gap-4 text-center max-w-sm">
                <svg className="w-16 h-16 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <h3 className="text-2xl font-bold">Pedidos Pausados</h3>
                <p className="text-zinc-300">El DJ está mezclando en vivo o la lista de canciones ya está llena. ¡Disfruta la música!</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Playlist */}
        <div className="w-full md:w-[350px] lg:w-[400px] xl:w-[480px] shrink-0 h-full flex flex-col md:pb-0">
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-4 lg:p-6 backdrop-blur-xl shadow-2xl h-full flex flex-col overflow-hidden">
            <header className="flex flex-col gap-3 mb-4 pb-4 border-b border-white/10 shrink-0">
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl lg:text-3xl xl:text-4xl font-black flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-red-500 to-purple-500 animate-pulse leading-none">
                    🔥 La Playlist 🔥
                  </h2>
                  <p className="text-zinc-400 font-medium italic mt-1 text-xs lg:text-sm">¡Vota tus temas para que suenen!</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-gradient-to-r from-orange-500/20 to-purple-500/20 text-orange-300 text-xs xl:text-sm font-bold px-3 py-1.5 rounded-full border border-orange-500/30">
                  {playlist.length} en cola
                </span>
                <span className="bg-white/10 text-white text-xs xl:text-sm font-bold px-3 py-1.5 rounded-full border border-white/20 animate-pulse">
                  🎵 EN VIVO
                </span>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3">
              <AnimatePresence mode="popLayout">
              {playlist.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center h-full text-zinc-500 gap-4 opacity-50"
                  key="empty-state"
                  transition={{ duration: 0.2 }}
                >
                  <svg className="w-16 h-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-center font-medium">La cola está vacía.</p>
                  <p className="text-sm text-center">¡Agrega unas cuantas pistas de la biblioteca!</p>
                </motion.div>
              ) : (
                [...playlist].sort((a, b) => {
                    const order = { 'playing': 0, 'queued': 1, 'played': 2 };
                    const aStatus = a.status || 'queued';
                    const bStatus = b.status || 'queued';
                    if (order[aStatus] !== order[bStatus]) return order[aStatus] - order[bStatus];
                    return (b.requests_count || 1) - (a.requests_count || 1);
                }).map((song, index) => (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ 
                        opacity: 1, 
                        x: 0,
                        ...(song.status === 'playing' ? { y: -4, scale: 1.02 } : { y: 0, scale: 1 })
                    }}
                    exit={{ opacity: 0, x: -20, scale: 0.95 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
                    key={song.id}
                    onClick={() => addToPlaylist(song)}
                    className={`group border rounded-2xl p-4 flex items-center gap-4 transition-colors duration-300 cursor-pointer hover:shadow-2xl ${
                        song.status === 'playing' ? 'bg-purple-900/40 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 
                        song.status === 'played' ? 'bg-white/5 border-white/5 opacity-50 grayscale hover:opacity-100 hover:grayscale-0' : 
                        'bg-white/5 hover:bg-white/10 border-white/10'
                    }`}
                    title="Click para votar por esta canción"
                  >
                    <div className="relative w-16 h-16 xl:w-20 xl:h-20 rounded-xl overflow-hidden shrink-0 shadow-lg group-hover:shadow-purple-500/20 transition-all">
                      <Image
                        src={song.coverUrl}
                        alt={song.album}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-base xl:text-lg text-zinc-100 truncate flex items-center gap-2">
                        {song.title}
                        {song.status === 'playing' && (
                            <span className="text-[10px] xl:text-xs font-black bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-md flex items-center gap-1.5 shrink-0 shadow-lg shadow-purple-500/50">
                                <span className="w-2 h-2 bg-white rounded-full animate-pulse" /> SONANDO
                            </span>
                        )}
                        {song.status === 'played' && (
                            <span className="text-[10px] xl:text-xs font-bold bg-zinc-800 text-zinc-400 px-2 py-1 rounded-md border border-zinc-700 shrink-0">
                                TOCADA
                            </span>
                        )}
                      </h4>
                      <div className="flex items-center gap-2 text-sm xl:text-base text-zinc-400 mt-1">
                        <span className="truncate">{song.artist}</span>
                      </div>
                    </div>
                    <AnimatePresence mode="popLayout">
                    {song.requests_count && song.requests_count > 1 ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1, rotate: 3 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        key={`badge-${song.requests_count}`}
                        className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1.5 rounded-lg text-sm xl:text-base font-black shrink-0 shadow-lg shadow-red-500/20"
                      >
                        🔥 {song.requests_count}
                      </motion.div>
                    ) : null}
                    </AnimatePresence>
                  </motion.div>
                ))
              )}
              </AnimatePresence>
            </div>



            {/* Sponsor Banner / QR Section */}
            <div className="mt-4 pt-4 border-t border-white/10 shrink-0">
              <div className="bg-white/5 border border-white/10 rounded-2xl lg:rounded-3xl p-3 lg:p-4 flex flex-col items-center justify-center gap-2 lg:gap-3 hover:bg-white/10 transition-all duration-500 backdrop-blur-md group cursor-pointer shadow-lg text-center">
                <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Sígueme en Instagram</p>
                <div className="h-24 w-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 relative bg-white rounded-xl lg:rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all shrink-0">
                  <Image
                    src="/instagram-qr.png"
                    alt="Instagram QR Code"
                    fill
                    className="object-contain p-2 lg:p-3 group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                </div>
                <h4 className="font-bold text-base lg:text-xl xl:text-2xl text-zinc-100 group-hover:text-purple-300 transition-colors tracking-tight">@marcos_dj.uy</h4>
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
