/**
 * Haversine formula to compute great-circle distance between two GPS coordinates in meters
 * @param {number} lat1 
 * @param {number} lon1 
 * @param {number} lat2 
 * @param {number} lon2 
 * @returns {number} Distance in meters
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (
    lat1 === undefined || lat1 === null ||
    lon1 === undefined || lon1 === null ||
    lat2 === undefined || lat2 === null ||
    lon2 === undefined || lon2 === null
  ) {
    return null;
  }

  const R = 6371000; // Earth's radius in meters
  const toRad = (angle) => (angle * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place (meters)
}

/**
 * Validates GPS location against bridge anchor coordinates.
 * Treats GPS as a soft signal (returns distance & flag, without hard-blocking, as requested in spec)
 * @param {number} userLat 
 * @param {number} userLng 
 * @param {number} bridgeLat 
 * @param {number} bridgeLng 
 * @param {number} thresholdMeters (default 75m)
 * @returns {{ inRadius: boolean, distanceMeters: number | null, note: string }}
 */
function checkGpsProximity(userLat, userLng, bridgeLat, bridgeLng, thresholdMeters = 75) {
  if (userLat === undefined || userLat === null || userLng === undefined || userLng === null) {
    return {
      inRadius: true, // Soft signal: allow missing GPS without failing verification
      distanceMeters: null,
      note: 'GPS coordinates were omitted or unavailable from browser',
    };
  }

  const distance = calculateHaversineDistance(userLat, userLng, bridgeLat, bridgeLng);

  if (distance === null) {
    return { inRadius: true, distanceMeters: null, note: 'Invalid coordinate calculation' };
  }

  const inRadius = distance <= thresholdMeters;
  return {
    inRadius,
    distanceMeters: distance,
    note: inRadius
      ? `Pedestrian within ${distance}m of bridge anchor (Threshold: ${thresholdMeters}m)`
      : `Pedestrian is ${distance}m from bridge anchor (Warning: outside standard ${thresholdMeters}m radius)`,
  };
}

module.exports = {
  calculateHaversineDistance,
  checkGpsProximity,
};
