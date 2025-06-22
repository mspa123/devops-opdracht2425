// target-service/models/target.model.js

import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const targetSchema = new Schema({
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [ true, 'Title is verplicht' ],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    required: [ true, 'ImageUrl is verplicht' ]
  },
  // vrije tekst voor plaatsnaam (optioneel)
  placeName: {
    type: String,
    default: ''
  },
  // GeoJSON‐veld voor coördinaten (longitude, latitude)
  location: {
    type: {
      type: String,
      enum: [ 'Point' ],
      default: 'Point'
    },
    coordinates: {
      type: [ Number ],
      required: [ true, 'Locatie (coördinaten) is verplicht' ]
    }
  },
  // Straal (in meters) waarin deelnemers mogen inleveren
  radius: {
    type: Number,
    required: [ true, 'Radius is verplicht (in meters)' ]
  },
  // Tot wanneer deelnemers kunnen inschrijven of foto’s inzenden
  deadline: {
    type: Date,
    required: [ true, 'Deadline is verplicht' ]
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 2dsphere‐index voor geospatiale queries
targetSchema.index({ location: '2dsphere' });

export default model('Target', targetSchema);
