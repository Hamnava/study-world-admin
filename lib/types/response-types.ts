export interface User {
  id: number;
  documentId: string;
  firstName: string;
  lastName: string;
  displayName: string;
  username: string | null;
  email: string;
  isEmailVerified: boolean;
  createdAt: string;
  roles: string[];
  picture?: string;
  teacherInfo: Record<string, unknown> | null;
  studentCategories: Record<string, unknown> | null;
}

export interface UpdateUserResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: {
    id: number;
    documentId: string;
    firstName: string;
    lastName: string;
    displayName: string;
    username: string;
    email: string;
  };
};

export interface TeacherInfo {
  id:number
  phoneNumber: string
  resume: string
  educationLevel: string
  graduationYear: number
  teachingExperience: number
  teachingSpecialty: {
    id: number
    name: string
  }
  isApproved: boolean
}

export interface Category {
  id: number
  name: string
}

export interface UserDetails {
  id: number
  documentId: string
  firstName: string
  lastName: string
  displayName: string
  username: string
  email: string
  isEmailVerified: boolean
  createdAt: string
  roles: string[]
  picture: string
  teacherInfo?: TeacherInfo
  studentCategories?: Category[]
}

export interface UploadProfilePicture {
  file: File | null;
  folderPath?: string;
}

export interface StatsData {
  totalUsers: number;
  totalRoles: number
  totalPermissions: number
}
export interface Metadata  {
  count: number;
  page: number;
  limit: number;
  totalPages: number;
};

export interface Permission {
  id: number;
  name: string;
  description: string;
  action: string;
  group: string;
};

export interface RolePermission{
  roleId: number;
  permissions: Permission[]
}

export interface Role {
  id: number
  name: string
  description: string
}

export interface RolePermissionsProps {
  roleId: number
}