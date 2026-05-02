import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import connectDB from './services/db.js';
import { handleLocationUpdate, getAllLocations } from './controller/location.js';
import { geminiGenerate } from './controller/gemini.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());
app.set('socketio', io);

// ROUTE 1: Mobile dev calls this to get the 100 scrapped locations
app.get('/api/all-locations', getAllLocations);

// ROUTE 2: Mobile dev calls this every time a user moves
app.post('/api/user-location', handleLocationUpdate);

app.post('/api/generate', geminiGenerate);
app.post('/test', (req, res) => {
  console.log("Test route hit");
  res.json({ msg: "working" });
});

server.listen(3000, () => {
    console.log("🚀 Server running on port 3000");
});