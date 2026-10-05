const isLocal = ['localhost', '127.0.0.1'].includes(location.hostname);
window.CRC_CONFIG = {
  apiUrl: isLocal
    ? 'http://localhost:7071/api/visitorCount'
    : 'https://func-crc-ad-c4b7bahhchd4aacb.centralindia-01.azurewebsites.net/api/visitorCount',
};