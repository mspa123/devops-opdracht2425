import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const submissionSchema = new Schema(
  {
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
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true  // voegt automatisch createdAt en updatedAt toe
  }
);

export default model('Submission', submissionSchema);
