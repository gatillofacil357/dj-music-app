"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function PantallaEvento() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 4);
    }, 6000); // Cambia de paso cada 6 segundos para dar tiempo a leer y ver la animación
    return () => clearInterval(interval);
  }, []);

  const steps = [
    {
      title: "¡Bienvenidos!",
      subtitle: "Acércate a la tablet en la pista para pedir tu música.",
      color: "from-purple-400 to-pink-600",
      content: (
        <div className="flex flex-col items-center gap-6">
          <div className="text-[120px] animate-bounce">👋</div>
          <div className="bg-white/10 p-6 rounded-3xl border border-white/20 backdrop-blur-md shadow-2xl">
            <svg className="w-24 h-24 text-purple-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <p className="text-xl font-medium text-zinc-300">Usa la Tablet Exclusiva</p>
          </div>
        </div>
      )
    },
    {
      title: "Paso 1: Busca",
      subtitle: "Toca la barra de búsqueda y escribe tu canción o artista.",
      color: "from-blue-400 to-cyan-500",
      content: (
        <div className="w-full max-w-md bg-[#0a0a0a] rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(56,189,248,0.2)]">
          <div className="p-6">
            <h3 className="text-2xl font-bold mb-4">Descubrir</h3>
            <div className="relative">
              <input 
                disabled 
                placeholder="Busca CUALQUIER canción..." 
                className="w-full bg-white/5 border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-white opacity-50"
              />
              <motion.div 
                className="absolute right-4 top-1/2 -translate-y-1/2"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
              >
                👆
              </motion.div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Paso 2: Agrega",
      subtitle: "Presiona el botón (+) al lado de la canción que quieras.",
      color: "from-green-400 to-emerald-600",
      content: (
        <div className="w-full max-w-md bg-[#0a0a0a] rounded-3xl p-4 border border-white/10 shadow-[0_0_50px_rgba(52,211,153,0.2)]">
          <div className="flex items-center gap-4 bg-white/10 p-3 rounded-2xl relative">
            <div className="w-16 h-16 bg-zinc-800 rounded-lg shrink-0 flex items-center justify-center text-3xl">🎵</div>
            <div className="flex-1">
              <h4 className="font-bold">Tu Canción Favorita</h4>
              <p className="text-sm text-zinc-400">Artista del Momento</p>
            </div>
            <motion.button 
              className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0 border border-white/30"
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.2, 1], backgroundColor: ["rgba(255,255,255,0.2)", "rgba(168,85,247,0.8)", "rgba(255,255,255,0.2)"] }}
              transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </motion.button>
            <motion.div 
                className="absolute right-0 top-12 text-3xl"
                initial={{ opacity: 0, y: 10, x: 10 }}
                animate={{ opacity: [0, 1, 0], y: -5, x: 0 }}
                transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
              >
                👆
              </motion.div>
          </div>
        </div>
      )
    },
    {
      title: "¡Y Listo!",
      subtitle: "Tu canción aparecerá en la cola y nosotros la mezclaremos.",
      color: "from-yellow-400 to-orange-500",
      content: (
        <div className="w-full max-w-md bg-[#0a0a0a] rounded-3xl p-6 border border-white/10 shadow-[0_0_50px_rgba(250,204,21,0.2)]">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            En Vivo (Cola)
          </h2>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <motion.div 
                key={i}
                className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-center gap-4"
                initial={i === 1 ? { opacity: 0, x: -20 } : { opacity: 1 }}
                animate={i === 1 ? { opacity: 1, x: 0 } : { opacity: 1 }}
                transition={{ repeat: Infinity, duration: 3, repeatDelay: 3 }}
              >
                <div className="w-10 h-10 bg-zinc-800 rounded-lg shrink-0"></div>
                <div className="flex-1 w-full relative">
                   {i === 1 ? (
                      <motion.div 
                        className="h-3 w-3/4 bg-green-400/50 rounded mb-2"
                        initial={{ width: "0%" }}
                        animate={{ width: "75%" }}
                        transition={{ repeat: Infinity, duration: 3, repeatDelay: 3 }}
                      />
                   ): (
                      <div className="h-3 w-3/4 bg-white/20 rounded mb-2" />
                   )}
                   <div className="h-2 w-1/2 bg-white/10 rounded" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="flex h-screen w-full flex-col bg-zinc-950 text-white overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/50 blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/50 blur-[150px]" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center justify-center w-full max-w-5xl gap-12"
          >
            {/* Cabecera del Step */}
            <div className="text-center space-y-6">
              <h1 className={`text-6xl md:text-8xl font-black bg-gradient-to-r ${steps[step].color} text-transparent bg-clip-text tracking-tight drop-shadow-sm`}>
                {steps[step].title}
              </h1>
              <p className="text-3xl md:text-4xl font-medium text-zinc-300 max-w-3xl leading-snug">
                {steps[step].subtitle}
              </p>
            </div>

            {/* Contenido Interactivo/Visual */}
            <div className="w-full flex justify-center mt-8">
              {steps[step].content}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Bar Indicators */}
      <div className="relative z-10 p-8 flex justify-center gap-4">
        {steps.map((_, i) => (
          <div 
            key={i} 
            className={`h-2 rounded-full transition-all duration-500 ${i === step ? 'w-24 bg-white' : 'w-12 bg-white/20'}`}
          />
        ))}
      </div>
    </div>
  );
}
