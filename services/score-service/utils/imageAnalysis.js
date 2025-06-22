// services/score-service/utils/imageAnalysis.js

import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Vergelijk twee beelden met Imagga en geef een gelijkenis‐percentage terug.
 * @param {string} targetImageUrl  Volledige URL naar het target‐beeld
 * @param {string} submissionPath  Lokale bestandsnaam van de ingezonden foto
 * @returns {number} Score tussen 0 en 100 (% gelijkenis)
 */
export const imageAnalysis = async (targetImageUrl, submissionPath) => {
  try {
    // 1) Download target image als buffer
    const resp = await axios.get(targetImageUrl, { responseType: 'arraybuffer' });
    const targetBuffer = Buffer.from(resp.data);

    // 2) Lees ingezonden afbeelding van disk
    const submissionBuffer = fs.readFileSync(submissionPath);

    // 3) Bouw multipart/form-data met de juiste veldnamen
    const form = new FormData();
    form.append('image',  targetBuffer,     'target.jpg');
    form.append('image2', submissionBuffer, 'submission.jpg');

    // 4) Roep de Imagga Images‐Similarity API aan
    const apiRes = await axios.post(
      'https://api.imagga.com/v2/images-similarity/categories/general_v3',
      form,
      {
        auth: {
          username: process.env.IMAGGA_API_KEY,
          password: process.env.IMAGGA_API_SECRET
        },
        headers: form.getHeaders()
      }
    );

    // 5) Imagga geeft 'distance' (lager = meer gelijk)
    const distance = apiRes.data.result.distance;

    // 6) Zet om naar %‐score (0% = helemaal verschillend, 100% = exact gelijk)
    const similarityPct = Math.max(0, Math.round((1 - distance) * 100));

    return similarityPct;

  } catch (error) {
    console.error('[imageAnalysis] error:', error);
    // fallback 0% bij fout
    return 0;
  }
};
