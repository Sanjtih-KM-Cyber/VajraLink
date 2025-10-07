import * as server from '../server';
import { Operative, Threat, DashboardStats, ThreatStatus, PendingRegistration, ConnectionRequest, Group } from '../common/types';

// --- API CLIENT ---
// This file simulates a client-side library for making API calls to the backend.
// In a real app, each function would use `fetch` to call a Node.js endpoint.
// We use a simulated delay to mimic network latency.

const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Auth API ---
export const { SECURITY_QUESTIONS } = server;

export const login = async (username: string, password, expectedRole: 'operative' | 'admin'): Promise<{success: boolean; error?: string}> => {
    await simulateDelay(1500);
    // In a real app: return fetch('/api/login', { method: 'POST', body: JSON.stringify({ username, password, role: expectedRole }) });
    return server.handleLogin(username, password, expectedRole);
}

export const checkUsername = async (username): Promise<{isTaken: boolean}> => {
    await simulateDelay(500);
    return server.handleCheckUsername(username);
}

export const register = async (userData: any): Promise<{success: boolean}> => {
    await simulateDelay(2000);
    return server.handleRegister(userData);
}

export const getSecurityQuestion = async (username): Promise<{success: boolean; question?: string; error?: string}> => {
    await simulateDelay(1000);
    return server.handleGetSecurityQuestion(username);
}

export const submitSecurityAnswer = async (username, answer): Promise<{success: boolean; error?: string}> => {
    await simulateDelay(1000);
    return server.handleSubmitSecurityAnswer(username, answer);
}

export const triggerDuressAlert = async (username: string, location: { lat: number, lon: number } | null): Promise<{success: boolean}> => {
    await simulateDelay(100);
    return server.handleTriggerDuressAlert(username, location);
};

// --- HQ Data API ---
export const getPendingRegistrations = async (): Promise<PendingRegistration[]> => {
    await simulateDelay(700);
    return server.handleGetPendingRegistrations();
}

export const approveRegistration = async (username: string): Promise<{ success: boolean }> => {
    await simulateDelay(1000);
    return server.handleApproveRegistration(username);
}

export const denyRegistration = async (username: string): Promise<{ success: boolean }> => {
    await simulateDelay(500);
    return server.handleDenyRegistration(username);
}

export const getOperatives = async (): Promise<Operative[]> => {
    await simulateDelay(800);
    return server.handleGetOperatives();
};

export const getContactsForUser = async (username: string): Promise<Operative[]> => {
    await simulateDelay(300);
    return server.handleGetContactsForUser(username);
};

export const searchOperatives = async (query: string, username: string): Promise<Operative[]> => {
    await simulateDelay(400);
    return server.handleSearchOperatives(query, username);
};

export const getThreats = async (): Promise<Threat[]> => {
    await simulateDelay(1000);
    return server.handleGetThreats();
};

export const updateThreatStatus = async (id: number, status: ThreatStatus): Promise<Threat> => {
    await simulateDelay(500);
    return server.handleUpdateThreatStatus(id, status);
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
    await simulateDelay(600);
    return server.handleGetDashboardStats();
};

export const getRecentThreats = async (count: number = 2): Promise<Threat[]> => {
    await simulateDelay(1200);
    return server.handleGetRecentThreats(count);
};

// --- Group Management API ---
export const getGroupsForUser = async (username: string): Promise<Group[]> => {
    await simulateDelay(400);
    return server.handleGetGroupsForUser(username);
};

export const getGroupDetails = async (groupId: string): Promise<Group | null> => {
    await simulateDelay(500);
    return server.handleGetGroupDetails(groupId);
};

export const addGroup = async (name: string, admin: string, members: string[]): Promise<Group> => {
    await simulateDelay(1000);
    return server.handleAddGroup(name, admin, members);
};

export const addMemberToGroup = async (groupId: string, memberId: string, requesterId: string): Promise<{ success: boolean }> => {
    await simulateDelay(500);
    return server.handleAddMemberToGroup(groupId, memberId, requesterId);
};

export const removeMemberFromGroup = async (groupId: string, memberId: string, requesterId: string): Promise<{ success: boolean }> => {
    await simulateDelay(500);
    return server.handleRemoveMemberFromGroup(groupId, memberId, requesterId);
};

export const leaveGroup = async (groupId: string, memberId: string): Promise<{ success: boolean }> => {
    await simulateDelay(500);
    return server.handleLeaveGroup(groupId, memberId);
};

export const deleteGroup = async (groupId: string, requesterId: string): Promise<{ success: boolean }> => {
    await simulateDelay(700);
    return server.handleDeleteGroup(groupId, requesterId);
};


// --- Connection Requests API ---
export const getPendingConnectionRequests = async (): Promise<ConnectionRequest[]> => {
    await simulateDelay(600);
    return server.handleGetPendingConnectionRequests();
};

export const submitConnectionRequest = async (from: string, to: string, reason: string): Promise<{success: boolean}> => {
    await simulateDelay(1000);
    return server.handleSubmitConnectionRequest(from, to, reason);
};

export const approveConnectionRequest = async (requestId: number): Promise<{success: boolean}> => {
    await simulateDelay(500);
    return server.handleApproveConnectionRequest(requestId);
};

export const denyConnectionRequest = async (requestId: number): Promise<{success: boolean}> => {
    await simulateDelay(500);
    return server.handleDenyConnectionRequest(requestId);
};