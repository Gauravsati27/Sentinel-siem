import React from 'react';
import { AttackingIP } from '../types';

interface TopAttackingIpsTableProps {
  ips: AttackingIP[];
  onInvestigate: (ip: AttackingIP) => void;
  onBlockIp?: (ip: string) => void;
}

export const TopAttackingIpsTable: React.FC<TopAttackingIpsTableProps> = ({
  ips,
  onInvestigate,
  onBlockIp
}) => {
  return (
    <div className="bg-[#171f33] border border-[#3b494b] rounded flex flex-col overflow-hidden flex-1 select-none">
      {/* Header */}
      <div className="bg-[#2d3449] px-4 py-2 border-b border-[#3b494b] flex justify-between items-center">
        <h2 className="text-[11px] font-mono uppercase text-[#849495] tracking-widest">
          Top Attacking IPs
        </h2>
        <span className="text-[10px] font-mono text-[#00dbe9]">
          AUTO-QUARANTINE
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="text-[#849495] border-b border-[#3b494b] uppercase text-[9px] font-mono">
              <th className="py-2 pl-4">Source IP</th>
              <th className="py-2">Origin</th>
              <th className="py-2 text-right">Count</th>
              <th className="py-2 text-center pr-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3b494b]/40 font-mono text-[11px] text-[#dae2fd]">
            {ips.slice(0, 5).map((item, index) => {
              const ipColor =
                index === 0
                  ? 'text-[#ffb4ab]'
                  : index === 1
                  ? 'text-[#ffe179]'
                  : index === 2
                  ? 'text-[#00dbe9]'
                  : 'text-[#dae2fd]';

              const isBlocked = item.status === 'blocked';

              return (
                <tr
                  key={item.ip}
                  className="hover:bg-[#2d3449]/60 transition-colors group cursor-pointer"
                >
                  <td className={`py-2.5 pl-4 ${ipColor} font-bold flex items-center gap-2`}>
                    <span>{item.ip}</span>
                    {isBlocked && (
                      <span className="text-[9px] bg-[#93000a]/40 text-[#ffb4ab] px-1 py-0.2 rounded border border-[#ffb4ab]/30">
                        BLOCKED
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 text-[#849495] text-[10px]">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="text-[9px] px-1 py-0.2 rounded bg-[#060e20] border border-[#3b494b] text-[#dae2fd] font-bold">
                        {item.countryCode}
                      </span>
                      <span className="hidden sm:inline">{item.country}</span>
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-bold text-[#dae2fd]">
                    {item.count.toLocaleString()}
                  </td>
                  <td className="py-2.5 text-center pr-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onInvestigate(item);
                        }}
                        className="px-2 py-0.5 border border-[#3b494b] rounded text-[10px] text-[#dae2fd] hover:border-[#00dbe9] hover:text-[#00dbe9] transition-all bg-[#060e20]"
                      >
                        Triage
                      </button>
                      {onBlockIp && !isBlocked && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onBlockIp(item.ip);
                          }}
                          className="px-1.5 py-0.5 border border-[#ffb4ab]/40 text-[#ffb4ab] rounded text-[10px] hover:bg-[#93000a]/30 transition-all bg-[#060e20]"
                          title="Block IP in Firewall"
                        >
                          Ban
                        </button>
                      )}
                    </div>
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
