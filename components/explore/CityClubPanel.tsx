"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Globe, ShieldCheck, ExternalLink, Instagram, Linkedin, MapPin, Users, Sparkles, ArrowLeft
} from "lucide-react";

// Wikipedia article name overrides for cities whose page title differs from our display name
const WIKI_NAME_MAP: Record<string, string> = {
  "Bengaluru": "Bangalore",
  "Mysuru": "Mysore",
  "Mangaluru": "Mangalore",
  "Belagavi": "Belgaum",
  "Hubballi-Dharwad": "Hubli-Dharwad",
  "Kalyan-Dombivali": "Kalyan-Dombivli",
  "Vasai-Virar": "Vasai-Virar",
  "Haora": "Howrah",
  "Tripunithura": "Thrippunithura",
  "Kozhikode": "Calicut",
  "Prayagraj": "Allahabad",
  "Bokaro Steel City": "Bokaro_Steel_City",
  "Noida": "Noida",
  "Thiruvananthapuram": "Thiruvananthapuram",
  "Tiruchirappalli": "Tiruchirappalli",
};

interface ClubEntry {
  id: string;
  name: string;
  organization: string;
  category: string;
  description: string;
  location: string;
  links: { website?: string; instagram?: string; linkedin?: string; facebook?: string; youtube?: string };
  approxMemberCount?: string;
  achievements?: string;
}

interface Props {
  cityName: string;
  clubs: ClubEntry[];
  onClose: () => void;
  selectedCategory: string;
  isLoading?: boolean;
}

const CATEGORY_MAPPING: Record<string, string> = {
  "Bio": "Biological Sciences and Biotechnology",
  "Math": "Mathematics and Quantitative Analysis",
  "Physics": "Physics and Theoretical Research",
  "Chemistry": "Chemical Sciences and Chemistry",
  "Racing": "Racing and Automotive Engineering",
  "Dance": "Dance and Choreography",
  "Singing": "Singing and Musical Performance",
  "Theatre/Acting": "Theatre, Acting, and Dramatics",
  "Astronomy/Space": "Astronomy, Space Science, and Rocketry",
  "Coding": "Coding, Web Development, and Cybersecurity",
  "Mountaineering": "Mountaineering, Trekking, and Adventure Sports",
  "Fashion": "Fashion, Styling, and Modeling",
  "Photography": "Photography, Cinematography, and Visual Media",
  "Social Service": "Social Service and Community Outreach",
  "Debating": "Debating, Public Speaking, and Rhetoric",
  "Fine Arts": "Fine Arts, Painting, and Creative Design",
  "Literary": "Literary Arts and Journalistic Writing",
  "Comedy": "Stand-up, Comedy, and Humorous Writing",
  "Electronics": "Electronics and Embedded Systems",
  "Robotics": "Robotics, Artificial Intelligence, and Automation",
  "Cultural": "Cultural Umbrella Bodies and Regional Sanghams",
  "Business": "Business, Entrepreneurship, and Startups"
};

export default function CityClubPanel({ cityName, clubs, onClose, selectedCategory, isLoading = false }: Props) {
  const [cityImage, setCityImage] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Fetch city image from Wikipedia REST API
  useEffect(() => {
    setCityImage(null);
    setImageLoaded(false);

    const wikiTitle = WIKI_NAME_MAP[cityName] || cityName;
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`;

    fetch(url)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        const imgSrc = data?.originalimage?.source || data?.thumbnail?.source;
        if (imgSrc) {
          setCityImage(imgSrc);
        }
      })
      .catch(() => { /* silently fail — panel still works without image */ });
  }, [cityName]);

  const filtered = selectedCategory === "All"
    ? clubs
    : clubs.filter(c => {
        const mappedCat = CATEGORY_MAPPING[selectedCategory];
        return c.category === mappedCat || c.category === selectedCategory || (c.category && c.category.toLowerCase().includes(selectedCategory.toLowerCase()));
      });

  // Group by category
  const grouped: Record<string, ClubEntry[]> = {};
  filtered.forEach(club => {
    const cat = club.category || "General Extracurriculars";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(club);
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="absolute inset-0 z-30 bg-[#060606]/95 backdrop-blur-2xl overflow-hidden flex flex-col rounded-[2rem]"
    >
      {/* Panel Header */}
      <div className="relative px-8 pt-8 pb-6 border-b border-white/10 flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-r from-gold-500/10 via-transparent to-transparent" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-gold-500/30 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-gold-500 shadow-[0_0_12px_rgba(234,179,8,0.6)]" />
                <h3 className="text-2xl font-astronomus text-signature-gradient uppercase tracking-tight">{cityName}</h3>
              </div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                {isLoading ? "Fetching Directory..." : `${filtered.length} ${filtered.length === 1 ? "Organization" : "Organizations"} Found`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/30 transition-all cursor-pointer"
          >
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        </div>
      </div>

      {/* City Hero Image */}
      {cityImage && (
        <div className="relative w-full h-[160px] flex-shrink-0 overflow-hidden">
          <img
            src={cityImage}
            alt={`${cityName} cityscape`}
            className={`w-full h-full object-cover transition-opacity duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
          />
          {/* Gradient overlays for seamless blending */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#060606] via-[#060606]/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#060606]/50 via-transparent to-[#060606]/50" />
          {/* City name overlay at bottom */}
          <div className="absolute bottom-4 left-6 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-gold-500" />
            <span className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em]">{cityName}, India</span>
          </div>
          {/* Shimmer while loading */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] via-white/[0.06] to-white/[0.02] animate-pulse" />
          )}
        </div>
      )}

      {/* Club Cards */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 custom-scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-2 border-gold-500/10" />
              <div className="absolute inset-0 rounded-full border-2 border-t-gold-500 animate-spin" />
            </div>
            <p className="text-[10px] font-black text-gold-500 uppercase tracking-widest animate-pulse">Scanning verified files...</p>
          </div>
        ) : (
          <>
            {Object.entries(grouped).map(([category, categoryClubs]) => (
              <div key={category} className="mb-6">
                <div className="flex items-center gap-3 mb-4 py-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-gold-500/30 to-transparent" />
                  <span className="text-[9px] font-black text-gold-500 uppercase tracking-[0.25em] whitespace-nowrap">
                    {category}
                  </span>
                  <span className="text-[9px] font-bold text-zinc-600 bg-white/5 px-2 py-0.5 rounded-full">
                    {categoryClubs.length}
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-l from-gold-500/30 to-transparent" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {categoryClubs.map((club, i) => (
                    <motion.div
                      key={club.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="group relative"
                    >
                      <div className="relative glass-card rounded-2xl border border-white/[0.07] p-5 flex flex-col gap-3 hover:border-gold-500/30 transition-all duration-300 group-hover:-translate-y-0.5 cursor-pointer">
                        <div className="flex justify-between items-start gap-3">
                          <div className="space-y-1 flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-white leading-tight group-hover:text-gold-400 transition-colors truncate">
                              {club.name}
                            </h4>
                            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-gold-500/50 flex-shrink-0" />
                              <span className="truncate">{club.organization}</span>
                            </p>
                          </div>
                          {parseInt(club.approxMemberCount || "0") > 1000 && (
                            <div className="flex items-center gap-1 text-gold-400 flex-shrink-0">
                              <Sparkles className="w-3 h-3" />
                              <span className="text-[8px] font-black uppercase tracking-widest">Elite</span>
                            </div>
                          )}
                        </div>

                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          {club.description}
                        </p>

                        {club.achievements && club.achievements !== "N/A" && club.achievements !== "N/a" && (
                          <div className="text-[10px] bg-gold-500/5 border border-gold-500/10 rounded-xl p-2.5 text-zinc-300 mt-1">
                            <span className="font-bold text-gold-400 block mb-0.5 uppercase tracking-wider text-[8px]">Achievements:</span>
                            {club.achievements}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                          <div className="flex items-center gap-3">
                            <div className="flex gap-2">
                              {club.links.instagram && (
                                <a href={club.links.instagram} target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-pink-500 transition-colors" title="Instagram">
                                  <Instagram className="w-3.5 h-3.5" />
                                </a>
                              )}
                              {club.links.linkedin && (
                                <a href={club.links.linkedin} target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-blue-400 transition-colors" title="LinkedIn">
                                  <Linkedin className="w-3.5 h-3.5" />
                                </a>
                              )}
                              {club.links.facebook && (
                                <a href={club.links.facebook} target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-blue-500 transition-colors" title="Facebook">
                                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M9 8H7v3h2v9h4v-9h3.6l.4-3H13V6c0-.5.5-1 1-1h2V1h-3C10.5 1 9 2.5 9 5v3z"/></svg>
                                </a>
                              )}
                              {club.links.youtube && (
                                <a href={club.links.youtube} target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-red-500 transition-colors" title="YouTube">
                                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                                </a>
                              )}
                            </div>
                            {club.approxMemberCount && club.approxMemberCount !== "N/A" && club.approxMemberCount !== "N/a" && (
                              <div className="flex items-center gap-1 text-zinc-500 text-[10px]" title="Member Count">
                                <Users className="w-3.5 h-3.5 text-gold-500/50" />
                                <span>{club.approxMemberCount} members</span>
                              </div>
                            )}
                          </div>
                          {club.links.website && (
                            <a
                              href={club.links.website.startsWith("http") ? club.links.website : `https://${club.links.website}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-zinc-300 hover:border-gold-500/40 hover:text-gold-400 transition-all flex-shrink-0"
                            >
                              Portal <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                  <Globe className="w-7 h-7 text-zinc-600" />
                </div>
                <p className="text-zinc-500 text-xs max-w-[200px]">
                  No organizations found for the selected category in {cityName}.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
