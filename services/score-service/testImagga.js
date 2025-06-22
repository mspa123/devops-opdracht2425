// testImagga.js
import dotenv from 'dotenv';
dotenv.config();

import { imageAnalysis } from './utils/imageAnalysis.js';

async function test() {
  // Publieke URL van een test­target­afbeelding, bv. eentje die je al geüpload hebt
  const targetUrl = 'http://localhost:3002/uploads/1747503244470-860350344.jpg';
  // Lokaal pad naar een test­submit­bestandje
  const submissionPath = 'uploads/1749846857858-111613451.jpg';

  const score = await imageAnalysis(targetUrl, submissionPath);
  console.log('Returned score:', score);
}

test().catch(err => console.error(err));
