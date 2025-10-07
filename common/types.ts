export type OperativeStatus = 'Online' | 'Away' | 'Offline';
export type ThreatStatus = 'Pending' | 'Reviewing' | 'Mitigated';
export type RequestStatus = 'pending' | 'approved' | 'denied';

export interface User {
    username: string;
    password?: string;
    role: 'operative' | 'admin';
    securityQuestionIndex: number;
    securityQuestionAnswer: string;
    contacts: string[]; // Array of usernames
}

export interface Group {
    id: string;
    name: string;
    // icon string for simplicity, could be more complex
    icon: string;
    admin: string; // username of the admin
    members: string[]; // array of usernames
    createdAt: string; // ISO date string
}

export interface Operative {
    id: string;
    name: string;
    rank: string;
    status: OperativeStatus;
    clearance: number;
    joinDate: string;
    isContact?: boolean;
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

export interface PendingRegistration {
    username: string;
    password?: string;
    serviceId: string;
    rank: string;
    unit: string;
    enlistmentDate: string;
    verifyingOfficer: string;
    requestDate: string;
}

export interface ConnectionRequest {
    id: number;
    fromUsername: string;
    toUsername: string;
    reason: string;
    requestDate: string;
    status: RequestStatus;
}

// Custom types for functional features
export interface MessageAttachment {
  type: 'image' | 'video' | 'voicenote' | 'file';
  url?: string; // For images/videos from mock
  blobUrl?: string; // For recorded voice notes
  duration?: number; // Duration in seconds
  fileName?: string;
  fileSize?: string;
}

export interface Message {
  id: number;
  text: string;
  sender: 'user' | 'other';
  timestamp: string;
  replyingTo?: Message;
  attachment?: MessageAttachment;
}