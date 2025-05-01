import axios from 'axios'
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  StudentInfo,
  CompanyInfo,
  InternshipDuration,
  Documents,
  InternshipApplication,
} from "@/types";
import { Progress } from "@/components/ui/progress";
import StudentInfoForm from "./StudentInfoForm";
import CompanyInfoForm from "./CompanyInfoForm";
import InternshipDurationForm from "./InternshipDurationForm";
import DocumentsUploadForm from "./DocumentsUploadForm";

import { v4 as uuidv4 } from "uuid";

const InternshipFormContainer: React.FC = () => {
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(25);
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [internshipDuration, setInternshipDuration] = useState<InternshipDuration | null>(null);
  
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const handleStudentInfoSubmit = (data: StudentInfo) => {
    setStudentInfo(data);
    setStep(2);
    setProgress(50);
  };

  const handleCompanyInfoSubmit = (data: CompanyInfo) => {
    setCompanyInfo(data);
    setStep(3);
    setProgress(75);
  };

  const handleDurationSubmit = (data: InternshipDuration) => {
    setInternshipDuration(data);
    setStep(4);
    setProgress(100);
  };

const handleDocumentsSubmit = async (documents: Documents) => {
  try {
    if (!user) {
      toast.error("You must be logged in to submit an application");
      navigate("/login");
      return;
    }

    if (!token) {
      toast.error("Authentication token missing. Please log in again");
      navigate("/login");
      return;
    }

    if (!studentInfo || !companyInfo || !internshipDuration) {
      toast.error("Please complete all previous steps first");
      return;
    }

    const formData = new FormData();
    
    // Append JSON data
    formData.append("studentInfo", JSON.stringify(studentInfo));
    formData.append("companyInfo", JSON.stringify(companyInfo));
    formData.append("internshipDuration", JSON.stringify(internshipDuration));

    // Append files with proper keys
    if (documents.offerLetter) {
      formData.append("files.offerLetter", documents.offerLetter);
    }
    if (documents.nocByHod) {
      formData.append("files.nocByHod", documents.nocByHod);
    }
    if (documents.studentLetterToHod) {
      formData.append("files.studentLetterToHod", documents.studentLetterToHod);
    }

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true
    };

    const response = await axios.post(
      "http://localhost:5000/api/applications", 
      formData,
      config
    );

    if (response.status === 201) {
      toast.success("Application submitted successfully!");
      navigate("/dashboard");
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        toast.error("Your session has expired. Please log in again.");
        navigate("/login");
      } else {
        toast.error(error.response?.data?.message || "Failed to submit application");
      }
    } else {
      console.error("Submission error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  }
};

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Student Information";
      case 2:
        return "Company & Role Details";
      case 3:
        return "Internship Duration";
      case 4:
        return "Required Documents";
      default:
        return "Internship Application";
    }
  };

  if (!user) return null;

  return (
    <div className="p-6 bg-white rounded-md shadow-sm max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <div className="bg-gray-100 rounded-full py-1 px-4 inline-block mb-4">
          Internship Record Form
        </div>
        <h1 className="text-3xl font-bold mb-2">Internship Application</h1>
        <p className="text-gray-600">
          Please fill in the details of your internship for our records
        </p>
      </div>

      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span>Step {step} of 4</span>
          <span>{progress}% completed</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-6">{getStepTitle()}</h2>

        {step === 1 && (
          <StudentInfoForm
            onSubmit={handleStudentInfoSubmit}
            studentEmail={user.email}
          />
        )}

        {step === 2 && (
          <CompanyInfoForm
            onSubmit={handleCompanyInfoSubmit}
            onBack={() => {
              setStep(1);
              setProgress(25);
            }}
          />
        )}

        {step === 3 && (
          <InternshipDurationForm
            onSubmit={handleDurationSubmit}
            onBack={() => {
              setStep(2);
              setProgress(50);
            }}
          />
        )}

        {step === 4 && (
          <DocumentsUploadForm
            onSubmit={handleDocumentsSubmit}
            onBack={() => {
              setStep(3);
              setProgress(75);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default InternshipFormContainer;
