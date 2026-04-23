import { LayoutDashboard, Trophy, Target, Settings, Users, UserPlus } from "lucide-react";
import { Club } from "@/lib/types";

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedClub: Club | null;
  userRole?: string;
}

export function MobileNav({
  activeTab,
  setActiveTab,
  selectedClub,
  userRole
}: MobileNavProps) {
  if (!selectedClub) return null;

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Portfolio", icon: Trophy },
    { name: "Membership", icon: UserPlus },
    { name: "Sponsorship", icon: Target, restricted: userRole === 'Junior Core' },
    { name: "Settings", icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 glass-morphism border-t border-white/10 z-50 flex items-center justify-around px-4 py-3 pb-8">
      {menuItems.map((item) => {
        if (item.restricted) return null;
        
        const isActive = activeTab === item.name;
        return (
          <button
            key={item.name}
            onClick={() => setActiveTab(item.name)}
            className={`flex flex-row items-center gap-2 p-2 rounded-xl transition-all ${
              isActive 
                ? "text-purple-400 bg-purple-500/10" 
                : "text-gray-500"
            }`}
          >
            <item.icon className="w-5 h-5" />
            {isActive && <span className="text-[10px] font-bold uppercase tracking-widest">{item.name}</span>}
          </button>
        );
      })}
    </div>
  );
}
