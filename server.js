import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import userRouter from './routes/userRouter.js';
import businessRouter from './routes/businessRouter.js';
import path from 'path';

// Initialize app
const app = express();
const port = process.env.PORT || 4000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cors());

// Serve static uploads
app.use('/uploads', express.static('uploads'));

// Routes
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/user', userRouter);
app.use('/api/business', businessRouter);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
