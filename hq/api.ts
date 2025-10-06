import { Operative, Threat, DashboardStats, ThreatStatus } from './types';

// --- MOCK DATABASE ---

const users = [
    {
        username: 'hq_admin',
        password: 'password123',
        role: 'admin',
        securityQuestionIndex: 2,
        securityQuestionAnswer: 'Johnson'
    },
    {
        username: 'agent_zero',
        password: 'password123',
        role: 'operative',
        securityQuestionIndex: 2,
        securityQuestionAnswer: 'Johnson'
    }
];

let operatives: Operative[] = [
    { id: 'agent_zero', name: 'Agent Zero', rank: 'Field Agent', status: 'Online', clearance: 4 },
    { id: 'dm-sarah', name: 'Sarah Jenkins', rank: 'Lead Analyst', status: 'Online', clearance: 4 },
    { id: 'dm-mike', name: 'Mike Chen', rank: 'Field Agent', status: 'Away', clearance: 3 },
    { id: 'alpha-lead', name: 'Alpha Lead', rank: 'Squad Leader', status: 'Online', clearance: 5 },
    { id: 'spectre', name: 'Spectre', rank: 'Deep Cover Agent', status: 'Offline', clearance: 5 },
    { id: 'oracle', name: 'Oracle', rank: 'Intel Analyst', status: 'Away', clearance: 4 },
];

let threats: Threat[] = [
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

// --- API FUNCTIONS ---

const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Auth API ---

export const login = async (username, password): Promise<{success: boolean; error?: string}> => {
    await simulateDelay(1500);
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (user && user.password === password) {
        return { success: true };
    }
    return { success: false, error: 'Invalid credentials. Please try again.' };
}

export const checkUsername = async (username): Promise<{isTaken: boolean}> => {
    await simulateDelay(500);
    const isTaken = users.some(u => u.username.toLowerCase() === username.toLowerCase());
    return { isTaken };
}

export const register = async (userData): Promise<{success: boolean}> => {
    await simulateDelay(3000);
    console.log("Simulating registration request to HQ:", userData);
    // In a real scenario, this would create a pending user in the DB.
    return { success: true };
}

export const getSecurityQuestion = async (username): Promise<{success: boolean; question?: string; error?: string}> => {
    await simulateDelay(1000);
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (user) {
        const question = SECURITY_QUESTIONS[user.securityQuestionIndex];
        return { success: true, question };
    }
    return { success: false, error: 'Username not found.' };
}

export const submitSecurityAnswer = async (username, answer): Promise<{success: boolean; error?: string}> => {
    await simulateDelay(1000);
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (user && answer.toLowerCase() === user.securityQuestionAnswer.toLowerCase()) {
        return { success: true };
    }
    return { success: false, error: 'Incorrect answer.' };
}

// --- HQ Data API ---

export const getOperatives = async (): Promise<Operative[]> => {
    await simulateDelay(800);
    return [...operatives];
};

export const getThreats = async (): Promise<Threat[]> => {
    await simulateDelay(1000);
    return [...threats].sort((a, b) => b.id - a.id); // Newest first
};

export const updateThreatStatus = async (id: number, status: ThreatStatus): Promise<Threat> => {
    await simulateDelay(500);
    const threatIndex = threats.findIndex(t => t.id === id);
    if (threatIndex > -1) {
        threats[threatIndex].status = status;
        return { ...threats[threatIndex] };
    }
    throw new Error('Threat not found');
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
    await simulateDelay(600);
    const openThreats = threats.filter(t => t.status === 'Pending' || t.status === 'Reviewing').length;
    let threatLevel: DashboardStats['threatLevel'] = 'Low';
    if (openThreats > 3) threatLevel = 'Critical';
    else if (openThreats > 1) threatLevel = 'Elevated';

    return {
        activeOperatives: operatives.filter(o => o.status === 'Online').length,
        threatLevel: threatLevel,
        openThreats: openThreats,
        networkIntegrity: "99.8%"
    };
};

export const getRecentThreats = async (count: number = 2): Promise<Threat[]> => {
    await simulateDelay(1200);
    return [...threats]
        .filter(t => t.status !== 'Mitigated')
        .sort((a, b) => b.id - a.id)
        .slice(0, count);
};

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