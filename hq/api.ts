import { Operative, Threat, DashboardStats, ThreatStatus, PendingRegistration, ConnectionRequest, Group, OperativeStatus } from '../common/types';

const API_BASE_URL = 'http://localhost:3001/api';

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            // Clear token and reload if unauthorized, forcing re-login
            localStorage.removeItem('vajralink_token');
            window.location.reload();
        }
        const errorData = await response.json().catch(() => ({ error: 'An unknown network error occurred.' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    try {
        const token = localStorage.getItem('vajralink_token');
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });
        return handleResponse(response);
    } catch (error) {
        console.error(`API request to ${endpoint} failed:`, error);
        throw error;
    }
};


// --- Auth API ---
export const login = async (username: string, password, expectedRole: 'operative' | 'admin') => {
    // Login doesn't use the standard apiRequest because it doesn't send a token
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role: expectedRole })
    });
    const data = await handleResponse(response);
    if (data.success && data.token) {
        localStorage.setItem('vajralink_token', data.token);
    }
    return data;
}

export const checkUsername = (username: string) =>
    apiRequest('/check-username', { method: 'POST', body: JSON.stringify({ username }) });

export const register = (userData: any) =>
    apiRequest('/register', { method: 'POST', body: JSON.stringify(userData) });

export const getSecurityQuestion = (username: string) =>
    apiRequest('/security-question', { method: 'POST', body: JSON.stringify({ username }) });
    
export const SECURITY_QUESTIONS = [
    "What was the model of your first issued service weapon?",
    "In what city was your initial training conducted?",
    "What is the name of your first commanding officer?",
    "What was the call sign of your first unit?",
    "What is your mother's maiden name?",
    "What was the name of your childhood best friend?",
    "What was the name of your first pet?",
];


export const submitSecurityAnswer = (username: string, answer: string) =>
    apiRequest('/submit-security-answer', { method: 'POST', body: JSON.stringify({ username, answer }) });

export const triggerDuressAlert = (username: string, location: { lat: number; lon: number } | null) =>
    apiRequest('/duress-alert', { method: 'POST', body: JSON.stringify({ username, location }) });


// --- HQ Data API ---
export const getPendingRegistrations = (): Promise<PendingRegistration[]> =>
    apiRequest('/registrations/pending');

export const approveRegistration = (username: string): Promise<{ success: boolean }> =>
    apiRequest(`/registrations/${username}/approve`, { method: 'POST' });

export const denyRegistration = (username: string): Promise<{ success: boolean }> =>
    apiRequest(`/registrations/${username}/deny`, { method: 'POST' });

export const getOperatives = (): Promise<Operative[]> =>
    apiRequest('/operatives');

export const getOperativeProfile = (username: string): Promise<Operative | null> =>
    apiRequest(`/operatives/profile/${username}`);

export const getContactsForUser = (username: string): Promise<Operative[]> =>
    apiRequest(`/operatives/contacts/${username}`);

export const searchOperatives = (query: string, username: string): Promise<Operative[]> =>
    apiRequest(`/operatives/search?query=${encodeURIComponent(query)}&username=${encodeURIComponent(username)}`);

export const getThreats = (): Promise<Threat[]> =>
    apiRequest('/threats');

export const updateThreatStatus = (id: number, status: ThreatStatus): Promise<Threat> =>
    apiRequest(`/threats/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) });

export const analyzeThreatWithAI = (id: number): Promise<Threat> =>
    apiRequest(`/threats/${id}/analyze`, { method: 'POST' });

export const updateOperativeStatus = (username: string, status: OperativeStatus): Promise<{ success: boolean }> =>
    apiRequest('/operatives/status', { method: 'POST', body: JSON.stringify({ username, status }) });

export const setStatusVisibility = (username: string, isVisible: boolean): Promise<{ success: boolean }> =>
    apiRequest('/operatives/visibility', { method: 'POST', body: JSON.stringify({ username, isVisible }) });

export const getDashboardStats = (): Promise<DashboardStats> =>
    apiRequest('/dashboard-stats');

export const getRecentThreats = (count: number = 2): Promise<Threat[]> =>
    apiRequest(`/threats/recent?count=${count}`);


// --- Group Management API ---
export const getGroupsForUser = (username: string): Promise<Group[]> =>
    apiRequest(`/groups/${username}`);

export const getGroupDetails = (groupId: string): Promise<Group | null> =>
    apiRequest(`/group-details/${groupId}`);

export const addGroup = (name: string, admin: string, members: string[]): Promise<Group> =>
    apiRequest('/groups', { method: 'POST', body: JSON.stringify({ name, admin, members }) });

export const addMemberToGroup = (groupId: string, memberId: string, requesterId: string): Promise<{ success: boolean }> =>
    apiRequest(`/groups/${groupId}/members`, { method: 'POST', body: JSON.stringify({ memberId, requesterId }) });

export const removeMemberFromGroup = (groupId: string, memberId: string, requesterId: string): Promise<{ success: boolean }> =>
    apiRequest(`/groups/${groupId}/members/${memberId}`, { method: 'DELETE', body: JSON.stringify({ requesterId }) });

export const leaveGroup = (groupId: string, memberId: string): Promise<{ success: boolean }> =>
     apiRequest(`/groups/${groupId}/members/${memberId}`, { method: 'DELETE', body: JSON.stringify({ requesterId: memberId }) });

export const deleteGroup = (groupId: string, requesterId: string): Promise<{ success: boolean }> =>
    apiRequest(`/groups/${groupId}`, { method: 'DELETE', body: JSON.stringify({ requesterId }) });


// --- Connection Requests API ---
export const getPendingConnectionRequests = (): Promise<ConnectionRequest[]> =>
    apiRequest('/connections/pending');

export const submitConnectionRequest = (from: string, to: string, reason: string): Promise<{ success: boolean }> =>
    apiRequest('/connections', { method: 'POST', body: JSON.stringify({ from, to, reason }) });

export const approveConnectionRequest = (requestId: number): Promise<{ success: boolean }> =>
    apiRequest(`/connections/${requestId}/approve`, { method: 'POST' });

export const denyConnectionRequest = (requestId: number): Promise<{ success: boolean }> =>
    apiRequest(`/connections/${requestId}/deny`, { method: 'POST' });