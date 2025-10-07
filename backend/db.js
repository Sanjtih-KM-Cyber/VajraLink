const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db.json');

// --- DATABASE HELPERS ---

const readDb = () => {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading database file:", error);
        // This is a critical error in a real app, might need to exit or use a backup.
        // For this simulation, we'll return an empty structure.
        return {
            users: [],
            operatives: [],
            groups: [],
            threats: [],
            pendingRegistrations: [],
            connectionRequests: [],
        };
    }
};

const writeDb = (data) => {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error("Error writing to database file:", error);
    }
};

module.exports = {
    readDb,
    writeDb,
};
