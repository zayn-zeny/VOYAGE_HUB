const https = require('https');
const query = `[out:json][timeout:15];(node["tourism"](around:2500,48.8566,2.3522);way["tourism"](around:2500,48.8566,2.3522););out center body 20;`;
const req = https.request('https://maps.mail.ru/osm/tools/overpass/api/interpreter', { 
  method: 'POST', 
  headers: { 
    'Content-Type': 'application/x-www-form-urlencoded', 
    'User-Agent': 'VoyageHub/1.0 (travel planner)' 
  } 
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Status:', res.statusCode, 'Data length:', data.length, 'Data snippet:', data.substring(0, 100)));
});
req.on('error', e => console.error(e));
req.write('data=' + encodeURIComponent(query));
req.end();
