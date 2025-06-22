import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const submissionSchema = new mongoose.Schema({
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
  createdAt: {
    type: Date,
    default: Date.now
  },
  active:    { type:Boolean, default:true },
  timestamp: true
});

// const Submission = mongoose.model('Submission', submissionSchema );
// export default Submission; 

export default mongoose.model('Submission', submissionSchema);
