# Student Management API Documentation

This document provides comprehensive documentation for the Student Management API system, including both general student APIs and organization-specific student management.

## Overview

The Student Management API provides endpoints for:
- Creating, reading, updating, and deleting students
- Organization-specific student management
- Bulk operations and imports
- File uploads (passport photos and marksheets)
- Advanced search and filtering
- Statistics and analytics
- Excel/CSV template generation and import

## Base URLs

- General Student APIs: `/api/student`
- Organization Student APIs: `/api/organization/[id]/students`

## Authentication

All APIs follow the existing authentication patterns used in your institution APIs.

## Data Models

### Student Model

```typescript
interface IStudent {
  _id?: string;
  fullName: string;
  gender: "Male" | "Female" | "Other";
  phoneNumber: string;
  dateOfBirth: Date;
  joiningDate: Date;
  state: string;
  district: string;
  county: string;
  currentCourse: string;
  department: string;
  semester: string;
  admissionNumber: string; // Unique
  govtIdNumber: string; // Unique
  marksheets: string[]; // Array of R2 URLs
  passportPhoto: string; // R2 URL
  isActive: boolean;
  institutionId: string; // Required - Reference to Organization
  createdAt?: Date;
  updatedAt?: Date;
}
```

## General Student APIs

### 1. Get All Students
```
GET /api/student
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search term for name, admission number, etc.
- `isActive` (boolean): Filter by active status
- `institutionId` (string): Filter by institution

**Response:**
```json
{
  "success": true,
  "data": [Student],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100,
    "itemsPerPage": 10
  }
}
```

### 2. Create Student
```
POST /api/student
```

**Content-Type:** `multipart/form-data`

**Form Fields:**
- All student fields (see model above)
- `passportPhoto` (File): Required passport photo
- `marksheets` (File[]): Optional marksheet files

### 3. Get Single Student
```
GET /api/student/[id]
```

### 4. Update Student
```
PUT /api/student/[id]
```

**Content-Type:** `multipart/form-data`

### 5. Delete Student (Soft Delete)
```
DELETE /api/student/[id]
```

### 6. Bulk Operations
```
POST /api/student/bulk
```

**Body:**
```json
{
  "action": "activate" | "deactivate",
  "studentIds": ["id1", "id2", ...]
}
```

### 7. Student Statistics
```
GET /api/student/bulk
```

### 8. Advanced Search
```
POST /api/student/search
```

**Body:**
```json
{
  "filters": {
    "fullName": "John",
    "gender": "Male",
    "state": "California",
    "isActive": true,
    "dateOfBirthFrom": "1990-01-01",
    "dateOfBirthTo": "2000-12-31"
  },
  "page": 1,
  "limit": 10,
  "sortBy": "createdAt",
  "sortOrder": "desc"
}
```

### 9. Search Suggestions
```
GET /api/student/search?field=fullName&query=John&limit=10
```

## Organization-Specific Student APIs

### 1. Get Organization Students
```
GET /api/organization/[id]/students
```

**Query Parameters:** Same as general student API

### 2. Create Student for Organization
```
POST /api/organization/[id]/students
```

**Content-Type:** `multipart/form-data`

**Options:**
1. **Single Student Creation:** Include all student form fields
2. **Bulk Import:** Include `bulkFile` (Excel/CSV file)

**Bulk Import File Format:**
- Excel (.xlsx, .xls) or CSV (.csv)
- Required columns: Full Name, Gender, Phone Number, Date of Birth, Joining Date, State, District, County, Current Course, Department, Semester, Admission Number, Government ID

### 3. Get Organization Student Statistics
```
GET /api/organization/[id]/students/statistics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalStudents": 150,
      "activeStudents": 140,
      "inactiveStudents": 10,
      "activationRate": "93.33"
    },
    "demographics": {
      "gender": [{"_id": "Male", "count": 80}],
      "age": [{"_id": "18-22", "count": 120}],
      "states": [{"_id": "California", "count": 50}]
    },
    "academic": {
      "departments": [{"_id": "Engineering", "count": 60}],
      "courses": [{"_id": "Computer Science", "count": 40}],
      "semesters": [{"_id": "3rd Year", "count": 30}]
    },
    "trends": {
      "monthlyRegistrations": [{"month": "2024-01", "count": 25}]
    },
    "recent": {
      "students": [...]
    },
    "organization": {
      "name": "ABC University",
      "email": "admin@abc.edu"
    }
  }
}
```

### 4. Organization Student Bulk Operations
```
POST /api/organization/[id]/students/bulk
```

**Body:**
```json
{
  "action": "activate" | "deactivate" | "delete",
  "studentIds": ["id1", "id2", ...]
}
```

### 5. Export Organization Students
```
GET /api/organization/[id]/students/bulk?format=csv&isActive=true
```

**Query Parameters:**
- `format` (string): "json" | "csv" (default: "json")
- `isActive` (boolean): Filter by active status

### 6. Organization Student Search
```
POST /api/organization/[id]/students/search
```

**Body:** Same as general search API

### 7. Organization Search Suggestions
```
GET /api/organization/[id]/students/search?field=department&query=Eng&limit=5
```

### 8. Get Single Organization Student
```
GET /api/organization/[id]/students/[studentId]
```

### 9. Update Organization Student
```
PUT /api/organization/[id]/students/[studentId]
```

### 10. Delete Organization Student
```
DELETE /api/organization/[id]/students/[studentId]
```

### 11. Download Import Template
```
GET /api/organization/[id]/students/template?format=xlsx
```

**Query Parameters:**
- `format` (string): "xlsx" | "csv" (default: "xlsx")

**Response:** File download with proper headers

## File Upload Specifications

### Supported File Types
- **Images:** JPEG, PNG, GIF, WebP
- **Documents:** PDF, DOC, DOCX
- **Spreadsheets:** XLSX, XLS, CSV

### File Size Limits
- **Passport Photos:** Max 5MB
- **Marksheets:** Max 10MB per file
- **Bulk Import Files:** Max 50MB

### File Storage
All files are stored in Cloudflare R2 using your existing `uploadImageToR2` function.

## Bulk Import Format

### Excel/CSV Headers
```
Full Name | Gender | Phone Number | Date of Birth | Joining Date | State | District | County | Current Course | Department | Semester | Admission Number | Government ID
```

### Sample Data
```csv
"John Doe","Male","+1234567890","1995-05-15","2023-09-01","California","Los Angeles","LA County","Computer Science","Engineering","3rd Year","CS2023001","ID123456789"
```

### Validation Rules
1. All fields are required except marksheets and passport photo
2. Date format: YYYY-MM-DD
3. Gender: Male, Female, or Other
4. Admission Number and Government ID must be unique
5. Phone numbers should include country code

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": ["Full name is required", "Invalid phone number format"]
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Student not found"
}
```

**409 Conflict:**
```json
{
  "success": false,
  "error": "Student with this admission number already exists"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Failed to create student"
}
```

## Usage Examples

### Creating a Student with Files

```javascript
const formData = new FormData();
formData.append('fullName', 'John Doe');
formData.append('gender', 'Male');
formData.append('phoneNumber', '+1234567890');
formData.append('institutionId', 'org123');
formData.append('passportPhoto', photoFile);
formData.append('marksheets', marksheetFile1);
formData.append('marksheets', marksheetFile2);

const response = await fetch('/api/organization/org123/students', {
  method: 'POST',
  body: formData
});
```

### Bulk Import

```javascript
const formData = new FormData();
formData.append('bulkFile', excelFile);

const response = await fetch('/api/organization/org123/students', {
  method: 'POST',
  body: formData
});
```

### Advanced Search

```javascript
const searchData = {
  filters: {
    fullName: 'John',
    department: 'Engineering',
    isActive: true,
    dateOfBirthFrom: '1990-01-01',
    dateOfBirthTo: '2000-12-31'
  },
  page: 1,
  limit: 20,
  sortBy: 'fullName',
  sortOrder: 'asc'
};

const response = await fetch('/api/organization/org123/students/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(searchData)
});
```

## Security Considerations

1. **Organization Isolation:** Students can only be accessed by their associated organization
2. **File Validation:** All uploaded files are validated for type and size
3. **Input Sanitization:** All input data is sanitized and validated
4. **Unique Constraints:** Admission numbers and government IDs are enforced as unique
5. **Soft Deletes:** Students are deactivated rather than permanently deleted

## Performance Optimizations

1. **Database Indexes:** Optimized indexes on frequently queried fields
2. **Pagination:** All list endpoints support pagination
3. **Selective Population:** Only necessary fields are populated in responses
4. **Aggregation Pipelines:** Efficient statistics calculation using MongoDB aggregation

## Dependencies

- `xlsx`: Excel file processing
- `csv-parse`: CSV file processing
- `mongoose`: MongoDB ODM
- `@aws-sdk/client-s3`: Cloudflare R2 integration

## Installation

```bash
npm install xlsx csv-parse @types/xlsx
```

This completes the comprehensive Student Management API system with organization-specific features, bulk operations, file uploads, and advanced search capabilities.