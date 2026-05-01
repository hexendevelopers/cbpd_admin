# CBPD Form APIs Documentation

This document outlines the public API endpoints used for receiving form submissions from the frontend website. These endpoints do not require authentication and have CORS configured to accept requests from external sources.

---

## 1. Contact Form API

Use this endpoint to submit a "Drop A Line" or "General Enquiry" form.

### **Endpoint:** `/api/public/contact`
- **Method:** `POST`
- **Authentication:** None required

### **Request Body (JSON):**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `firstName` | string | **Yes** | User's first name |
| `lastName` | string | **Yes** | User's last name |
| `email` | string | **Yes** | User's email address |
| `phone` | string | **Yes** | User's phone number with country code |
| `enquiryType` | string | No | Enum: `"General Enquiry"` or `"Programme Enquiry"`. Defaults to `"General Enquiry"`. |
| `programmeName` | string | No | The name of the programme they are enquiring about (use if `enquiryType` is `"Programme Enquiry"`). |
| `message` | string | **Yes** | The content of their message |

### **Example Request:**
```bash
curl -X POST \
  http://localhost:3000/api/public/contact \
  -H 'Content-Type: application/json' \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "johndoe@example.com",
    "phone": "+44 20 1234 5678",
    "enquiryType": "Programme Enquiry",
    "programmeName": "Diploma in Construction",
    "message": "I would like more information about this diploma."
}'
```

### **Success Response (201 Created):**
```json
{
  "message": "Contact form submitted successfully",
  "data": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "johndoe@example.com",
    "phone": "+44 20 1234 5678",
    "enquiryType": "Programme Enquiry",
    "programmeName": "Diploma in Construction",
    "message": "I would like more information about this diploma.",
    "status": "New",
    "_id": "60d5ecb54d245...",
    "createdAt": "2023-08-01T10:00:00.000Z",
    "updatedAt": "2023-08-01T10:00:00.000Z"
  }
}
```

### **Error Response (400 Bad Request):**
```json
{
  "error": "Missing required field: email"
}
```

---

## 2. Partnership Enquiry Form API

Use this endpoint to submit a "Begin the Conversation" partnership application form.

### **Endpoint:** `/api/public/partner`
- **Method:** `POST`
- **Authentication:** None required

### **Request Body (JSON):**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `organizationName` | string | **Yes** | The name of the organization or institute |
| `website` | string | **Yes** | The organization's website URL |
| `authorizedSignatory` | string | **Yes** | The head or authorized signatory's name |
| `yearOfInception` | string | **Yes** | The year the institute was founded |
| `addressLine1` | string | **Yes** | Primary street address |
| `addressLine2` | string | No | Suite, unit, etc. |
| `cityState` | string | **Yes** | Province / City / State |
| `country` | string | **Yes** | Country of origin |
| `email` | string | **Yes** | Contact email address |
| `phone` | string | **Yes** | Contact phone number |
| `instituteProfile` | string | **Yes** | A brief profile outlining the institute's operations |
| `hasAccreditations` | string | **Yes** | Must be either `"Yes"` or `"No"` |

### **Example Request:**
```bash
curl -X POST \
  http://localhost:3000/api/public/partner \
  -H 'Content-Type: application/json' \
  -d '{
    "organizationName": "Global Education Corp",
    "website": "https://www.example.com",
    "authorizedSignatory": "Jane Smith",
    "yearOfInception": "2010",
    "addressLine1": "123 Education Lane",
    "addressLine2": "Suite 400",
    "cityState": "London",
    "country": "United Kingdom",
    "email": "jane.smith@example.com",
    "phone": "+44 20 9876 5432",
    "instituteProfile": "We are a leading education provider offering various diplomas.",
    "hasAccreditations": "Yes"
}'
```

### **Success Response (201 Created):**
```json
{
  "message": "Partnership enquiry submitted successfully",
  "data": {
    "organizationName": "Global Education Corp",
    "website": "https://www.example.com",
    "authorizedSignatory": "Jane Smith",
    "yearOfInception": "2010",
    "addressLine1": "123 Education Lane",
    "addressLine2": "Suite 400",
    "cityState": "London",
    "country": "United Kingdom",
    "email": "jane.smith@example.com",
    "phone": "+44 20 9876 5432",
    "instituteProfile": "We are a leading education provider offering various diplomas.",
    "hasAccreditations": "Yes",
    "status": "New",
    "_id": "60d5ecd24b123...",
    "createdAt": "2023-08-01T10:05:00.000Z",
    "updatedAt": "2023-08-01T10:05:00.000Z"
  }
}
```

### **Error Response (400 Bad Request):**
```json
{
  "error": "Missing required field: hasAccreditations"
}
```
