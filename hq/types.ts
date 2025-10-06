export type OperativeStatus = 'Online' | 'Away' | 'Offline';
export type ThreatStatus = 'Pending' | 'Reviewing' | 'Mitigated';

export interface Operative {
    id: string;
    name: string;
    rank: string;
    status: OperativeStatus;
    clearance: number;
}

export interface Threat {
    id: number;
    type: string;
    source: string;
    reportedBy: string;
    timestamp: string;
    status: ThreatStatus;
    details: string;
}

export interface DashboardStats {
    activeOperatives: number;
    threatLevel: 'Low' | 'Elevated' | 'High' | 'Critical';
    openThreats: number;
    networkIntegrity: string;
}
