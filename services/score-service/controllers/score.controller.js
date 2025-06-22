import Submission from '../models/submission.model.js';
import axios from 'axios';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import { publish } from '../libs/bus.js';
import { imageAnalysis } from '../utils/imageAnalysis.js';


// ----------------------------------------------------------------------------
// 1. Post submitPhoto
// ----------------------------------------------------------------------------
export const submitPhoto = async (req, res) => {
  const { targetId } = req.params;
  const  playerId  = req.user._id;

  // 1. Check if target exists
  let target;

  try {
    const resp = await axios.get(`${process.env.TARGET_SERVICE_URL}/api/targets/${targetId}`);
    target = resp.data;
    if (!target.active) return res.status(400).json({message: 'Target is niet actief'});
  } catch {
    return res.status(404).json({message: 'Target niet gevonden'});
  }

  // Controleer bestand en deadline
  if (!req.file) return res.status(400).json({message: 'Geen afbeelding geüpload'});
  if(new Date() > new Date(target.deadline)){
    return res.status(403).json({message: 'Deadline is bereikt'});
  }

  //Score berekenen
  // const submissionPath = path.join(process.cwd(), 'uploads', req.file.filename);
  // const score = await imageAnalysis(target.imageUrl, submissionPath);

  const submissionPath = path.join(process.cwd(), 'uploads', req.file.filename);
  const score = await imageAnalysis(target.imageUrlFull, submissionPath);

  // Score opslaan in database
  const submission = new Submission({
    targetId,
    playerId,
    imageUrl: `/uploads/${req.file.filename}`,
    score,
  });

  const saved = await submission.save();

  // Publish event naar Mail service
  publish('photo', 'uploaded', {
    targetId,
    participantId: playerId,
    score,
    submissionId: saved._id,
    photoUrl: `${process.env.BASE_URL}/uploads/${req.file.filename}`
  });

  res.status(201).json(saved);  
}

// ----------------------------------------------------------------------------
// 2. Get scores targetId/mijn score
// ----------------------------------------------------------------------------
export const getMyScore = async (req, res) => {
  const { targetId } = req.params;
  const playerId = req.user._id;
  const submission = await Submission.findOne({targetId, playerId});
  if (!submission) return res.status(404).json({message: 'Geen score gevonden'});
  res.json(submission);
}

// ----------------------------------------------------------------------------
// 3. Get scores targetId/All scores
// ----------------------------------------------------------------------------
export const getAllScores = async (req, res) => {
  const { targetId } = req.params;
  const submissions = await Submission.find({targetId}).sort({score: -1, submittedAt: 1});
  res.json(submissions);
}