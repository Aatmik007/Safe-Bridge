const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Reward title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Reward description is required'],
    },
    partner: {
      type: String,
      required: [true, 'Partner brand is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Transit', 'Food & Beverage', 'Retail', 'Fitness', 'Eco'],
      default: 'Transit',
    },
    costInPoints: {
      type: Number,
      required: [true, 'Cost in points is required'],
      min: [1, 'Cost must be at least 1 point'],
    },
    stock: {
      type: Number,
      default: 100,
      min: [0, 'Stock cannot be negative'],
    },
    active: {
      type: Boolean,
      default: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    badgeText: {
      type: String,
      default: 'Instant Voucher',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Reward', rewardSchema);
