"use client";

import React, { useState, useMemo, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, MapPin, Globe, Users, Filter, ChevronDown, Sparkles, Layers
} from "lucide-react";
import dynamic from "next/dynamic";
import globalDirectory from "@/data/global-clubs-db.json";
import { mapLocationToCity, INDIA_CITIES } from "@/data/city-coordinates";
import CityClubPanel from "@/components/explore/CityClubPanel";

// Dynamic import for the map (heavy component — SSR disabled)
const IndiaMapView = dynamic(() => import("@/components/explore/IndiaMapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-[4/5] md:aspect-[3/4] lg:aspect-[4/5] rounded-[2rem] bg-[#0a0a0a] border border-white/10 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Loading Map...</p>
      </div>
    </div>
  ),
});

// Specific 22 categories
const ALL_CATEGORIES = [
  "All",
  "Bio",
  "Math",
  "Physics",
  "Chemistry",
  "Racing",
  "Dance",
  "Singing",
  "Theatre/Acting",
  "Astronomy/Space",
  "Coding",
  "Mountaineering",
  "Fashion",
  "Photography",
  "Social Service",
  "Debating",
  "Fine Arts",
  "Literary",
  "Comedy",
  "Electronics",
  "Robotics",
  "Cultural",
  "Business"
];

// Map specific category names to categories used in global-directory.json
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

export default function ExploreClubsView() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [clubs, setClubs] = useState<any[]>([]);
  const [isLoadingClubs, setIsLoadingClubs] = useState(false);

  // Map clubs to cities
  const clubsByCity = useMemo(() => {
    const map: Record<string, any[]> = {};
    globalDirectory.forEach((club: any) => {
      const city = mapLocationToCity(club.city || club.location || "");
      if (city) {
        if (!map[city]) map[city] = [];
        map[city].push(club);
      }
    });
    return map;
  }, []);

  // Club counts per city (filtered by category)
  const clubCountByCity = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.entries(clubsByCity).forEach(([city, clubs]) => {
      const filtered = selectedCategory === "All"
        ? clubs
        : clubs.filter((c: any) => {
            const mappedCat = CATEGORY_MAPPING[selectedCategory];
            return c.category === mappedCat || c.category === selectedCategory;
          });
      counts[city] = filtered.length;
    });
    return counts;
  }, [clubsByCity, selectedCategory]);

  // Fetch clubs dynamically from local city files
  React.useEffect(() => {
    if (!selectedCity) {
      setClubs([]);
      return;
    }

    async function fetchClubs() {
      setIsLoadingClubs(true);
      try {
        const response = await fetch("/api/explore-clubs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            type: "all",
            category: selectedCategory,
            location: selectedCity
          })
        });
        if (response.ok) {
          const fetchedData = await response.json();
          const mappedClubs = fetchedData.map((club: any, idx: number) => ({
            id: `club-${idx}`,
            name: club.club_name,
            organization: club.parent_org,
            category: club.category,
            description: club.description || club.details || `${club.club_name} is a student club located in ${club.region} under ${club.parent_org}.`,
            location: club.region,
            approxMemberCount: club.approxMemberCount || "",
            achievements: club.achievements || "",
            links: {
              website: club.official_website,
              instagram: club.social_media?.instagram,
              linkedin: club.social_media?.linkedin,
              facebook: club.social_media?.facebook,
              youtube: club.social_media?.youtube
            }
          }));
          setClubs(mappedClubs);
        } else {
          setClubs([]);
        }
      } catch (err) {
        console.error("Error fetching clubs:", err);
        setClubs([]);
      } finally {
        setIsLoadingClubs(false);
      }
    }

    fetchClubs();
  }, [selectedCity, selectedCategory]);

  // Top 25 active hubs sorted by current filtered counts
  const topHubs = useMemo(() => {
    return INDIA_CITIES
      .map(city => ({
        name: city.name,
        state: city.state,
        count: clubCountByCity[city.name] || 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 25);
  }, [clubCountByCity]);

  const handleCitySelect = useCallback((city: string | null) => {
    setSelectedCity(city);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <header className="border-b border-white/5 pb-8 flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-astronomus text-signature-gradient uppercase tracking-tighter">
            Explore Clubs
          </h2>
          <p className="text-zinc-100 text-[10px] mt-1 uppercase font-bold tracking-[0.2em] ml-1">
            Discover clubs in a region
          </p>
        </div>
      </header>

      {/* Category Filter Dropdown */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <button
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            className={`w-full flex items-center justify-between gap-3 px-6 py-4 rounded-2xl border transition-all cursor-pointer ${
              isCategoryOpen
                ? "bg-gold-500/10 border-gold-500/30 text-gold-400"
                : "bg-white/5 border-white/10 text-white hover:border-white/20"
            }`}
          >
            <div className="flex items-center gap-3">
              <Layers className="w-4 h-4 text-gold-500" />
              <span className="text-xs font-bold uppercase tracking-widest">
                {selectedCategory === "All" ? "All Categories" : selectedCategory}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${isCategoryOpen ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {isCategoryOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 mt-2 bg-[#0c0c0c] border border-white/10 rounded-2xl overflow-hidden z-40 shadow-2xl shadow-black/60 max-h-[400px] overflow-y-auto custom-scrollbar"
              >
                {ALL_CATEGORIES.map((cat) => {
                  const mappedCat = CATEGORY_MAPPING[cat];
                  const count = cat === "All"
                    ? globalDirectory.length
                    : globalDirectory.filter((c: any) => c.category === mappedCat || c.category === cat).length;

                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setIsCategoryOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-5 py-3 text-left transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? "bg-gold-500/10 text-gold-400"
                          : "text-zinc-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="text-[11px] font-bold uppercase tracking-wider truncate">{cat}</span>
                      <span className="text-[10px] font-bold text-zinc-600 bg-white/5 px-2 py-0.5 rounded-full flex-shrink-0 ml-2">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Active filter badge */}
        {selectedCategory !== "All" && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setSelectedCategory("All")}
            className="px-4 py-2 bg-gold-500/10 border border-gold-500/30 rounded-full text-[10px] font-black uppercase tracking-widest text-gold-400 hover:bg-gold-500/20 transition-all cursor-pointer whitespace-nowrap"
          >
            Clear Filter ✕
          </motion.button>
        )}
      </div>

      {/* Map + Panel Container */}
      <div className="relative rounded-[2rem] overflow-hidden border border-white/10 bg-[#0a0a0a]">
        {/* Subtle Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(234,179,8,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(234,179,8,0.3) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        <IndiaMapView
          clubs={globalDirectory}
          selectedCategory={selectedCategory}
          selectedCity={selectedCity}
          onCitySelect={handleCitySelect}
          clubCountByCity={clubCountByCity}
        />

        {/* Top Cities Sidebar Overlay */}
        <div className="absolute top-6 left-6 z-30 w-[240px] hidden md:flex flex-col gap-3 pointer-events-auto transition-all duration-500 ease-in-out"
          onMouseDown={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
        >
          <div className="glass-panel group p-4 !rounded-[14px] border border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl pointer-events-auto transition-all duration-500 ease-in-out">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2.5 mb-3">
              <MapPin className="w-3.5 h-3.5 text-gold-500 transition-transform duration-500 group-hover:scale-110" />
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-100">Top Cities</span>
            </div>

            <div className="space-y-2 max-h-[130px] group-hover:max-h-[240px] overflow-y-auto custom-scrollbar pr-1 pointer-events-auto transition-all duration-500 ease-in-out"
              onMouseDown={(e) => e.stopPropagation()}
              onWheel={(e) => e.stopPropagation()}
            >
              {topHubs.map((hub) => (
                <button
                  key={hub.name}
                  onClick={() => handleCitySelect(hub.name)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-left cursor-pointer ${
                    selectedCity === hub.name
                      ? "bg-gold-500/10 border-gold-500/30 text-gold-400"
                      : "bg-white/[0.02] border-white/5 hover:border-white/15 text-zinc-300 hover:text-white"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate leading-none">{hub.name}</p>
                    <p className="text-[8px] text-zinc-500 truncate mt-0.5">{hub.state}</p>
                  </div>
                  <span className="text-[9px] font-black text-gold-400 bg-gold-500/5 px-2 py-0.5 rounded-full border border-gold-500/10 flex-shrink-0">
                    {hub.count}
                  </span>
                </button>
              ))}

              {topHubs.length === 0 && (
                <div className="py-4 text-center">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">No active hubs</p>
                  <p className="text-[9px] text-zinc-600 mt-1">Try changing the category</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* City Club Panel Overlay */}
        <AnimatePresence>
          {selectedCity && (
            <CityClubPanel
              cityName={selectedCity}
              clubs={clubs}
              onClose={() => handleCitySelect(null)}
              selectedCategory={selectedCategory}
              isLoading={isLoadingClubs}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Disclaimer */}
      <div className="flex items-center justify-center py-4">
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
          Some portal links may be invalid
        </p>
      </div>
    </div>
  );
}
