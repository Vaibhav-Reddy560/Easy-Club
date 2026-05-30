import React from "react";
import { ChevronLeft, Loader2, Minus, Plus, Download } from "lucide-react";
import { ClubEvent } from "@/lib/types";

interface TopToolbarProps {
  activeEvent: ClubEvent | undefined;
  onClose?: () => void;
  zoom: number;
  handleZoomIn?: () => void;
  handleZoomOut?: () => void;
  handleFitToView: () => void;
  handleExport: () => void;
  handleResetLogos?: () => void;
  isExporting?: boolean;
  peers?: Record<string, import('@/hooks/useMultiplayer').Peer>;
}

export default function TopToolbar({
  activeEvent,
  onClose,
  zoom,
  handleZoomIn,
  handleZoomOut,
  handleFitToView,
  handleExport,
  handleResetLogos,
  isExporting,
  peers = {}
}: TopToolbarProps) {
  return (
    <div className="h-20 bg-[#0d0d0d] border-b border-white/5 flex items-center justify-between px-6 shrink-0 z-[92]">
      {/* Left: Back + Event Name */}
      <div className="flex items-center gap-4">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-[10px] font-bold tracking-[0.15em] text-white hover:text-white transition-colors px-4 py-1.5 rounded-full border border-white/10 hover:border-white/20 bg-transparent"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          BACK
        </button>
        <div className="w-px h-4 bg-white/10" />
        <div className="flex items-center truncate pt-1">
          <span className="text-2xl uppercase tracking-widest text-signature-gradient" style={{ fontFamily: 'var(--font-astronomus)' }}>
            {activeEvent?.name || 'BROWSER BATTLE'}
          </span>
          <span className="text-2xl text-white uppercase ml-2 tracking-widest" style={{ fontFamily: 'var(--font-astronomus)' }}>
            / DESIGN STUDIO
          </span>
        </div>
      </div>

      {/* Center: Notice banner */}
      <div className="text-zinc-500 text-[10px] tracking-[0.15em] uppercase font-bold bg-zinc-900/60 border border-white/5 rounded-full px-4 py-1.5 shadow-inner">
        Design Studio is still being worked upon
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Active Peers Display */}
        {Object.values(peers).length > 0 && (
          <div className="flex items-center mr-4 -space-x-2">
            {Object.values(peers).map(peer => (
              <div 
                key={peer.id}
                className="w-8 h-8 rounded-full border-2 border-[#0d0d0d] flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                style={{ backgroundColor: peer.color }}
                title={peer.name}
              >
                {peer.name.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center bg-black/50 border border-white/10 rounded overflow-hidden mr-2 h-8">
          <button onClick={handleZoomOut} className="p-2 hover:bg-white/10 text-zinc-400">
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span onClick={handleFitToView} className="text-[10px] text-zinc-300 min-w-[3ch] text-center font-medium cursor-pointer hover:text-white px-1">
            {Math.round(zoom * 100)}%
          </span>
          <button onClick={handleZoomIn} className="p-2 hover:bg-white/10 text-zinc-400">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {handleResetLogos && (
          <button
            onClick={handleResetLogos}
            className="px-4 h-8 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[11px] font-semibold transition-colors flex items-center justify-center border border-white/5"
          >
            Reset Logos
          </button>
        )}

        <button 
          className="px-6 h-8 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-bold tracking-wide rounded border border-amber-300/50 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-2 text-[11px]"
        >
          Render Canvas
        </button>
        <button
          onClick={handleExport}
          className="px-4 h-8 bg-white/10 hover:bg-white/15 text-white rounded text-[11px] transition-colors flex items-center justify-center gap-2"
        >
          {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          Export
        </button>
      </div>
    </div>
  );
}
