import express from 'express';
import { correctGrammar } from '../controllers/grammarController.js';

const router = express.Router();

router.post('/correct', correctGrammar);

export default router;
