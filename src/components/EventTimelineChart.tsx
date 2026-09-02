import React, { useState } from 'react';

interface EventTimelineChartProps {
  onPointClick?: (pointInfo: string) => void;
}

export const EventTimelineChart: React.FC<EventTimelineChartProps> = ({ onPointClick }) => {
  const [selectedRange, setSelectedRange] = useState<'1H' | '24H' | '7D'>('24H');
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; time: string; events: string; note?: string } | null>(null);

  // SVG Area Paths for different time horizons
  const pathData: Record<'1H' | '24H' | '7D', { path: string; fill: string; startLabel: string; endLabel: string; peakLabel: string; timeSteps: string[] }> = {
    '1H': {
      path: 'M0,100 L0,70 Q15,40 30,65 T60,35 T85,75 L100,50 L100,100 Z',
      fill: 'M0,100 L0,70 Q15,40 30,65 T60,35 T85,75 L100,50 L100,100 Z',
      startLabel: '13:30',
      endLabel: '14:30',
      peakLabel: '120k EPS',
      timeSteps: ['13:30', '13:40', '13:50', '14:00', '14:10', '14:20', '14:30']
    },
    '24H': {
      path: 'M0,100 L0,80 Q10,70 20,85 T40,60 T60,90 T80,40 T100,50 L100,100 Z',
      fill: 'M0,100 L0,80 Q10,70 20,85 T40,60 T60,90 T80,40 T100,50 L100,100 Z',
      startLabel: '00:00',
      endLabel: '24:00',
      peakLabel: '100k EPS',
      timeSteps: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00']
    },
    '7D': {
      path: 'M0,100 L0,75 Q20,80 35,50 T70,45 T90,60 L100,40 L100,100 Z',
      fill: 'M0,100 L0,75 Q20,80 35,50 T70,45 T90,60 L100,40 L100,100 Z',
      startLabel: 'Mon',
      endLabel: 'Sun',
      peakLabel: '250k EPS',
      timeSteps: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    }
  };

  const current = pathData[selectedRange];

  return (
    <div className="bg-[#171f33] border border-[#3b494b] p-4 rounded col-span-1 md:col-span-2 flex flex-col justify-between select-none">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-[11px] font-mono uppercase text-[#849495] tracking-widest flex items-center gap-2">
          <span>Event Volume Timeline</span>
          <span className="text-[9px] text-[#00dbe9] bg-[#00dbe9]/10 px-1.5 py-0.5 rounded border border-[#00dbe9]/30">
            Realtime Telemetry
          </span>
        </h2>

        {/* Time Selector Buttons */}
        <div className="flex gap-1.5">
          {(['1H', '24H', '7D'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`px-2 py-0.5 rounded text-[9px] font-mono transition-all ${
                selectedRange === range
                  ? 'bg-[#00dbe9] text-[#0b1326] font-bold shadow-[0_0_8px_rgba(0,219,233,0.3)]'
                  : 'bg-[#3b494b] text-[#dae2fd] hover:bg-[#849495]/40'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="h-44 w-full bg-[#060e20] rounded border border-[#3b494b]/60 relative flex items-end overflow-hidden group">
        {/* Subtle grid lines */}
        <div className="absolute inset-0 grid grid-rows-4 grid-cols-6 pointer-events-none opacity-10">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="border-b border-r border-[#00dbe9]" />
          ))}
        </div>

        {/* Main SVG Area Line */}
        <svg
          className="w-full h-full absolute inset-0"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          <defs>
            <linearGradient id="areaGlowTech" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00dbe9" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#00dbe9" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path
            d={current.fill}
            fill="url(#areaGlowTech)"
          />
          <path
            d={current.path.replace(' Z', '')}
            fill="none"
            stroke="#00dbe9"
            strokeWidth="1.5"
          />
        </svg>

        {/* Highlighted Alert Point 1: Critical Spike (at 40%) */}
        <div
          onClick={() => onPointClick?.('Critical Spike at 14:32 - 185.17.43.99')}
          onMouseEnter={() => setHoveredPoint({ x: 40, y: 40, time: '14:32:01', events: '94,200 EPS', note: 'Critical: Multiple Failed Logins Spike' })}
          onMouseLeave={() => setHoveredPoint(null)}
          className="absolute bottom-[60%] left-[40%] cursor-pointer group/node"
        >
          <div className="w-3 h-3 -ml-1.5 -mb-1.5 rounded-full bg-[#ffb4ab] shadow-[0_0_12px_#ffb4ab] animate-ping opacity-75" />
          <div className="absolute inset-0 w-2 h-2 rounded-full bg-[#ffb4ab] shadow-[0_0_8px_#ffb4ab]" />
        </div>

        {/* Highlighted Alert Point 2: High Severity Surge (at 80%) */}
        <div
          onClick={() => onPointClick?.('High Port Scan at 14:30 - 45.22.19.112')}
          onMouseEnter={() => setHoveredPoint({ x: 80, y: 60, time: '14:30:12', events: '62,800 EPS', note: 'High: Port Scan Surge (SYN sweep)' })}
          onMouseLeave={() => setHoveredPoint(null)}
          className="absolute bottom-[40%] left-[80%] cursor-pointer group/node"
        >
          <div className="w-2.5 h-2.5 -ml-1.25 -mb-1.25 rounded-full bg-[#ffe179] shadow-[0_0_10px_#ffe179]" />
        </div>

        {/* Tooltip on Hover */}
        {hoveredPoint && (
          <div
            className="absolute z-30 pointer-events-none bg-[#171f33] border border-[#00dbe9] rounded px-2.5 py-1.5 shadow-2xl font-mono text-xs transform -translate-x-1/2 -translate-y-full mb-2"
            style={{ left: `${hoveredPoint.x}%`, top: `${hoveredPoint.y}%` }}
          >
            <div className="text-[#00dbe9] font-bold text-[11px] flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">analytics</span>
              {hoveredPoint.time}
            </div>
            <div className="text-[#dae2fd] text-[10px] mt-0.5">Rate: {hoveredPoint.events}</div>
            {hoveredPoint.note && (
              <div className="text-[#ffb4ab] text-[9px] mt-0.5 border-t border-[#3b494b] pt-0.5">
                {hoveredPoint.note}
              </div>
            )}
          </div>
        )}

        {/* Peak Label */}
        <div className="absolute top-2 left-2.5 font-mono text-[9px] text-[#849495] select-none">
          {current.peakLabel}
        </div>

        {/* Axis Timeline Steps */}
        <div className="absolute bottom-0 w-full flex justify-between px-2 text-[8px] font-mono text-[#849495] pb-1 border-t border-[#3b494b]/40">
          {current.timeSteps.map((step, idx) => (
            <span key={idx}>{step}</span>
          ))}
        </div>
      </div>
    </div>
  );
};
