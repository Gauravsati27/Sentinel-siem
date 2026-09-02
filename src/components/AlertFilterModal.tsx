import React from 'react';
import { SeverityLevel, AlertStatus } from '../types';

interface AlertFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSeverity: SeverityLevel | 'all';
  setSelectedSeverity: (s: SeverityLevel | 'all') => void;
  selectedStatus: AlertStatus | 'all';
  setSelectedStatus: (st: AlertStatus | 'all') => void;
  onReset: () => void;
}

export const AlertFilterModal: React.FC<AlertFilterModalProps> = ({
  isOpen,
  onClose,
  selectedSeverity,
  setSelectedSeverity,
  selectedStatus,
  setSelectedStatus,
  onReset
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#060e20]/80 backdrop-blur-xs p-4 select-none">
      <div className="w-full max-w-md bg-[#171f33] border border-[#3b494b] rounded shadow-2xl p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-[#3b494b] pb-2">
          <div className="flex items-center gap-2 font-mono text-sm font-bold text-[#dae2fd]">
            <span className="material-symbols-outlined text-[#00dbe9] text-[18px]">tune</span>
            <span>Filter Live Alerts Stream</span>
          </div>
          <button
            onClick={onClose}
            className="text-[#849495] hover:text-[#dae2fd] p-1 rounded hover:bg-[#2d3449] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Severity Filter */}
        <div className="space-y-1.5 font-mono">
          <label className="text-xs font-bold text-[#849495] uppercase">Severity Level</label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {(['all', 'critical', 'high', 'medium', 'low'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`py-1.5 px-3 rounded border text-left flex items-center justify-between transition-all ${
                  selectedSeverity === sev
                    ? 'bg-[#00dbe9]/20 border-[#00dbe9] text-[#00dbe9] font-bold'
                    : 'bg-[#0b1326] border-[#3b494b] text-[#dae2fd] hover:border-[#849495]'
                }`}
              >
                <span className="uppercase">{sev}</span>
                {selectedSeverity === sev && (
                  <span className="material-symbols-outlined text-[14px]">check</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-1.5 font-mono">
          <label className="text-xs font-bold text-[#849495] uppercase">Incident Status</label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {(['all', 'open', 'reviewing', 'pending', 'auto-closed'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`py-1.5 px-3 rounded border text-left flex items-center justify-between transition-all ${
                  selectedStatus === st
                    ? 'bg-[#00dbe9]/20 border-[#00dbe9] text-[#00dbe9] font-bold'
                    : 'bg-[#0b1326] border-[#3b494b] text-[#dae2fd] hover:border-[#849495]'
                }`}
              >
                <span className="capitalize">{st.replace('-', ' ')}</span>
                {selectedStatus === st && (
                  <span className="material-symbols-outlined text-[14px]">check</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-3 border-t border-[#3b494b] font-mono">
          <button
            onClick={() => {
              onReset();
              onClose();
            }}
            className="text-xs text-[#849495] hover:text-[#00dbe9] transition-colors"
          >
            Reset Filters
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#00dbe9] text-[#00363a] font-bold rounded text-xs hover:bg-[#7df4ff] transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};
