import React from 'react';
import { SeverityLevel } from '../types';

interface AlertSeverityDiamondProps {
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount?: number;
  onSelectSeverity?: (severity: SeverityLevel | 'all') => void;
  selectedSeverity?: SeverityLevel | 'all';
}

export const AlertSeverityDiamond: React.FC<AlertSeverityDiamondProps> = ({
  criticalCount,
  highCount,
  mediumCount,
  lowCount = 28,
  onSelectSeverity,
  selectedSeverity = 'all'
}) => {
  return (
    <div className="bg-[#171f33] border border-[#3b494b] p-4 rounded col-span-1 flex flex-col justify-between select-none">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[11px] font-mono uppercase text-[#849495] tracking-widest">
          Severity Distribution
        </h2>
        {selectedSeverity !== 'all' && (
          <button
            onClick={() => onSelectSeverity?.('all')}
            className="text-[10px] font-mono text-[#00dbe9] hover:underline"
          >
            Reset
          </button>
        )}
      </div>

      {/* Severity Rows List */}
      <div className="flex flex-col gap-2">
        {/* Critical */}
        <div
          onClick={() => onSelectSeverity?.(selectedSeverity === 'critical' ? 'all' : 'critical')}
          className={`flex justify-between items-center bg-[#2d3449] p-2 rounded border-l-4 border-[#ffb4ab] cursor-pointer hover:bg-[#3b494b]/50 transition-all ${
            selectedSeverity === 'critical' ? 'ring-1 ring-[#ffb4ab]' : ''
          }`}
        >
          <span className="text-[10px] font-mono text-[#dae2fd]">CRITICAL</span>
          <span className="font-bold text-sm text-[#ffb4ab] font-mono">
            {criticalCount < 10 ? `0${criticalCount}` : criticalCount}
          </span>
        </div>

        {/* High */}
        <div
          onClick={() => onSelectSeverity?.(selectedSeverity === 'high' ? 'all' : 'high')}
          className={`flex justify-between items-center bg-[#2d3449] p-2 rounded border-l-4 border-[#ffe179] cursor-pointer hover:bg-[#3b494b]/50 transition-all ${
            selectedSeverity === 'high' ? 'ring-1 ring-[#ffe179]' : ''
          }`}
        >
          <span className="text-[10px] font-mono text-[#dae2fd]">HIGH</span>
          <span className="font-bold text-sm text-[#ffe179] font-mono">{highCount}</span>
        </div>

        {/* Medium */}
        <div
          onClick={() => onSelectSeverity?.(selectedSeverity === 'medium' ? 'all' : 'medium')}
          className={`flex justify-between items-center bg-[#2d3449] p-2 rounded border-l-4 border-[#00dbe9] cursor-pointer hover:bg-[#3b494b]/50 transition-all ${
            selectedSeverity === 'medium' ? 'ring-1 ring-[#00dbe9]' : ''
          }`}
        >
          <span className="text-[10px] font-mono text-[#dae2fd]">MEDIUM</span>
          <span className="font-bold text-sm text-[#00dbe9] font-mono">{mediumCount}</span>
        </div>

        {/* Low */}
        <div
          onClick={() => onSelectSeverity?.(selectedSeverity === 'low' ? 'all' : 'low')}
          className={`flex justify-between items-center bg-[#2d3449] p-2 rounded border-l-4 border-[#849495] cursor-pointer hover:bg-[#3b494b]/50 transition-all ${
            selectedSeverity === 'low' ? 'ring-1 ring-[#849495]' : ''
          }`}
        >
          <span className="text-[10px] font-mono text-[#dae2fd]">LOW</span>
          <span className="font-bold text-sm text-[#849495] font-mono">{lowCount}</span>
        </div>
      </div>
    </div>
  );
};
