// lib/studentUtils.ts
import { IStudent, StudentFormData } from "@/types/student";

/**
 * Validates student form data
 * @param data - Student form data to validate
 * @returns Object with isValid boolean and errors array
 */
export function validateStudentData(data: StudentFormData): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Required field validation
  if (!data.fullName?.trim()) {
    errors.push("Full name is required");
  }

  if (!data.gender) {
    errors.push("Gender is required");
  }

  if (!data.phoneNumber?.trim()) {
    errors.push("Phone number is required");
  } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(data.phoneNumber)) {
    errors.push("Please enter a valid phone number");
  }

  if (!data.dateOfBirth) {
    errors.push("Date of birth is required");
  } else {
    const dob = new Date(data.dateOfBirth);
    const today = new Date();
    if (dob >= today) {
      errors.push("Date of birth must be in the past");
    }
  }

  if (!data.joiningDate) {
    errors.push("Joining date is required");
  }

  if (!data.state?.trim()) {
    errors.push("State is required");
  }

  if (!data.district?.trim()) {
    errors.push("District is required");
  }

  if (!data.county?.trim()) {
    errors.push("County is required");
  }

  if (!data.currentCourse?.trim()) {
    errors.push("Current course is required");
  }

  if (!data.department?.trim()) {
    errors.push("Department is required");
  }

  if (!data.semester?.trim()) {
    errors.push("Semester is required");
  }

  if (!data.admissionNumber?.trim()) {
    errors.push("Admission number is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Formats student data for display
 * @param student - Student object
 * @returns Formatted student data
 */
export function formatStudentForDisplay(student: IStudent) {
  return {
    ...student,
    dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : "",
    joiningDate: student.joiningDate ? new Date(student.joiningDate).toLocaleDateString() : "",
    createdAt: student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "",
    updatedAt: student.updatedAt ? new Date(student.updatedAt).toLocaleDateString() : "",
  };
}

/**
 * Calculates age from date of birth
 * @param dateOfBirth - Date of birth
 * @returns Age in years
 */
export function calculateAge(dateOfBirth: Date | string): number {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Generates a unique admission number
 * @param prefix - Prefix for the admission number (e.g., institution code)
 * @returns Generated admission number
 */
export function generateAdmissionNumber(prefix: string = "STU"): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `${prefix}${year}${randomNum}`;
}

/**
 * Validates file types for uploads
 * @param file - File to validate
 * @param allowedTypes - Array of allowed MIME types
 * @returns Boolean indicating if file type is valid
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Validates file size
 * @param file - File to validate
 * @param maxSizeMB - Maximum file size in MB
 * @returns Boolean indicating if file size is valid
 */
export function validateFileSize(file: File, maxSizeMB: number): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Formats file size for display
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Sanitizes student data for API requests
 * @param data - Raw form data
 * @returns Sanitized data
 */
export function sanitizeStudentData(data: any): StudentFormData {
  return {
    fullName: data.fullName?.trim() || "",
    gender: data.gender || "",
    phoneNumber: data.phoneNumber?.trim() || "",
    dateOfBirth: data.dateOfBirth || "",
    joiningDate: data.joiningDate || "",
    state: data.state?.trim() || "",
    district: data.district?.trim() || "",
    county: data.county?.trim() || "",
    currentCourse: data.currentCourse?.trim() || "",
    department: data.department?.trim() || "",
    semester: data.semester?.trim() || "",
    admissionNumber: data.admissionNumber?.trim() || "",
    institutionId: data.institutionId || undefined,
    isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
  };
}

/**
 * Builds search query for student filtering
 * @param filters - Search filters
 * @returns MongoDB query object
 */
export function buildStudentSearchQuery(filters: any): any {
  const query: any = {};

  // Text search filters with case-insensitive regex
  const textFields = [
    "fullName", "state", "district", "county", 
    "currentCourse", "department", "semester", 
    "admissionNumber"
  ];

  textFields.forEach(field => {
    if (filters[field]) {
      query[field] = { $regex: filters[field], $options: "i" };
    }
  });

  // Exact match filters
  if (filters.gender) {
    query.gender = filters.gender;
  }

  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive;
  }

  if (filters.institutionId) {
    query.institutionId = filters.institutionId;
  }

  // Date range filters
  if (filters.dateOfBirthFrom || filters.dateOfBirthTo) {
    query.dateOfBirth = {};
    if (filters.dateOfBirthFrom) {
      query.dateOfBirth.$gte = new Date(filters.dateOfBirthFrom);
    }
    if (filters.dateOfBirthTo) {
      query.dateOfBirth.$lte = new Date(filters.dateOfBirthTo);
    }
  }

  if (filters.joiningDateFrom || filters.joiningDateTo) {
    query.joiningDate = {};
    if (filters.joiningDateFrom) {
      query.joiningDate.$gte = new Date(filters.joiningDateFrom);
    }
    if (filters.joiningDateTo) {
      query.joiningDate.$lte = new Date(filters.joiningDateTo);
    }
  }

  return query;
}