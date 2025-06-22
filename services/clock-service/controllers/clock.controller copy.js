import Deadline from '../models/deadline.model.js';
import { scheduleJob } from '../utils/scheduler.js';

export async function createDeadline(req, res, next) {
  try {
    const { targetId, deadlineDate } = req.body;
    const dl = await Deadline.findOneAndUpdate(
      { targetId },
      { deadlineDate },
      { upsert: true, new: true }
    );
    // (Re-)schedule in-memory timer
    scheduleJob(dl.targetId.toString(), dl.deadlineDate);
    res.status(201).json(dl);
  } catch (err) {
    next(err);
  }
}

export async function listDeadlines(_req, res, next) {
  try {
    const all = await Deadline.find().lean();
    res.json(all);
  } catch (err) {
    next(err);
  }
}
