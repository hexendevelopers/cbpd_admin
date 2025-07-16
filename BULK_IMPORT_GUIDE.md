# Student Bulk Import Guide

This guide provides detailed instructions for organizations to bulk import students using Excel or CSV files.

## Overview

The bulk import feature allows organizations to upload multiple students at once using a standardized Excel or CSV template. This eliminates the need to create students one by one.

**Note:** Passport photos and marksheets are **NOT** included in bulk import. These must be uploaded separately after student creation.

## Process Flow

1. **Download Template** → 2. **Fill Data** → 3. **Upload File** → 4. **Validation** → 5. **Import Complete** → 6. **Upload Images Separately**

## Step 1: Download Template

### API Endpoint
```
GET /api/organization/[organizationId]/students/template?format=xlsx
```

### Query Parameters
- `format`: "xlsx" (default) or "csv"

### Template Structure
The Excel template contains three sheets:

#### 1. Instructions Sheet
- Comprehensive guidelines for filling the template
- Field requirements and validation rules
- Important notes about image uploads
- Organization-specific information

#### 2. Field Mapping Sheet
- Database field mapping reference
- Validation rules for each field
- Data type specifications
- Auto-generated field information

#### 3. Students Data Sheet
- Pre-formatted columns matching the student model
- Sample data for reference
- Ready-to-fill template

## Step 2: Fill Student Data

### Required Fields (All 12 fields must be filled)

| Column | Field Name | Example | Validation |
|--------|------------|---------|------------|
| A | Full Name | "John Doe" | Max 100 characters |
| B | Gender | "Male" | Exactly: Male, Female, or Other |
| C | Phone Number | "+1234567890" | Include country code |
| D | Date of Birth (YYYY-MM-DD) | "1995-05-15" | Past date, YYYY-MM-DD |
| E | Joining Date (YYYY-MM-DD) | "2023-09-01" | YYYY-MM-DD format |
| F | State | "California" | Text |
| G | District | "Los Angeles" | Text |
| H | County | "LA County" | Text |
| I | Current Course | "Computer Science" | Text |
| J | Department / Branch | "Engineering" | Text |
| K | Year / Semester | "3rd Year" | Text |
| L | College Admission Number | "CS2023001" | Unique globally |

### Sample Data Rows
```
John Doe | Male | +1234567890 | 1995-05-15 | 2023-09-01 | California | Los Angeles | LA County | Computer Science | Engineering | 3rd Year | CS2023001
Jane Smith | Female | +1987654321 | 1996-08-22 | 2023-09-01 | New York | Manhattan | New York County | Business Administration | Business | 2nd Year | BA2023002
Mike Johnson | Male | +1122334455 | 1997-03-10 | 2023-09-01 | Texas | Houston | Harris County | Mechanical Engineering | Engineering | 1st Year | ME2023003
```

### Important Guidelines

#### Date Formats
- **Date of Birth**: Must be YYYY-MM-DD (e.g., 1995-05-15)
- **Joining Date**: Must be YYYY-MM-DD (e.g., 2023-09-01)
- Date of birth must be in the past

#### Gender Values
- Must be exactly: "Male", "Female", or "Other"
- Case-sensitive (not "male" or "MALE")

#### Phone Numbers
- Must include country code (e.g., +1234567890)
- Only numbers and + symbol allowed
- Pattern: +[country code][number]

#### Unique Fields
- **Admission Number**: Must be unique across all students globally
- System will reject the entire import if duplicates are found

#### Text Fields
- All text fields are automatically trimmed of extra spaces
- Full name has a maximum of 100 characters
- Other text fields have reasonable limits

## Step 3: Upload File

### API Endpoint
```
POST /api/organization/[organizationId]/students
```

### Request Format
```javascript
const formData = new FormData();
formData.append('bulkFile', excelFile); // File object

const response = await fetch('/api/organization/org123/students', {
  method: 'POST',
  body: formData
});
```

### Supported File Types
- Excel: .xlsx, .xls
- CSV: .csv
- Maximum file size: 50MB

## Step 4: Validation Process

### Pre-Import Validation
1. **File Format Check**: Validates file type and structure
2. **Data Parsing**: Extracts data from Excel/CSV
3. **Field Mapping**: Maps columns to database fields
4. **Required Field Check**: Ensures all mandatory fields are present
5. **Data Type Validation**: Validates dates, phone numbers, etc.
6. **Duplicate Detection**: Checks for duplicates within file
7. **Database Conflict Check**: Verifies no existing conflicts

### Validation Rules Applied

#### Row-Level Validation
- Full name: Required, max 100 characters
- Gender: Required, must be "Male", "Female", or "Other"
- Phone number: Required, valid format with country code
- Date of birth: Required, valid date in past, YYYY-MM-DD format
- Joining date: Required, valid date, YYYY-MM-DD format
- Address fields: Required (state, district, county)
- Academic fields: Required (course, department, semester)
- Admission number: Required, unique globally

#### File-Level Validation
- No duplicate admission numbers within file
- No conflicts with existing database records

### Error Responses

#### Validation Errors (400 Bad Request)
```json
{
  "success": false,
  "error": "Validation errors found in uploaded file",
  "details": [
    "Row 2: Full name is required",
    "Row 3: Gender must be Male, Female, or Other",
    "Row 4: Invalid phone number format. Use format: +1234567890",
    "Row 5: Invalid date of birth format. Use YYYY-MM-DD"
  ]
}
```

#### Duplicate Errors (409 Conflict)
```json
{
  "success": false,
  "error": "Duplicate students found in database",
  "details": [
    "Student with admission number \"CS2023001\" already exists"
  ]
}
```

## Step 5: Successful Import

### Success Response
```json
{
  "success": true,
  "data": {
    "totalProcessed": 50,
    "successfullyCreated": 50,
    "createdStudents": [...]
  },
  "message": "Successfully imported 50 students. Note: Passport photos and marksheets need to be uploaded separately for each student."
}
```

## Step 6: Upload Images Separately

### After successful bulk import, upload images individually for each student:

#### Upload Passport Photo
```javascript
const formData = new FormData();
formData.append('passportPhoto', photoFile);

const response = await fetch(`/api/organization/[orgId]/students/[studentId]`, {
  method: 'PUT',
  body: formData
});
```

#### Upload Marksheets
```javascript
const formData = new FormData();
formData.append('marksheets', marksheetFile1);
formData.append('marksheets', marksheetFile2);

const response = await fetch(`/api/organization/[orgId]/students/[studentId]`, {
  method: 'PUT',
  body: formData
});
```

#### Upload Both
```javascript
const formData = new FormData();
formData.append('passportPhoto', photoFile);
formData.append('marksheets', marksheetFile1);
formData.append('marksheets', marksheetFile2);

const response = await fetch(`/api/organization/[orgId]/students/[studentId]`, {
  method: 'PUT',
  body: formData
});
```

## Auto-Generated Fields

The following fields are automatically set during import:

- `institutionId`: Set to the uploading organization's ID
- `isActive`: Set to `true` for all imported students
- `marksheets`: Empty array (upload separately)
- `passportPhoto`: Empty string (upload separately)
- `createdAt`: Current timestamp
- `updatedAt`: Current timestamp

## Best Practices

### Before Upload
1. **Validate Data Locally**: Check dates, phone numbers, and required fields
2. **Remove Duplicates**: Ensure no duplicate admission numbers
3. **Consistent Formatting**: Use consistent date and phone number formats
4. **Test with Small Batch**: Try with 5-10 students first

### During Upload
1. **Stable Connection**: Ensure stable internet connection
2. **Don't Navigate Away**: Stay on the upload page until completion
3. **Monitor Progress**: Watch for validation error messages

### After Upload
1. **Review Results**: Check the success message and created student count
2. **Plan Image Uploads**: Organize passport photos and marksheets
3. **Upload Images**: Use individual student update API for each student
4. **Verify Data**: Spot-check a few students to ensure data accuracy

## Image Upload Strategy

### Recommended Approach
1. **Bulk Import Students**: Import all student data first
2. **Organize Images**: Sort images by admission number or student name
3. **Batch Upload Images**: Upload images for multiple students in sequence
4. **Verify Uploads**: Check that images are properly associated

### Image Requirements
- **Passport Photos**: JPEG, PNG, GIF, WebP (max 5MB)
- **Marksheets**: JPEG, PNG, GIF, WebP, PDF (max 10MB per file)
- **File Naming**: Use admission numbers for easy identification

## Troubleshooting

### Common Issues

#### "No data found in uploaded file"
- Check if you're uploading the correct sheet ("Students Data")
- Ensure the file has data rows beyond the header

#### "Invalid file format"
- Use only .xlsx, .xls, or .csv files
- Ensure the file isn't corrupted

#### "Validation errors found"
- Check the details array for specific row errors
- Fix each error and re-upload

#### "Duplicate students found"
- Check for existing students with same admission numbers
- Use unique identifiers for each student

### Getting Help

If you encounter issues:
1. Check the error details in the API response
2. Verify your data against the validation rules
3. Try uploading a smaller batch to isolate issues
4. Contact technical support with specific error messages

## Example Workflow

```javascript
// 1. Download template
const templateResponse = await fetch('/api/organization/org123/students/template?format=xlsx');
const templateBlob = await templateResponse.blob();

// 2. User fills template and uploads
const formData = new FormData();
formData.append('bulkFile', userUploadedFile);

// 3. Upload for bulk import
const importResponse = await fetch('/api/organization/org123/students', {
  method: 'POST',
  body: formData
});

const result = await importResponse.json();

if (result.success) {
  console.log(`Successfully imported ${result.data.successfullyCreated} students`);
  
  // 4. Upload images for each student
  for (const student of result.data.createdStudents) {
    const imageFormData = new FormData();
    imageFormData.append('passportPhoto', getPhotoForStudent(student.admissionNumber));
    
    await fetch(`/api/organization/org123/students/${student._id}`, {
      method: 'PUT',
      body: imageFormData
    });
  }
} else {
  console.error('Import failed:', result.error);
  console.log('Details:', result.details);
}
```

## Benefits of Separated Approach

### ✅ **Advantages**
- **Faster Bulk Import**: No image processing delays
- **Reliable Data Import**: Student data import won't fail due to image issues
- **Flexible Image Upload**: Upload images at your own pace
- **Better Error Handling**: Separate validation for data vs images
- **Scalable**: Handle thousands of students efficiently

### ✅ **Simple Workflow**
1. Import all student data quickly
2. Upload images separately when convenient
3. No complex URL management required
4. Standard file upload process

This completes the streamlined bulk import process for efficient student management without image complexity.