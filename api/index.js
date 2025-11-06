import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is running' });
});

app.post('/api/auth/login', (req, res) => {
  res.json({ message: 'Login endpoint - coming soon' });
});

app.post('/api/auth/register', (req, res) => {
  res.json({ message: 'Register endpoint - coming soon' });
});

export default app;