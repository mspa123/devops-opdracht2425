import schedule from 'node-schedule';
import { publish } from '../../../libs/bus.js';
import Deadline from '../models/deadline.model.js';

/**
 * Schedule a single deadline job.
 * When the job runs, it publishes a 'target.deadline.reached' event and removes the doc.
 */
export async function scheduleJob(doc) {
  schedule.scheduleJob(doc._id.toString(), doc.deadlineDate, async () => {
    const payload = { targetId: doc.targetId, deadlineDate: doc.deadlineDate };
    publish('deadline', 'target.deadline.reached', payload);
    console.log('[clock] Published deadline.reached for', doc.targetId);
    await Deadline.findByIdAndDelete(doc._id);
  });
}

/**
 * On service start, load and schedule all existing deadlines.
 */
export async function scheduleExisting() {
  const all = await Deadline.find();
  all.forEach(scheduleJob);
}

