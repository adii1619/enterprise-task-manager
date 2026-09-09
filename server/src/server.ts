import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import taskRoutes from './routes/taskRoutes.js';
import columnRoutes from "./routes/columnRoutes.js"
import authRoutes from './routes/authRoutes.js';
import workspaceRoutes from './routes/workspaceRoutes.js';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/columns', columnRoutes)
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);

// Health Check Route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Server is healthy and running' });
});

app.listen(PORT, () => {
  console.log(`⚡️[server]: Express server running at http://localhost:${PORT}`);
});