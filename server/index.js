import express from 'express';
import bodyParser from 'body-parser';
import grammarRoutes from './routes/grammarRoutes.js';
import errorHandler from './utils/errorHandler.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use('/api', grammarRoutes);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));