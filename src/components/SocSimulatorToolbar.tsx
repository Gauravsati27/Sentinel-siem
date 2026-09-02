import React, { useState } from 'react';

interface SocSimulatorToolbarProps {
  onInjectAttack: (scenarioId: string) => void;
  isLive: boolean;
  setIsLive: (live: boolean) => void;
  streamSpeed: number;
  setStreamSpeed: (speed: number) => void;
  totalLogsCount: number;
}

export const SocSimulatorToolbar: React.FC<SocSimulatorToolbarProps> = ({
  onInjectAttack,
  isLive,
  setIsLive,
  streamSpeed,
  setStreamSpeed,
  totalLogsCount
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="fixed bottom-20 md:bottom-4 right-4 z-40 select-none">
      <div className="bg-[#171f33]/95 backdrop-blur-md border border-[#3b494b] rounded shadow-2xl p-3 max-w-xs sm:max-w-sm transition-all duration-300">
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#3b494b]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00dbe9] animate-pulse" />
            <span className="font-mono text-xs font-bold text-[#dae2fd] uppercase tracking-wider">
              SOC Traffic Simulator
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-[#849495] hover:text-[#dae2fd] p-1 rounded hover:bg-[#2d3449] transition-colors"
              title={isCollapsed ? 'Expand' : 'Minimize'}
            >
              <span className="material-symbols-outlined text-[16px]">
                {isCollapsed ? 'expand_less' : 'expand_more'}
              </span>
            </button>
          </div>
        </div>

        {!isCollapsed && (
          <div className="space-y-3 pt-2 font-mono text-xs">
            {/* Live Stream Engine Status */}
            <div className="flex items-center justify-between text-[11px] text-[#849495]">
              <span>Ingested Events:</span>
              <span className="text-[#00dbe9] font-bold">{totalLogsCount.toLocaleString()}</span>
            </div>

            {/* Ingestion Speed Controls */}
            <div className="space-y-1">
              <span className="text-[10px] text-[#849495] uppercase font-bold">Stream Pace:</span>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { label: 'Normal (3s)', speed: 3000 },
                  { label: 'Fast (1s)', speed: 1000 },
                  { label: 'Burst (500ms)', speed: 500 }
                ].map((item) => (
                  <button
                    key={item.speed}
                    onClick={() => {
                      setStreamSpeed(item.speed);
                      if (!isLive) setIsLive(true);
                    }}
                    className={`py-1 px-1.5 rounded text-[10px] text-center border transition-all ${
                      streamSpeed === item.speed && isLive
                        ? 'bg-[#00dbe9]/20 border-[#00dbe9] text-[#00dbe9] font-bold'
                        : 'bg-[#0b1326] border-[#3b494b] text-[#849495] hover:text-[#dae2fd]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Attack Surge Triggers */}
            <div className="space-y-1">
              <span className="text-[10px] text-[#ffb4ab] uppercase font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">bolt</span>
                Inject Attack Vector:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => onInjectAttack('attack_ssh_brute')}
                  className="p-1.5 rounded bg-[#ffb4ab]/10 hover:bg-[#ffb4ab]/20 border border-[#ffb4ab]/30 text-[#ffb4ab] text-[10px] text-left transition-all active:scale-95"
                >
                  <div className="font-bold">SSH Brute Storm</div>
                  <div className="text-[9px] text-[#849495]">RU: 185.17.43.99</div>
                </button>

                <button
                  onClick={() => onInjectAttack('attack_sqli_wave')}
                  className="p-1.5 rounded bg-[#ffb4ab]/10 hover:bg-[#ffb4ab]/20 border border-[#ffb4ab]/30 text-[#ffb4ab] text-[10px] text-left transition-all active:scale-95"
                >
                  <div className="font-bold">SQL Injection</div>
                  <div className="text-[9px] text-[#849495]">BR: 91.200.12.5</div>
                </button>

                <button
                  onClick={() => onInjectAttack('attack_dotfile_crawler')}
                  className="p-1.5 rounded bg-[#ffe179]/10 hover:bg-[#ffe179]/20 border border-[#ffe179]/30 text-[#ffe179] text-[10px] text-left transition-all active:scale-95"
                >
                  <div className="font-bold">Dotfile Recon</div>
                  <div className="text-[9px] text-[#849495]">VN: 103.245.236.1</div>
                </button>

                <button
                  onClick={() => onInjectAttack('attack_port_sweep')}
                  className="p-1.5 rounded bg-[#ffe179]/10 hover:bg-[#ffe179]/20 border border-[#ffe179]/30 text-[#ffe179] text-[10px] text-left transition-all active:scale-95"
                >
                  <div className="font-bold">Port Sweep</div>
                  <div className="text-[9px] text-[#849495]">CN: 45.22.19.112</div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
