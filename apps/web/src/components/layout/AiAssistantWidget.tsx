"use client";

import { useState } from "react";

export function AiAssistantWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? "Cerrar asistente IA" : "Abrir asistente IA"}
        aria-expanded={open}
        className="w-14 h-14 bg-primary text-white rounded-full shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all group overflow-hidden relative"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-secondary to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        <span className="material-symbols-outlined relative z-10 text-[28px]">
          smart_toy
        </span>
      </button>

      {open && (
        <div className="absolute bottom-20 right-0 w-80 h-[500px] glass-ai rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="p-4 bg-primary text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] ai-pulse">
                auto_awesome
              </span>
              <span className="font-body-custom text-label-md">
                Asistente IA TravelOS
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar asistente"
              className="opacity-70 hover:opacity-100"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="flex-grow p-4 space-y-4 overflow-y-auto custom-scrollbar">
            <div className="bg-surface-container-low p-3 rounded-lg rounded-tl-none mr-8">
              <p className="font-body-custom text-body-sm">
                ¡Hola! He analizado tu flujo. Tienes 3 seguimientos urgentes y
                una tendencia potencial en grupos para cruceros por el
                Mediterráneo. ¿Debería redactar los correos?
              </p>
            </div>
          </div>
          <div className="p-4 bg-white/50 border-t border-white/30">
            <div className="flex gap-2">
              <label className="sr-only" htmlFor="ai-widget-input">
                Pregunta a la IA
              </label>
              <input
                id="ai-widget-input"
                type="text"
                placeholder="Pregunta a la IA..."
                className="flex-grow bg-white border border-outline-variant rounded-lg px-3 py-2 font-body-custom text-body-sm outline-none focus:ring-2 focus:ring-secondary-container"
              />
              <button
                type="button"
                aria-label="Enviar mensaje"
                className="bg-secondary text-white p-2 rounded-lg"
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
