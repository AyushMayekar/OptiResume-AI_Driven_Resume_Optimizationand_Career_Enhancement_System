import spacy
import os
from dotenv import load_dotenv 
import google.generativeai as genai
import re

load_dotenv()

# Loading NLP English Model
nlp = spacy.load("en_core_web_md")

# Loading Gemini LLM
gemini_api_key = os.getenv("GEMINI_API_KEY")
if not gemini_api_key:
    raise ValueError("GEMINI_API_KEY environment variable not set")
genai.configure(api_key=gemini_api_key)
model = genai.GenerativeModel("gemini-1.5-flash")

# Temp DB
job_descriptions_db = {
    "Software Developer": """
        We are looking for a Software Developer skilled in Python, Django, REST API, Docker, and Kubernetes.
        Experience in cloud infrastructure, CI/CD pipelines, and relational databases like PostgreSQL is a plus.
    """,
    "Data Scientist": """
        Seeking Data Scientist with strong skills in Python, Machine Learning, Pandas, NumPy, and data visualization.
        Knowledge of TensorFlow, PyTorch, and cloud services like AWS is desirable.
    """,
    "DevOps Engineer": """
        DevOps Engineer needed with expertise in Docker, Kubernetes, Jenkins, Terraform, CI/CD automation, and cloud infrastructure.
        Experience in monitoring tools and scripting (Python/Bash) is essential.
    """,
}

# Function to get the Job Description from DB
def get_description_from_db(job_role: str) -> str:
    return job_descriptions_db.get(job_role, "No description available for this role.")

# TBD -> Function to parse resume
def parse_resume(file) -> dict:
    pass

# Function to apply NLP on Job Description 
def extract_job_skills(job_description: str) -> list:
    doc = nlp(job_description)
    skills = []
    COMMON_STOPWORDS = {"software", "developer", "experience", "databases", "pipelines", "knowledge", "service", "engineer"}

    for ent in doc.ents:
        if ent.label_ in ["ORG", "PRODUCT", "WORK_OF_ART", "TECHNOLOGY"]:  
            skills.append(ent.text)

    # Fallback: Extract all proper nouns (PROPN) and nouns (NOUN)
    if not skills:
        skills = [token.text for token in doc if token.pos_ in ("PROPN", "NOUN")]

    skills = [skill for skill in skills if skill.lower() not in COMMON_STOPWORDS]
    return list(set(skills))

# Function to process resume data and job description
def analyze_skill_match(resume_data: dict, job_skills: list) -> dict:
    matched = list(set(resume_data["skills"]) & set(job_skills))
    missing = list(set(job_skills) - set(resume_data["skills"]))
    match_percent = 0.0
    if len(job_skills) > 0:
        match_percent = round(len(matched) / len(job_skills) * 100, 2) 
    return {
        "matched_skills": matched,
        "missing_skills": missing,
        "match_percentage": match_percent
    }

# Function to get personalised recommendations from llm
def generate_llm_recommendations(resume_data: dict, job_description: str, match_info: dict) -> str:
    prompt = f"""
    The user wants to apply for the following role:
    {job_description}
    
    Their current resume skills:
    {', '.join(resume_data['skills'])}
    
    Matched skills:
    {', '.join(match_info['matched_skills'])}
    
    Missing skills:
    {', '.join(match_info['missing_skills'])}
    
    Please provide 3 legitimate actionable recommendations to help the user improve their resume as well as skillset, focusing on bridging the missing skills. Format the output cleanly and consistently. Do not include any markdown formatting like ** or *. Avoid using symbols like `*`, `**`, `-`, or `:` at the start or end. Be concise but clinically complete.

    Expected Output format:
    1. Add personal projects using Docker and Kubernetes to your resume.
    2. Highlight cloud experience and certification (e.g., AWS Certified Solutions Architect).
    3. Take an online Docker/Kubernetes course on platforms like Coursera or Udemy to improve technical expertise.

    """
    response = model.generate_content(prompt)
    bot_response = response.text
    return bot_response

# Function to format llm raw response
def format_for_ui_and_pdf(match_info: dict, recommendations: str) -> dict:
    clean_text = re.sub(r"^[\*\-\`\s]*", "", recommendations, flags=re.MULTILINE)
    clean_text = re.sub(r"\s*$", "", clean_text, flags=re.MULTILINE)

    lines = re.split(r'\n\d+\.\s+', clean_text)

    if len(lines) == 1:
        lines = [line.strip() for line in clean_text.split('\n') if line.strip()]
    else:
        lines = [line.strip() for line in lines if line.strip()]

    cleaned_lines = [re.sub(r'^\d+\.\s*', '', line) for line in lines]

    return {
        "match_percentage": match_info["match_percentage"],
        "matched_skills": match_info["matched_skills"],
        "missing_skills": match_info["missing_skills"],
        "recommendations": cleaned_lines
    }

# TBD -> Function to export pdf
def export_to_pdf(formatted_data: dict) -> str:
    pass