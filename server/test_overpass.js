const axios = require('axios');

const query = `[out:json][timeout:15];(node["tourism"](around:2500,48.8566,2.3522);way["tourism"](around:2500,48.8566,2.3522););out center body 20;`;

async function test() {
  try {
    const { data } = await axios.post('https://overpass.kumi.systems/api/interpreter', `data=${encodeURIComponent(query)}`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'VoyageHub/1.0 (zayn.contact@example.com)'
      }
    });
    console.log('Kumi Success, results:', data.elements ? data.elements.length : 'no elements');
  } catch (err) {
    console.error('Kumi Failed:', err.message, err.response?.status);
  }

  try {
    const { data } = await axios.post('https://lz4.overpass-api.de/api/interpreter', `data=${encodeURIComponent(query)}`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'VoyageHub/1.0 (zayn.contact@example.com)'
      }
    });
    console.log('LZ4 Success, results:', data.elements ? data.elements.length : 'no elements');
  } catch (err) {
    console.error('LZ4 Failed:', err.message, err.response?.status);
  }
}

test();
