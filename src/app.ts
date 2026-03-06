import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const publicDir = path.join(process.cwd(), 'public');
app.use(express.static(publicDir));

app.use('/api', routes);

app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.use(errorHandler);

export default app;
