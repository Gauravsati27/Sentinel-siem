import React from 'react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  unreadAlertsCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  unreadAlertsCount
}) => {
  const navItems: { id: ActiveTab; icon: string; label: string; badge?: boolean }[] = [
    { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
    { id: 'logs', icon: 'list_alt', label: 'Logs' },
    { id: 'alerts', icon: 'notifications_active', label: 'Alerts', badge: unreadAlertsCount > 0 },
    { id: 'rules', icon: 'upload_file', label: 'Ingest' },
    { id: 'threat_intel', icon: 'shield', label: 'Intel' }
  ];

  return (
    <nav className="md:hidden bg-[#171f33] border-t border-[#3b494b] fixed bottom-0 w-full flex justify-around items-center h-16 z-50 px-2 select-none">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded transition-all relative ${
              isActive
                ? 'bg-[#2d3449] text-[#00dbe9]'
                : 'text-[#849495] hover:text-[#dae2fd]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            <span className="font-mono text-[9px] mt-0.5">{item.label}</span>
            {item.badge && (
              <div className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-[#ffb4ab] animate-pulse" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
