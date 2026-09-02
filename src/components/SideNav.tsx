import React from 'react';
import { ActiveTab } from '../types';

interface SideNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  unreadAlertsCount: number;
}

export const SideNav: React.FC<SideNavProps> = ({
  activeTab,
  setActiveTab,
  unreadAlertsCount
}) => {
  const navItems: { id: ActiveTab; icon: string; label: string; badge?: boolean }[] = [
    { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
    { id: 'logs', icon: 'list_alt', label: 'Log Explorer' },
    { id: 'alerts', icon: 'notifications_active', label: 'Alerts & Triage', badge: unreadAlertsCount > 0 },
    { id: 'rules', icon: 'upload_file', label: 'Ingest & Rules' },
    { id: 'threat_intel', icon: 'shield', label: 'Threat Intel' },
  ];

  return (
    <nav className="hidden md:flex flex-col w-16 bg-[#060e20] border-r border-[#3b494b] fixed left-0 top-14 bottom-0 z-40 items-center py-4 gap-4 select-none">
      <div className="flex flex-col gap-3">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={item.label}
              className={`relative flex flex-col items-center justify-center rounded w-10 h-10 transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#00dbe9]/20 text-[#00dbe9] border border-[#00dbe9]'
                  : 'text-[#dae2fd]/60 hover:text-[#dae2fd] hover:bg-[#171f33]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              {item.badge && (
                <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#ffb4ab] animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-auto flex flex-col items-center gap-3">
        <div className="w-6 h-[1px] bg-[#3b494b]" />
        <div
          title="Engine Status: Active (Processing Logs)"
          className="w-2 h-2 rounded-full bg-[#00dbe9] animate-pulse"
        />
      </div>
    </nav>
  );
};
