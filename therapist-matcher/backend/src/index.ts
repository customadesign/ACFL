import express from 'express';
import cors from 'cors';
import matchRoutes from './routes/matchRoutes';
import coachRoutes from './routes/coachRoutes';
import adminRoutes from './routes/adminRoutes';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:4000', 'http://localhost:4002', 'http://localhost:4003', 'http://localhost:3000', 'http://frontend:3000'],
  credentials: true
}));
app.use(express.json());
app.use('/api', matchRoutes);
app.use('/api', coachRoutes);
app.use('/admin', adminRoutes);

// Add a test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 

