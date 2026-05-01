const http = require('http');

const contactData = JSON.stringify({
  firstName: "John",
  lastName: "Doe",
  email: "johndoe@example.com",
  phone: "+44 20 1234 5678",
  enquiryType: "Programme Enquiry",
  programmeName: "Diploma in Construction",
  message: "I would like more information about this diploma."
});

const partnerData = JSON.stringify({
  organizationName: "Global Education Corp",
  website: "https://www.example.com",
  authorizedSignatory: "Jane Smith",
  yearOfInception: "2010",
  addressLine1: "123 Education Lane",
  cityState: "London",
  country: "United Kingdom",
  email: "jane.smith@example.com",
  phone: "+44 20 9876 5432",
  instituteProfile: "We are a leading education provider.",
  hasAccreditations: "Yes"
});

const makeRequest = (path, data) => {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  const req = http.request(options, (res) => {
    let responseData = '';
    res.on('data', (chunk) => { responseData += chunk; });
    res.on('end', () => { console.log(`Response for ${path}:`, responseData); });
  });

  req.on('error', (e) => { console.error(`Problem with request to ${path}: ${e.message}`); });
  req.write(data);
  req.end();
};

makeRequest('/api/public/contact', contactData);
makeRequest('/api/public/partner', partnerData);
