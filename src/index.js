import express from 'express';
import { matchRouter } from './routes/matches.js';
import http from 'http';
import { attachWebsocketServer } from './ws/server.js';
import { securityMiddleware } from '../arcjet.js';
import { commentaryRouter } from './routes/commentary.js';

const app = express();
const server = http.createServer(app);

const PORT = Number(process.env.PORT || 8000);
const HOST = process.env.HOST || '0.0.0.0';

app.use(express.json());



app.get('/', (req, res) => {
  res.send('Sports Engine Active');
});

app.use(securityMiddleware());

app.use('/matches', matchRouter);
app.use('/matches/:id/commentary', commentaryRouter);

const { broadcastMatchCreated, broadcastCommentary } = attachWebsocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;
app.locals.broadcastCommentary = broadcastCommentary; 


server.listen(PORT, HOST, () => {
  const httpServerUrl = HOST === '0.0.0.0' ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;
  console.log(`HTTP Server is running on ${httpServerUrl}`);

  const host = process.env.PROJECT_HOST?.replace("https://", "");
  // Ensure we have a host before logging the WebSocket URL
  if (host) {
    // We construct the wss url for the client, which will be different from the
    // local ws url, and does not need the port.
    const wsUrl = `wss://${host}/ws`;
    console.log(`WebSocket Server is running on ${wsUrl}`);
  } else {
    // Fallback for local development if PROJECT_HOST is not set
    const wsUrl = `ws://localhost:${PORT}/ws`;
    console.log(`WebSocket Server is running on ${wsUrl}`);
  }
});