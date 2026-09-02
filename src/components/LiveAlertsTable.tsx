import React from 'react';
import { SecurityAlert } from '../types';

interface LiveAlertsTableProps {
  alerts: SecurityAlert[];
  onSelectAlert: (alert: SecurityAlert) => void;
  onOpenFilter: () => void;
  filterSeverity?: string;
}

export const LiveAlertsTable: React.FC<LiveAlertsTableProps> = ({
  alerts,
  onSelectAlert,
  onOpenFilter,
  filterSeverity
}) => {
  return (
    <div className="bg-[#171f33] border border-[#3b494b] rounded flex flex-col overflow-hidden select-none">
      {/* Table Header Bar */}
      <div className="bg-[#2d3449] px-4 py-2 border-b border-[#3b494b] flex justify-between items-center">
        <h2 className="text-[11px] font-mono uppercase text-[#849495] tracking-widest flex items-center gap-2">
          <span>Live Security Alerts</span>
          {filterSeverity && filterSeverity !== 'all' && (
            <span className="text-[9px] text-[#00dbe9] bg-[#00dbe9]/10 px-1.5 py-0.2 rounded border border-[#00dbe9]/30">
              {filterSeverity.toUpperCase()}
            </span>
          )}
        </h2>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-[#00dbe9] hidden sm:inline">
            STREAMING: 12.4 EPS
          </span>
          <button
            onClick={onOpenFilter}
            className="text-[10px] font-mono text-[#dae2fd] hover:text-[#00dbe9] flex items-center gap-1 bg-[#171f33] px-2 py-0.5 rounded border border-[#3b494b] transition-all"
          >
            <span className="material-symbols-outlined text-[12px]">tune</span>
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="text-[#849495] border-b border-[#3b494b] uppercase text-[9px] font-mono">
              <th className="py-2 pl-4">Timestamp</th>
              <th className="py-2">Severity</th>
              <th className="py-2">Source IP</th>
              <th className="py-2">Event Type</th>
              <th className="py-2 pr-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3b494b]/40 font-mono text-[11px] text-[#dae2fd]">
            {alerts.map((alert) => {
              // Severity Tag styling
              const tagStyle =
                alert.severity === 'critical'
                  ? 'bg-[#ffb4ab]/20 text-[#ffb4ab] border-[#ffb4ab]/30 font-bold'
                  : alert.severity === 'high'
                  ? 'bg-[#ffe179]/20 text-[#ffe179] border-[#ffe179]/30 font-bold'
                  : alert.severity === 'medium'
                  ? 'bg-[#00dbe9]/20 text-[#00dbe9] border-[#00dbe9]/30 font-bold'
                  : 'bg-[#849495]/20 text-[#849495] border-[#849495]/30 font-bold';

              // Status styling
              let statusText = <span className="text-[#ffb4ab]">Open</span>;
              if (alert.status === 'reviewing') {
                statusText = <span className="text-[#ffe179]">Reviewing</span>;
              } else if (alert.status === 'pending') {
                statusText = <span className="text-[#849495]">Pending</span>;
              } else if (alert.status === 'auto-closed') {
                statusText = <span className="text-[#00dbe9]">Closed</span>;
              }

              return (
                <tr
                  key={alert.id}
                  onClick={() => onSelectAlert(alert)}
                  className="hover:bg-[#2d3449]/60 transition-colors cursor-pointer group"
                >
                  <td className="py-2.5 pl-4 text-[#849495] text-[10px]">
                    {alert.timestamp.split(' ')[1] || alert.timestamp}
                  </td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded text-[9px] border uppercase ${tagStyle}`}>
                      {alert.severity}
                    </span>
                  </td>
                  <td className="py-2.5 font-bold text-[#dae2fd] group-hover:text-[#00dbe9] transition-colors">
                    {alert.sourceIp}
                  </td>
                  <td className="py-2.5 text-[#dae2fd]">
                    <div className="flex items-center gap-2">
                      <span>{alert.eventType}</span>
                      {alert.relatedEventsCount > 1 && (
                        <span className="text-[9px] text-[#849495] bg-[#060e20] px-1 py-0.2 rounded border border-[#3b494b]">
                          x{alert.relatedEventsCount}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 pr-4">
                    {statusText}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
