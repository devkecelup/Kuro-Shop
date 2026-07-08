const fs = require('fs');
const crypto = require('crypto');

const env = fs.readFileSync('.env.local', 'utf-8');
const vipIdMatch = env.match(/VIP_API_ID=(.*)/);
const vipKeyMatch = env.match(/VIP_API_KEY=(.*)/);

const vipId = vipIdMatch ? vipIdMatch[1].trim() : '';
const vipKey = vipKeyMatch ? vipKeyMatch[1].trim() : '';

function generateVipSign(apiId, apiKey) {
  return crypto.createHash('md5').update(apiId + apiKey).digest('hex');
}

async function main() {
  const sign = generateVipSign(vipId, vipKey);
  console.log('Fetching from VIP with sign...', sign);
  
  try {
    const response = await fetch('https://vip-reseller.co.id/api/game-feature', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        key: vipKey,
        sign: sign,
        type: 'services',
        filter_type: 'game',
        filter_value: ''
      })
    });
    
    const apiResponse = await response.json();
    console.log('Response:', apiResponse.result, apiResponse.message);
    if (apiResponse.data) {
      console.log('Items count:', apiResponse.data.length);
    }
  } catch (err) {
    console.error('Fetch failed:', err);
  }
}

main();
