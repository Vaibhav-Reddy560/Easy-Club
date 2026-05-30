import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown, Search, Type, Check, MonitorSmartphone, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// A fallback list of popular Google Fonts in case API key is missing
const TOP_GOOGLE_FONTS = [
  "Roboto", "Open Sans", "Lato", "Montserrat", "Oswald", "Source Sans Pro",
  "Slabo 27px", "Raleway", "PT Sans", "Poppins", "Nunito", "Merriweather",
  "Ubuntu", "Playfair Display", "Lora", "Rubik", "Work Sans", "Fira Sans",
  "Quicksand", "Nunito Sans", "Inter", "Barlow", "Mulish", "PT Serif",
  "Titillium Web", "Heebo", "Mukta", "Noto Sans", "Inconsolata", "Anton",
  "Josefin Sans", "Dosis", "Teko", "Oxygen", "Cabin", "Lobster",
  "Dancing Script", "Pacifico", "Bebas Neue", "Righteous", "Caveat"
];

// Fallback web-safe system fonts for browsers that don't support queryLocalFonts
const FALLBACK_SYSTEM_FONTS = [
  "Arial", "Helvetica", "Times New Roman", "Courier New", "Verdana",
  "Georgia", "Palatino", "Garamond", "Bookman", "Comic Sans MS",
  "Trebuchet MS", "Arial Black", "Impact", "Monaco", "Optima",
  "Hoefler Text", "Brush Script MT", "Papyrus"
].sort();

// Project specific custom fonts
const PROJECT_FONTS = [
  { name: "Inter", value: "Inter" },
  { name: "Destrubia", value: "var(--font-destrubia)" },
  { name: "Astronomus", value: "var(--font-astronomus)" }
];

interface FontSelectorProps {
  value: string;
  onChange: (font: string, variants?: string[]) => void;
  className?: string;
}

export default function FontSelector({ value, onChange, className = '' }: FontSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const [systemFonts, setSystemFonts] = useState<string[]>(FALLBACK_SYSTEM_FONTS);
  const [googleFonts, setGoogleFonts] = useState<{family: string, variants: string[]}[]>(TOP_GOOGLE_FONTS.map(f => ({ family: f, variants: [] })));
  const [isLoadingSystem, setIsLoadingSystem] = useState(false);
  const [hasPromptedSystem, setHasPromptedSystem] = useState(false);
  const [loadedGoogleFonts, setLoadedGoogleFonts] = useState<Set<string>>(new Set(["Inter"]));

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Google Fonts if API key is present
  useEffect(() => {
    const fetchGoogleFonts = async () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_FONTS_API_KEY;
      if (!apiKey) return;
      try {
        const res = await fetch(`https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}&sort=popularity`);
        const data = await res.json();
        if (data.items) {
          setGoogleFonts(data.items.slice(0, 500).map((f: any) => ({ family: f.family, variants: f.variants }))); 
        }
      } catch (err) {
        console.error("Failed to fetch Google Fonts", err);
      }
    };
    fetchGoogleFonts();
  }, []);

  // Request Local System Fonts
  const handleRequestLocalFonts = async () => {
    if (!('queryLocalFonts' in window)) {
      alert("Local Font Access API is not supported in this browser. Try Chrome or Edge.");
      return;
    }
    
    setIsLoadingSystem(true);
    try {
      // @ts-ignore
      const fonts = await window.queryLocalFonts();
      // Extract unique families
      const families = Array.from(new Set(fonts.map((f: any) => f.family))) as string[];
      const merged = Array.from(new Set([...FALLBACK_SYSTEM_FONTS, ...families]));
      setSystemFonts(merged.sort());
      setHasPromptedSystem(true);
    } catch (err) {
      console.error("Local font access denied or failed:", err);
      alert("Permission to access local fonts was denied or failed.");
    } finally {
      setIsLoadingSystem(false);
    }
  };

  // Helper to load Google Font dynamically
  const loadGoogleFont = (fontFamily: string, variants: string[] = []) => {
    if (loadedGoogleFonts.has(fontFamily)) return;
    
    const formattedName = fontFamily.replace(/ /g, '+');
    let variantsStr = '300,400,600,700,900'; // fallback
    if (variants.length > 0) {
      variantsStr = variants.map(v => {
        if (v === 'regular') return '400';
        if (v === 'italic') return '400i';
        return v.replace('italic', 'i');
      }).join(',');
    }

    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css?family=${formattedName}:${variantsStr}&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    setLoadedGoogleFonts(prev => new Set(prev).add(fontFamily));
  };

  const handleSelect = (font: string, isGoogle: boolean = false, variants?: string[]) => {
    if (isGoogle) {
      loadGoogleFont(font, variants);
    }
    onChange(font, variants);
    setIsOpen(false);
    setSearch('');
  };

  const displayValue = useMemo(() => {
    const projectFont = PROJECT_FONTS.find(f => f.value === value);
    if (projectFont) return projectFont.name;
    return value;
  }, [value]);

  const filteredProjectFonts = PROJECT_FONTS.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
  const filteredSystemFonts = systemFonts.filter(f => f.toLowerCase().includes(search.toLowerCase()));
  const filteredGoogleFonts = googleFonts.filter(f => f.family.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-black border border-transparent hover:border-[#444] focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/20 rounded px-2.5 py-1.5 outline-none text-white text-[10px] transition-all"
      >
        <span className="truncate" style={{ fontFamily: value }}>{displayValue}</span>
        <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1 bg-[#111] border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden flex flex-col max-h-[300px]"
          >
            {/* Search */}
            <div className="p-2 border-b border-white/5 flex items-center gap-2">
              <Search className="w-3 h-3 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search fonts..."
                className="w-full bg-transparent border-none outline-none text-[10px] text-white placeholder-zinc-600"
                autoFocus
              />
            </div>

            <div className="overflow-y-auto custom-scrollbar p-1">
              {/* Project Fonts */}
              {filteredProjectFonts.length > 0 && (
                <div className="mb-2">
                  <div className="px-2 py-1 text-[8px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                    <Type className="w-3 h-3" /> Default Fonts
                  </div>
                  {filteredProjectFonts.map(font => (
                    <button
                      key={font.value}
                      onClick={() => handleSelect(font.value)}
                      className="w-full text-left px-2 py-1.5 rounded text-[11px] text-zinc-300 hover:text-white hover:bg-white/10 flex items-center justify-between group"
                    >
                      <span style={{ fontFamily: font.value }}>{font.name}</span>
                      {value === font.value && <Check className="w-3 h-3 text-gold-500" />}
                    </button>
                  ))}
                </div>
              )}

              {/* System Fonts */}
              <div className="mb-2">
                <div className="px-2 py-1 text-[8px] font-black uppercase tracking-widest text-zinc-500 flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><MonitorSmartphone className="w-3 h-3" /> System Fonts</span>
                  {typeof window !== 'undefined' && 'queryLocalFonts' in window && !hasPromptedSystem && (
                    <button 
                      onClick={handleRequestLocalFonts}
                      className="text-gold-500 hover:text-gold-400 hover:bg-gold-500/20 capitalize flex items-center gap-1 bg-gold-500/10 px-2 py-1 rounded-md text-[9px] font-medium border border-gold-500/20 transition-all shadow-sm"
                    >
                      {isLoadingSystem ? 'Loading...' : 'Load All System Fonts'}
                    </button>
                  )}
                </div>
                
                {filteredSystemFonts.length === 0 && search === '' && (
                  <div className="px-2 py-2 text-[10px] text-zinc-500 text-center">No system fonts loaded</div>
                )}
                
                {filteredSystemFonts.map(font => (
                  <button
                    key={font}
                    onClick={() => handleSelect(font)}
                    className="w-full text-left px-2 py-1.5 rounded text-[11px] text-zinc-300 hover:text-white hover:bg-white/10 flex items-center justify-between"
                  >
                    <span className="truncate pr-4" style={{ fontFamily: font }}>{font}</span>
                    {value === font && <Check className="w-3 h-3 text-gold-500 shrink-0" />}
                  </button>
                ))}
              </div>

              {/* Google Fonts */}
              {filteredGoogleFonts.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[8px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                    <Globe className="w-3 h-3" /> Google Fonts
                  </div>
                  {filteredGoogleFonts.map(font => (
                    <button
                      key={font.family}
                      onClick={() => handleSelect(font.family, true, font.variants)}
                      className="w-full text-left px-2 py-1.5 rounded text-[11px] text-zinc-300 hover:text-white hover:bg-white/10 flex items-center justify-between"
                    >
                      <span className="truncate pr-4" style={{ fontFamily: `"${font.family}", sans-serif` }}>{font.family}</span>
                      {value === font.family && <Check className="w-3 h-3 text-gold-500 shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
