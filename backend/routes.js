const express = require('express');
const { readDb, writeDb } = require('./db');
const router = express.Router();

// --- Constants ---
const SECURITY_QUESTIONS = [
    "What was the model of your first issued service weapon?",
    "In what city was your initial training conducted?",
    "What is the name of your first commanding officer?",
    "What was the call sign of your first unit?",
    "What is your mother's maiden name?",
    "What was the name of your childhood best friend?",
    "What was the name of your first pet?",
];

const ADJECTIVES = ['Crimson', 'Silent', 'Broken', 'Glass', 'Iron', 'Golden', 'Fallen', 'Last', 'Final', 'Shadow', 'Ghost', 'Winter'];
const NOUNS = ['Tide', 'Whisper', 'Arrow', 'Mirror', 'Shield', 'Key', 'Echo', 'Star', 'Protocol', 'Raven', 'Serpent', 'Lion'];

const generateUniqueDuressPassword = (users) => {
    const existingPasswords = new Set(users.map(u => u.duressPassword));
    let newPassword = '';
    do {
        const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
        const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
        const num = Math.floor(Math.random() * 90) + 10;
        newPassword = `${adj}-${noun}-${num}`.toLowerCase();
    } while (existingPasswords.has(newPassword));
    return newPassword;
};

// --- Middleware to reduce boilerplate ---
const dbAction = (action) => (req, res) => {
    try {
        const db = readDb();
        const result = action(db, req.body, req.params, req.query);
        if (result && result.db) {
            writeDb(result.db);
            res.status(result.status || 200).json(result.data);
        } else if (result) {
            res.status(result.status || 200).json(result.data);
        } else {
             res.status(500).json({ error: 'Action did not return a response.' });
        }
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
};

// --- AUTH ROUTES ---

router.post('/login', (req, res) => {
    const { username, password, role: expectedRole } = req.body;
    const db = readDb();
    const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (!user || user.role !== expectedRole) {
        return res.status(401).json({ success: false, error: 'Invalid credentials. Please try again.' });
    }

    if (user.duressPassword && password === user.duressPassword) {
        return res.json({ success: true, duress: true });
    }

    if (user.password === password) {
        if (user.isFirstLogin) {
            const duressPassword = user.duressPassword;
            user.isFirstLogin = false;
            writeDb(db);
            return res.json({ success: true, firstLogin: true, duressPassword });
        }
        return res.json({ success: true });
    }

    res.status(401).json({ success: false, error: 'Invalid credentials. Please try again.' });
});

router.post('/register', (req, res) => {
    const db = readDb();
    const { confirm, ...userData } = req.body;
     const newRequest = {
        ...userData,
        requestDate: new Date().toISOString().split('T')[0],
    };
    db.pendingRegistrations.push(newRequest);
    writeDb(db);
    res.status(201).json({ success: true });
});

router.get('/security-questions', (req, res) => {
    res.json(SECURITY_QUESTIONS);
});

router.post('/check-username', (req, res) => {
    const { username } = req.body;
    const db = readDb();
    const isTaken = db.users.some(u => u.username.toLowerCase() === username.toLowerCase()) ||
                    db.pendingRegistrations.some(p => p.username.toLowerCase() === username.toLowerCase());
    res.json({ isTaken });
});

router.post('/security-question', (req, res) => {
    const { username } = req.body;
    const db = readDb();
    const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (user) {
        const question = SECURITY_QUESTIONS[user.securityQuestionIndex];
        res.json({ success: true, question });
    } else {
        res.status(404).json({ success: false, error: 'Username not found.' });
    }
});

router.post('/submit-security-answer', (req, res) => {
    const { username, answer } = req.body;
    const db = readDb();
    const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (user && answer.toLowerCase() === user.securityQuestionAnswer.toLowerCase()) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, error: 'Incorrect answer.' });
    }
});

router.post('/duress-alert', (req, res) => {
    const { username, location } = req.body;
    const db = readDb();
    const locationInfo = location ? `at geo-coordinates ${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}` : `(location unavailable)`;
    const newThreat = {
        id: Date.now(),
        type: 'DURESS ALERT (CODE RED SKY)',
        source: 'Operative Credential',
        reportedBy: username,
        timestamp: new Date().toISOString().replace('T', ' ').split('.')[0] + ' UTC',
        status: 'Pending',
        details: `Operative ${username} has activated a duress protocol ${locationInfo}. Immediate action required. Operative may be compromised.`
    };
    db.threats.push(newThreat);
    writeDb(db);
    res.json({ success: true });
});


// --- DATA ROUTES (HQ & Operative) ---

router.get('/operatives', (req, res) => {
    const db = readDb();
    res.json(db.operatives);
});

router.get('/operatives/profile/:username', (req, res) => {
    const { username } = req.params;
    const db = readDb();
    const operative = db.operatives.find(op => op.id === username);
    if (operative) {
        res.json(operative);
    } else {
        res.status(404).json(null);
    }
});

router.get('/operatives/contacts/:username', (req, res) => {
    const { username } = req.params;
    const db = readDb();
    const user = db.users.find(u => u.username === username);
    if (!user) return res.status(404).json([]);
    
    const contactList = db.operatives.filter(op => user.contacts.includes(op.id));

    const enrichedContacts = contactList.map(op => {
        const targetUser = db.users.find(u => u.username === op.id);
        const isVisible = targetUser?.isStatusVisible ?? true;
        return { ...op, status: isVisible ? op.status : 'Offline' };
    });
    
    res.json(enrichedContacts);
});

router.get('/operatives/search', (req, res) => {
    const { query, username: searcherUsername } = req.query;
    const db = readDb();
    const searcher = db.users.find(u => u.username === searcherUsername);
    const searcherContacts = searcher?.contacts || [];
    const lowerCaseQuery = query.toLowerCase();

    const results = db.operatives
        .filter(op =>
            op.id.toLowerCase() !== searcherUsername.toLowerCase() &&
            (op.name.toLowerCase().includes(lowerCaseQuery) || op.id.toLowerCase().includes(lowerCaseQuery))
        )
        .map(op => ({ ...op, isContact: searcherContacts.includes(op.id) }));
    
    res.json(results);
});

router.post('/operatives/status', (req, res) => {
    const { username, status } = req.body;
    const db = readDb();
    const op = db.operatives.find(o => o.id === username);
    if (op) {
        op.status = status;
        writeDb(db);
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false, error: 'Operative not found' });
    }
});

router.post('/operatives/visibility', (req, res) => {
    const { username, isVisible } = req.body;
    const db = readDb();
    const user = db.users.find(u => u.username === username);
    const op = db.operatives.find(o => o.id === username);
    let success = false;
    if (user) {
        user.isStatusVisible = isVisible;
        success = true;
    }
    if (op) {
        op.isStatusVisible = isVisible;
        success = true;
    }
    if (success) {
        writeDb(db);
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false, error: 'User or Operative not found' });
    }
});


router.get('/threats', (req, res) => {
    const db = readDb();
    res.json(db.threats.sort((a, b) => b.id - a.id));
});

router.post('/threats/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const db = readDb();
    const threat = db.threats.find(t => t.id == id);
    if (threat) {
        threat.status = status;
        writeDb(db);
        res.json(threat);
    } else {
        res.status(404).json({ error: 'Threat not found' });
    }
});

router.post('/threats/:id/analyze', (req, res) => {
    const { id } = req.params;
    const db = readDb();
    const threat = db.threats.find(t => t.id == id);
    if (!threat) return res.status(404).json({ error: 'Threat not found' });
    
    let analysis = {
        summary: "Standard threat detected. Follow protocol.",
        mitigationSteps: ["Monitor associated network traffic.", "Verify operative status via secondary channel.", "Log all actions taken."]
    };
    const type = threat.type.toLowerCase();
     if (type.includes('phishing')) {
        analysis = {
            summary: "AI analysis indicates a targeted phishing campaign. The URL provided uses a non-standard TLD (.xyz) and mimics our official domain. The goal is likely credential harvesting.",
            mitigationSteps: ["Block the domain 'vajralink-secure-auth.xyz' network-wide.", "Issue a global alert to all operatives regarding this specific phishing attempt.", "Scan network logs for any access attempts to the malicious domain.", "Initiate password reset protocols for the reporting operative as a precaution."]
        };
    } else if (type.includes('duress')) {
        analysis = {
            summary: "AI confirms a high-probability duress situation. The operative's activation of this protocol is a critical alert that requires immediate, covert response.",
            mitigationSteps: ["DO NOT attempt to contact the operative through VajraLink.", "Activate live tracking on the operative's device if available.", "Dispatch the nearest Quick Reaction Force (QRF) to the last known coordinates.", "Monitor the operative's comms for any unusual activity or keywords."]
        };
    } else if (type.includes('exfiltration')) {
        analysis = {
            summary: "AI pattern analysis suggests a potential data breach. The volume of outbound traffic from the operative's device is 3 standard deviations above their daily average. The destination IP is not on our whitelist.",
            mitigationSteps: ["Immediately quarantine the operative's device from the network.", "Begin a forensic analysis of the data packets if captured.", "Remotely trigger a security scan on the device.", "Alert the operative's handler to investigate potential device compromise."]
        }
    }
    threat.aiAnalysis = analysis;
    writeDb(db);
    res.json(threat);
});

router.get('/dashboard-stats', (req, res) => {
    const db = readDb();
    const openThreats = db.threats.filter(t => t.status === 'Pending' || t.status === 'Reviewing').length;
    let threatLevel = 'Low';
    if (openThreats > 3 || db.threats.some(t => t.type.includes('DURESS'))) threatLevel = 'Critical';
    else if (openThreats > 1) threatLevel = 'Elevated';

    res.json({
        activeOperatives: db.operatives.filter(o => o.status === 'Online').length,
        threatLevel,
        openThreats,
        networkIntegrity: "99.8%"
    });
});

router.get('/threats/recent', (req, res) => {
    const { count = 2 } = req.query;
    const db = readDb();
    const recent = db.threats
        .filter(t => t.status !== 'Mitigated')
        .sort((a, b) => b.id - a.id)
        .slice(0, parseInt(count));
    res.json(recent);
});


// --- PENDING REGISTRATIONS ---

router.get('/registrations/pending', (req, res) => {
    const db = readDb();
    res.json(db.pendingRegistrations);
});

router.post('/registrations/:username/approve', (req, res) => {
    const { username } = req.params;
    const db = readDb();
    const regIndex = db.pendingRegistrations.findIndex(p => p.username === username);
    if (regIndex === -1) return res.status(404).json({ success: false, error: 'Registration not found' });
    
    const [pendingUser] = db.pendingRegistrations.splice(regIndex, 1);
    
    db.users.push({
        username: pendingUser.username,
        password: pendingUser.password || 'password123',
        role: 'operative',
        securityQuestionIndex: 0,
        securityQuestionAnswer: 'Placeholder',
        contacts: [],
        duressPassword: generateUniqueDuressPassword(db.users),
        isFirstLogin: true,
        isStatusVisible: true,
    });

    db.operatives.push({
        id: pendingUser.username,
        name: pendingUser.username,
        rank: pendingUser.rank,
        status: 'Offline',
        clearance: 3,
        joinDate: new Date().toISOString().split('T')[0],
        isStatusVisible: true,
    });

    writeDb(db);
    res.json({ success: true });
});

router.post('/registrations/:username/deny', (req, res) => {
    const { username } = req.params;
    const db = readDb();
    db.pendingRegistrations = db.pendingRegistrations.filter(p => p.username !== username);
    writeDb(db);
    res.json({ success: true });
});

// --- CONNECTION REQUESTS ---

router.get('/connections/pending', (req, res) => {
    const db = readDb();
    res.json(db.connectionRequests.filter(r => r.status === 'pending'));
});

router.post('/connections', (req, res) => {
    const { from, to, reason } = req.body;
    const db = readDb();
    const newRequest = {
        id: Date.now(),
        fromUsername: from,
        toUsername: to,
        reason,
        requestDate: new Date().toISOString().split('T')[0],
        status: 'pending'
    };
    db.connectionRequests.push(newRequest);
    writeDb(db);
    res.status(201).json({ success: true });
});

router.post('/connections/:id/approve', (req, res) => {
    const { id } = req.params;
    const db = readDb();
    const request = db.connectionRequests.find(r => r.id == id);
    if (!request) return res.status(404).json({ success: false });
    
    request.status = 'approved';
    const user1 = db.users.find(u => u.username === request.fromUsername);
    const user2 = db.users.find(u => u.username === request.toUsername);
    if (user1 && user2) {
        if (!user1.contacts.includes(user2.username)) user1.contacts.push(user2.username);
        if (!user2.contacts.includes(user1.username)) user2.contacts.push(user1.username);
    }
    
    writeDb(db);
    res.json({ success: true });
});

router.post('/connections/:id/deny', (req, res) => {
    const { id } = req.params;
    const db = readDb();
    const request = db.connectionRequests.find(r => r.id == id);
    if (!request) return res.status(404).json({ success: false });
    
    request.status = 'denied';
    writeDb(db);
    res.json({ success: true });
});

// --- GROUP MANAGEMENT ---

router.get('/groups/:username', (req, res) => {
    const { username } = req.params;
    const db = readDb();
    const userGroups = db.groups.filter(g => g.members.includes(username));
    res.json(userGroups);
});

router.get('/group-details/:id', (req, res) => {
    const { id } = req.params;
    const db = readDb();
    const group = db.groups.find(g => g.id === id);
    res.json(group || null);
});

router.post('/groups', (req, res) => {
    const { name, admin, members } = req.body;
    const db = readDb();
    const newGroup = {
        id: name.toLowerCase().replace(/\s/g, '-') + '-' + Date.now(),
        name, admin, members,
        createdAt: new Date().toISOString(),
        icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.084-1.28-.24-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.084-1.28.24-1.857m11.52 1.857a3 3 0 00-5.356-1.857m0 0A3 3 0 017 16.143m5.657 1.857l-2.829-5.657a3 3 0 015.657 0l-2.829 5.657z',
    };
    db.groups.push(newGroup);
    writeDb(db);
    res.status(201).json(newGroup);
});

router.post('/groups/:id/members', (req, res) => {
    const { id } = req.params;
    const { memberId, requesterId } = req.body;
    const db = readDb();
    const group = db.groups.find(g => g.id === id);
    if (!group || group.admin !== requesterId || group.members.includes(memberId)) {
        return res.status(400).json({ success: false });
    }
    group.members.push(memberId);
    writeDb(db);
    res.json({ success: true });
});

router.delete('/groups/:id/members/:memberId', (req, res) => {
    const { id, memberId } = req.params;
    const { requesterId } = req.body;
    const db = readDb();
    const group = db.groups.find(g => g.id === id);
    if (!group || (group.admin !== requesterId && memberId !== requesterId)) {
        return res.status(403).json({ success: false }); // Forbidden
    }

    if (group.admin === memberId && memberId === requesterId) {
         return res.status(400).json({ success: false, error: 'Admin must delete group, cannot leave.'})
    }
    
    group.members = group.members.filter(m => m !== memberId);
    writeDb(db);
    res.json({ success: true });
});

router.delete('/groups/:id', (req, res) => {
    const { id } = req.params;
    const { requesterId } = req.body;
    const db = readDb();
    const group = db.groups.find(g => g.id === id);
    if (!group || group.admin !== requesterId) {
        return res.status(403).json({ success: false });
    }
    db.groups = db.groups.filter(g => g.id !== id);
    writeDb(db);
    res.json({ success: true });
});


module.exports = router;
