import { LayoutDashboard, Target, Trophy, Settings, FolderClosed, Users, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { Club } from "@/lib/types";

interface AppSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedClub: Club | null;
  onBackToClubs: () => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  userRole?: string;
}

export function AppSidebar({
  activeTab,
  setActiveTab,
  selectedClub,
  onBackToClubs,
  collapsed,
  setCollapsed,
  userRole
}: AppSidebarProps) {
  
  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Portfolio", icon: Trophy },
    { name: "Membership", icon: UserPlus },
    { name: "Sponsorship", icon: Target, restricted: userRole === 'Junior Core' },
    { name: "Settings", icon: Settings },
  ];

  const sidebarWidth = collapsed ? "w-20" : "w-64";

  return (
    <div className={`${sidebarWidth} h-full transition-all duration-300 flex flex-col p-4 bg-[#020617]`}>
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20">
          <LayoutDashboard className="w-6 h-6 text-white" />
        </div>
        {!collapsed && (
          <span className="text-2xl font-bold text-white font-airstream tracking-wider truncate">Easy Club</span>
        )}
      </div>

      <div className="flex-1 space-y-1">
        {selectedClub && (
          <button
            onClick={onBackToClubs}
            className="w-full flex items-center gap-3 p-3 text-gray-500 hover:text-white transition-all mb-6 group rounded-xl hover:bg-white/5"
          >
            <FolderClosed className="w-5 h-5 group-hover:scale-110 transition-transform flex-shrink-0" />
            {!collapsed && <span className="font-bold text-sm">All Clubs</span>}
          </button>
        )}

        <div className="space-y-1">
          {menuItems.map((item) => {
            if (item.restricted) return null;
            
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all relative group ${
                  isActive 
                    ? "text-white bg-purple-600 shadow-lg shadow-purple-500/20" 
                    : "text-gray-500 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-white" : "group-hover:scale-110 transition-transform"}`} />
                {!collapsed && (
                  <span className="font-bold text-sm whitespace-nowrap">{item.name}</span>
                )}
                {isActive && !collapsed && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-auto px-2">
        <div className={`p-4 rounded-2xl bg-gradient-to-br from-purple-600/10 to-blue-600/10 border border-white/5 ${collapsed ? "items-center" : ""}`}>
          {!collapsed && (
            <>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Current Tier</p>
              <p className="text-white font-bold text-sm mb-3">Enterprise Pro</p>
              <button className="w-full bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold py-2 rounded-lg transition-all uppercase tracking-widest">Upgrade</button>
            </>
          )}
          {collapsed && <div className="w-2 h-2 rounded-full bg-purple-500 mx-auto animate-pulse"></div>}
        </div>
      </div>
    </div>
  );
}
