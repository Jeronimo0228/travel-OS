type TopbarProps = {
  searchPlaceholder?: string;
};

export function Topbar({
  searchPlaceholder = "Buscar itinerarios, agentes o insights...",
}: TopbarProps) {
  return (
    <header className="bg-surface-container-lowest sticky top-0 z-40 border-b border-outline-variant shadow-sm flex justify-between items-center h-16 px-container-margin w-full">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md focus-within:ring-2 focus-within:ring-secondary-container rounded-lg overflow-hidden">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
            search
          </span>
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full bg-surface-container-low border-none pl-10 pr-4 py-2 font-body-custom text-body-sm outline-none rounded-full"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-secondary to-tertiary-fixed-dim text-white rounded-full font-body-custom text-label-md shadow-lg shadow-secondary/20 hover:scale-105 transition-transform"
        >
          <span
            className="material-symbols-outlined text-[20px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            auto_awesome
          </span>
          Análisis IA
        </button>
        <div className="flex items-center gap-2 border-l border-outline-variant pl-4">
          <button
            type="button"
            className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-all relative"
          >
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-alert-coral rounded-full" />
          </button>
          <div className="w-10 h-10 rounded-full bg-surface-container-high border-2 border-white overflow-hidden cursor-pointer" />
        </div>
      </div>
    </header>
  );
}
