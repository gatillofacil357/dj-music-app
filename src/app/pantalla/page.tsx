"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { motion, AnimatePresence } from "framer-motion";

export default function PantallaEvento() {
  const [url, setUrl] = useState("");
  const [step, setStep] = useState(0);

  useEffect(() => {
    setUrl(window.location.origin);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 3);
    }, 4000); // Cambia de paso cada 4 segundos
    return () => clearInterval(interval);
  }, []);

  const steps = [
    { title: "Escanea el código QR", emoji: "📱" },
    { title: "Busca tu canción preferida", emoji: "🔍" },
    { title: "¡Nosotros la pasamos!", emoji: "🎶" }
  ];

  if (!url) return null;

  return (
    <div className="flex h-screen w-full flex-col md:flex-row items-center justify-center bg-zinc-950 text-white overflow-hidden p-8 gap-8 md:gap-24">
      {/* Sección Izquierda: Textos Animados */}
      <motion.div 
        className="flex flex-col items-center justify-center space-y-12 flex-1"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
      >
        <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text text-center tracking-tight">
          Pide tus Canciones
        </h1>
        
        <div className="h-64 flex items-center justify-center w-full relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6 }}
              className="absolute text-center flex flex-col items-center w-full"
            >
              <div className="text-8xl md:text-[140px] mb-6 drop-shadow-xl">{steps[step].emoji}</div>
              <h2 className="text-4xl md:text-6xl font-medium text-zinc-100 drop-shadow-md">
                <span className="text-pink-500 font-bold">{step + 1}.</span> {steps[step].title}
              </h2>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Sección Derecha: Código QR */}
      <motion.div 
        className="flex-shrink-0 bg-white p-8 md:p-12 rounded-[2.5rem] shadow-[0_0_80px_rgba(236,72,153,0.3)] flex flex-col items-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.5 
        }}
      >
        <QRCode 
          value={url} 
          size={400} 
          bgColor="#ffffff" 
          fgColor="#09090b" 
          level="H" 
          className="w-[300px] h-[300px] md:w-[400px] md:h-[400px]"
        />
        <p className="mt-8 text-2xl md:text-3xl font-black text-zinc-800 tracking-widest uppercase">
          ¡Apunta tu cámara aquí!
        </p>
      </motion.div>
    </div>
  );
}
