export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';
export type AlertStatus = 'open' | 'reviewing' | 'pending' | 'auto-closed';
export type LogType = 'apache' | 'nginx' | 'auth' | 'firewall' | 'syslog';

export interface LogEvent {
  id: string;
  timestamp: string;
  sourceIp: string;
  destinationIp: string;
  method?: string;
  endpoint?: string;
  statusCode?: number;
  userAgent?: string;
  rawMessage: string;
  logType: LogType;
  country: string;
  countryCode: string;
  isAnomaly?: boolean;
  attackType?: string;
  bytes?: number;
}

export interface SecurityAlert {
  id: string;
  timestamp: string;
  severity: SeverityLevel;
  sourceIp: string;
  eventType: string;
  status: AlertStatus;
  description: string;
  relatedEventsCount: number;
  country: string;
  countryCode: string;
  ruleTriggered: string;
  rawLogSample: string;
  analystNotes?: string;
  assignedAnalyst?: string;
  mitigatedAt?: string;
  blocked?: boolean;
}

export interface AttackingIP {
  ip: string;
  country: string;
  countryCode: string;
  count: number;
  lastSeen: string;
  riskScore: number; // 0-100
  category: string;
  status: 'active' | 'blocked' | 'monitoring';
  attacks: string[];
  asn?: string;
  hostname?: string;
}

export interface SiemMetrics {
  totalEvents: number;
  activeAlerts: number;
  criticalAlerts: number;
  uniqueIps: number;
  blockedIps: number;
  eventsPerSec: number;
}

export interface DetectionRule {
  id: string;
  name: string;
  description: string;
  severity: SeverityLevel;
  ruleType: 'brute_force' | 'sensitive_path' | 'volume_anomaly' | 'geo_anomaly' | 'sqli_xss' | 'ransomware_behavior';
  pattern?: string;
  threshold?: number;
  windowSeconds?: number;
  enabled: boolean;
  matchCount: number;
}

export interface ThreatGeoNode {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
  xPercent: number; // for SVG/Canvas map positioning
  yPercent: number;
  alertCount: number;
  severity: SeverityLevel;
  activeIp: string;
  attackType: string;
}

export type ActiveTab = 'dashboard' | 'logs' | 'alerts' | 'rules' | 'threat_intel';
