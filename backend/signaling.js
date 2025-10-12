const WebSocket = require('ws');

const wss = new WebSocket.Server({ noServer: true });

const clients = new Map();

wss.on('connection', (ws, req) => {
    const userId = new URLSearchParams(req.url.slice(1)).get('userId');
    clients.set(userId, ws);

    ws.on('message', (message) => {
        const { to, ...data } = JSON.parse(message);
        const targetClient = clients.get(to);
        if (targetClient && targetClient.readyState === WebSocket.OPEN) {
            targetClient.send(JSON.stringify({ from: userId, ...data }));
        }
    });

    ws.on('close', () => {
        clients.delete(userId);
    });
});

module.exports = { wss };