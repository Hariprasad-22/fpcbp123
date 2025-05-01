import axios from 'axios';
import { InternshipApplication, StudentInfo, CompanyInfo, InternshipDuration, Documents } from '@/types';

// This should be configured from environment variables in a production app
const API_URL = 'http://localhost:5000/api';

// Create an axios instance with interceptors
const api = axios.create({
  baseURL: API_URL,
});

// Add request interceptor to include token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized error by redirecting to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Define the API response types
interface ApiResponse<T> {
  data: T;
  message?: string;
}

// Fetch all internship applications
export const fetchInternships = async (): Promise<InternshipApplication[]> => {
  try {
    const response = await api.get<InternshipApplication[]>(`/internships`);
    return response.data;
  } catch (error) {
    console.error('Error fetching internships:', error);
    throw error;
  }
};

// Create a new internship application
export const createInternship = async (
  studentInfo: StudentInfo,
  companyInfo: CompanyInfo,
  internshipDuration: InternshipDuration,
  documents: Documents
): Promise<ApiResponse<InternshipApplication>> => {
  try {
    // Transform the data to match the MongoDB schema
    const internshipData = {
      // Student info
      fullName: studentInfo.fullName,
      rollNumber: studentInfo.rollNumber,
      course: studentInfo.course,
      branch: studentInfo.branch,
      year: studentInfo.year,
      semester: studentInfo.semester,
      email: studentInfo.email,
      mobileNumber: studentInfo.mobileNumber,
      academicYear: studentInfo.academicYear,
      
      // Company info
      companyName: companyInfo.companyName,
      roleOffered: companyInfo.roleOffered,
      stipend: companyInfo.stipend,
      durationMonths: companyInfo.duration,
      
      // HR details
      hrDetails: {
        name: companyInfo.hrName,
        mobileNumber: companyInfo.hrMobile,
        email: companyInfo.hrEmail
      },
      
      // Internship duration
      internshipDuration: {
        startDate: internshipDuration.startDate,
        endDate: internshipDuration.endDate
      },
      
      // Document paths would be handled by file uploads
      offerLetter: documents.offerLetter ? documents.offerLetter.name : null,
      nocByHOD: documents.nocByHod ? documents.nocByHod.name : null,
      studentLetterToHOD: documents.studentLetterToHod ? documents.studentLetterToHod.name : null
    };

    const response = await api.post<ApiResponse<InternshipApplication>>(
      `/internships`, 
      internshipData
    );
    return response.data;
  } catch (error) {
    console.error('Error creating internship:', error);
    throw error;
  }
};

// Get a single internship application by ID
export const getInternshipById = async (id: string): Promise<InternshipApplication> => {
  try {
    const response = await api.get<InternshipApplication>(`/internships/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching internship with ID ${id}:`, error);
    throw error;
  }
};

// Update a feedback for an internship
export const updateFeedback = async (
  id: string, 
  feedback: {
    company: string;
    role: string;
    feedbackText: string;
    skillsUsed: string;
    learningExperience: string;
  }
): Promise<ApiResponse<InternshipApplication>> => {
  try {
    const response = await api.patch<ApiResponse<InternshipApplication>>(
      `/internships/${id}/feedback`,
      feedback
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating feedback for internship with ID ${id}:`, error);
    throw error;
  }
};

// File upload function
export const uploadFile = async (
  id: string,
  fileType: 'offerLetter' | 'nocByHod' | 'studentLetterToHod',
  file: File
): Promise<ApiResponse<{fileUrl: string}>> => {
  try {
    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', fileType);

    const response = await api.post<ApiResponse<{fileUrl: string}>>(
      `/internships/${id}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error uploading ${fileType} for internship with ID ${id}:`, error);
    throw error;
  }
};

// Get student applications
export const getStudentApplications = async (): Promise<InternshipApplication[]> => {
  try {
    // Updated to use the correct endpoint
    const response = await api.get<InternshipApplication[]>('/applications/mystudent');
    return response.data;
  } catch (error) {
    console.error('Error fetching student applications:', error);
    throw error;
  }
};

// Get student profile
export const getStudentProfile = async () => {
  try {
    const response = await api.get('/auth/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching student profile:', error);
    throw error;
  }
};

// Submit application - Updated to fix the validation errors
export const submitApplication = async (formData: FormData): Promise<ApiResponse<any>> => {
  try {
    // Extract data from original form
    const studentInfoStr = formData.get('studentInfo') as string;
    const companyInfoStr = formData.get('companyInfo') as string;
    const internshipDurationStr = formData.get('internshipDuration') as string;
    
    // Parse JSON strings
    const studentInfo = studentInfoStr ? JSON.parse(studentInfoStr) : {};
    const companyInfo = companyInfoStr ? JSON.parse(companyInfoStr) : {};
    const internshipDuration = internshipDurationStr ? JSON.parse(internshipDurationStr) : {};
    
    // Create a new FormData with the structure expected by the backend
    const processedFormData = new FormData();
    
    // The backend validation works on this structure - directly create a flattened version with dot notation
    // Using a single studentInfo field with the entire object as JSON
    processedFormData.append('studentInfo', JSON.stringify({
      fullName: studentInfo.fullName || '',
      rollNumber: studentInfo.rollNumber || '',
      course: studentInfo.course || '',
      branch: studentInfo.branch || '',
      year: studentInfo.year || '',
      semester: studentInfo.semester || '',
      email: studentInfo.email || '',
      mobileNumber: studentInfo.mobileNumber || '',
      academicYear: studentInfo.academicYear || ''
    }));
    
    processedFormData.append('companyInfo', JSON.stringify({
      companyName: companyInfo.companyName || '',
      roleOffered: companyInfo.roleOffered || '',
      stipend: companyInfo.stipend || '',
      duration: companyInfo.duration || '',
      hrName: companyInfo.hrName || '',
      hrMobile: companyInfo.hrMobile || '',
      hrEmail: companyInfo.hrEmail || ''
    }));
    
    // Format dates to ensure they pass validation
    processedFormData.append('internshipDuration', JSON.stringify({
      startDate: internshipDuration.startDate ? new Date(internshipDuration.startDate).toISOString() : null,
      endDate: internshipDuration.endDate ? new Date(internshipDuration.endDate).toISOString() : null
    }));
    
    // Add file fields directly
    if (formData.get('offerLetter')) {
      processedFormData.append('offerLetter', formData.get('offerLetter') as File);
    }
    
    if (formData.get('nocByHod')) {
      processedFormData.append('nocByHod', formData.get('nocByHod') as File);
    }
    
    if (formData.get('studentLetterToHod')) {
      processedFormData.append('studentLetterToHod', formData.get('studentLetterToHod') as File);
    }
    
    // Debug the form data being sent
    console.log('Processed form data keys:', [...processedFormData.keys()]);
    
    // Looking at the backend code in applicationRoutes.js, we need to match the upload.fields pattern
    // Make direct request without using the interceptor to have full control
    const response = await axios.post(
      `${API_URL}/applications`, 
      processedFormData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': localStorage.getItem('authToken') || ''
        }
      }
    );
    
    return response.data;
  } catch (error) {
    // Enhanced error logging with complete details
    if (axios.isAxiosError(error) && error.response) {
      console.error('Application submission error details:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        message: error.message,
        validationErrors: error.response.data?.errors || 'No validation errors returned'
      });
      
      // Log the specific validation errors in a more readable format
      if (error.response.data?.errors) {
        console.table(error.response.data.errors);
      }
    } else {
      console.error('Application submission error (non-Axios):', error);
    }
    throw error;
  }
};

// Add a more robust direct submission function
export const directApplicationSubmit = async (formData: FormData): Promise<any> => {
  try {
    // Create a new enhanced FormData with proper content for the backend
    const enhancedFormData = new FormData();
    
    // Process JSON data to ensure valid format
    for (const [key, value] of formData.entries()) {
      if (key === 'studentInfo' || key === 'companyInfo' || key === 'internshipDuration') {
        try {
          if (typeof value === 'string') {
            // Parse and re-stringify to ensure proper JSON format
            const parsed = JSON.parse(value);
            enhancedFormData.append(key, JSON.stringify(parsed));
          } else {
            enhancedFormData.append(key, value);
          }
        } catch (e) {
          console.error(`Error processing ${key}:`, e);
          enhancedFormData.append(key, value);
        }
      } else if (value instanceof File) {
        // File uploads
        enhancedFormData.append(key, value);
      } else {
        enhancedFormData.append(key, value);
      }
    }
    
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_URL}/applications`, {
      method: 'POST',
      headers: {
        'Authorization': token
      },
      body: enhancedFormData,
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Server responded with ${response.status}: ${JSON.stringify(errorData)}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Direct form submission error:', error);
    throw error;
  }
};

// Add a function to directly use in the InternshipFormContainer
export const submitApplicationDirect = async (
  formData: FormData, 
  token: string
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.post(
      `${API_URL}/applications`,
      formData,
      {
        headers: {
          'Authorization': token,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error('Direct submission error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
    }
    throw error;
  }
};
