// src/controllers/target.controller.js
import dotenv from 'dotenv';
dotenv.config();

import Target from '../models/target.model.js';
// import { publish } from '../../libs/bus.js';
import { publish } from '../../../libs/bus.js';

const BASE = process.env.BASE_URL || '';

// ----------------------------------------------------------------------------
// 1. CREATE TARGET (inclusief placeName)
// ----------------------------------------------------------------------------
export const createTarget = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Geen afbeelding geüpload.' });
    }
    const imgPath = `/uploads/${req.file.filename}`;

    const {
      title,
      description = '',
      placeName = '',
      latitude,
      longitude,
      radius,
      deadline
    } = req.body;

    // Aangezien validateTarget is uitgevoerd, weten we dat latitude, longitude, radius en deadline geldig zijn.

    const targetData = {
      ownerId: req.user._id,
      title: title.trim(),
      description,
      imageUrl: imgPath,
      // **Plaatsnaam opslaan**
      placeName: placeName.trim(),
      location: {
        type: 'Point',
        coordinates: [ parseFloat(longitude), parseFloat(latitude) ]
      },
      radius: parseInt(radius, 10),
      deadline: new Date(deadline),
      active: true
    };

    const saved = await new Target(targetData).save();

    // Publiceer event naar RabbitMQ
    publish('target', 'created', {
      targetId : saved._id,
      ownerId  : saved.ownerId,
      title    : saved.title,
      deadline : saved.deadline,
      placeName: saved.placeName,
      location : saved.location,
      radius   : saved.radius
    });
    

    return res.status(201).json({
      ...saved.toObject(),
      imageUrlFull: BASE + imgPath
    });
  } catch (error) {
    console.error('[target.controller:createTarget] Error:', error);
    return res.status(500).json({
      message: 'Fout bij het aanmaken van target',
      error: error.message
    });
  }
};

// ----------------------------------------------------------------------------
// 2. GET ALL TARGETS (filter op placeName of op coördinaten)
// ----------------------------------------------------------------------------
export const getAllTargets = async (req, res) => {
  try {
    const { placeName, latitude, longitude } = req.query;

    // 1) Als latitude & longitude zijn opgegeven → doe géo‐query
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      if (isNaN(lat) || isNaN(lon)) {
        return res.status(400).json({ message: 'latitude en longitude moeten geldige nummers zijn.' });
      }

      // In dit voorbeeld gebruiken we radius = het veld 'radius' in elk document:
      // we vinden eerst alle targets binnen afstandInMeters (via $geoNear),
      // en voeren daarna een $match uit zodat afstandInMeters <= radius van dat document.
      const pipeline = [
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [lon, lat] },
            distanceField: 'afstandInMeters',
            spherical: true,
            query: { active: true }
          }
        },
        {
          // Behoud alleen documenten waarvan afstandInMeters <= document.radius
          $match: { $expr: { $lte: ['$afstandInMeters', '$radius'] } }
        },
        {
          // Voeg imageUrlFull toe door BASE + imageUrl te concatenaten
          $addFields: {
            imageUrlFull: { $concat: [BASE, '$imageUrl'] }
          }
        },
        {
          // Geef alleen relevante velden terug
          $project: {
            ownerId: 1,
            title: 1,
            description: 1,
            placeName: 1,
            imageUrlFull: 1,
            location: 1,
            radius: 1,
            deadline: 1,
            afstandInMeters: 1
          }
        }
      ];

      const results = await Target.aggregate(pipeline);
      return res.json(results);
    }

    // 2) Als alleen placeName is opgegeven (zonder geldige lat/lng) → simpele tekst‐query
    if (placeName) {
      // Case‐insensitive zoeken naar deel‐string in placeName
      const regex = new RegExp(placeName, 'i');
      const list = await Target.find({
        placeName: { $regex: regex },
        active: true
      });

      // Voeg per document imageUrlFull toe in JS‐laag
      const transformed = list.map(doc => ({
        ...doc.toObject(),
        imageUrlFull: doc.imageUrl ? BASE + doc.imageUrl : null
      }));
      return res.json(transformed);
    }

    // 3) Geen filters → gewoon alle actieve targets
    const all = await Target.find({ active: true });
    const transformed = all.map(doc => ({
      ...doc.toObject(),
      imageUrlFull: doc.imageUrl ? BASE + doc.imageUrl : null
    }));
    return res.json(transformed);

  } catch (error) {
    console.error('[target.controller:getAllTargets] Error:', error);
    return res.status(500).json({
      message: 'Fout bij ophalen van targets',
      error: error.message
    });
  }
};

// ----------------------------------------------------------------------------
// 3. GET TARGET BY ID
// ----------------------------------------------------------------------------
export const getTargetById = async (req, res) => {
  try {
    const target = await Target.findById(req.params.id);
    if (!target || !target.active) {
      return res.status(404).json({ message: 'Target niet gevonden.' });
    }
    return res.json({
      ...target.toObject(),
      imageUrlFull: target.imageUrl ? BASE + target.imageUrl : null
    });
  } catch (error) {
    console.error('[target.controller:getTargetById] Error:', error);
    return res.status(500).json({
      message: 'Fout bij het ophalen van target',
      error: error.message
    });
  }
};


// ----------------------------------------------------------------------------
// 4. DELETE TARGET (soft delete)
// ----------------------------------------------------------------------------
export const deleteTarget = async (req, res) => {
  try {
    const target = await Target.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );
    if (!target) {
      return res.status(404).json({ message: 'Target niet gevonden.' });
    }
    return res.json({ message: 'Target succesvol verwijderd (soft delete).' });
  } catch (error) {
    console.error('[target.controller:deleteTarget] Error:', error);
    return res.status(500).json({
      message: 'Fout bij verwijderen van target',
      error: error.message
    });
  }
};

