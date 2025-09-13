// Lightweight API client for OptiResume backend
// Endpoints:
// - POST /analyze-resume (multipart: file, job_role, job_description?)
// - GET  /export-pdf

export type AnalysisResult = {
  match_percentage: number;
  matched_skills: string[];
  missing_skills: string[];
  recommendations: string[];
  estimated_time_saved_minutes: number;
};

export type AnalyzeResumeResponse = {
  result: AnalysisResult;
};

// Backend URL configuration with fallbacks
const getBackendUrl = () => {
  // Check for environment variable first
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  
  // Check if we're in development mode
  if (import.meta.env.DEV) {
    return "http://localhost:8000";
  }
  
  // Production fallback
  return "https://optiresume-aidrivenresumeoptimizationandcare-production.up.railway.app";
};

const DEFAULT_BASE_URL = getBackendUrl();

export const getBackendBaseUrl = () => DEFAULT_BASE_URL.replace(/\/$/, "");

export async function analyzeResume(params: {
  file: File;
  jobRole: string;
  jobDescription?: string;
}): Promise<AnalyzeResumeResponse> {
  const form = new FormData();
  form.append("file", params.file);
  form.append("job_role", params.jobRole);
  if (params.jobDescription && params.jobDescription.trim()) {
    form.append("job_description", params.jobDescription.trim());
  }

  const base = getBackendBaseUrl();
  const url = base ? `${base}/analyze-resume` : "/analyze-resume";
  
  console.log("Attempting to connect to:", url);
  console.log("Backend base URL:", base);
  
  try {
    const res = await fetch(url, {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("API Error:", res.status, text);
      throw new Error(`Analyze failed (${res.status}): ${text || res.statusText}`);
    }
    return res.json();
  } catch (error) {
    console.error("Network Error:", error);
    if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
      throw new Error(`Cannot connect to backend at ${url}. Please check if the backend is running.`);
    }
    throw error;
  }
}

export async function exportPdf(): Promise<Blob> {
  const base = getBackendBaseUrl();
  const url = base ? `${base}/export-pdf` : "/export-pdf";
  
  console.log("Exporting PDF from:", url);
  
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Export failed (${res.status}): ${text || res.statusText}`);
  }
  
  // Return the PDF as a blob
  return res.blob();
}


