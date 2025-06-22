import Target from '../models/target.model.js';
import Score from '../models/score.model.js';
import Submission from '../models/submission.model.js';

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
 * Alle targets waarvan de deadline voorbij is, met hoogste score
 */

export async function getFinishedTargets(_req, res, next) {
  try {
    const now = new Date();
    // 1) Haal alle afgeronde targets op
    const targets = await Target.find({
      active:       true,
      deadlineDate: { $lte: now }
    }).lean();

    // 2) Voor elk target: vind de beste score
    const withWinner = await Promise.all(
      targets.map(async t => {
        const top = await Score.find({ targetId: t._id })
          .sort({ totalScore: -1 })
          .limit(1)
          .lean();

        if (top.length > 0) {
          return {
            ...t,
            winnerId:  top[0].playerId,
            bestScore: top[0].totalScore
          };
        }
        // als er geen inzendingen waren
        return { ...t, winnerId: null, bestScore: null };
      })
    );

    res.json(withWinner);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /finished
 * Alle targets waarvan de deadline voorbij is, mét gemiddelde score
 */

export async function getFinishedTargetss(_req, res, next) {
  try {
    const now = new Date();
    // 1) Haal alle afgeronde targets op
    const targets = await Target.find({
      active: true,
      deadline: { $lt: now }
    }).lean();

    // 2) Voor elk target: vind de beste score
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

/**
 * GET /user/:playerId/submissions
 */
export async function getUserSubmissions(req, res, next) {
    try {
      const { playerId } = req.params;
      const subs = await Submission.find({ playerId }).lean();
      res.json(subs);
    } catch (err) { next(err); }
  }

  /**
 * GET /owner/:ownerId/target/:id/scores
 */
export async function getOwnerTargetScores(req, res, next) {
    try {
      const { ownerId, id } = req.params;
      // optioneel: check req.user.id === ownerId
      const scores = await Score.find({ targetId: id }).lean();
      res.json(scores);
    } catch (err) { next(err); }
  }
