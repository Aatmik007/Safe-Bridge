const QRCode = require('qrcode');
const { generateSignedQrToken } = require('./tokenUtils');

/**
 * Generate a high-contrast Data URL image for a given URL string
 * @param {string} url - Target URL to encode
 * @returns {Promise<string>} Data URL (data:image/png;base64,...)
 */
async function generateQrDataUrl(url) {
  try {
    return await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 320,
      color: {
        dark: '#121418', // Asphalt dark
        light: '#FFFFFF', // High contrast white
      },
    });
  } catch (error) {
    console.error('QR Code generation error:', error);
    return null;
  }
}

/**
 * Generates scan URLs and real QR code data images for a bridge
 * @param {string} clientBaseUrl - Base frontend URL (e.g. http://localhost:5173)
 * @param {string} bridgeId - Bridge mongo _id
 * @returns {Promise<{ entryUrl: string, exitUrl: string, entryQrDataUrl: string, exitQrDataUrl: string }>}
 */
async function generateBridgeQrSet(clientBaseUrl = 'http://localhost:5173', bridgeId) {
  const entryToken = generateSignedQrToken(bridgeId, 'entry', 86400 * 30); // Long-lived for demo seed
  const exitToken = generateSignedQrToken(bridgeId, 'exit', 86400 * 30);

  const entryUrl = `${clientBaseUrl.replace(/\/$/, '')}/scan/${bridgeId}/entry?token=${encodeURIComponent(entryToken)}`;
  const exitUrl = `${clientBaseUrl.replace(/\/$/, '')}/scan/${bridgeId}/exit?token=${encodeURIComponent(exitToken)}`;

  const entryQrDataUrl = await generateQrDataUrl(entryUrl);
  const exitQrDataUrl = await generateQrDataUrl(exitUrl);

  return {
    entryUrl,
    exitUrl,
    entryQrDataUrl,
    exitQrDataUrl,
    entryToken,
    exitToken,
  };
}

module.exports = {
  generateQrDataUrl,
  generateBridgeQrSet,
};
