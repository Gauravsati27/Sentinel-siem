import React from 'react';
import { SecurityAlert } from '../types';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: SecurityAlert[];
  onSelectAlert: (alert: SecurityAlert) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  alerts,
  onSelectAlert
}) => {
  if (!isOpen) return null;

  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const highAlerts = alerts.filter(a => a.severity === 'high');

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#060e20]/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-md bg-[#171f33] border-l border-[#3b494b] h-full shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#3b494b] flex justify-between items-center bg-[#0b1326]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00dbe9] text-[20px]">notifications</span>
            <h3 className="font-mono text-sm font-bold text-[#dae2fd]">
              Incident Escalation Dispatch
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#849495] hover:text-[#dae2fd] p-1 rounded hover:bg-[#2d3449] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
          <div className="text-[10px] text-[#ffb4ab] font-bold uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab] animate-ping" />
            Critical Threat Incidents ({criticalAlerts.length})
          </div>

          {criticalAlerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => {
                onSelectAlert(alert);
                onClose();
              }}
              className="p-3 rounded bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 hover:bg-[#ffb4ab]/20 transition-all cursor-pointer space-y-1.5"
            >
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#ffb4ab] text-[#690005]">
                  CRITICAL
                </span>
                <span className="text-[10px] text-[#849495]">{alert.timestamp.split(' ')[1]}</span>
              </div>
              <div className="font-bold text-[#dae2fd] text-xs">
                {alert.eventType}
              </div>
              <div className="flex justify-between text-[11px] text-[#849495]">
                <span className="text-[#00dbe9]">{alert.sourceIp}</span>
                <span>{alert.country}</span>
              </div>
            </div>
          ))}

          <div className="text-[10px] text-[#ffe179] font-bold uppercase tracking-wider pt-3 border-t border-[#3b494b]">
            High Priority Alerts ({highAlerts.length})
          </div>

          {highAlerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => {
                onSelectAlert(alert);
                onClose();
              }}
              className="p-3 rounded bg-[#2d3449] border border-[#3b494b] hover:border-[#ffe179]/50 transition-all cursor-pointer space-y-1"
            >
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#ffe179]/20 text-[#ffe179]">
                  HIGH
                </span>
                <span className="text-[10px] text-[#849495]">{alert.timestamp.split(' ')[1]}</span>
              </div>
              <div className="font-bold text-[#dae2fd] text-xs">
                {alert.eventType}
              </div>
              <div className="flex justify-between text-[11px] text-[#849495]">
                <span className="text-[#00dbe9]">{alert.sourceIp}</span>
                <span>{alert.country}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#3b494b] bg-[#0b1326] text-center font-mono">
          <button
            onClick={onClose}
            className="w-full py-2 bg-[#2d3449] hover:bg-[#3b494b] text-[#dae2fd] text-xs rounded transition-colors"
          >
            Dismiss Dispatch
          </button>
        </div>
      </div>
    </div>
  );
};
