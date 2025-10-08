const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getDb } = require('./database');
const router = express.Router();

const SALT_ROUNDS = 10;

// Helper function to get collections
const getCollections = () => {
    const db = getDb();
    return {
        users: db.collection('users'),
        operatives: db.collection('operatives'),
        groups: db.collection('groups'),
        threats: db.collection('threats'),
        pendingRegistrations: db.collection('pendingRegistrations'),
        connectionRequests: db.collection('connectionRequests'),
    };
};

// --- JWT Authentication Middleware ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.sendStatus(401); // Unauthorized
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403); // Forbidden
        }
        req.user = user;
        next();
    });
};

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

const generateUniqueDuressPassword = async () => {
    const { users } = getCollections();
    // In a real app with many users, you'd want a more efficient way to check for uniqueness
    const existingUsers = await users.find({}, { projection: { duressPassword: 1 } }).toArray();
    const duressPasswords = new Set(existingUsers.map(u => u.duressPassword));

    let newPassword = '';
    do {
        const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
        const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
        const num = Math.floor(Math.random() * 90) + 10;
        newPassword = `${adj}-${noun}-${num}`.toLowerCase();
    } while (duressPasswords.has(newPassword)); // This check is conceptual; bcrypt hashes won't match
    return newPassword;
};

// --- PUBLIC AUTH ROUTES (No token required) ---

router.post('/login', async (req, res) => {
    try {
        const { users } = getCollections();
        const { username, password, role: expectedRole } = req.body;
        
        const user = await users.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });

        if (!user || user.role !== expectedRole) {
            return res.status(401).json({ success: false, error: 'Invalid credentials. Please try again.' });
        }
        
        const isDuressMatch = await bcrypt.compare(password, user.duressPassword || '');
        if (isDuressMatch) {
            const token = jwt.sign({ username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
            return res.json({ success: true, duress: true, token });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            if (user.isFirstLogin) {
                 const newDuressPassword = await generateUniqueDuressPassword();
                 const hashedDuressPassword = await bcrypt.hash(newDuressPassword, SALT_ROUNDS);
                 await users.updateOne({ _id: user._id }, { $set: { duressPassword: hashedDuressPassword, isFirstLogin: false } });
                 const token = jwt.sign({ username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
                 return res.json({ success: true, firstLogin: true, duressPassword: newDuressPassword, token });
            }
            const token = jwt.sign({ username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
            return res.json({ success: true, token });
        }

        res.status(401).json({ success: false, error: 'Invalid credentials. Please try again.' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: 'Internal server error.' });
    }
});


router.post('/register', async (req, res) => {
    const { pendingRegistrations } = getCollections();
    const { confirm, ...userData } = req.body;
     const newRequest = {
        ...userData,
        requestDate: new Date().toISOString().split('T')[0],
    };
    await pendingRegistrations.insertOne(newRequest);
    res.status(201).json({ success: true });
});

router.post('/check-username', async (req, res) => {
    const { username } = req.body;
    const { users, pendingRegistrations } = getCollections();
    const query = { username: { $regex: new RegExp(`^${username}$`, 'i') } };
    const userExists = await users.findOne(query);
    const pendingExists = await pendingRegistrations.findOne(query);
    res.json({ isTaken: !!userExists || !!pendingExists });
});

router.post('/security-question', async (req, res) => {
    const { username } = req.body;
    const { users } = getCollections();
    const user = await users.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
    if (user) {
        const question = SECURITY_QUESTIONS[user.securityQuestionIndex];
        res.json({ success: true, question });
    } else {
        res.status(404).json({ success: false, error: 'Username not found.' });
    }
});

router.post('/submit-security-answer', async (req, res) => {
    const { username, answer } = req.body;
    const { users } = getCollections();
    const user = await users.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
    if (user && answer.toLowerCase() === user.securityQuestionAnswer.toLowerCase()) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, error: 'Incorrect answer.' });
    }
});


// --- APPLY AUTHENTICATION MIDDLEWARE ---
router.use(authenticateToken);

// --- PROTECTED ROUTES ---

router.post('/duress-alert', async (req, res) => {
    const { threats } = getCollections();
    const { username, location } = req.body;
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
    await threats.insertOne(newThreat);
    res.json({ success: true });
});


// --- DATA ROUTES (HQ & Operative) ---

router.get('/operatives', async (req, res) => {
    const { operatives } = getCollections();
    const allOperatives = await operatives.find().toArray();
    res.json(allOperatives);
});

router.get('/operatives/profile/:username', async (req, res) => {
    const { username } = req.params;
    const { operatives } = getCollections();
    const operative = await operatives.findOne({ id: username });
    res.json(operative);
});

router.get('/operatives/contacts/:username', async (req, res) => {
    const { username } = req.params;
    const { users, operatives } = getCollections();
    const user = await users.findOne({ username });
    if (!user) return res.status(404).json([]);
    
    const contactList = await operatives.find({ id: { $in: user.contacts } }).toArray();

    const contactUsers = await users.find({ username: { $in: user.contacts } }).toArray();
    const visibilityMap = new Map(contactUsers.map(u => [u.username, u.isStatusVisible]));
    
    const enrichedContacts = contactList.map(op => ({
        ...op,
        status: visibilityMap.get(op.id) ?? true ? op.status : 'Offline'
    }));
    
    res.json(enrichedContacts);
});

router.get('/operatives/search', async (req, res) => {
    const { query, username: searcherUsername } = req.query;
    const { users, operatives } = getCollections();

    const searcher = await users.findOne({ username: searcherUsername });
    const searcherContacts = searcher?.contacts || [];
    const lowerCaseQuery = query.toLowerCase();

    const results = await operatives.find({
        id: { $ne: searcherUsername },
        $or: [
            { name: { $regex: lowerCaseQuery, $options: 'i' } },
            { id: { $regex: lowerCaseQuery, $options: 'i' } }
        ]
    }).toArray();

    const mappedResults = results.map(op => ({
        ...op,
        isContact: searcherContacts.includes(op.id)
    }));
    
    res.json(mappedResults);
});

router.post('/operatives/status', async (req, res) => {
    const { username, status } = req.body;
    const { operatives } = getCollections();
    const result = await operatives.updateOne({ id: username }, { $set: { status } });
    if (result.matchedCount > 0) {
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false, error: 'Operative not found' });
    }
});

router.post('/operatives/visibility', async (req, res) => {
    const { username, isVisible } = req.body;
    const { users, operatives } = getCollections();
    const userResult = await users.updateOne({ username }, { $set: { isStatusVisible: isVisible } });
    const opResult = await operatives.updateOne({ id: username }, { $set: { isStatusVisible: isVisible } });
    
    if (userResult.matchedCount > 0 || opResult.matchedCount > 0) {
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false, error: 'User or Operative not found' });
    }
});


router.get('/threats', async (req, res) => {
    const { threats } = getCollections();
    const allThreats = await threats.find().sort({ id: -1 }).toArray();
    res.json(allThreats);
});

router.post('/threats/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const { threats } = getCollections();
    const result = await threats.findOneAndUpdate(
        { id: parseInt(id) },
        { $set: { status } },
        { returnDocument: 'after' }
    );
    if (result) {
        res.json(result);
    } else {
        res.status(404).json({ error: 'Threat not found' });
    }
});

router.post('/threats/:id/analyze', async (req, res) => {
    const { id } = req.params;
    const { threats } = getCollections();
    const threat = await threats.findOne({ id: parseInt(id) });
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
    
    const result = await threats.findOneAndUpdate(
        { id: parseInt(id) },
        { $set: { aiAnalysis: analysis } },
        { returnDocument: 'after' }
    );
    res.json(result);
});

router.get('/dashboard-stats', async (req, res) => {
    const { threats, operatives } = getCollections();
    const openThreatsCount = await threats.countDocuments({ status: { $in: ['Pending', 'Reviewing'] } });
    const hasDuress = await threats.findOne({ type: /DURESS/i });
    
    let threatLevel = 'Low';
    if (openThreatsCount > 3 || hasDuress) threatLevel = 'Critical';
    else if (openThreatsCount > 1) threatLevel = 'Elevated';

    const activeOperatives = await operatives.countDocuments({ status: 'Online' });

    res.json({
        activeOperatives,
        threatLevel,
        openThreats: openThreatsCount,
        networkIntegrity: "99.8%"
    });
});

router.get('/threats/recent', async (req, res) => {
    const { count = 2 } = req.query;
    const { threats } = getCollections();
    const recent = await threats
        .find({ status: { $ne: 'Mitigated' } })
        .sort({ id: -1 })
        .limit(parseInt(count))
        .toArray();
    res.json(recent);
});


// --- PENDING REGISTRATIONS ---

router.get('/registrations/pending', async (req, res) => {
    const { pendingRegistrations } = getCollections();
    res.json(await pendingRegistrations.find().toArray());
});

router.post('/registrations/:username/approve', async (req, res) => {
    try {
        const { username } = req.params;
        const { pendingRegistrations, users, operatives } = getCollections();
        
        const pendingUser = await pendingRegistrations.findOneAndDelete({ username });
        if (!pendingUser) return res.status(404).json({ success: false, error: 'Registration not found' });
        
        const hashedPassword = await bcrypt.hash(pendingUser.password || 'password123', SALT_ROUNDS);
        
        await users.insertOne({
            username: pendingUser.username,
            password: hashedPassword,
            role: 'operative',
            securityQuestionIndex: pendingUser.securityQuestionIndex || 0,
            securityQuestionAnswer: pendingUser.securityQuestionAnswer || 'Placeholder',
            contacts: [],
            duressPassword: await bcrypt.hash('placeholder-duress', SALT_ROUNDS), // Will be set on first login
            isFirstLogin: true,
            isStatusVisible: true,
        });

        await operatives.insertOne({
            id: pendingUser.username,
            name: pendingUser.username,
            rank: pendingUser.rank,
            status: 'Offline',
            clearance: 3,
            joinDate: new Date().toISOString().split('T')[0],
            isStatusVisible: true,
        });

        res.json({ success: true });
    } catch (error) {
        console.error("Error approving registration:", error);
        res.status(500).json({ success: false, error: "Internal server error." });
    }
});

router.post('/registrations/:username/deny', async (req, res) => {
    const { username } = req.params;
    const { pendingRegistrations } = getCollections();
    await pendingRegistrations.deleteOne({ username });
    res.json({ success: true });
});

// --- CONNECTION REQUESTS ---

router.get('/connections/pending', async (req, res) => {
    const { connectionRequests } = getCollections();
    res.json(await connectionRequests.find({ status: 'pending' }).toArray());
});

router.post('/connections', async (req, res) => {
    const { from, to, reason } = req.body;
    const { connectionRequests } = getCollections();
    const newRequest = {
        id: Date.now(),
        fromUsername: from,
        toUsername: to,
        reason,
        requestDate: new Date().toISOString().split('T')[0],
        status: 'pending'
    };
    await connectionRequests.insertOne(newRequest);
    res.status(201).json({ success: true });
});

router.post('/connections/:id/approve', async (req, res) => {
    const { id } = req.params;
    const { connectionRequests, users } = getCollections();
    const request = await connectionRequests.findOne({ id: parseInt(id) });
    if (!request) return res.status(404).json({ success: false });
    
    await connectionRequests.updateOne({ id: parseInt(id) }, { $set: { status: 'approved' } });
    await users.updateOne({ username: request.fromUsername }, { $addToSet: { contacts: request.toUsername } });
    await users.updateOne({ username: request.toUsername }, { $addToSet: { contacts: request.fromUsername } });
    
    res.json({ success: true });
});

router.post('/connections/:id/deny', async (req, res) => {
    const { id } = req.params;
    const { connectionRequests } = getCollections();
    await connectionRequests.updateOne({ id: parseInt(id) }, { $set: { status: 'denied' } });
    res.json({ success: true });
});

// --- GROUP MANAGEMENT ---

router.get('/groups/:username', async (req, res) => {
    const { username } = req.params;
    const { groups } = getCollections();
    res.json(await groups.find({ members: username }).toArray());
});

router.get('/group-details/:id', async (req, res) => {
    const { id } = req.params;
    const { groups } = getCollections();
    res.json(await groups.findOne({ id }));
});

router.post('/groups', async (req, res) => {
    const { name, admin, members } = req.body;
    const { groups } = getCollections();
    const newGroup = {
        id: name.toLowerCase().replace(/\s/g, '-') + '-' + Date.now(),
        name, admin, members,
        createdAt: new Date().toISOString(),
        icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.084-1.28-.24-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.084-1.28.24-1.857m11.52 1.857a3 3 0 00-5.356-1.857m0 0A3 3 0 017 16.143m5.657 1.857l-2.829-5.657a3 3 0 015.657 0l-2.829 5.657z',
    };
    await groups.insertOne(newGroup);
    res.status(201).json(newGroup);
});

router.post('/groups/:id/members', async (req, res) => {
    const { id } = req.params;
    const { memberId, requesterId } = req.body;
    const { groups } = getCollections();
    const group = await groups.findOne({ id });
    if (!group || group.admin !== requesterId) {
        return res.status(403).json({ success: false });
    }
    await groups.updateOne({ id }, { $addToSet: { members: memberId } });
    res.json({ success: true });
});

router.delete('/groups/:id/members/:memberId', async (req, res) => {
    const { id, memberId } = req.params;
    const { requesterId } = req.body;
    const { groups } = getCollections();
    const group = await groups.findOne({ id });
    if (!group || (group.admin !== requesterId && memberId !== requesterId)) {
        return res.status(403).json({ success: false });
    }

    if (group.admin === memberId && memberId === requesterId) {
         return res.status(400).json({ success: false, error: 'Admin must delete group, cannot leave.'})
    }
    
    await groups.updateOne({ id }, { $pull: { members: memberId } });
    res.json({ success: true });
});

router.delete('/groups/:id', async (req, res) => {
    const { id } = req.params;
    const { requesterId } = req.body;
    const { groups } = getCollections();
    const group = await groups.findOne({ id });
    if (!group || group.admin !== requesterId) {
        return res.status(403).json({ success: false });
    }
    await groups.deleteOne({ id });
    res.json({ success: true });
});


module.exports = router;
