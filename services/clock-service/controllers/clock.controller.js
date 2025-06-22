import Deadline from '../models/deadline.model.js';
import { scheduleJob } from '../utils/scheduler.js';

export async function createDeadline(req, res) {
  try {
    const { targetId, deadlineDate } = req.body;
    const dl = new Deadline({ targetId, deadlineDate });
    const saved = await dl.save();
    await scheduleJob(saved);
    return res.status(201).json({ message: 'Deadline scheduled', deadline: saved });
  } catch (err) {
    console.error('[clock] createDeadline error:', err);
    return res.status(500).json({ message: 'Error scheduling deadline', error: err.message });
  }
}

export async function listDeadlines(req, res) {
  try {
    const docs = await Deadline.find().populate('targetId', 'title');
    return res.json({ deadlines: docs });
  } catch (err) {
    console.error('[clock] listDeadlines error:', err);
    return res.status(500).json({ message: 'Error listing deadlines', error: err.message });
  }
}