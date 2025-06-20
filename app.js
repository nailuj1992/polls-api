import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

import userRoutes from './src/routes/users.js';
app.use('/api/users', userRoutes);

import pollsRoutes from './src/routes/polls.js';
app.use('/api/polls', pollsRoutes);

app.get('/health', (req, res) => {
    res.send('OK');
});

export default app;