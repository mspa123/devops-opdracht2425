import Deadline from '../models/deadline.model.js';
import { publish } from '../../../libs/bus.js';

const timers = new Map();

/**
 * Plan of verzet een timer voor een gegeven targetId.
 */
export function scheduleJob(targetId, date) {
  // Clear bestaande timer
  if (timers.has(targetId)) {
    clearTimeout(timers.get(targetId));
  }

  const when = new Date(date).getTime() - Date.now();
  if (when <= 0) {
    // Als deadline al gepasseerd, vuurt direct af:
    fire(targetId);
    return;
  }

  // Zet nieuwe timer
  const timeoutId = setTimeout(() => fire(targetId), when);
  timers.set(targetId, timeoutId);
}

async function fire(targetId) {
  timers.delete(targetId);
  // Publiceer event via RabbitMQ
  publish('deadline', 'reached', {
    targetId,
    timestamp: new Date().toISOString()
  });
}
