const API_BASE_URL = 'http://localhost:3001/api';

const handleResponse = async (response) => {
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

const apiRequest = async (endpoint, options = {}) => {
    try {
        const token = localStorage.getItem('vajralink_token');
        const headers = {
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
export const login = async (username, password, expectedRole) => {
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

export const checkUsername = (username) =>
    apiRequest('/check-username', { method: 'POST', body: JSON.stringify({ username }) });

export const register = (userData) =>
    apiRequest('/register', { method: 'POST', body: JSON.stringify(userData) });

export const getSecurityQuestion = (username) =>
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


export const submitSecurityAnswer = (username, answer) =>
    apiRequest('/submit-security-answer', { method: 'POST', body: JSON.stringify({ username, answer }) });

export const triggerDuressAlert = (username, location, message) =>
    apiRequest('/duress-alert', { method: 'POST', body: JSON.stringify({ username, location, message }) });


// --- HQ Data API ---
export const getPendingRegistrations = () =>
    apiRequest('/registrations/pending');

export const approveRegistration = (username) =>
    apiRequest(`/registrations/${username}/approve`, { method: 'POST' });

export const denyRegistration = (username) =>
    apiRequest(`/registrations/${username}/deny`, { method: 'POST' });

export const getOperatives = () =>
    apiRequest('/operatives');

export const getOperativeProfile = (username) =>
    apiRequest(`/operatives/profile/${username}`);

export const getContactsForUser = (username) =>
    apiRequest(`/operatives/contacts/${username}`);

export const searchOperatives = (query, username) =>
    apiRequest(`/operatives/search?query=${encodeURIComponent(query)}&username=${encodeURIComponent(username)}`);

export const getThreats = () =>
    apiRequest('/threats');

export const updateThreatStatus = (id, status) =>
    apiRequest(`/threats/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) });

export const analyzeThreatWithAI = (id) =>
    apiRequest(`/threats/${id}/analyze`, { method: 'POST' });

export const updateOperativeStatus = (username, status) =>
    apiRequest('/operatives/status', { method: 'POST', body: JSON.stringify({ username, status }) });

export const setStatusVisibility = (username, isVisible) =>
    apiRequest('/operatives/visibility', { method: 'POST', body: JSON.stringify({ username, isVisible }) });

export const getDashboardStats = () =>
    apiRequest('/dashboard-stats');

export const getRecentThreats = (count = 2) =>
    apiRequest(`/threats/recent?count=${count}`);


// --- Group Management API ---
export const getGroupsForUser = (username) =>
    apiRequest(`/groups/${username}`);

export const getGroupDetails = (groupId) =>
    apiRequest(`/group-details/${groupId}`);

export const addGroup = (name, admin, members) =>
    apiRequest('/groups', { method: 'POST', body: JSON.stringify({ name, admin, members }) });

export const addMemberToGroup = (groupId, memberId, requesterId) =>
    apiRequest(`/groups/${groupId}/members`, { method: 'POST', body: JSON.stringify({ memberId, requesterId }) });

export const removeMemberFromGroup = (groupId, memberId, requesterId) =>
    apiRequest(`/groups/${groupId}/members/${memberId}`, { method: 'DELETE', body: JSON.stringify({ requesterId }) });

export const leaveGroup = (groupId, memberId) =>
     apiRequest(`/groups/${groupId}/members/${memberId}`, { method: 'DELETE', body: JSON.stringify({ requesterId: memberId }) });

export const deleteGroup = (groupId, requesterId) =>
    apiRequest(`/groups/${groupId}`, { method: 'DELETE', body: JSON.stringify({ requesterId }) });


// --- Connection Requests API ---
export const getPendingConnectionRequests = () =>
    apiRequest('/connections/pending');

export const submitConnectionRequest = (from, to, reason) =>
    apiRequest('/connections', { method: 'POST', body: JSON.stringify({ from, to, reason }) });

export const approveConnectionRequest = (requestId) =>
    apiRequest(`/connections/${requestId}/approve`, { method: 'POST' });

export const denyConnectionRequest = (requestId) =>
    apiRequest(`/connections/${requestId}/deny`, { method: 'POST' });

// --- Family API ---
export const getFamilyMembers = (username) => apiRequest(`/family/${username}/members`);
export const getFamilyGroups = (username) => apiRequest(`/family/${username}/groups`);
export const addFamilyGroup = (name, admin, members) => apiRequest('/family/groups', { method: 'POST', body: JSON.stringify({ name, admin, members }) });
export const getPendingFamilyRegistrations = () => apiRequest('/family/registrations/pending');
export const approveFamilyRegistration = (username) => apiRequest(`/family/registrations/${username}/approve`, { method: 'POST' });
export const denyFamilyRegistration = (username) => apiRequest(`/family/registrations/${username}/deny`, { method: 'POST' });

// --- Operative Actions ---
export const lockOperative = (username) => apiRequest(`/operatives/${username}/lock`, { method: 'POST' });
export const wipeOperative = (username) => apiRequest(`/operatives/${username}/wipe`, { method: 'DELETE' });
