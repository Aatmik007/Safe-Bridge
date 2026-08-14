const mongoose = require('mongoose');

const bridgeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Bridge name is required'],
      trim: true,
    },
    locationLabel: {
      type: String,
      required: [true, 'Location label is required (e.g. West Entry, Junction)'],
      trim: true,
    },
    city: {
      type: String,
      default: 'Mumbai',
      trim: true,
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
    },
    pointsPerCrossing: {
      type: Number,
      default: 25,
      min: [5, 'Points per crossing must be at least 5'],
    },
    entryCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    exitCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    stairsCount: {
      type: Number,
      default: 42, // Average FOB staircase steps
    },
    caloriesPerClimb: {
      type: Number,
      default: 18, // Average calories burned
    },
    maintenanceReports: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        issueType: { type: String, enum: ['Lighting', 'Cleanliness', 'Structural', 'Accessibility', 'Other'], default: 'Lighting' },
        note: String,
        reportedAt: { type: Date, default: Date.now },
      },
    ],
    qrCodes: {
      entryUrl: String,
      exitUrl: String,
      entryQrDataUrl: String,
      exitQrDataUrl: String,
    },
    description: {
      type: String,
      default: 'Safe pedestrian foot over bridge connecting major transit corridors.',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Bridge', bridgeSchema);
