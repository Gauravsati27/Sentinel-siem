import React, { useState } from 'react';
import { ThreatGeoNode, AttackingIP } from '../types';

interface GlobalThreatMapProps {
  nodes: ThreatGeoNode[];
  onSelectNode?: (node: ThreatGeoNode) => void;
  onInvestigateIp?: (ipStr: string) => void;
}

export const GlobalThreatMap: React.FC<GlobalThreatMapProps> = ({
  nodes,
  onSelectNode,
  onInvestigateIp
}) => {
  const [activeHoverNode, setActiveHoverNode] = useState<ThreatGeoNode | null>(null);
  const mapImage =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBottgwzFGd51wUlNdBluY5aVCfvpWChtj2te5O6qZ46QQZB2DUO2AHr7vFm81imbaove9ES4P7j0szx_0FQqMU7su_KVufqPZ45Obdeky2TUztu718bIrunQeMejfryod_Cw8LLcwGrGEBcLTPdyTYEcr-AenjLL85H0oGgIV1P0XbApP-nnlI8QXmb9_WnzZcenTMdnvnSzqo-XxUPvc6tlhGm2SsEtTn7vf4FOkoT8PPbR_8K31H';

  return (
    <div className="bg-[#171f33] border border-[#3b494b] rounded flex flex-col min-h-[260px] lg:h-auto select-none overflow-hidden">
      {/* Header */}
      <div className="bg-[#2d3449] px-4 py-2 border-b border-[#3b494b] flex justify-between items-center">
        <h2 className="text-[11px] font-mono uppercase text-[#849495] tracking-widest flex items-center gap-2">
          <span>Global Threat Origin Matrix</span>
        </h2>

        <div className="flex items-center gap-2 font-mono text-[10px] text-[#ffb4ab]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab] animate-ping" />
          <span>890 ATK/SEC</span>
        </div>
      </div>

      {/* Map Canvas Container */}
      <div className="flex-1 bg-[#060e20] relative overflow-hidden flex items-center justify-center min-h-[190px]">
        {/* Dark stylized world map background with fallback mix-blend */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-screen"
          style={{ backgroundImage: `url('${mapImage}')` }}
        />

        {/* Cyber Matrix Coordinate overlay lines */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060e20] via-transparent to-transparent opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#060e20]/50 via-transparent to-[#060e20]/50" />

        {/* Vector SVG Attack Beams connecting origin nodes to target center (SOC HQ in US/LAN) */}
        <svg className="w-full h-full absolute inset-0 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Beams */}
          <path
            d="M62,32 Q40,15 22,42"
            fill="none"
            stroke="#ffb4ab"
            strokeWidth="0.8"
            strokeDasharray="2,2"
            className="opacity-70 animate-pulse"
          />
          <path
            d="M78,44 Q50,25 22,42"
            fill="none"
            stroke="#ffe179"
            strokeWidth="0.8"
            strokeDasharray="2,2"
            className="opacity-60"
          />
          <path
            d="M34,74 Q25,55 22,42"
            fill="none"
            stroke="#00dbe9"
            strokeWidth="0.8"
            strokeDasharray="2,2"
            className="opacity-50"
          />
          {/* Target HQ node (US) */}
          <circle cx="22" cy="42" r="2" fill="#00dbe9" className="shadow-[0_0_10px_#00dbe9]" />
        </svg>

        {/* Threat Origin Pulsing Hubs */}
        {nodes.map((node) => {
          const colorClass =
            node.severity === 'critical'
              ? 'bg-[#ffb4ab] text-[#ffb4ab]'
              : node.severity === 'high'
              ? 'bg-[#ffe179] text-[#ffe179]'
              : 'bg-[#00dbe9] text-[#00dbe9]';

          return (
            <div
              key={node.id}
              onClick={() => {
                onSelectNode?.(node);
                if (onInvestigateIp) onInvestigateIp(node.activeIp);
              }}
              onMouseEnter={() => setActiveHoverNode(node)}
              onMouseLeave={() => setActiveHoverNode(null)}
              style={{ left: `${node.xPercent}%`, top: `${node.yPercent}%` }}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
            >
              {/* Outer pulsing ring */}
              <div
                className={`w-5 h-5 rounded-full ${colorClass.split(' ')[0]} opacity-30 animate-ping absolute -inset-1`}
              />
              {/* Core Node */}
              <div
                className={`w-3 h-3 rounded-full ${colorClass.split(' ')[0]} border border-[#060e20] shadow-[0_0_10px_currentColor] relative flex items-center justify-center`}
              >
                <div className="w-1 h-1 rounded-full bg-[#060e20]" />
              </div>
            </div>
          );
        })}

        {/* Hover Info Tooltip */}
        {activeHoverNode && (
          <div
            className="absolute z-30 pointer-events-none bg-[#171f33]/95 backdrop-blur-md border border-[#00dbe9]/60 rounded p-2 shadow-2xl font-mono text-xs transform -translate-x-1/2 -translate-y-full mb-3"
            style={{ left: `${activeHoverNode.xPercent}%`, top: `${activeHoverNode.yPercent}%` }}
          >
            <div className="flex items-center justify-between gap-3 text-[#00dbe9] font-bold text-[11px] pb-1 border-b border-[#3b494b]">
              <span>{activeHoverNode.name}</span>
              <span className="text-[10px] px-1 py-0.5 rounded bg-[#060e20] text-[#ffb4ab]">
                {activeHoverNode.alertCount.toLocaleString()} hits
              </span>
            </div>
            <div className="text-[10px] text-[#dae2fd] mt-1">IP: {activeHoverNode.activeIp}</div>
            <div className="text-[9px] text-[#ffe179] mt-0.5">Vector: {activeHoverNode.attackType}</div>
          </div>
        )}

        {/* HUD Telemetry Overlay in Corner */}
        <div className="absolute top-2 left-2.5 z-10 pointer-events-none hidden sm:block bg-[#060e20]/80 border border-[#3b494b]/60 rounded px-2 py-1 text-[9px] font-mono text-[#849495] space-y-0.5 backdrop-blur-xs">
          <div className="text-[#00dbe9] font-bold">MISSION: ACTIVE MONITORING</div>
          <div>REGION 1: RU (35%)</div>
          <div>REGION 2: CN (28%)</div>
          <div>REGION 3: BR (16%)</div>
        </div>

        {/* Center Label (from HTML template) */}
        <div className="absolute bottom-2 right-2.5 z-10 flex items-center gap-1.5 bg-[#060e20]/80 px-2 py-0.5 rounded border border-[#3b494b]/50">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00dbe9] animate-pulse" />
          <span className="font-mono text-[10px] text-[#849495] font-bold">
            Telemetry Matrix
          </span>
        </div>
      </div>
    </div>
  );
};
