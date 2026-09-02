import React from 'react';
import { SiemMetrics } from '../types';

interface KpiRowProps {
  metrics: SiemMetrics;
  onFilterChange?: (filterType: string) => void;
}

export const KpiRow: React.FC<KpiRowProps> = ({ metrics, onFilterChange }) => {
  return (
    <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 select-none">
      {/* 1. Total Ingest */}
      <div 
        onClick={() => onFilterChange?.('all')}
        className="bg-[#171f33] border border-[#3b494b] p-3 rounded flex flex-col relative overflow-hidden group hover:border-[#849495] transition-all cursor-pointer"
      >
        <div className="absolute top-0 left-0 w-1 h-full bg-[#00dbe9]" />
        <span className="text-[10px] uppercase font-mono text-[#849495] tracking-wider pl-1">
          Total Ingest
        </span>
        <span className="text-2xl font-bold mt-1 text-[#dae2fd] pl-1 font-['Hanken_Grotesk']">
          {(metrics.totalEvents / 1_000_000).toFixed(1)}M
        </span>
        <span className="text-[10px] text-[#00dbe9] mt-2 font-mono flex items-center gap-1 pl-1">
          <span className="material-symbols-outlined text-[12px]">trending_up</span>
          <span>+5.2% (24h)</span>
        </span>
      </div>

      {/* 2. Active Alerts */}
      <div 
        onClick={() => onFilterChange?.('active_alerts')}
        className="bg-[#171f33] border border-[#3b494b] p-3 rounded flex flex-col relative overflow-hidden group hover:border-[#ffb4ab] transition-all cursor-pointer"
      >
        <div className="absolute top-0 left-0 w-1 h-full bg-[#ffb4ab]" />
        <span className="text-[10px] uppercase font-mono text-[#849495] tracking-wider pl-1">
          Active Alerts
        </span>
        <span className="text-2xl font-bold mt-1 text-[#ffb4ab] pl-1 font-['Hanken_Grotesk']">
          {metrics.activeAlerts}
        </span>
        <span className="text-[10px] text-[#ffb4ab] mt-2 font-mono flex items-center gap-1 pl-1">
          <span className="material-symbols-outlined text-[12px]">warning</span>
          <span>+12 since 1hr</span>
        </span>
      </div>

      {/* 3. Critical Threats */}
      <div 
        onClick={() => onFilterChange?.('critical')}
        className="bg-[#171f33] border border-[#3b494b] p-3 rounded flex flex-col relative overflow-hidden group hover:border-[#ffb4ab] transition-all cursor-pointer"
      >
        <div className="absolute top-0 left-0 w-1 h-full bg-[#ffb4ab]" />
        <span className="text-[10px] uppercase font-mono text-[#ffb4ab] tracking-wider flex items-center justify-between pl-1">
          <span>Critical</span>
          <span className="w-2 h-2 rounded-full bg-[#ffb4ab] animate-ping" />
        </span>
        <span className="text-2xl font-bold mt-1 text-[#ffb4ab] pl-1 font-['Hanken_Grotesk']">
          {metrics.criticalAlerts < 10 ? `0${metrics.criticalAlerts}` : metrics.criticalAlerts}
        </span>
        <span className="text-[10px] text-[#ffb4ab] mt-2 font-mono flex items-center gap-1 pl-1">
          <span className="material-symbols-outlined text-[12px]">crisis_alert</span>
          <span>Immediate action</span>
        </span>
      </div>

      {/* 4. Unique IPs */}
      <div 
        onClick={() => onFilterChange?.('unique_ips')}
        className="bg-[#171f33] border border-[#3b494b] p-3 rounded flex flex-col relative overflow-hidden group hover:border-[#849495] transition-all cursor-pointer"
      >
        <div className="absolute top-0 left-0 w-1 h-full bg-[#c0c1ff]" />
        <span className="text-[10px] uppercase font-mono text-[#849495] tracking-wider pl-1">
          Unique IPs
        </span>
        <span className="text-2xl font-bold mt-1 text-[#dae2fd] pl-1 font-['Hanken_Grotesk']">
          {(metrics.uniqueIps / 1000).toFixed(1)}k
        </span>
        <span className="text-[10px] text-[#849495] mt-2 font-mono flex items-center gap-1 pl-1">
          <span className="material-symbols-outlined text-[12px]">router</span>
          <span>Nominal range</span>
        </span>
      </div>

      {/* 5. Blocked / Mitigated */}
      <div 
        onClick={() => onFilterChange?.('blocked')}
        className="bg-[#171f33] border border-[#3b494b] p-3 rounded flex flex-col relative overflow-hidden col-span-2 sm:col-span-1 group hover:border-[#ffe179] transition-all cursor-pointer"
      >
        <div className="absolute top-0 left-0 w-1 h-full bg-[#ffe179]" />
        <span className="text-[10px] uppercase font-mono text-[#849495] tracking-wider pl-1">
          Auto-Blocked
        </span>
        <span className="text-2xl font-bold mt-1 text-[#dae2fd] pl-1 font-['Hanken_Grotesk']">
          {metrics.blockedIps}
        </span>
        <span className="text-[10px] text-[#ffe179] mt-2 font-mono flex items-center gap-1 pl-1">
          <span className="material-symbols-outlined text-[12px]">shield</span>
          <span>Active firewall</span>
        </span>
      </div>
    </section>
  );
};
