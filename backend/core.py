import spacy
import os, tempfile
from dotenv import load_dotenv 
import google.generativeai as genai
import re
import fitz
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph
from reportlab.graphics.shapes import Drawing, Rect, String
from datetime import datetime

load_dotenv()

BASE_FONT_PATH = os.path.join(os.getcwd(), 'assets', 'fonts')

# Register essential fonts
pdfmetrics.registerFont(TTFont('Roboto-Regular', os.path.join(BASE_FONT_PATH, 'Roboto-Regular.ttf')))
pdfmetrics.registerFont(TTFont('Roboto-Bold', os.path.join(BASE_FONT_PATH, 'Roboto-Bold.ttf')))
pdfmetrics.registerFont(TTFont('Roboto-Italic', os.path.join(BASE_FONT_PATH, 'Roboto-Italic.ttf')))
pdfmetrics.registerFont(TTFont('Roboto-BoldItalic', os.path.join(BASE_FONT_PATH, 'Roboto-BoldItalic.ttf')))

PDF_THEME = {
    "font_name": "Roboto",
    "primary_color": colors.HexColor("#1a73e8"),
    "secondary_color": colors.HexColor("#34a853"),
    "warning_color": colors.HexColor("#fbbc05"),
    "neutral_color": colors.HexColor("#202124"),
    "background_matched": colors.HexColor("#e6f4ea"),
    "background_missing": colors.HexColor("#fce8e6"),
    "font_size_title": 24,
    "font_size_header": 14,
    "font_size_normal": 11,
    "line_spacing": 14
}

CATEGORY_RULES = {
    "Certification": ["course", "certification", "certificate", "exam"],
    "Project": ["project", "github", "portfolio"],
    "Skill": ["highlight", "resume", "experience", "skills"],
}

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

TECH_SKILLS = {
    "python", "django", "flask", "fastapi", "numpy", "pandas", "scipy",
    "matplotlib", "seaborn", "plotly", "tensorflow", "pytorch", "scikit-learn",
    "docker", "kubernetes", "aws", "azure", "gcp", "postgresql", "mysql",
    "mongodb", "sql", "linux", "git", "github", "gitlab", "javascript",
    "typescript", "react", "vue", "angular", "nodejs", "express", "java",
    "spring", "c++", "c#", "php", "ruby", "rails", "swift", "objective-c",
    "go", "rust", "graphql", "rest api", "soap", "redis", "elasticsearch",
    "apache kafka", "rabbitmq", "celery", "jenkins", "circleci", "travisci",
    "terraform", "ansible", "helm", "prometheus", "grafana", "hadoop", "spark",
    "apache airflow", "bigquery", "cloud functions", "lambda", "docker-compose"
}

# Function to get the Job Description from DB
def get_description_from_db(job_role: str) -> str:
    return job_descriptions_db.get(job_role, "No description available for this role.")

# Function to parse resume
def parse_resume(file) -> dict:
    """
    Accepts an UploadFile-like object (has .file) or a simple file path (for local tests).
    Returns {"text": full_text, "skills": [...]} with skills lowercased from TECH_SKILLS.
    """
    # read bytes (supports FastAPI UploadFile or a path string)
    raw_bytes = None
    if hasattr(file, "file"):
        # Uploaded file from FastAPI
        raw_bytes = file.file.read()
    elif isinstance(file, (bytes, bytearray)):
        raw_bytes = file
    else:
        # assume file is a path
        with open(file, "rb") as fh:
            raw_bytes = fh.read()

    text = ""
    try:
        with fitz.open(stream=raw_bytes, filetype="pdf") as doc:
            for page in doc:
                text += page.get_text("text") + "\n"
    except Exception:
        # fallback: try decode bytes
        try:
            text = raw_bytes.decode(errors="ignore")
        except Exception:
            text = ""

    # normalize whitespace
    text_norm = re.sub(r"\s+", " ", text)

    found = set()
    for skill in TECH_SKILLS:
        # word boundary match, case-insensitive
        if re.search(r"\b" + re.escape(skill) + r"\b", text_norm, flags=re.IGNORECASE):
            found.add(skill)  # store lowercase canonical

    return {
        "text": text,
        "skills": sorted(list(found))
    }

# Function to apply NLP on Job Description 
def extract_job_skills(job_description: str) -> list:
    doc = nlp(job_description)
    skills = set()
    COMMON_STOPWORDS = {"software", "developer", "experience", "databases", "pipelines", "knowledge", "service", "engineer"}
    TECH_SKILLS_DICT = {
    "python", "django", "flask", "fastapi", "numpy", "pandas", "scipy",
    "matplotlib", "seaborn", "tensorflow", "keras", "pytorch",
    "jenkins", "docker", "kubernetes", "ansible", "terraform",
    "aws", "azure", "google cloud", "gcp", "oracle cloud",
    "postgresql", "mysql", "mongodb", "sqlite", "redis",
    "graphql", "rest api", "soap api",
    "git", "github", "gitlab", "bitbucket",
    "celery", "rabbitmq",
    "elasticsearch", "logstash", "kibana",
    "apache", "nginx",
    "linux", "ubuntu", "centos",
    "microservices", "ci/cd", "tdd", "bdd",
    "oauth", "jwt", "ssl",
    "object-oriented programming", "oop",
    "multithreading", "asyncio",
    "react", "angular", "vue.js",
    "typescript", "javascript", "java", "c++", "c#", "php", "ruby", "go"
        }

    for token in doc:
        token_lower = token.text.lower()
        if token_lower in TECH_SKILLS_DICT:
            skills.add(token.text)

    for ent in doc.ents:
        if ent.label_ in ["ORG", "PRODUCT", "WORK_OF_ART", "TECHNOLOGY"]:  
            skills.add(ent.text)

    # Fallback: Extract all proper nouns (PROPN) and nouns (NOUN)
    if not skills:
        skills = [token.text for token in doc if token.pos_ in ("PROPN", "NOUN")]
        skills.update(skills)

    skills = [skill for skill in skills if skill.lower() not in COMMON_STOPWORDS]
    return list(set(skills))

# Function to calculate time saved estimate
def calculate_estimated_time_saved(match_info: dict) -> int:
    estimated_time_per_skill_min = 5  
    missing_skills_count = len(match_info.get("missing_skills", []))
    return missing_skills_count * estimated_time_per_skill_min

# Function to normalize skills
def _normalize_skill(s: str) -> str:
    s = s.lower().strip()
    s = re.sub(r"[^\w+#.+-]", "", s)
    return s

# Function to analyze skill match
def analyze_skill_match(resume_data: dict, job_skills: list) -> dict:
    resume_skills = resume_data.get("skills") or []
    job_skills = job_skills or []

    resume_map = { _normalize_skill(s): s for s in resume_skills }
    job_map = { _normalize_skill(s): s for s in job_skills }

    matched_norm = set(resume_map.keys()) & set(job_map.keys())
    matched = [resume_map[n] for n in matched_norm]

    missing_norm = set(job_map.keys()) - matched_norm
    missing = [job_map[n] for n in missing_norm]

    match_percentage = 0.0
    if len(job_map) > 0:
        match_percentage = round(len(matched) / len(job_map) * 100, 2)

    return {
        "matched_skills": matched,
        "missing_skills": missing,
        "match_percentage": match_percentage
    }

# Function to get personalised recommendations from LLM
def generate_llm_recommendations(resume_data: dict, job_description: str, match_info: dict) -> str:
    prompt = f"""
    The user wants to apply for the following role:
    {job_description}
    
    Current resume skills:
    {', '.join(resume_data['skills'])}
    
    Matched skills:
    {', '.join(match_info['matched_skills'])}
    
    Missing skills:
    {', '.join(match_info['missing_skills'])}
    
    Generate three practical and market-relevant recommendations to improve the user’s resume and skillset. Focus on bridging missing skills with real-world actions that can be completed within one to three months. Each recommendation should be personalized, realistic, and actionable, including projects, certifications, or ways to highlight experience. Format the recommendations clearly, with each on a separate line, avoiding symbols, extra spaces, or numbering. Use natural, human-friendly language that feels tailored to the individual.

    Example style of output:
    1. Add a personal project using [technology] and publish it on GitHub
    2. Complete the [course or certification name] from platforms like Coursera, Udemy, or LinkedIn Learning
    3. Emphasize [specific experience or skill] in your resume and quantify the impact wherever possible
    """
    response = model.generate_content(prompt)
    return response.text

# Function to format LLM output for UI/PDF
def format_for_ui_and_pdf(match_info: dict, recommendations: str) -> dict:
    clean_text = recommendations.replace('\r\n', '\n').replace('\r', '\n').strip()
    lines = [re.sub(r'^[\*\-\`\s]*', '', line).strip() for line in clean_text.split('\n') if line.strip()]
    cleaned_lines = [re.sub(r'^\d+\.\s*', '', line) for line in lines]

    return {
        "match_percentage": match_info["match_percentage"],
        "matched_skills": match_info["matched_skills"],
        "missing_skills": match_info["missing_skills"],
        "recommendations": cleaned_lines,
        "estimated_time_saved_minutes": calculate_estimated_time_saved(match_info)
    }

# Function to export PDF
def export_to_pdf(formatted_data: dict) -> str:
    pdf_fd, pdf_path = tempfile.mkstemp(suffix=".pdf")
    os.close(pdf_fd)

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        leftMargin=40,
        rightMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    # Define styles
    title_style = ParagraphStyle(
        "TitleStyle",
        fontName="Roboto-Bold",
        fontSize=PDF_THEME['font_size_title'],
        textColor=PDF_THEME['primary_color'],
        alignment=1,
        spaceAfter=15,
        leading=PDF_THEME['line_spacing']
    )

    header_style = ParagraphStyle(
        "HeaderStyle",
        fontName="Roboto-Bold",
        fontSize=PDF_THEME['font_size_header'],
        textColor=PDF_THEME['neutral_color'],
        spaceBefore=12,
        spaceAfter=10,
        leading=16
    )

    normal_style = ParagraphStyle(
        "NormalStyle",
        fontName="Roboto-Regular",
        fontSize=PDF_THEME['font_size_normal'],
        leading=PDF_THEME['line_spacing'],
        textColor=PDF_THEME['neutral_color']
    )

    footer_style = ParagraphStyle(
        "FooterStyle",
        fontName="Roboto-Italic",
        fontSize=9,
        textColor=colors.HexColor("#5f6368"),
        alignment=1,
        spaceBefore=20
    )

    subtitle_style = ParagraphStyle(
    "SubtitleStyle",
    fontName="Roboto-Italic",
    fontSize=9,
    textColor=colors.HexColor("#5f6368"),
    spaceAfter=10
    )

    important_style = ParagraphStyle(
    "ImportantStyle",
    fontName="Roboto-Bold",
    fontSize=12,
    leading=14,
    textColor=PDF_THEME['primary_color'],
    spaceBefore=10,
    spaceAfter=15
    )

    elements = []

    # Cover Title
    elements.append(Paragraph("Resume Optimization Report", title_style))
    elements.append(Paragraph(f"Generated on: {datetime.now().strftime('%Y-%m-%d %I:%M %p')}", subtitle_style))
    elements.append(Spacer(1, 10))

    # Executive Summary
    elements.append(Paragraph("Executive Summary", header_style))
    elements.append(Paragraph(
        "This report compares the candidate’s resume against the target job role, "
        "highlighting matched skills, missing gaps, and actionable recommendations "
        "to improve role fit.",
        normal_style
    ))
    elements.append(Spacer(1, 20))

    # Skill Match Overview + Progress Bar
    elements.append(Paragraph("Skill Match Overview", header_style))
    elements.append(Paragraph(f"Overall Match: <b>{formatted_data['match_percentage']}%</b>", normal_style))
    elements.append(Spacer(1, 12))


    match_pct = formatted_data["match_percentage"]

    # Create a minimal bar chart manually
    chart_width = 300
    chart_height = 20
    chart = Drawing(chart_width + 2, chart_height + 20)

    # Background bar (full length)
    chart.add(Rect(0, 0, chart_width, chart_height, fillColor=colors.HexColor("#e8eaed"), strokeColor=None, rx=3, ry=3))

    # Filled bar (match)
    filled_width = chart_width * (match_pct / 100)
    chart.add(Rect(0, 0, filled_width, chart_height, fillColor=PDF_THEME['primary_color'], strokeColor=None, rx=3, ry=3))

    # Text label above bar
    chart.add(String(chart_width / 2, chart_height + 5, f"{match_pct:.1f}%", textAnchor="middle",
                fontName="Roboto-Bold", fontSize=10, fillColor=PDF_THEME['neutral_color']))

    elements.append(chart)
    elements.append(Spacer(1, 20))
    # Skills Breakdown Table
    elements.append(Paragraph("Skills Breakdown", header_style))
    table_data = [
    ["Matched Skills", Paragraph(", ".join(formatted_data["matched_skills"]) or "None", normal_style)],
    ["Missing Skills", Paragraph(", ".join(formatted_data["missing_skills"]) or "None", normal_style)]
    ]

    table = Table(table_data, colWidths=[150, 320])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, 0), PDF_THEME['background_matched']),
        ("BACKGROUND", (0, 1), (0, 1), PDF_THEME['background_missing']),
        ("TEXTCOLOR", (0, 0), (-1, -1), PDF_THEME['neutral_color']),
        ("FONTNAME", (0, 0), (-1, -1), "Roboto-Regular"),
        ("FONTSIZE", (0, 0), (-1, -1), PDF_THEME['font_size_normal']),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("BOX", (0, 0), (-1, -1), 0.5, PDF_THEME['neutral_color']),
        ("INNERGRID", (0, 0), (-1, -1), 0.3, PDF_THEME['neutral_color']),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    elements.append(table)
    elements.append(Spacer(1, 20))

    # Actionable Recommendations
    elements.append(Paragraph("Actionable Recommendations", header_style))
    for i, rec in enumerate(formatted_data["recommendations"], start=1):
        category = "General"
        color = PDF_THEME['neutral_color']

        rec_lower = rec.lower()
        if any(x in rec_lower for x in CATEGORY_RULES["Certification"]):
            category = "Certification"
            color = PDF_THEME['secondary_color']
        elif any(x in rec_lower for x in CATEGORY_RULES["Project"]):
            category = "Project"
            color = PDF_THEME['primary_color']
        elif any(x in rec_lower for x in CATEGORY_RULES["Skill"]):
            category = "Skill"
            color = PDF_THEME['warning_color']

        para_text = f"{i}. <font color='{color}'><b>{category}</b></font>: {rec}"
        elements.append(Paragraph(para_text, normal_style))
        elements.append(Spacer(1, 6))

    estimated_time = formatted_data.get("estimated_time_saved_minutes", 0)
    elements.append(Paragraph(
        f"<b>Estimated Time Saved:</b> {estimated_time} minutes", 
        important_style
    ))

    # Footer
    footer = Paragraph(
        "Generated by <b>OptiResume AI</b>, Empowering Smarter Career Growth",
        footer_style
    )
    elements.append(footer)

    doc.build(elements)

    return pdf_path