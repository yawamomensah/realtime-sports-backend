import { WebSocket, WebSocketServer } from 'ws';
import { wsArcjet } from '../../arcjet.js';

const MAX_BUFFERED_AMOUNT = 1024 * 1024;

function sendJson(socket, payload) {
    if (socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify(payload));
}

function broadcast(wss, payload) {
    for (const client of wss.clients) {
        if (client.readyState !== WebSocket.OPEN) continue;

        if (client.bufferedAmount > MAX_BUFFERED_AMOUNT) {
            client.terminate();
            continue;
        }

        client.send(JSON.stringify(payload));
    }
}

export function attachWebsocketServer(server) {
    const wss = new WebSocketServer({
        noServer: true,
        path: '/ws',
        maxPayload: 1024 * 1024,
    });

    server.on('upgrade', async (req, socket, head) => {
        const { pathname } = new URL(req.url, `http://${req.headers.host}`);
        if (pathname !== '/ws') return;
        
        if (wsArcjet) {
            try {
                const decision = await wsArcjet.protect(req);

                if (decision.isErrored()) {
                    console.error("WS upgrade protection error", decision.conclusion);
                    socket.write(1011, "HTTP/1.1 500 Internal Server Error\r\n\r\n");
                    socket.destroy();
                    return;
                }

                if (decision.isDenied()) {
                    decision.reason.isRateLimit() ? socket.write('HTTP/1.1 429 Too Many Requests\r\n\r\n'): socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
                    socket.destroy();
                    return;
                }

                wss.handleUpgrade(req, socket, head, (ws) => {
                    wss.emit('connection', ws, req);
                });
            } catch (e) {
                console.error("WS upgrade protection error", e);
                socket.write(1011, "HTTP/1.1 500 Internal Server Error\r\n\r\n");
                socket.destroy();
                return;
            }
        }
    });

    wss.on('connection', async (socket, req) => {
        socket.isAlive = true;
        socket.on('pong', () => {
            socket.isAlive = true;
        });
        sendJson(socket, {type: 'welcome'});
        socket.on('error', console.error);
    });

    const interval = setInterval(() => {
        wss.clients.forEach((ws) => {
            if (ws.isAlive === false) return ws.terminate();
            ws.isAlive = false;
            ws.ping();
        });
    }, 3000);

    wss.on('close', () => {
        clearInterval(interval);
    });

    function broadcastMatchCreated(match) {
        broadcast(wss, { type: 'match_created', data: match });
    }

    return { broadcastMatchCreated };
}