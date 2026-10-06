const isLocal = ['localhost', '127.0.0.1'].includes(location.hostname);
window.CRC_CONFIG = {
  apiUrl: isLocal
    ? 'http://localhost:7071/api/visitorCount'
    : 'https://apim-crc-ad.azure-api.net/crc/visitorCount',
};