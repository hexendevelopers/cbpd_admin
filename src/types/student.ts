// types/student.ts
export interface IStudent {
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
  admissionNumber: string;
  marksheets: string[];
  passportPhoto: string;
  isActive: boolean;
  institutionId: string; // Now required
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StudentFormData {
  fullName: string;
  gender: string;
  phoneNumber: string;
  dateOfBirth: string;
  joiningDate: string;
  state: string;
  district: string;
  county: string;
  currentCourse: string;
  department: string;
  semester: string;
  admissionNumber: string;
  institutionId?: string;
  isActive?: boolean;
}

export interface StudentSearchFilters {
  fullName?: string;
  gender?: string;
  state?: string;
  district?: string;
  county?: string;
  currentCourse?: string;
  department?: string;
  semester?: string;
  admissionNumber?: string;
  isActive?: boolean;
  institutionId?: string;
  dateOfBirthFrom?: string;
  dateOfBirthTo?: string;
  joiningDateFrom?: string;
  joiningDateTo?: string;
}

export interface StudentApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: string[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface StudentStatistics {
  overview: {
    totalStudents: number;
    activeStudents: number;
    inactiveStudents: number;
    activationRate: string;
  };
  demographics: {
    gender: Array<{ _id: string; count: number }>;
  };
  academic: {
    topDepartments: Array<{ _id: string; count: number }>;
    topCourses: Array<{ _id: string; count: number }>;
  };
}

export interface BulkOperationRequest {
  action: "activate" | "deactivate";
  studentIds: string[];
}

export interface SearchRequest {
  filters: StudentSearchFilters;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Organization-specific types
export interface OrganizationStudentStatistics {
  overview: {
    totalStudents: number;
    activeStudents: number;
    inactiveStudents: number;
    activationRate: string;
  };
  demographics: {
    gender: Array<{ _id: string; count: number }>;
    age: Array<{ _id: string | number; count: number }>;
    states: Array<{ _id: string; count: number }>;
  };
  academic: {
    departments: Array<{ _id: string; count: number }>;
    courses: Array<{ _id: string; count: number }>;
    semesters: Array<{ _id: string; count: number }>;
  };
  trends: {
    monthlyRegistrations: Array<{ month: string; count: number }>;
  };
  recent: {
    students: Array<{
      _id: string;
      fullName: string;
      admissionNumber: string;
      currentCourse: string;
      createdAt: Date;
    }>;
  };
  organization: {
    name: string;
    email: string;
  };
}

export interface BulkImportResult {
  success: boolean;
  totalProcessed: number;
  successCount: number;
  errorCount: number;
  errors: Array<{
    row: number;
    error: string;
  }>;
  createdStudents?: IStudent[];
}

export interface StudentBulkData {
  fullName: string;
  gender: string;
  phoneNumber: string;
  dateOfBirth: string;
  joiningDate: string;
  state: string;
  district: string;
  county: string;
  currentCourse: string;
  department: string;
  semester: string;
  admissionNumber: string;
}

export interface OrganizationBulkOperationRequest {
  action: "activate" | "deactivate" | "delete";
  studentIds: string[];
}