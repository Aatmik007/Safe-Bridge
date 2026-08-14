const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    lat: { type: Number },
    lng: { type: Number },
    accuracy: { type: Number },
  },
  { _id: false }
);

const crossingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    bridge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bridge',
      required: true,
      index: true,
    },
    entryTimestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    exitTimestamp: {
      type: Date,
    },
    durationSeconds: {
      type: Number,
    },
    entryLocation: {
      type: locationSchema,
    },
    exitLocation: {
      type: locationSchema,
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
      index: true,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    pointsAwarded: {
      type: Number,
      default: 0,
    },
    geoDistanceDelta: {
      type: Number, // Haversine distance in meters to bridge anchor
    },
    flags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for ultra-fast cooldown checks per user per bridge
crossingSchema.index({ user: 1, bridge: 1, status: 1, exitTimestamp: -1 });

module.exports = mongoose.model('Crossing', crossingSchema);
