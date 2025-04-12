import express from 'express';
import Goal from '../Goal.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const goals = await Goal.find();
  res.json(goals);
});

router.post('/', async (req, res) => {
  const newGoal = new Goal(req.body);
  await newGoal.save();
  res.status(201).json(newGoal);
});

export default router;
