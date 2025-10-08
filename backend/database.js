const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vajralink';
const client = new MongoClient(uri);

let db;

const connectToDb = async () => {
    try {
        await client.connect();
        db = client.db();
        console.log('Successfully connected to MongoDB.');
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1); // Exit process with failure
    }
};

const getDb = () => {
    if (!db) {
        throw new Error('Database not initialized. Call connectToDb first.');
    }
    return db;
};

module.exports = {
    connectToDb,
    getDb,
};
