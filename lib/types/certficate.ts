export interface TrainingRegistration {
  id: number;
  registration_number: string;
  customer_id: number;
  training_course_id: number;
  trainer_id: number;
  training_date: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  training_course?: TrainingCourse;
}

export interface TrainingCourse {
  id: number;
  title: string;
  description: string;
  duration_hours: number;
}

export interface Trainee {
  id: number;
  name: string;
  civil_id: string;
  emp_id?: string;
  company_name: string;
  photo_path?: string;
  training_registration_id?: number;
  training_completion_date?: string;
  certificate_validation_date?: string;
}

export interface CertificateVerificationResponse {
  is_valid: boolean;
  trainee_name?: string;
  trainee_id?: string;
  emp_id?: string;
  company_name?: string;
  course_title?: string;
  training_date?: string;
  expiry_date?: string;
  registration_number?: string;
  error_message?: string;
  trainee_photo?: string;
}

export interface CertificateGenerationRequest {
  trainee_id: number;
  training_registration_id: number;
}

export interface Certificate {
  id: string;
  trainee_id: number;
  registration_id: number;
  issue_date: string;
  expiry_date?: string;
  certificate_path?: string;
  is_revoked: boolean;
  revocation_reason?: string;
}

export interface CertificateData {
  certificateNumber: string;
  traineeName: string;
  civilId: string;
  empId?: string | null;
  companyName: string;
  courseName: string;
  trainingDate: string;
  validityDate: string;
  registrationNumber: string;
  officialName?: string;
  instructorName?: string;
  qrCodeUrl: string;
  photo?: string | null;
}

export type CertificateStatus = 'valid' | 'expired' | 'revoked' | 'invalid';