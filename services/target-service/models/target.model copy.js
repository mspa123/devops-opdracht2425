import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const targetSchema = new mongoose.Schema({
  ownerId:   { type: Schema.Types.ObjectId, required: true },
  title:     String,
  description:String,
  category:  String,
  difficulty:String,
  imageUrl:  String,
  active:    { type:Boolean, default:true },
  createdAt: { type:Date,    default:Date.now }
});

const Target = mongoose.model('Target', targetSchema);
export default Target; 