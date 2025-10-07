import { Operative, Threat, DashboardStats, ThreatStatus, PendingRegistration, ConnectionRequest, Group } from '../common/types';
import * as db from './database';

// --- SERVER LOGIC / API ENDPOINT HANDLERS ---
// In a real Node.js app, these functions would be handlers for Express routes.

// --- Constants ---
export const SECURITY_QUESTIONS = [
    "What was the model of your first issued service weapon?",
    "In what city was your initial training conducted?",
    "What is the name of your first commanding officer?",
    "What was the call sign of your first unit?",
    "What is your mother's maiden name?",
    "What was the name of your childhood best friend?",
    "What was the name of your first pet?",
];

// --- Auth Logic ---
export const handleLogin = (username: string, password, expectedRole: 'operative' | 'admin'): {success: boolean; error?: string} => {
    const user = db.dbFindUser(username);
    if (!user || user.password !== password) {
        return { success: false, error: 'Invalid credentials. Please try again.' };
    }
    if (user.role !== expectedRole) {
        return { success: false, error: 'Access denied for this portal.' };
    }
    return { success: true };
}

export const handleCheckUsername = (username): {isTaken: boolean} => {
    const isTaken = !!db.dbFindUser(username) || db.dbGetPendingRegistrations().some(p => p.username.toLowerCase() === username.toLowerCase());
    return { isTaken };
}

export const handleRegister = (userData: any): {success: boolean} => {
    const { confirm, ...rest } = userData;
    const newRequest: PendingRegistration = {
        ...rest,
        requestDate: new Date().toISOString().split('T')[0],
    };
    db.dbAddPendingRegistration(newRequest);
    console.log("New registration request received:", newRequest);
    return { success: true };
}

export const handleGetSecurityQuestion = (username): {success: boolean; question?: string; error?: string} => {
    const user = db.dbFindUser(username);
    if (user) {
        const question = SECURITY_QUESTIONS[user.securityQuestionIndex];
        return { success: true, question };
    }
    return { success: false, error: 'Username not found.' };
}

export const handleSubmitSecurityAnswer = (username, answer): {success: boolean; error?: string} => {
    const user = db.dbFindUser(username);
    if (user && answer.toLowerCase() === user.securityQuestionAnswer.toLowerCase()) {
        return { success: true };
    }
    return { success: false, error: 'Incorrect answer.' };
}

export const handleTriggerDuressAlert = (username: string, location: { lat: number, lon: number } | null): {success: boolean} => {
    const locationInfo = location ? `at geo-coordinates ${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}` : `(location unavailable)`;
    const newThreat: Threat = {
        id: Date.now(),
        type: 'DURESS ALERT (CODE RED SKY)',
        source: 'Operative Credential',
        reportedBy: username,
        timestamp: new Date().toISOString().replace('T', ' ').split('.')[0] + ' UTC',
        status: 'Pending',
        details: `Operative ${username} has activated a duress protocol ${locationInfo}. Immediate action required. Operative may be compromised.`
    };
    db.dbAddThreat(newThreat);
    console.log(`DURESS THREAT LOGGED: `, newThreat);
    return { success: true };
};

// --- HQ Data Logic ---
export const handleGetPendingRegistrations = (): PendingRegistration[] => {
    return db.dbGetPendingRegistrations();
}

export const handleApproveRegistration = (username: string): { success: boolean } => {
    const pendingUser = db.dbGetPendingRegistrations().find(p => p.username === username);
    if (!pendingUser) return { success: false };
    
    db.dbAddUser({
        username: pendingUser.username,
        password: pendingUser.password || 'password123',
        role: 'operative',
        securityQuestionIndex: 0,
        securityQuestionAnswer: 'Placeholder',
        contacts: [],
    });

    db.dbAddOperative({
        id: pendingUser.username,
        name: pendingUser.username,
        rank: pendingUser.rank,
        status: 'Offline',
        clearance: 3,
        joinDate: new Date().toISOString().split('T')[0],
    });

    db.dbRemovePendingRegistration(username);
    return { success: true };
}

export const handleDenyRegistration = (username: string): { success: boolean } => {
    db.dbRemovePendingRegistration(username);
    return { success: true };
}

export const handleGetOperatives = (): Operative[] => {
    return db.dbGetOperatives();
};

export const handleGetContactsForUser = (username: string): Operative[] => {
    const user = db.dbFindUser(username);
    if (!user) return [];
    const allOperatives = db.dbGetOperatives();
    return allOperatives.filter(op => user.contacts.includes(op.id));
};

export const handleSearchOperatives = (query: string, username: string): Operative[] => {
    return db.dbSearchOperatives(query, username);
};

export const handleGetThreats = (): Threat[] => {
    return db.dbGetThreats().sort((a, b) => b.id - a.id);
};

export const handleUpdateThreatStatus = (id: number, status: ThreatStatus): Threat => {
    const threats = db.dbGetThreats();
    const threatIndex = threats.findIndex(t => t.id === id);
    if (threatIndex > -1) {
        threats[threatIndex].status = status;
        db.dbUpdateThreat(threats[threatIndex]);
        return { ...threats[threatIndex] };
    }
    throw new Error('Threat not found');
};

export const handleGetDashboardStats = (): DashboardStats => {
    const threats = db.dbGetThreats();
    const operatives = db.dbGetOperatives();
    const openThreats = threats.filter(t => t.status === 'Pending' || t.status === 'Reviewing').length;
    let threatLevel: DashboardStats['threatLevel'] = 'Low';
    if (openThreats > 3 || threats.some(t => t.type.includes('DURESS'))) threatLevel = 'Critical';
    else if (openThreats > 1) threatLevel = 'Elevated';

    return {
        activeOperatives: operatives.filter(o => o.status === 'Online').length,
        threatLevel,
        openThreats,
        networkIntegrity: "99.8%"
    };
};

export const handleGetRecentThreats = (count: number = 2): Threat[] => {
    return db.dbGetThreats()
        .filter(t => t.status !== 'Mitigated')
        .sort((a, b) => b.id - a.id)
        .slice(0, count);
};

// --- Group Management Logic ---

export const handleGetGroupsForUser = (username: string): Group[] => {
    return db.dbGetGroups().filter(group => group.members.includes(username));
};

export const handleGetGroupDetails = (groupId: string): Group | null => {
    return db.dbFindGroupById(groupId) || null;
};

export const handleAddGroup = (name: string, admin: string, members: string[]): Group => {
    const newGroup: Group = {
        id: name.toLowerCase().replace(/\s/g, '-') + '-' + Date.now(),
        name,
        admin,
        members,
        createdAt: new Date().toISOString(),
        icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.084-1.28-.24-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.084-1.28.24-1.857m11.52 1.857a3 3 0 00-5.356-1.857m0 0A3 3 0 017 16.143m5.657 1.857l-2.829-5.657a3 3 0 015.657 0l-2.829 5.657z',
    };
    db.dbAddGroup(newGroup);
    return newGroup;
};

export const handleAddMemberToGroup = (groupId: string, memberId: string, requesterId: string): { success: boolean } => {
    const allGroups = db.dbGetGroups();
    const groupIndex = allGroups.findIndex(g => g.id === groupId);
    if (groupIndex === -1) return { success: false };
    
    const group = allGroups[groupIndex];
    if (group.admin !== requesterId || group.members.includes(memberId)) {
        return { success: false };
    }

    group.members.push(memberId);
    db.dbUpdateGroups(allGroups);
    return { success: true };
};

export const handleRemoveMemberFromGroup = (groupId: string, memberId: string, requesterId: string): { success: boolean } => {
    const allGroups = db.dbGetGroups();
    const groupIndex = allGroups.findIndex(g => g.id === groupId);
    if (groupIndex === -1) return { success: false };

    const group = allGroups[groupIndex];
    if (group.admin !== requesterId || memberId === requesterId) {
        return { success: false };
    }
    
    group.members = group.members.filter(m => m !== memberId);
    db.dbUpdateGroups(allGroups);
    return { success: true };
};

export const handleLeaveGroup = (groupId: string, memberId: string): { success: boolean } => {
    const allGroups = db.dbGetGroups();
    const groupIndex = allGroups.findIndex(g => g.id === groupId);
    if (groupIndex === -1) return { success: false };

    const group = allGroups[groupIndex];
    // Admin cannot leave, must delete group
    if (!group.members.includes(memberId) || group.admin === memberId) {
        return { success: false };
    }

    group.members = group.members.filter(m => m !== memberId);
    db.dbUpdateGroups(allGroups);
    return { success: true };
};

export const handleDeleteGroup = (groupId: string, requesterId: string): { success: boolean } => {
    const group = db.dbFindGroupById(groupId);
    if (!group || group.admin !== requesterId) {
        return { success: false };
    }
    db.dbDeleteGroup(groupId);
    return { success: true };
};


// --- Connection Requests Logic ---
export const handleGetPendingConnectionRequests = (): ConnectionRequest[] => {
    return db.dbGetConnectionRequests().filter(r => r.status === 'pending');
};

export const handleSubmitConnectionRequest = (from: string, to: string, reason: string): {success: boolean} => {
    const newRequest: ConnectionRequest = {
        id: Date.now(),
        fromUsername: from,
        toUsername: to,
        reason: reason,
        requestDate: new Date().toISOString().split('T')[0],
        status: 'pending'
    };
    db.dbAddConnectionRequest(newRequest);
    return { success: true };
};

export const handleApproveConnectionRequest = (requestId: number): {success: boolean} => {
    const request = db.dbGetConnectionRequests().find(r => r.id === requestId);
    if (!request) return { success: false };
    
    request.status = 'approved';
    db.dbUpdateConnectionRequest(request);
    db.dbAddContact(request.fromUsername, request.toUsername);
    return { success: true };
};

export const handleDenyConnectionRequest = (requestId: number): {success: boolean} => {
    const request = db.dbGetConnectionRequests().find(r => r.id === requestId);
    if (!request) return { success: false };
    
    request.status = 'denied';
    db.dbUpdateConnectionRequest(request);
    return { success: true };
};