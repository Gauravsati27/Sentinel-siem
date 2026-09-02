import React, { useState } from 'react';
import { SecurityAlert, SeverityLevel, AlertStatus } from '../types';

interface AlertsTriageViewProps {
  alerts: SecurityAlert[];
  onSelectAlert: (alert: SecurityAlert) => void;
  onUpdateStatus: (alertId: string, status: AlertStatus) => void;
  onBlockIp: (ip: string) => void;
}

export const AlertsTriageView: React.FC<AlertsTriageViewProps> = ({
  alerts,
  onSelectAlert,
  onUpdateStatus,
  onBlockIp
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityLevel | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'board' | 'list'>('board');

  const filtered = alerts.filter((a) => {
    if (selectedSeverity !== 'all' && a.severity !== selectedSeverity) return false;
    return true;
  });

  const columns: { id: AlertStatus; title: string; icon: string; color: string }[] = [
    { id: 'open', title: 'Open / Unassigned', icon: 'warning', color: 'text-[#ffb4ab] border-t-[#ffb4ab]' },
    { id: 'reviewing', title: 'Under Investigation', icon: 'visibility', color: 'text-[#ffe179] border-t-[#ffe179]' },
    { id: 'pending', title: 'Pending Response', icon: 'pending', color: 'text-[#7df4ff] border-t-[#7df4ff]' },
    { id: 'auto-closed', title: 'Closed & Mitigated', icon: 'check_circle', color: 'text-[#849495] border-t-[#849495]' }
  ];

  return (
    <div className="space-y-4 select-none">
      {/* Top Banner */}
      <div className="p-4 bg-[#171f33] border border-[#3b494b] rounded flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ffb4ab] text-[22px]">notifications_active</span>
            <h2 className="font-mono text-base font-bold text-[#dae2fd]">
              SOC Incident Triage & Response Board
            </h2>
          </div>
          <p className="text-xs text-[#849495] font-mono mt-1">
            Correlated alerts flagged by Sentinel's sliding-window detection engine across attack vectors.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {/* Severity tabs */}
          <div className="flex gap-1 font-mono text-xs">
            {(['all', 'critical', 'high', 'medium', 'low'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-2.5 py-1 rounded uppercase font-bold transition-all ${
                  selectedSeverity === sev
                    ? 'bg-[#00dbe9]/20 border border-[#00dbe9] text-[#00dbe9]'
                    : 'bg-[#0b1326] border border-[#3b494b] text-[#849495] hover:text-[#dae2fd]'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          <div className="w-[1px] h-6 bg-[#3b494b]" />

          {/* View switcher */}
          <div className="flex bg-[#0b1326] border border-[#3b494b] rounded p-0.5">
            <button
              onClick={() => setActiveTab('board')}
              className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${
                activeTab === 'board' ? 'bg-[#2d3449] text-[#00dbe9]' : 'text-[#849495]'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">view_kanban</span>
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${
                activeTab === 'list' ? 'bg-[#2d3449] text-[#00dbe9]' : 'text-[#849495]'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">table_rows</span>
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board Layout */}
      {activeTab === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {columns.map((col) => {
            const colAlerts = filtered.filter((a) => a.status === col.id);
            return (
              <div
                key={col.id}
                className={`rounded p-3 flex flex-col gap-3 bg-[#171f33] border border-[#3b494b] border-t-2 ${col.color}`}
              >
                {/* Column Header */}
                <div className="flex justify-between items-center pb-2 border-b border-[#3b494b]">
                  <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#dae2fd]">
                    <span className="material-symbols-outlined text-[16px]">{col.icon}</span>
                    <span>{col.title}</span>
                  </div>
                  <span className="text-[10px] font-mono bg-[#0b1326] px-1.5 py-0.5 rounded text-[#849495] border border-[#3b494b]">
                    {colAlerts.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-2.5 overflow-y-auto max-h-[650px] pr-1 font-mono">
                  {colAlerts.length === 0 ? (
                    <div className="p-4 text-center text-xs text-[#849495]/50 border border-dashed border-[#3b494b] rounded">
                      No incidents in this queue
                    </div>
                  ) : (
                    colAlerts.map((alert) => {
                      const sevBadge =
                        alert.severity === 'critical'
                          ? 'bg-[#ffb4ab]/10 text-[#ffb4ab] border-[#ffb4ab]/30'
                          : alert.severity === 'high'
                          ? 'bg-[#ffe179]/10 text-[#ffe179] border-[#ffe179]/30'
                          : 'bg-[#00dbe9]/10 text-[#00dbe9] border-[#00dbe9]/30';

                      return (
                        <div
                          key={alert.id}
                          onClick={() => onSelectAlert(alert)}
                          className="bg-[#2d3449] hover:bg-[#3b494b] p-3 rounded border border-[#3b494b] hover:border-[#00dbe9]/50 transition-all cursor-pointer space-y-2"
                        >
                          <div className="flex justify-between items-start">
                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${sevBadge}`}>
                              {alert.severity}
                            </span>
                            <span className="text-[10px] font-mono text-[#849495]">
                              {alert.timestamp.split(' ')[1]}
                            </span>
                          </div>

                          <div className="font-mono text-xs font-bold text-[#dae2fd] line-clamp-2">
                            {alert.eventType}
                          </div>

                          <div className="flex items-center justify-between text-[11px] font-mono text-[#849495] pt-1 border-t border-[#3b494b]">
                            <span className="text-[#00dbe9]">{alert.sourceIp}</span>
                            <span className="text-[10px]">{alert.countryCode}</span>
                          </div>

                          {/* Quick Workflow Action Dropdown */}
                          <div className="flex justify-between items-center pt-1" onClick={(e) => e.stopPropagation()}>
                            <span className="text-[10px] text-[#849495]">Move status:</span>
                            <select
                              value={alert.status}
                              onChange={(e) => onUpdateStatus(alert.id, e.target.value as AlertStatus)}
                              className="bg-[#0b1326] border border-[#3b494b] text-[10px] font-mono text-[#dae2fd] rounded px-1.5 py-0.5 focus:outline-none focus:border-[#00dbe9]"
                            >
                              <option value="open">Open</option>
                              <option value="reviewing">Reviewing</option>
                              <option value="pending">Pending</option>
                              <option value="auto-closed">Closed</option>
                            </select>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-[#171f33] rounded overflow-hidden border border-[#3b494b]">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-[#0b1326] border-b border-[#3b494b] text-[#849495] text-[10px] uppercase">
                  <th className="py-2.5 pl-3">ID & Time</th>
                  <th className="py-2.5">Severity</th>
                  <th className="py-2.5">Threat Vector</th>
                  <th className="py-2.5">Source IP</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5 pr-3 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3b494b] text-[#dae2fd]">
                {filtered.map((alert) => (
                  <tr
                    key={alert.id}
                    onClick={() => onSelectAlert(alert)}
                    className="hover:bg-[#2d3449] cursor-pointer transition-colors"
                  >
                    <td className="py-2 pl-3 text-[#849495] text-[11px]">
                      <div className="font-bold text-[#dae2fd]">{alert.id}</div>
                      <div>{alert.timestamp}</div>
                    </td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        alert.severity === 'critical' ? 'text-[#ffb4ab] bg-[#ffb4ab]/10 border border-[#ffb4ab]/30' : 'text-[#ffe179] bg-[#ffe179]/10 border border-[#ffe179]/30'
                      }`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="py-2 font-bold text-[#dae2fd]">
                      {alert.eventType}
                    </td>
                    <td className="py-2 text-[#00dbe9]">{alert.sourceIp}</td>
                    <td className="py-2">
                      <span className="capitalize">{alert.status}</span>
                    </td>
                    <td className="py-2 pr-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onBlockIp(alert.sourceIp)}
                        className="px-2 py-0.5 border border-[#ffb4ab]/40 text-[#ffb4ab] rounded text-[10px] hover:bg-[#ffb4ab]/20 transition-colors"
                      >
                        Mitigate IP
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
