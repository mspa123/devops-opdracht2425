import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const targetSchema = new Schema({
  ownerId:    { type: Schema.Types.ObjectId, required: true },
  title:      String,
  description:String,
  category:   String,
  difficulty: String,
  imageUrl:   String,
  active:     { type: Boolean, default: true }
}, {
  timestamps: true    // voegt createdAt en updatedAt toe
});

export default model('Target', targetSchema);
