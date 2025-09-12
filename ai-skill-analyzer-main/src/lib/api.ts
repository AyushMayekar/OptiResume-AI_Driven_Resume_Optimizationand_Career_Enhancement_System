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

// Use the working backend URL from ai-skill-analyzer-main
const DEFAULT_BASE_URL = import.meta.env.VITE_BACKEND_URL || "https://optiresume-aidrivenresumeoptimizationandcare-production.up.railway.app";

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
  const res = await fetch(url, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Analyze failed (${res.status}): ${text || res.statusText}`);
  }
  return res.json();
}

export async function exportPdf(): Promise<{ pdf_download_link?: string; error?: string }> {
  const base = getBackendBaseUrl();
  const url = base ? `${base}/export-pdf` : "/export-pdf";
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Export failed (${res.status}): ${text || res.statusText}`);
  }
  return res.json();
}


