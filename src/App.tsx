import React, { useState, useEffect, useCallback } from 'react';
import {
  ActiveTab,
  LogEvent,
  SecurityAlert,
  AttackingIP,
  ThreatGeoNode,
  DetectionRule,
  SiemMetrics,
  SeverityLevel,
  AlertStatus
} from './types';
import {
  INITIAL_METRICS,
  INITIAL_ALERTS,
  INITIAL_ATTACKING_IPS,
  INITIAL_GEO_NODES,
  INITIAL_DETECTION_RULES,
  INITIAL_LOGS
} from './data/mockSiemData';
import { TopAppBar } from './components/TopAppBar';
import { SideNav } from './components/SideNav';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { LogStreamView } from './components/LogStreamView';
import { AlertsTriageView } from './components/AlertsTriageView';
import { RuleEngineView } from './components/RuleEngineView';
import { ThreatIntelView } from './components/ThreatIntelView';
import { InvestigateModal } from './components/InvestigateModal';
import { AlertFilterModal } from './components/AlertFilterModal';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { SocSimulatorToolbar } from './components/SocSimulatorToolbar';
import {
  generateSyntheticAttackBatch,
  getGeoForIp,
  evaluateDetectionRules
} from './utils/detectionEngine';

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState('Last 24h');

  // Core SIEM State
  const [metrics, setMetrics] = useState<SiemMetrics>(INITIAL_METRICS);
  const [alerts, setAlerts] = useState<SecurityAlert[]>(INITIAL_ALERTS);
  const [logs, setLogs] = useState<LogEvent[]>(INITIAL_LOGS);
  const [attackingIps, setAttackingIps] = useState<AttackingIP[]>(INITIAL_ATTACKING_IPS);
  const [geoNodes, setGeoNodes] = useState<ThreatGeoNode[]>(INITIAL_GEO_NODES);
  const [detectionRules, setDetectionRules] = useState<DetectionRule[]>(INITIAL_DETECTION_RULES);

  // Simulation controls
  const [isLive, setIsLive] = useState(true);
  const [streamSpeed, setStreamSpeed] = useState(3000); // 3 seconds per simulated event

  // Modal / Drawer States
  const [investigateTarget, setInvestigateTarget] = useState<{
    alert?: SecurityAlert;
    ipData?: AttackingIP;
  } | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Filter criteria
  const [filterSeverity, setFilterSeverity] = useState<SeverityLevel | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<AlertStatus | 'all'>('all');

  // Background Live Stream Simulation Tick
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const isSuspicious = Math.random() < 0.25;

      const randomIps = [
        '185.17.43.99',
        '45.22.19.112',
        '91.200.12.5',
        '194.26.29.11',
        '103.245.236.1',
        '192.168.1.105',
        '172.16.0.44',
        '10.0.1.52'
      ];
      const selectedIp = randomIps[Math.floor(Math.random() * randomIps.length)];
      const geo = getGeoForIp(selectedIp);

      const endpoints = [
        '/api/v1/auth/token',
        '/dashboard/overview',
        '/admin/login',
        '/users/profile',
        '/.env',
        '/static/bundle.js',
        '/api/v2/catalog?id=1'
      ];
      const selectedEndpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
      const statusCode = isSuspicious
        ? [401, 403, 404, 500][Math.floor(Math.random() * 4)]
        : 200;

      const newLog: LogEvent = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: nowStr,
        sourceIp: selectedIp,
        destinationIp: '10.0.1.80',
        method: selectedEndpoint.includes('login') || selectedEndpoint.includes('token') ? 'POST' : 'GET',
        endpoint: selectedEndpoint,
        statusCode,
        userAgent: isSuspicious ? 'python-requests/2.28' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        bytes: Math.floor(200 + Math.random() * 4000),
        rawMessage: `${selectedIp} - - [${nowStr}] "${selectedEndpoint.includes('login') ? 'POST' : 'GET'} ${selectedEndpoint} HTTP/1.1" ${statusCode} 512 "-" "LiveStreamAgent"`,
        logType: 'nginx',
        country: geo.country,
        countryCode: geo.countryCode,
        isAnomaly: isSuspicious
      };

      setLogs((prev) => [newLog, ...prev.slice(0, 199)]);

      // Update metrics
      setMetrics((prev) => ({
        ...prev,
        totalEvents: prev.totalEvents + Math.floor(10 + Math.random() * 25)
      }));

      // If suspicious and from top IP, increment counter
      if (isSuspicious) {
        setAttackingIps((prev) =>
          prev.map((item) =>
            item.ip === selectedIp ? { ...item, count: item.count + 1 } : item
          )
        );
      }
    }, streamSpeed);

    return () => clearInterval(interval);
  }, [isLive, streamSpeed]);

  // Inject Attack Surge Handler
  const handleInjectAttack = useCallback((scenarioId: string) => {
    const { logs: newLogs, alerts: newAlerts } = generateSyntheticAttackBatch(scenarioId);

    setLogs((prev) => [...newLogs, ...prev.slice(0, 200)]);
    if (newAlerts.length > 0) {
      setAlerts((prev) => [...newAlerts, ...prev]);
      setMetrics((prev) => ({
        ...prev,
        activeAlerts: prev.activeAlerts + newAlerts.length,
        criticalAlerts: prev.criticalAlerts + newAlerts.filter((a) => a.severity === 'critical').length
      }));
    }
  }, []);

  // IP Block / Quarantine Handler
  const handleBlockIp = useCallback((ipToBlock: string) => {
    setAttackingIps((prev) => {
      const exists = prev.some((item) => item.ip === ipToBlock);
      if (exists) {
        return prev.map((item) =>
          item.ip === ipToBlock ? { ...item, status: 'blocked' as const } : item
        );
      } else {
        const geo = getGeoForIp(ipToBlock);
        return [
          {
            ip: ipToBlock,
            country: geo.country,
            countryCode: geo.countryCode,
            count: 1,
            attackType: 'Manual Quarantine',
            riskScore: 90,
            status: 'blocked' as const
          },
          ...prev
        ];
      }
    });

    setAlerts((prev) =>
      prev.map((a) => (a.sourceIp === ipToBlock ? { ...a, blocked: true, status: 'reviewing' } : a))
    );

    setMetrics((prev) => ({
      ...prev,
      blockedIps: prev.blockedIps + 1
    }));
  }, []);

  // IP Unblock Handler
  const handleUnblockIp = useCallback((ipToUnblock: string) => {
    setAttackingIps((prev) =>
      prev.map((item) =>
        item.ip === ipToUnblock ? { ...item, status: 'active' as const } : item
      )
    );
    setAlerts((prev) =>
      prev.map((a) => (a.sourceIp === ipToUnblock ? { ...a, blocked: false } : a))
    );
  }, []);

  // Update Alert Status
  const handleUpdateAlertStatus = useCallback((alertId: string, newStatus: AlertStatus) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: newStatus } : a))
    );
  }, []);

  // Toggle SIEM Rule
  const handleToggleRule = useCallback((ruleId: string) => {
    setDetectionRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
    );
  }, []);

  // Ingest manual logs
  const handleIngestNewLogs = useCallback((newLogs: LogEvent[], newAlerts: SecurityAlert[]) => {
    setLogs((prev) => [...newLogs, ...prev]);
    if (newAlerts.length > 0) {
      setAlerts((prev) => [...newAlerts, ...prev]);
      setMetrics((prev) => ({
        ...prev,
        activeAlerts: prev.activeAlerts + newAlerts.length,
        criticalAlerts: prev.criticalAlerts + newAlerts.filter((a) => a.severity === 'critical').length
      }));
    }
  }, []);

  const unreadAlertsCount = alerts.filter(
    (a) => a.severity === 'critical' && a.status === 'open'
  ).length;

  return (
    <div className="min-h-screen bg-[#0b1326] text-[#dae2fd] font-sans antialiased">
      {/* 1. Fixed Top Application Bar */}
      <TopAppBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        isLive={isLive}
        setIsLive={setIsLive}
        alerts={alerts}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenQuickAttack={() => handleInjectAttack('attack_ssh_brute')}
      />

      {/* 2. Side Navigation (Desktop) */}
      <SideNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadAlertsCount={unreadAlertsCount}
      />

      {/* 3. Main Workspace Content Area */}
      <main className="md:pl-16 pt-14 p-4 md:p-6 pb-20 md:pb-8 transition-all">
        {activeTab === 'dashboard' && (
          <Dashboard
            metrics={metrics}
            alerts={alerts}
            attackingIps={attackingIps}
            geoNodes={geoNodes}
            onSelectAlert={(alert) => setInvestigateTarget({ alert })}
            onInvestigateIp={(ipData) => setInvestigateTarget({ ipData })}
            onBlockIp={handleBlockIp}
            onOpenFilterModal={() => setIsFilterModalOpen(true)}
            filterSeverity={filterSeverity}
            setFilterSeverity={setFilterSeverity}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === 'logs' && (
          <LogStreamView
            logs={logs}
            onInvestigateIp={(ip) => {
              const found = attackingIps.find((a) => a.ip === ip);
              if (found) {
                setInvestigateTarget({ ipData: found });
              } else {
                setInvestigateTarget({
                  ipData: {
                    ip,
                    country: 'Target Node',
                    countryCode: 'LAN',
                    count: 1,
                    attackType: 'Inspection',
                    riskScore: 60,
                    status: 'active'
                  }
                });
              }
            }}
            onClearLogs={() => setLogs([])}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsTriageView
            alerts={alerts}
            onSelectAlert={(alert) => setInvestigateTarget({ alert })}
            onUpdateStatus={handleUpdateAlertStatus}
            onBlockIp={handleBlockIp}
          />
        )}

        {activeTab === 'rules' && (
          <RuleEngineView
            rules={detectionRules}
            onToggleRule={handleToggleRule}
            onIngestNewLogs={handleIngestNewLogs}
          />
        )}

        {activeTab === 'threat_intel' && (
          <ThreatIntelView
            attackingIps={attackingIps}
            onInvestigateIp={(ip) => setInvestigateTarget({ ipData: ip })}
            onBlockIp={handleBlockIp}
            onUnblockIp={handleUnblockIp}
          />
        )}
      </main>

      {/* 4. Bottom Navigation (Mobile) */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadAlertsCount={unreadAlertsCount}
      />

      {/* 5. Floating SOC Traffic Simulator Toolbar */}
      <SocSimulatorToolbar
        onInjectAttack={handleInjectAttack}
        isLive={isLive}
        setIsLive={setIsLive}
        streamSpeed={streamSpeed}
        setStreamSpeed={setStreamSpeed}
        totalLogsCount={logs.length}
      />

      {/* 6. Investigation & Threat Dossier Modal */}
      <InvestigateModal
        target={investigateTarget}
        onClose={() => setInvestigateTarget(null)}
        onBlockIp={handleBlockIp}
        onUpdateStatus={handleUpdateAlertStatus}
      />

      {/* 7. Alert Filter Modal */}
      <AlertFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        selectedSeverity={filterSeverity}
        setSelectedSeverity={setFilterSeverity}
        selectedStatus={filterStatus}
        setSelectedStatus={setFilterStatus}
        onReset={() => {
          setFilterSeverity('all');
          setFilterStatus('all');
        }}
      />

      {/* 8. Escalation Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        alerts={alerts}
        onSelectAlert={(alert) => setInvestigateTarget({ alert })}
      />
    </div>
  );
}
