import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const deadlineSchema = new Schema({
  targetId:     { type: Schema.Types.ObjectId, required: true, unique: true },
  deadlineDate: { type: Date, required: true },
  createdAt:    { type: Date, default: Date.now }
});

export default model('Deadline', deadlineSchema);
