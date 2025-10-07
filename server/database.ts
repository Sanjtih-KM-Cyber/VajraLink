import { Operative, Threat, DashboardStats, ThreatStatus, PendingRegistration, User, ConnectionRequest, Group } from '../common/types';

// --- DATABASE INITIALIZATION ---

const initialUsers: User[] = [
    {
        username: 'hq_admin',
        password: 'password123',
        role: 'admin',
        securityQuestionIndex: 2,
        securityQuestionAnswer: 'Johnson',
        contacts: []
    },
    {
        username: 'agent_zero',
        password: 'password123',
        role: 'operative',
        securityQuestionIndex: 2,
        securityQuestionAnswer: 'Johnson',
        contacts: ['dm-sarah', 'dm-mike', 'alpha-lead', 'spectre']
    }
];

const initialOperatives: Operative[] = [
    { id: 'agent_zero', name: 'Agent Zero', rank: 'Field Agent', status: 'Online', clearance: 4, joinDate: '2021-03-10' },
    { id: 'dm-sarah', name: 'Sarah Jenkins', rank: 'Lead Analyst', status: 'Online', clearance: 4, joinDate: '2022-08-15' },
    { id: 'dm-mike', name: 'Mike Chen', rank: 'Field Agent', status: 'Away', clearance: 3, joinDate: '2023-01-20' },
    { id: 'alpha-lead', name: 'Alpha Lead', rank: 'Squad Leader', status: 'Online', clearance: 5, joinDate: '2020-05-22' },
    { id: 'spectre', name: 'Spectre', rank: 'Deep Cover Agent', status: 'Offline', clearance: 5, joinDate: '2019-11-01' },
    { id: 'oracle', name: 'Oracle', rank: 'Intel Analyst', status: 'Away', clearance: 4, joinDate: '2022-10-05' },
];

const initialGroups: Group[] = [
    {
        id: 'alpha',
        name: 'Alpha Group',
        icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.084-1.28-.24-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.084-1.28.24-1.857m11.52 1.857a3 3 0 00-5.356-1.857m0 0A3 3 0 017 16.143m5.657 1.857l-2.829-5.657a3 3 0 015.657 0l-2.829 5.657z',
        admin: 'alpha-lead',
        members: ['alpha-lead', 'agent_zero', 'dm-mike'],
        createdAt: '2023-05-10T10:00:00Z'
    },
    {
        id: 'work',
        name: 'Project Condor',
        icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
        admin: 'agent_zero',
        members: ['agent_zero', 'dm-sarah'],
        createdAt: '2024-02-18T15:30:00Z'
    }
];


const initialThreats: Threat[] = [
    { 
        id: 1, 
        type: 'Phishing Attempt', 
        source: 'Personal Email',
        reportedBy: 'agent_zero', 
        timestamp: '2024-07-28 14:30 UTC', 
        status: 'Pending',
        details: 'Received an email with a suspicious link claiming to be an urgent account verification. Link redirects to http://vajralink-secure-auth.xyz/login which is not an official domain.'
    },
    { 
        id: 2, 
        type: 'PII Leak', 
        source: 'VajraLink Message',
        reportedBy: 'alpha-lead', 
        timestamp: '2024-07-28 09:15 UTC', 
        status: 'Mitigated',
        details: 'A new operative accidentally shared a phone number in the Alpha Group channel. The message was remotely deleted by OPSEC Sentinel bot.'
    },
    { 
        id: 3, 
        type: 'Anomalous Data Exfiltration', 
        source: 'Network Monitor',
        reportedBy: 'System', 
        timestamp: '2024-07-27 22:00 UTC', 
        status: 'Reviewing',
        details: 'Unusual outbound traffic detected from an operative device in the North Sector. Data packet analysis is underway.'
    },
    {
        id: 4,
        type: 'Unauthorized Access Attempt',
        source: 'Firewall Log',
        reportedBy: 'System',
        timestamp: '2024-07-29 02:00 UTC',
        status: 'Pending',
        details: 'Multiple failed login attempts detected on the EU-Central-1 gateway from a blacklisted IP range.'
    }
];

const initialPendingRegistrations: PendingRegistration[] = [
    {
        username: 'new_recruit_1',
        serviceId: 'NR-81831',
        rank: 'Recruit',
        unit: 'Training Division',
        enlistmentDate: '2024-06-01',
        verifyingOfficer: 'Sgt. Miller',
        requestDate: '2024-07-29',
        password: 'password123',
    }
];

const initialConnectionRequests: ConnectionRequest[] = [];

// --- LOCALSTORAGE HELPERS ---

const DB_PREFIX = 'VAJRALINK_';
const KEYS = {
    USERS: `${DB_PREFIX}USERS`,
    OPERATIVES: `${DB_PREFIX}OPERATIVES`,
    GROUPS: `${DB_PREFIX}GROUPS`,
    THREATS: `${DB_PREFIX}THREATS`,
    PENDING_REGISTRATIONS: `${DB_PREFIX}PENDING_REGISTRATIONS`,
    CONNECTION_REQUESTS: `${DB_PREFIX}CONNECTION_REQUESTS`,
    INITIALIZED: `${DB_PREFIX}INITIALIZED`
};

const _get = <T>(key: string): T | null => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
};

const _set = (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value));
};

const initializeDatabase = () => {
    if (!_get(KEYS.INITIALIZED)) {
        console.log("Database not found. Initializing with seed data...");
        _set(KEYS.USERS, initialUsers);
        _set(KEYS.OPERATIVES, initialOperatives);
        _set(KEYS.GROUPS, initialGroups);
        _set(KEYS.THREATS, initialThreats);
        _set(KEYS.PENDING_REGISTRATIONS, initialPendingRegistrations);
        _set(KEYS.CONNECTION_REQUESTS, initialConnectionRequests);
        _set(KEYS.INITIALIZED, true);
    }
};

// Initialize on script load
initializeDatabase();

// --- DATABASE API ---

// Users
export const dbGetUsers = () => _get<User[]>(KEYS.USERS) || [];
export const dbUpdateUsers = (users: User[]) => _set(KEYS.USERS, users);
export const dbAddUser = (user: User) => {
    const users = dbGetUsers();
    users.push(user);
    dbUpdateUsers(users);
};
export const dbFindUser = (username: string): User | undefined => dbGetUsers().find(u => u.username.toLowerCase() === username.toLowerCase());

export const dbAddContact = (username1: string, username2: string) => {
    const users = dbGetUsers();
    const user1 = users.find(u => u.username === username1);
    const user2 = users.find(u => u.username === username2);
    if (user1 && user2) {
        if (!user1.contacts.includes(username2)) user1.contacts.push(username2);
        if (!user2.contacts.includes(username1)) user2.contacts.push(username1);
        dbUpdateUsers(users);
    }
};


// Operatives
export const dbGetOperatives = () => _get<Operative[]>(KEYS.OPERATIVES) || [];
export const dbAddOperative = (operative: Operative) => {
    const operatives = dbGetOperatives();
    operatives.push(operative);
    _set(KEYS.OPERATIVES, operatives);
};
export const dbSearchOperatives = (query: string, searcherUsername: string): Operative[] => {
    if (!query) return [];
    const searcher = dbFindUser(searcherUsername);
    const searcherContacts = searcher?.contacts || [];
    const lowerCaseQuery = query.toLowerCase();
    
    return dbGetOperatives()
        .filter(op => 
            op.id.toLowerCase() !== searcherUsername.toLowerCase() &&
            (op.name.toLowerCase().includes(lowerCaseQuery) || op.id.toLowerCase().includes(lowerCaseQuery))
        )
        .map(op => ({
            ...op,
            isContact: searcherContacts.includes(op.id)
        }));
};

// Groups
export const dbGetGroups = () => _get<Group[]>(KEYS.GROUPS) || [];
export const dbUpdateGroups = (groups: Group[]) => _set(KEYS.GROUPS, groups);
export const dbFindGroupById = (groupId: string): Group | undefined => dbGetGroups().find(g => g.id === groupId);
export const dbAddGroup = (group: Group) => {
    const groups = dbGetGroups();
    groups.push(group);
    dbUpdateGroups(groups);
};
export const dbDeleteGroup = (groupId: string) => {
    const groups = dbGetGroups().filter(g => g.id !== groupId);
    dbUpdateGroups(groups);
};


// Threats
export const dbGetThreats = () => _get<Threat[]>(KEYS.THREATS) || [];
export const dbAddThreat = (threat: Threat) => {
    const threats = dbGetThreats();
    threats.push(threat);
    _set(KEYS.THREATS, threats);
};
export const dbUpdateThreat = (updatedThreat: Threat) => {
    const threats = dbGetThreats();
    const index = threats.findIndex(t => t.id === updatedThreat.id);
    if (index !== -1) {
        threats[index] = updatedThreat;
        _set(KEYS.THREATS, threats);
    }
};

// Pending Registrations
export const dbGetPendingRegistrations = () => _get<PendingRegistration[]>(KEYS.PENDING_REGISTRATIONS) || [];
export const dbAddPendingRegistration = (reg: PendingRegistration) => {
    const pending = dbGetPendingRegistrations();
    pending.push(reg);
    _set(KEYS.PENDING_REGISTRATIONS, pending);
};
export const dbRemovePendingRegistration = (username: string) => {
    const pending = dbGetPendingRegistrations().filter(p => p.username !== username);
    _set(KEYS.PENDING_REGISTRATIONS, pending);
};

// Connection Requests
export const dbGetConnectionRequests = () => _get<ConnectionRequest[]>(KEYS.CONNECTION_REQUESTS) || [];
export const dbAddConnectionRequest = (req: ConnectionRequest) => {
    const requests = dbGetConnectionRequests();
    requests.push(req);
    _set(KEYS.CONNECTION_REQUESTS, requests);
};
export const dbUpdateConnectionRequest = (updatedReq: ConnectionRequest) => {
    const requests = dbGetConnectionRequests();
    const index = requests.findIndex(r => r.id === updatedReq.id);
    if (index !== -1) {
        requests[index] = updatedReq;
        _set(KEYS.CONNECTION_REQUESTS, requests);
    }
};