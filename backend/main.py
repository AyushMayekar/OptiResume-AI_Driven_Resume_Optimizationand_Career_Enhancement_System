from fastapi import FastAPI, UploadFile, Form
from core import parse_resume, extract_job_skills, analyze_skill_match, generate_llm_recommendations, format_for_ui_and_pdf, export_to_pdf, get_description_from_db
from fastapi.responses import FileResponse

app = FastAPI()
temp_storage = {}

@app.post("/analyze-resume")
async def analyze_resume(file: UploadFile, job_role: str = Form(...), job_description: str = Form(None)):
    resume_data = parse_resume(file)
    if not job_description:
        job_description = get_description_from_db(job_role)
    required_skills = extract_job_skills(job_description)
    match_info = analyze_skill_match(resume_data, required_skills)
    recommendations = generate_llm_recommendations(resume_data, job_description, match_info)
    formatted = format_for_ui_and_pdf(match_info, recommendations)
    
    temp_storage["last_result"] = formatted 

    return {
        "result": formatted
    }

@app.get("/export-pdf")
async def export_pdf():
    formatted_data = temp_storage.get("last_result")
    if not formatted_data:
        return {"error": "No analysis result available to export."}

    pdf_path = export_to_pdf(formatted_data)
    return FileResponse(
        path=pdf_path,
        filename="ResumeReport(OptiResume).pdf",
        media_type="application/pdf"
    )