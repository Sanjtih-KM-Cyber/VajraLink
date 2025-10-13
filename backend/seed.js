require('dotenv').config({ path: __dirname + '/.env' });
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const initialData = {
  "users": [
    {
      "username": "hq_admin",
      "password": "password123",
      "role": "admin",
      "securityQuestionIndex": 2,
      "securityQuestionAnswer": "Johnson",
      "contacts": [],
      "duressPassword": "duresspassword",
      "isFirstLogin": false,
      "isStatusVisible": true
    }
  ],
  "operatives": [],
  "groups": [],
  "threats": [],
  "pendingRegistrations": [],
  "connectionRequests": [],
  "familyMembers": [
    {
      "username": "family_user",
      "password": "password123",
      "relatedTo": "agent_zero"
    }
  ]
};


async function seedDatabase() {
    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db();
        console.log("Connected to MongoDB for seeding.");

        const collections = {
            users: db.collection('users'),
            operatives: db.collection('operatives'),
            groups: db.collection('groups'),
            threats: db.collection('threats'),
            pendingRegistrations: db.collection('pendingRegistrations'),
            connectionRequests: db.collection('connectionRequests'),
            familyMembers: db.collection('familyMembers'),
        };

        // Clear existing data
        for (const collection of Object.values(collections)) {
            await collection.deleteMany({});
        }
        console.log("Cleared existing collections.");
        
        // Hash user passwords
        const usersWithHashedPasswords = await Promise.all(
            initialData.users.map(async (user) => {
                const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);
                const hashedDuressPassword = await bcrypt.hash(user.duressPassword, SALT_ROUNDS);
                return { ...user, password: hashedPassword, duressPassword: hashedDuressPassword };
            })
        );
        
        // Hash pending registration passwords
        const pendingWithHashedPasswords = await Promise.all(
            initialData.pendingRegistrations.map(async (reg) => {
                 const hashedPassword = await bcrypt.hash(reg.password, SALT_ROUNDS);
                 return { ...reg, password: hashedPassword };
            })
        );


        // Hash family member passwords
        const familyWithHashedPasswords = await Promise.all(
            initialData.familyMembers.map(async (member) => {
                const hashedPassword = await bcrypt.hash(member.password, SALT_ROUNDS);
                return { ...member, password: hashedPassword };
            })
        );

        // Insert new data, checking for non-empty arrays
        if (usersWithHashedPasswords.length > 0) {
            await collections.users.insertMany(usersWithHashedPasswords);
        }
        if (initialData.operatives.length > 0) {
            await collections.operatives.insertMany(initialData.operatives);
        }
        if (initialData.groups.length > 0) {
            await collections.groups.insertMany(initialData.groups);
        }
        if (initialData.threats.length > 0) {
            await collections.threats.insertMany(initialData.threats);
        }
        if (pendingWithHashedPasswords.length > 0) {
            await collections.pendingRegistrations.insertMany(pendingWithHashedPasswords);
        }
        if (initialData.connectionRequests.length > 0) {
            await collections.connectionRequests.insertMany(initialData.connectionRequests);
        }
        if (familyWithHashedPasswords.length > 0) {
            await collections.familyMembers.insertMany(familyWithHashedPasswords);
        }
        
        console.log("Database seeded successfully!");

    } catch (err) {
        console.error("Error seeding database:", err);
    } finally {
        await client.close();
        console.log("MongoDB connection closed.");
    }
}

seedDatabase();