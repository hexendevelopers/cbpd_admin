const http = require('http');

const testCases = [
  {
    type: "certificate",
    payload: {
      name: "THASNIYA K.M",
      regNumber: "CBPD/11054",
      certNumber: "CBPD/ISDME/25/3134",
      learnerNumber: "CPL/5499/030"
    }
  },
  {
    type: "centre",
    payload: {
      centreCode: "INVALID_CODE"
    }
  }
];

const makeRequest = (data) => {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/public/verify',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(JSON.stringify(data))
    }
  };

  const req = http.request(options, (res) => {
    let responseData = '';
    res.on('data', (chunk) => { responseData += chunk; });
    res.on('end', () => { 
        console.log(`\n--- Response for ${data.type} ---`);
        try {
            console.log(JSON.stringify(JSON.parse(responseData), null, 2));
        } catch(e) {
            console.log(responseData);
        }
    });
  });

  req.on('error', (e) => { console.error(`Problem with request to /api/public/verify: ${e.message}`); });
  req.write(JSON.stringify(data));
  req.end();
};

testCases.forEach(tc => makeRequest(tc));
