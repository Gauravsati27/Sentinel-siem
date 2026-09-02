import React, { useState } from 'react';
import { SecurityAlert } from '../types';

interface TopAppBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  timeRange: string;
  setTimeRange: (range: string) => void;
  isLive: boolean;
  setIsLive: (live: boolean) => void;
  alerts: SecurityAlert[];
  onOpenNotifications: () => void;
  onOpenQuickAttack: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  searchQuery,
  setSearchQuery,
  timeRange,
  setTimeRange,
  isLive,
  setIsLive,
  alerts,
  onOpenNotifications,
  onOpenQuickAttack
}) => {
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [showAnalystMenu, setShowAnalystMenu] = useState(false);

  const criticalCount = alerts.filter(a => a.severity === 'critical' && a.status === 'open').length;
  const timeOptions = ['Last 15m', 'Last 1h', 'Last 24h', 'Last 7d', 'Last 30d'];

  return (
    <header className="bg-[#0b1326] fixed top-0 w-full z-50 border-b border-[#3b494b] flex items-center justify-between px-4 md:px-6 h-14 select-none">
      {/* Left: Brand & Live Badge */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#00dbe9]/20 rounded flex items-center justify-center border border-[#00dbe9]">
            <div className="w-3.5 h-3.5 bg-[#00dbe9] rounded-xs animate-pulse" />
          </div>
          <h1 className="font-bold text-base md:text-lg tracking-tight text-[#00dbe9] uppercase font-['Hanken_Grotesk']">
            Sentinel SIEM
          </h1>
        </div>

        {/* Live Ingestion Status Badge */}
        <button
          onClick={() => setIsLive(!isLive)}
          title={isLive ? 'Click to Pause live telemetry' : 'Click to Resume stream'}
          className="flex items-center gap-2 bg-[#171f33] border border-[#3b494b] px-3 py-1 rounded text-[10px] font-mono hover:border-[#849495] transition-all cursor-pointer"
        >
          <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-[#ffb4ab] animate-pulse' : 'bg-[#849495]'}`} />
          <span className="text-[#dae2fd]">
            {isLive ? 'SYSTEM LIVE: 14:32:01 UTC' : 'INGESTION PAUSED'}
          </span>
        </button>

        {/* Time range selector */}
        <div className="relative hidden lg:block">
          <button
            onClick={() => setShowTimeDropdown(!showTimeDropdown)}
            className="flex items-center gap-1.5 bg-[#171f33] rounded px-2.5 py-1 border border-[#3b494b] hover:border-[#00dbe9]/50 transition-colors text-[10px] font-mono text-[#dae2fd]"
          >
            <span className="text-[#849495]">WINDOW:</span>
            <span className="text-[#00dbe9] font-bold">{timeRange}</span>
            <span className="material-symbols-outlined text-xs text-[#849495]">
              expand_more
            </span>
          </button>

          {showTimeDropdown && (
            <div className="absolute left-0 mt-1.5 w-36 bg-[#171f33] border border-[#3b494b] rounded shadow-2xl py-1 z-50 font-mono text-xs">
              {timeOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setTimeRange(opt);
                    setShowTimeDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-[#2d3449] transition-colors flex items-center justify-between ${
                    timeRange === opt ? 'text-[#00dbe9] bg-[#00dbe9]/10 font-bold' : 'text-[#dae2fd]'
                  }`}
                >
                  {opt}
                  {timeRange === opt && <span className="material-symbols-outlined text-[14px]">check</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-md hidden md:block mx-4">
        <div className="relative">
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 border border-[#849495] rounded-full" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#171f33] border border-[#3b494b] text-[11px] pl-8 pr-3 py-1.5 w-full font-mono rounded text-[#dae2fd] placeholder:text-[#849495] focus:outline-none focus:border-[#00dbe9]"
            placeholder='grep -i "error" logs...'
            type="text"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#849495] hover:text-[#dae2fd]"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Right: Actions & User Avatar */}
      <div className="flex items-center gap-3">
        {/* Attack Surge Trigger */}
        <button
          onClick={onOpenQuickAttack}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#171f33] border border-[#3b494b] hover:border-[#00dbe9] text-[#00dbe9] rounded transition-all text-[11px] font-mono"
          title="Inject synthetic attack surge into SIEM"
        >
          <span className="material-symbols-outlined text-[14px]">bolt</span>
          <span>Inject Surge</span>
        </button>

        {/* Notifications Icon with active badge */}
        <button
          onClick={onOpenNotifications}
          aria-label="Notifications"
          className="relative text-[#00dbe9] hover:bg-[#2d3449] transition-colors p-1.5 rounded active:scale-95"
          title="View Active Alert Incidents"
        >
          <span className="material-symbols-outlined text-[18px]">notifications</span>
          {criticalCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#93000a] text-[#ffb4ab] border border-[#ffb4ab]/40 text-[9px] font-mono font-bold flex items-center justify-center animate-pulse">
              {criticalCount}
            </span>
          )}
        </button>

        {/* SOC Analyst Profile Avatar */}
        <div className="relative">
          <button
            onClick={() => setShowAnalystMenu(!showAnalystMenu)}
            className="w-8 h-8 rounded-full bg-[#2d3449] border border-[#3b494b] flex items-center justify-center text-xs font-mono font-bold text-[#dae2fd] hover:border-[#00dbe9] transition-colors"
          >
            JD
          </button>

          {showAnalystMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-[#171f33] border border-[#3b494b] rounded shadow-2xl p-3 z-50 font-['Hanken_Grotesk']">
              <div className="pb-2 border-b border-[#3b494b] mb-2">
                <div className="font-bold text-xs text-[#dae2fd]">J. Doe (Lead Analyst)</div>
                <div className="font-mono text-[11px] text-[#00dbe9]">analyst-id #8492</div>
                <div className="text-[10px] text-[#849495] mt-0.5">Role: SOC Commander / Admin</div>
              </div>
              <div className="space-y-1 font-mono text-[11px] text-[#849495]">
                <div className="flex justify-between py-1 px-1 rounded hover:bg-[#2d3449] cursor-pointer">
                  <span>Duty Shift:</span>
                  <span className="text-[#dae2fd]">Alpha (08-16 UTC)</span>
                </div>
                <div className="flex justify-between py-1 px-1 rounded hover:bg-[#2d3449] cursor-pointer">
                  <span>Engine Status:</span>
                  <span className="text-[#00dbe9]">Sliding-Window OK</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
