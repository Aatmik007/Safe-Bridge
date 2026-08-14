const User = require('../models/User');
const Bridge = require('../models/Bridge');
const Reward = require('../models/Reward');
const Crossing = require('../models/Crossing');
const Redemption = require('../models/Redemption');
const { generateBridgeQrSet } = require('../utils/qrGenerator');

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const comprehensiveBridges = [
  // ==========================================
  // MUMBAI BRIDGES & SKYWALKS
  // ==========================================
  {
    name: 'Dadar Station Skywalk & FOB',
    locationLabel: 'West Platform 1 & 2 Stairway',
    city: 'Mumbai',
    latitude: 19.0178,
    longitude: 72.8478,
    pointsPerCrossing: 25,
    entryCode: 'fob-mumbai-dadar-entry',
    exitCode: 'fob-mumbai-dadar-exit',
    description: 'Bypasses the heavily congested Senapati Bapat Marg intersection with direct overhead access to Western Railway.',
  },
  {
    name: 'Bandra Station East Skywalk & BKC Connector',
    locationLabel: 'BKC Skywalk North Portal',
    city: 'Mumbai',
    latitude: 19.0596,
    longitude: 72.8425,
    pointsPerCrossing: 30,
    entryCode: 'fob-mumbai-bandra-entry',
    exitCode: 'fob-mumbai-bandra-exit',
    description: 'Elevated multi-lane skywalk separating walking commuters from Western Express Highway and BKC traffic.',
  },
  {
    name: 'Andheri Metro-Railway Interchange Skybridge',
    locationLabel: 'Versova-Ghatkopar Line 1 Concourse',
    city: 'Mumbai',
    latitude: 19.1197,
    longitude: 72.8468,
    pointsPerCrossing: 30,
    entryCode: 'fob-mumbai-andheri-entry',
    exitCode: 'fob-mumbai-andheri-exit',
    description: 'High-capacity interchange footbridge linking Western Railway suburban platforms with Metro Line 1.',
  },
  {
    name: 'Marine Drive Promenade Overpass',
    locationLabel: 'Nariman Point North Approach',
    city: 'Mumbai',
    latitude: 18.9431,
    longitude: 72.823,
    pointsPerCrossing: 25,
    entryCode: 'fob-mumbai-marinedrive-entry',
    exitCode: 'fob-mumbai-marinedrive-exit',
    description: 'Pedestrian footbridge allowing walkers to cross the high-speed arterial Netaji Subhash Chandra Bose Road safely.',
  },
  {
    name: 'Ghatkopar Metro-Suburban Arterial FOB',
    locationLabel: 'LBS Marg & Metro Line 1 Stairs',
    city: 'Mumbai',
    latitude: 19.0864,
    longitude: 72.9082,
    pointsPerCrossing: 25,
    entryCode: 'fob-mumbai-ghatkopar-entry',
    exitCode: 'fob-mumbai-ghatkopar-exit',
    description: 'Critical pedestrian overpass bridging Central Railway tracks and the busy LBS Marg arterial corridor.',
  },
  {
    name: 'CSMT Heritage Subway & Pedestrian Overpass',
    locationLabel: 'Dr. Dadabhai Naoroji Road Crossing',
    city: 'Mumbai',
    latitude: 18.9401,
    longitude: 72.8351,
    pointsPerCrossing: 20,
    entryCode: 'fob-mumbai-csmt-entry',
    exitCode: 'fob-mumbai-csmt-exit',
    description: 'Grade-separated pedestrian crossing protecting thousands of daily office commuters in South Mumbai.',
  },
  {
    name: 'Thane SATIS Elevated Pedestrian Deck',
    locationLabel: 'Thane West Station Deck Approach',
    city: 'Mumbai',
    latitude: 19.186,
    longitude: 72.9759,
    pointsPerCrossing: 30,
    entryCode: 'fob-mumbai-thane-entry',
    exitCode: 'fob-mumbai-thane-exit',
    description: 'Pioneering Station Area Traffic Improvement Scheme (SATIS) elevated deck separating pedestrians from bus bays.',
  },
  {
    name: 'Borivali Station West Skywalk',
    locationLabel: 'SV Road Overhead Walkway',
    city: 'Mumbai',
    latitude: 19.229,
    longitude: 72.857,
    pointsPerCrossing: 25,
    entryCode: 'fob-mumbai-borivali-entry',
    exitCode: 'fob-mumbai-borivali-exit',
    description: 'Extended skywalk connecting Borivali railway station with western bus terminals and commercial markets.',
  },

  // ==========================================
  // BENGALURU BRIDGES & SKYWALKS
  // ==========================================
  {
    name: 'Silk Board Junction Safe Overpass',
    locationLabel: 'Hosur Road North Stairs',
    city: 'Bengaluru',
    latitude: 12.9176,
    longitude: 77.6233,
    pointsPerCrossing: 35,
    entryCode: 'fob-blr-silkboard-entry',
    exitCode: 'fob-blr-silkboard-exit',
    description: 'Crucial pedestrian overpass traversing the busy 10-lane Central Silk Board traffic and Yellow Line metro junction.',
  },
  {
    name: 'Majestic Kempegowda Interchange Skywalk',
    locationLabel: 'KSR City Station to Metro Concourse',
    city: 'Bengaluru',
    latitude: 12.9778,
    longitude: 77.5726,
    pointsPerCrossing: 30,
    entryCode: 'fob-blr-majestic-entry',
    exitCode: 'fob-blr-majestic-exit',
    description: 'Grand interchange pedestrian walkway integrating BMTC bus terminal, KSR Railway, and Purple/Green Metro lines.',
  },
  {
    name: 'KR Puram Railway & Metro Skybridge',
    locationLabel: 'Old Madras Road Outer Ring Junction',
    city: 'Bengaluru',
    latitude: 13.0012,
    longitude: 77.6833,
    pointsPerCrossing: 35,
    entryCode: 'fob-blr-krpuram-entry',
    exitCode: 'fob-blr-krpuram-exit',
    description: 'Elevated multi-span skybridge linking Blue/Purple line metro stations over the high-speed hanging cable bridge.',
  },
  {
    name: 'Electronic City Flyover Pedestrian Overpass',
    locationLabel: 'Infosys Gate 1 Hosur Expressway',
    city: 'Bengaluru',
    latitude: 12.8452,
    longitude: 77.6602,
    pointsPerCrossing: 30,
    entryCode: 'fob-blr-ecity-entry',
    exitCode: 'fob-blr-ecity-exit',
    description: 'Safe transit skybridge over the 10-lane Electronic City expressway connecting IT tech campuses.',
  },
  {
    name: 'Bellandur EcoSpace Outer Ring Road Skywalk',
    locationLabel: 'Outer Ring Road Tech Corridor',
    city: 'Bengaluru',
    latitude: 12.926,
    longitude: 77.683,
    pointsPerCrossing: 35,
    entryCode: 'fob-blr-bellandur-entry',
    exitCode: 'fob-blr-bellandur-exit',
    description: 'Pedestrian skywalk protecting thousands of daily IT workforce pedestrians crossing heavy Outer Ring Road traffic.',
  },
  {
    name: 'Indiranagar 100 Feet Road Metro Overpass',
    locationLabel: 'CMH Road Purple Line Concourse',
    city: 'Bengaluru',
    latitude: 12.9784,
    longitude: 77.6408,
    pointsPerCrossing: 25,
    entryCode: 'fob-blr-indiranagar-entry',
    exitCode: 'fob-blr-indiranagar-exit',
    description: 'Direct elevated access bridge above the busy 100ft Road commercial corridor into Indiranagar Metro Station.',
  },
  {
    name: 'MG Road Promenade Elevated Walkway',
    locationLabel: 'Brigade Road Junction Portal',
    city: 'Bengaluru',
    latitude: 12.9756,
    longitude: 77.6066,
    pointsPerCrossing: 20,
    entryCode: 'fob-blr-mgroad-entry',
    exitCode: 'fob-blr-mgroad-exit',
    description: 'Heritage boulevard pedestrian walkway connecting Rangoli Metro Art Center and central business shopping district.',
  },
  {
    name: 'Hebbal Flyover Pedestrian Skywalk',
    locationLabel: 'Airport Expressway Bellary Road Crossing',
    city: 'Bengaluru',
    latitude: 13.0358,
    longitude: 77.597,
    pointsPerCrossing: 30,
    entryCode: 'fob-blr-hebbal-entry',
    exitCode: 'fob-blr-hebbal-exit',
    description: 'Long-span overpass across the multi-tiered Hebbal flyover junction into Hebbal railway station.',
  },

  // ==========================================
  // DELHI BRIDGES & SKYWALKS
  // ==========================================
  {
    name: 'ITO Multi-Arm Intersection Skywalk',
    locationLabel: 'Pragati Maidan & Supreme Court Arm',
    city: 'Delhi',
    latitude: 28.6289,
    longitude: 77.241,
    pointsPerCrossing: 30,
    entryCode: 'fob-delhi-ito-entry',
    exitCode: 'fob-delhi-ito-exit',
    description: 'Iconic cantilevered multi-arm skywalk spanning Sikandra Road, Mathura Road, Tilak Marg, and Bahadur Shah Zafar Marg.',
  },
  {
    name: 'New Delhi Railway Station to Airport Metro Skywalk',
    locationLabel: 'Ajmeri Gate Dedicated Concourse',
    city: 'Delhi',
    latitude: 28.6427,
    longitude: 77.2215,
    pointsPerCrossing: 30,
    entryCode: 'fob-delhi-ndls-entry',
    exitCode: 'fob-delhi-ndls-exit',
    description: '242-meter temperature-controlled skywalk providing seamless transfer between NDLS and Airport Express Metro.',
  },
  {
    name: 'Dhaula Kuan Metro Interchange Skywalk',
    locationLabel: 'Airport Express to Pink Line Travelator',
    city: 'Delhi',
    latitude: 28.5921,
    longitude: 77.1616,
    pointsPerCrossing: 35,
    entryCode: 'fob-delhi-dhaulakuan-entry',
    exitCode: 'fob-delhi-dhaulakuan-exit',
    description: 'Longest elevated pedestrian interchange in Delhi with 22 travelators crossing Ring Road & NH-48.',
  },
  {
    name: 'Connaught Place Outer Ring FOB',
    locationLabel: 'Radial Road 1 Crossing',
    city: 'Delhi',
    latitude: 28.6315,
    longitude: 77.2167,
    pointsPerCrossing: 20,
    entryCode: 'fob-delhi-cp-outer-entry',
    exitCode: 'fob-delhi-cp-outer-exit',
    description: 'Provides safe pedestrian crossing over the bustling Outer Circle ring road into Janpath subway and Palika Bazaar.',
  },
  {
    name: 'Lajpat Nagar Ring Road Pedestrian Overpass',
    locationLabel: 'Central Market Ring Road Crossing',
    city: 'Delhi',
    latitude: 28.57,
    longitude: 77.2435,
    pointsPerCrossing: 25,
    entryCode: 'fob-delhi-lajpat-entry',
    exitCode: 'fob-delhi-lajpat-exit',
    description: 'Heavily used arterial overpass connecting residential colonies with Central Market over South Delhi Ring Road.',
  },
  {
    name: 'Anand Vihar ISBT & Metro Multi-Modal Skywalk',
    locationLabel: 'Inter-State Bus Terminal North Stairs',
    city: 'Delhi',
    latitude: 28.6469,
    longitude: 77.315,
    pointsPerCrossing: 30,
    entryCode: 'fob-delhi-anandvihar-entry',
    exitCode: 'fob-delhi-anandvihar-exit',
    description: 'Transit hub bridge integrating Indian Railways Anand Vihar Terminal, Blue Line, Pink Line, and ISBT bus depot.',
  },
  {
    name: 'Nehru Place Outer Ring Road FOB',
    locationLabel: 'Paras Cinema & Tech Commercial Hub',
    city: 'Delhi',
    latitude: 28.5492,
    longitude: 77.2533,
    pointsPerCrossing: 25,
    entryCode: 'fob-delhi-nehruplace-entry',
    exitCode: 'fob-delhi-nehruplace-exit',
    description: 'Elevated pedestrian footbridge crossing Outer Ring Road directly into Asia’s largest electronics market.',
  },
  {
    name: 'Kashmere Gate Multi-Modal Transit Overpass',
    locationLabel: 'Red/Yellow/Violet Triple Interchange',
    city: 'Delhi',
    latitude: 28.6675,
    longitude: 77.2285,
    pointsPerCrossing: 30,
    entryCode: 'fob-delhi-kashmeregate-entry',
    exitCode: 'fob-delhi-kashmeregate-exit',
    description: 'Major transit corridor bridge linking northern ISBT buses with Delhi Metro’s largest triple-line interchange station.',
  },
];

const demoRewards = [
  {
    title: 'Delhi Metro (DMRC) ₹100 Card Recharge',
    description: 'Instant recharge voucher valid for smart cards across all Delhi Metro & Airport Express lines.',
    partner: 'Delhi Metro Rail Corp',
    category: 'Transit',
    costInPoints: 100,
    stock: 50,
    badgeText: 'Instant QR Voucher',
  },
  {
    title: 'Mumbai Maha Mumbai Metro 1-Day Pass',
    description: 'Unlimited 24-hour rides across all operational Mumbai Metro lines (Line 1, 2A, 7).',
    partner: 'MMRDA Transit',
    category: 'Transit',
    costInPoints: 80,
    stock: 60,
    badgeText: 'Unlimited Day Pass',
  },
  {
    title: 'Bengaluru Namma Metro ₹50 Top-Up',
    description: 'Instant recharge voucher valid for smart cards and QR tickets on Purple and Green Lines.',
    partner: 'BMRCL Namma Metro',
    category: 'Transit',
    costInPoints: 50,
    stock: 80,
    badgeText: 'Digital Recharge',
  },
  {
    title: 'Blue Tokai Artisan Coffee 50% Off',
    description: 'Enjoy 50% off any freshly brewed hot or iced beverage at partner cafe outlets across Delhi, Mumbai, and Bengaluru.',
    partner: 'Blue Tokai Cafe',
    category: 'Food & Beverage',
    costInPoints: 75,
    stock: 40,
    badgeText: '50% Discount',
  },
  {
    title: 'Decathlon ₹200 Active Footwear Voucher',
    description: 'Get ₹200 off your next pair of walking or running shoes at any Decathlon store nationwide.',
    partner: 'Decathlon Sports',
    category: 'Fitness',
    costInPoints: 150,
    stock: 35,
    badgeText: '₹200 Off',
  },
  {
    title: 'Chaayos Desi Chai & Bun Maska Combo',
    description: 'Claim a complimentary Desi Chai and Butter Bun Maska at any airport or metro Chaayos cafe.',
    partner: 'Chaayos',
    category: 'Food & Beverage',
    costInPoints: 60,
    stock: 50,
    badgeText: 'Complimentary Snack',
  },
  {
    title: 'Eco-Friendly Bamboo Water Flask Coupon',
    description: 'Claim ₹120 discount on thermal insulated bamboo flasks for sustainable walking commutes.',
    partner: 'Organic Green Co',
    category: 'Eco',
    costInPoints: 80,
    stock: 45,
    badgeText: 'Eco Reward',
  },
  {
    title: 'Subway Buy-1-Get-1 Fresh Sub Combo',
    description: 'Buy any 6-inch sub and get a second sub free upon showing your SafeBridge voucher.',
    partner: 'Subway',
    category: 'Food & Beverage',
    costInPoints: 70,
    stock: 65,
    badgeText: 'BOGO Offer',
  },
];

async function seedData() {
  try {
    console.log('Seeding SafeBridge Comprehensive Multi-City Database...');

    // Clear collections
    await User.deleteMany({});
    await Bridge.deleteMany({});
    await Reward.deleteMany({});
    await Crossing.deleteMany({});
    await Redemption.deleteMany({});

    // 1. Create Admin & Demo Users
    const adminUser = await User.create({
      name: 'Bridge Safety Admin',
      email: 'admin@safebridge.app',
      password: 'Admin@123456',
      role: 'admin',
      points: 650,
      totalCrossings: 26,
      currentStreak: 6,
      longestStreak: 9,
    });

    const testUser = await User.create({
      name: 'Alex Johnson',
      email: 'test@safebridge.app',
      password: 'Password123!',
      role: 'user',
      points: 175,
      totalCrossings: 7,
      currentStreak: 3,
      longestStreak: 5,
      lastCrossingDate: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    });

    const userAravind = await User.create({
      name: 'Aravind Menon',
      email: 'aravind@gmail.com',
      password: 'Password123!',
      role: 'user',
      points: 520,
      totalCrossings: 21,
      currentStreak: 8,
      longestStreak: 14,
      lastCrossingDate: new Date(Date.now() - 3 * 60 * 60 * 1000),
    });

    const userPriya = await User.create({
      name: 'Priya Sharma',
      email: 'priya.sharma@gmail.com',
      password: 'Password123!',
      role: 'user',
      points: 380,
      totalCrossings: 15,
      currentStreak: 5,
      longestStreak: 7,
      lastCrossingDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
    });

    const userRohan = await User.create({
      name: 'Rohan Deshmukh',
      email: 'rohan.deshmukh@gmail.com',
      password: 'Password123!',
      role: 'user',
      points: 290,
      totalCrossings: 11,
      currentStreak: 4,
      longestStreak: 6,
    });

    const userKaran = await User.create({
      name: 'Karan Mehra',
      email: 'karan.mehra@gmail.com',
      password: 'Password123!',
      role: 'user',
      points: 210,
      totalCrossings: 8,
      currentStreak: 2,
      longestStreak: 4,
    });

    console.log('✓ Created Admin and Demo Multi-City Users');

    // 2. Create Bridges and generate real QR code image sets for all 24 bridges
    const createdBridges = [];
    for (const bridgeData of comprehensiveBridges) {
      const bridge = await Bridge.create(bridgeData);
      const qrSet = await generateBridgeQrSet(CLIENT_URL, bridge._id);
      bridge.qrCodes = qrSet;
      await bridge.save();
      createdBridges.push(bridge);
    }
    console.log(`✓ Seeded ${createdBridges.length} Bridges across Delhi, Bengaluru, and Mumbai with real QR data URIs`);

    // 3. Create Rewards
    const createdRewards = await Reward.insertMany(demoRewards);
    console.log(`✓ Seeded ${createdRewards.length} Multi-City Rewards`);

    // 4. Create sample historical crossings for testUser
    const dadarBridge = createdBridges.find((b) => b.name.includes('Dadar'));
    const silkboardBridge = createdBridges.find((b) => b.name.includes('Silk Board'));

    // Historical crossing 2 hours ago on Dadar (so testUser is currently in 6h cooldown on Dadar!)
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const entryTwoHoursAgo = new Date(twoHoursAgo.getTime() - 45 * 1000);

    if (dadarBridge) {
      await Crossing.create({
        user: testUser._id,
        bridge: dadarBridge._id,
        entryTimestamp: entryTwoHoursAgo,
        exitTimestamp: twoHoursAgo,
        durationSeconds: 45,
        entryLocation: { lat: dadarBridge.latitude, lng: dadarBridge.longitude, accuracy: 15 },
        exitLocation: { lat: dadarBridge.latitude + 0.0001, lng: dadarBridge.longitude + 0.0001, accuracy: 12 },
        status: 'verified',
        pointsAwarded: 25,
        geoDistanceDelta: 12.4,
        flags: [],
      });
    }

    // Historical crossing yesterday on Silk Board for testUser
    const yesterday = new Date(Date.now() - 26 * 60 * 60 * 1000);
    if (silkboardBridge) {
      await Crossing.create({
        user: testUser._id,
        bridge: silkboardBridge._id,
        entryTimestamp: new Date(yesterday.getTime() - 52 * 1000),
        exitTimestamp: yesterday,
        durationSeconds: 52,
        entryLocation: { lat: silkboardBridge.latitude, lng: silkboardBridge.longitude, accuracy: 10 },
        exitLocation: { lat: silkboardBridge.latitude, lng: silkboardBridge.longitude, accuracy: 10 },
        status: 'verified',
        pointsAwarded: 35,
        geoDistanceDelta: 8.2,
        flags: [],
      });
    }

    // Create 1 sample redemption for test user
    await Redemption.create({
      user: testUser._id,
      reward: createdRewards[2]._id, // Bengaluru Namma Metro top-up
      pointsSpent: 50,
      redemptionCode: 'SB-BMR-8C2A-4F91',
      status: 'active',
      expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    });

    console.log('✓ Seeded historical crossings and sample redemption');
    console.log('\n--- SafeBridge Multi-City Database Initialized Successfully ---');
    console.log(`Bridges Seeded: ${createdBridges.length} total (8 Mumbai, 8 Bengaluru, 8 Delhi)`);
    console.log('Demo Test Account: test@safebridge.app | Password123!');
    console.log('Admin Account:     admin@safebridge.app | Admin@123456\n');
  } catch (error) {
    console.error('Seed Error:', error);
  }
}

module.exports = seedData;
