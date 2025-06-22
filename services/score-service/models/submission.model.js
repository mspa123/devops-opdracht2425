// score-service/models/submission.model.js
import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const submissionSchema = new Schema({
  targetId: {
    type: Schema.Types.ObjectId,
    ref: 'Target',
    required: true
  },
  playerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    default: 0
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

export default model('Submission', submissionSchema);
