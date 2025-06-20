import express from 'express';
import { createPoll, getPollsByUser, getPollByLink, answerPoll, editPoll, deletePoll, getPollAnswers } from '../controllers/pollsController.js';

const router = express.Router();

router.post('/', createPoll);
router.get('/:username', getPollsByUser);
router.get('/link/:link', getPollByLink);
router.post('/answer/:link', answerPoll);
router.put('/:link', editPoll);
router.delete('/:link', deletePoll);
router.get('/:link/answers/:username', getPollAnswers);

export default router;