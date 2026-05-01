# 🔍 Centers & Memberships Search APIs Documentation

## 🎯 **Overview**

I've created comprehensive search APIs for both Centers and Memberships that allow flexible searching by various criteria including names, codes, and numbers.

---

## 🏢 **Centers Search API**

### **Endpoint:** `/api/admin/centers/search`

### **GET Method - Query Parameters Search**

**URL:** `GET /api/admin/centers/search?centerName=value&centerCode=value&location=value&status=value&page=1&limit=10`

#### **Query Parameters:**
- `centerName` (string, optional): Search by center name (partial match, case insensitive)
- `centerCode` (string, optional): Search by center code (exact match, case insensitive)
- `location` (string, optional): Search by location (partial match, case insensitive)
- `status` (string, optional): Filter by status (`active`, `inactive`, `expired`, `valid`)
- `page` (number, optional): Page number for pagination (default: 1)
- `limit` (number, optional): Items per page (default: 10)

#### **Example Requests:**
```bash
# Search by center name
GET /api/admin/centers/search?centerName=Tech%20Center

# Search by center code
GET /api/admin/centers/search?centerCode=TC001

# Search by both name and code
GET /api/admin/centers/search?centerName=Tech&centerCode=TC001

# Search with pagination
GET /api/admin/centers/search?centerName=Tech&page=2&limit=5
```

#### **Response:**
```json
{
  "centers": [
    {
      "_id": "center_id",
      "centreCode": "TC001",
      "location": "New York",
      "nameOfAffiliatedCentre": "Tech Training Center",
      "expiryDate": "2024-12-31T00:00:00.000Z",
      "isActive": true,
      "createdAt": "2023-01-15T10:30:00.000Z",
      "updatedAt": "2023-06-20T14:45:00.000Z",
      "isExpired": false,
      "daysUntilExpiry": 180,
      "status": "Active"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  },
  "searchCriteria": {
    "centerName": "Tech",
    "centerCode": "TC001",
    "location": "",
    "status": ""
  },
  "message": "Centers search completed successfully"
}
```

### **POST Method - Advanced Search**

**URL:** `POST /api/admin/centers/search`

#### **Request Body:**
```json
{
  "searchTerms": {
    "centerName": "Tech Center",
    "centerCode": "TC001",
    "location": "New York",
    "isActive": true
  }
}
```

#### **Response:**
```json
{
  "centers": [...],
  "searchTerms": {...},
  "totalFound": 15,
  "message": "Advanced centers search completed successfully"
}
```

---

## 🎫 **Memberships Search API**

### **Endpoint:** `/api/admin/memberships/search`

### **GET Method - Query Parameters Search**

**URL:** `GET /api/admin/memberships/search?membershipName=value&membershipNumber=value&membershipType=value&membershipStatus=value&page=1&limit=10`

#### **Query Parameters:**
- `membershipName` (string, optional): Search by membership name (partial match, case insensitive)
- `membershipNumber` (string, optional): Search by membership number (exact match, case insensitive)
- `membershipType` (string, optional): Filter by type (`Individual`, `Corporate`, `Student`, `Senior`, `Premium`, `Basic`)
- `membershipStatus` (string, optional): Filter by status (`Active`, `Inactive`, `Suspended`, `Expired`, `Pending`)
- `isActive` (string, optional): Filter by active status (`true`, `false`)
- `page` (number, optional): Page number for pagination (default: 1)
- `limit` (number, optional): Items per page (default: 10)

#### **Example Requests:**
```bash
# Search by membership name
GET /api/admin/memberships/search?membershipName=John%20Doe

# Search by membership number
GET /api/admin/memberships/search?membershipNumber=MEM001

# Search by both name and number
GET /api/admin/memberships/search?membershipName=John&membershipNumber=MEM001

# Filter by type and status
GET /api/admin/memberships/search?membershipType=Premium&membershipStatus=Active
```

#### **Response:**
```json
{
  "memberships": [
    {
      "_id": "membership_id",
      "membershipName": "John Doe",
      "membershipNumber": "MEM001",
      "membershipType": "Premium",
      "membershipStatus": "Active",
      "validityPeriod": {
        "startDate": "2023-01-01T00:00:00.000Z",
        "endDate": "2024-12-31T00:00:00.000Z"
      },
      "isActive": true,
      "createdAt": "2023-01-01T10:00:00.000Z",
      "updatedAt": "2023-06-15T12:30:00.000Z",
      "isExpired": false,
      "isValid": true,
      "daysUntilExpiry": 180,
      "validityStatus": "Valid",
      "membershipDuration": 365
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "pages": 5
  },
  "searchCriteria": {
    "membershipName": "John",
    "membershipNumber": "MEM001",
    "membershipType": "Premium",
    "membershipStatus": "Active",
    "isActive": "true"
  },
  "message": "Memberships search completed successfully"
}
```

### **POST Method - Advanced Search**

**URL:** `POST /api/admin/memberships/search`

#### **Request Body:**
```json
{
  "searchTerms": {
    "membershipName": "John Doe",
    "membershipNumber": "MEM001",
    "membershipType": "Premium",
    "membershipStatus": "Active",
    "isActive": true,
    "startDateFrom": "2023-01-01",
    "startDateTo": "2023-12-31",
    "endDateFrom": "2024-01-01",
    "endDateTo": "2024-12-31"
  }
}
```

#### **Response:**
```json
{
  "memberships": [...],
  "searchTerms": {...},
  "totalFound": 8,
  "message": "Advanced memberships search completed successfully"
}
```

---

---

## 🎓 **Student Certificates Search API**

### **Endpoint:** `/api/admin/students/certificates/search`

### **GET Method - Query Parameters Search**

**URL:** `GET /api/admin/students/certificates/search?studentName=value&registerNumber=value&certificateNumber=value&learnerNumber=value&page=1&limit=10`

#### **Query Parameters:**
- `studentName` (string, optional): Search by student's full name (partial match, case insensitive)
- `registerNumber` (string, optional): Search by register number (exact match, case insensitive)
- `certificateNumber` (string, optional): Search by certificate number (exact match, case insensitive)
- `learnerNumber` (string, optional): Search by learner number (exact match, case insensitive)
- `page` (number, optional): Page number for pagination (default: 1)
- `limit` (number, optional): Items per page (default: 10)

#### **Example Requests:**
```bash
# Search by student name
GET /api/admin/students/certificates/search?studentName=John%20Doe

# Search by certificate number
GET /api/admin/students/certificates/search?certificateNumber=CERT123

# Search by multiple criteria
GET /api/admin/students/certificates/search?studentName=John&registerNumber=REG001
```

#### **Response:**
```json
{
  "students": [
    {
      "_id": "student_id",
      "fullName": "John Doe",
      "registerNumber": "REG001",
      "certificateNumber": "CERT123",
      "learnerNumber": "LRN456",
      "admissionNumber": "ADM789",
      "isActive": true,
      "createdAt": "2023-01-01T10:00:00.000Z",
      "updatedAt": "2023-06-15T12:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  },
  "searchCriteria": {
    "studentName": "John",
    "registerNumber": "REG001",
    "certificateNumber": "",
    "learnerNumber": ""
  },
  "message": "Student certificates search completed successfully"
}
```

### **POST Method - Advanced Search**

**URL:** `POST /api/admin/students/certificates/search`

#### **Request Body:**
```json
{
  "searchTerms": {
    "studentName": "John Doe",
    "registerNumber": "REG001",
    "certificateNumber": "CERT123",
    "learnerNumber": "LRN456"
  }
}
```

#### **Response:**
```json
{
  "students": [...],
  "searchTerms": {...},
  "totalFound": 1,
  "message": "Advanced student certificates search completed successfully"
}
```

---

## 🔧 **Features**

### **Centers Search Features:**
- ✅ Search by center name (partial match)
- ✅ Search by center code (exact match)
- ✅ Search by location
- ✅ Filter by status (active/inactive/expired/valid)
- ✅ Pagination support
- ✅ Computed fields (expiry status, days until expiry)
- ✅ Advanced search with POST method

### **Memberships Search Features:**
- ✅ Search by membership name (partial match)
- ✅ Search by membership number (exact match)
- ✅ Filter by membership type
- ✅ Filter by membership status
- ✅ Filter by active status
- ✅ Date range filtering
- ✅ Pagination support
- ✅ Computed fields (validity status, days until expiry, duration)
- ✅ Advanced search with POST method

### **Student Certificates Search Features:**
- ✅ Search by student name (partial match)
- ✅ Search by register number (exact match)
- ✅ Search by certificate number (exact match)
- ✅ Search by learner number (exact match)
- ✅ Pagination support
- ✅ Advanced search with POST method

### **Common Features:**
- ✅ Authentication required (JWT token)
- ✅ Case-insensitive searches
- ✅ Flexible query combinations
- ✅ Comprehensive error handling
- ✅ Professional response format
- ✅ Search criteria tracking

---

## 📊 **Computed Fields**

### **Centers:**
- `isExpired`: Boolean indicating if center has expired
- `daysUntilExpiry`: Number of days until expiry (negative if expired)
- `status`: Computed status (Active/Inactive/Expired)

### **Memberships:**
- `isExpired`: Boolean indicating if membership has expired
- `isValid`: Boolean indicating if membership is currently valid
- `daysUntilExpiry`: Number of days until expiry
- `validityStatus`: Computed status (Valid/Expired/Not Started)
- `membershipDuration`: Total duration in days

---

## 🚀 **Usage Examples**

### **Frontend Integration:**

```javascript
// Search centers by name
const searchCenters = async (centerName) => {
  const response = await fetch(`/api/admin/centers/search?centerName=${centerName}`);
  const data = await response.json();
  return data.centers;
};

// Search memberships by number
const searchMemberships = async (membershipNumber) => {
  const response = await fetch(`/api/admin/memberships/search?membershipNumber=${membershipNumber}`);
  const data = await response.json();
  return data.memberships;
};

// Advanced search
const advancedSearch = async (searchTerms) => {
  const response = await fetch('/api/admin/centers/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ searchTerms })
  });
  const data = await response.json();
  return data.centers;
};
```

Both APIs are now ready for use with comprehensive search capabilities! 🎉