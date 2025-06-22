import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const scoreSchema = new Schema({
  submissionId:   { type: Schema.Types.ObjectId, required: true, unique: true },
  targetId:       { type: Schema.Types.ObjectId, required: true, ref: 'Target' },
  playerId:       { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  analysisScore:  { type: Number,           required: true },
  totalScore:     { type: Number,           required: true },
  submissionTime: { type: Date,             required: true }
}, {
  timestamps: true   // voegt automatisch createdAt en updatedAt toe
});

export default model('Score', scoreSchema);
