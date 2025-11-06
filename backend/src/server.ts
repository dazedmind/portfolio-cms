import express, { type Express, type Request, type Response } from 'express';
import dotenv from 'dotenv';
import { authMiddleware } from './middleware/auth.js';
import profileRoutes from './routes/profile.js';
import { loginRoute } from './controllers/auth.controller.js';
import projectRoutes from './routes/project.js';
import skillsRoutes from './routes/skills.js';
import apiKeyRoutes from './routes/apiKey.js';
import employmentRoutes from './routes/employment.js';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;
// const BASE_URL = process.env.BACKEND_API_URL || 'http://localhost:5173';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware (adjust as needed for your frontend)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.get("/", (req: Request, res: Response) => {
  res.send("✅ Backend is live and running!");
});

// Routes
app.post('/api/login', loginRoute);

app.use('/api/profile', profileRoutes);

app.use('/api/project', projectRoutes);

app.use('/api/skills', skillsRoutes);

app.use('/api/employment', employmentRoutes);

app.use('/api/key', apiKeyRoutes);

// Example protected route using auth middleware
app.get('/api/profile', authMiddleware, (req: Request, res: Response) => {
  // Access authenticated user info via req.user
  res.json({
    message: 'Protected route accessed successfully',
    user: req.user,
  });
});

// Health check route
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

