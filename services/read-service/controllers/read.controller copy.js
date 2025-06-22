import Target from '../models/target.model.js';
import Score from '../models/score.model.js';

/**
 * GET /active
 * Alle actieve targets waarvan de deadline nog niet voorbij is
 */

export async function getActiveTargets(_req, res, next) {
  try {
    const now = new Date();
    const targets = await Target.find({
      active: true,
      deadline: { $gt: now }
    }).lean();
    res.json(targets);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /finished
 * Alle targets waarvan de deadline voorbij is, mét gemiddelde score
 */

export async function getFinishedTargets(_req, res, next) {
  try {
    const now = new Date();
    const targets = await Target.find({
      active: true,
      deadline: { $lt: now }
    }).lean();

    const withScore = await Promise.all(targets.map(async target => {
        const agg = await Score.aggregate([
            { $match: { targetId: target._id } },
            { $group: { _id: null, avg: { $avg: '$totalScore' } } },
        ]);
        return { ...target, avgScore: agg[0]?.avg || 0 };
    }));

    res.json(withScore);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /target/:id/leaderboard
 * Ranglijst van scores voor één target
 */

export async function getLeaderboard(_req, res, next) {
    try {
        const targetId = _req.params.id;
        const ranks = await Score.find({ targetId })
        .sort({ totalScore: -1 })
        .limit(10)
        .lean();

        res.json(ranks);
    } catch (err) {
        next(err);
    }
}
