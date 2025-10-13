const WebSocket = require('ws');
const { getDb } = require('./database');

const wss = new WebSocket.Server({ noServer: true });

const clients = new Map(); // Maps userId to WebSocket connection

const broadcastToGroup = async (fromUserId, groupId, messageData) => {
    const db = getDb();
    const groups = db.collection('groups');
    const group = await groups.findOne({ id: groupId });

    if (group && group.members) {
        const fullMessage = JSON.stringify({
            from: fromUserId,
            ...messageData,
            groupId, // Add groupId to identify the chat context on the client
        });

        group.members.forEach(memberId => {
            // Don't send the message back to the sender
            if (memberId !== fromUserId) {
                const targetClient = clients.get(memberId);
                if (targetClient && targetClient.readyState === WebSocket.OPEN) {
                    targetClient.send(fullMessage);
                }
            }
        });
    }
};

wss.on('connection', (ws, req) => {
    const url = new URL(req.url, `ws://${req.headers.host}`);
    const userId = url.searchParams.get('userId');

    if (!userId) {
        ws.close(1008, "User ID is required");
        return;
    }

    clients.set(userId, ws);

    ws.on('message', async (message) => {
        try {
            const parsedMessage = JSON.parse(message);
            const { to, isGroup, ...data } = parsedMessage;

            if (isGroup) {
                // 'to' is a groupId
                await broadcastToGroup(userId, to, data);
            } else {
                // 'to' is a userId for a direct message
                const targetClient = clients.get(to);
                if (targetClient && targetClient.readyState === WebSocket.OPEN) {
                    targetClient.send(JSON.stringify({ from: userId, ...data }));
                }
            }
        } catch (error) {
            console.error("Failed to process message:", error);
        }
    });

    ws.on('close', () => {
        clients.delete(userId);
    });

    ws.on('error', (error) => {
        console.error(`WebSocket error for user ${userId}:`, error);
    });
});

module.exports = { wss };